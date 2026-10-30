// Approved week 5 only. Private material is decrypted in memory until release.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

export const RELEASE = '2026-11-09T06:00:00+01:00';
export const due = now => new Date(now).getTime() >= Date.parse(RELEASE);
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
const write = (file,data) => fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
const sleep = ms => new Promise(resolve => setTimeout(resolve,ms));

export function decode(root,key,repository) {
  const meta=read(path.join(root,'.github/scheduled/week05.json'));
  assert.equal(meta.repository,repository);
  assert.equal(meta.releaseAt,RELEASE);
  assert.equal(meta.id,'luke-acts-05');
  const bytes=fs.readFileSync(path.join(root,'.github/scheduled/week05.enc'));
  assert.equal(sha(bytes),meta.cipherSha256);
  const secret=Buffer.from(key,'base64');assert.equal(secret.length,32);
  const decipher=crypto.createDecipheriv('aes-256-gcm',secret,bytes.subarray(0,12));
  decipher.setAAD(Buffer.from('DGroups-week05-v1'));decipher.setAuthTag(bytes.subarray(-16));
  const payload=JSON.parse(Buffer.concat([decipher.update(bytes.subarray(12,-16)),decipher.final()]));
  for(const name of ['repository','releaseAt','id','site']) assert.equal(payload[name],meta[name]);
  assert.equal(sha(Buffer.from(payload.lesson,'base64')),payload.lessonSha256);
  const lesson=JSON.parse(Buffer.from(payload.lesson,'base64'));
  assert.equal(lesson.points.length,3);
  assert.ok(lesson.title && lesson.introduction);
  for(const [name,image] of Object.entries(payload.images)) {
    assert.match(name,/^[a-z0-9-]+\.webp$/);
    assert.equal(sha(Buffer.from(image.data,'base64')),image.sha256);
  }
  for(const point of lesson.points) {
    assert.ok(point.title && point.reference && point.text);
    if(point.image) assert.ok(payload.images[point.image] && point.alt);
  }
  assert.ok(payload.images[lesson.points[0].image]);
  return payload;
}

export function applyPayload(root,payload) {
  const at = name => path.join(root,name);
  const lesson=JSON.parse(Buffer.from(payload.lesson,'base64'));
  const catalog=read(at('published/catalog.json'));
  const entry=catalog.lessons.find(x=>x.id===payload.id);
  assert.equal(entry.releaseAt,RELEASE);assert.equal(entry.studyWeek,'2026-11-09');
  Object.assign(entry,{title:lesson.title,status:'available'});
  const journey=read(at('journey.json')),curriculum=read(at('curriculum.json'));
  assert.equal(journey.sessions[4].number,5);assert.equal(curriculum.sessions[4].id,payload.id);
  Object.assign(journey.sessions[4],{image:lesson.points[0].image,alt:lesson.points[0].alt,commentaryTitle:lesson.title});
  curriculum.sessions[4].title=lesson.title;
  let app=fs.readFileSync(at('app.js'),'utf8');
  for(const name of ['journey','curriculum']) {
    const pattern=new RegExp("fetchJSON\\('\\./"+name+"\\.json(?:\\?[^']*)?'\\)");
    assert.ok(pattern.test(app),'Missing data fetch');
    app=app.replace(pattern,"fetchJSON('./"+name+".json?v=week05-20261109')");
  }
  const revision=sha(Buffer.from(app)).slice(0,12);
  const htmls=['index.html','review.html'].map(name=>{
    const html=fs.readFileSync(at(name),'utf8');assert.ok(html.includes('./app.js'));
    return [name,html.replace(/\.\/app\.js(?:\?v=[^"\s]+)?/g,'./app.js?v='+revision)];
  });
  fs.mkdirSync(at('published/'+payload.id),{recursive:true});
  fs.writeFileSync(at('published/'+payload.id+'/lesson.json'),Buffer.from(payload.lesson,'base64'));
  for(const [name,image] of Object.entries(payload.images)) {
    for(const dest of ['assets/'+name,'published/'+payload.id+'/'+name]) fs.writeFileSync(at(dest),Buffer.from(image.data,'base64'));
  }
  write(at('published/catalog.json'),catalog);write(at('journey.json'),journey);write(at('curriculum.json'),curriculum);
  fs.writeFileSync(at('app.js'),app);
  for(const [name,html] of htmls) fs.writeFileSync(at(name),html);
  return ['published/'+payload.id,'published/catalog.json','journey.json','curriculum.json','app.js','index.html','review.html',...Object.keys(payload.images).map(name=>'assets/'+name)];
}

function fixtureCheck(root,payload) {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dgroups-validation-'));
  try {
    fs.mkdirSync(path.join(dir,'published'));fs.mkdirSync(path.join(dir,'assets'));
    const names=['published/catalog.json','journey.json','curriculum.json','app.js','index.html','review.html'];
    for(const name of names) fs.copyFileSync(path.join(root,name),path.join(dir,name));
    const before=read(path.join(dir,'published/catalog.json')).lessons.filter(x=>x.id!==payload.id);
    const files=applyPayload(dir,payload);
    assert.equal(sha(fs.readFileSync(path.join(dir,'published/'+payload.id+'/lesson.json'))),payload.lessonSha256);
    assert.deepEqual(read(path.join(dir,'published/catalog.json')).lessons.filter(x=>x.id!==payload.id),before);
    const hashes=names.map(name=>sha(fs.readFileSync(path.join(dir,name))));
    applyPayload(dir,payload);
    assert.deepEqual(names.map(name=>sha(fs.readFileSync(path.join(dir,name)))),hashes);
    assert.ok(files.length>7);
  } finally {fs.rmSync(dir,{recursive:true,force:true});}
  assert.equal(due('2026-11-09T04:59:59Z'),false);
  assert.equal(due('2026-11-09T05:00:00Z'),true);
  console.log('Validated encrypted lesson, image, release boundary, isolated update and repeat safety.');
}

async function api(repository,suffix,method='GET',body) {
  const res=await fetch('https://api.github.com/repos/'+repository+suffix,{
    method,headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},
    body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(45000)
  });
  if(!res.ok) throw new Error('GitHub '+method+' '+suffix+' returned '+res.status);
  return res.status===204?{}:res.json();
}

async function rebuild(repository) {
  await api(repository,'/pages/builds','POST',{});
  for(let n=0;n<40;n++) {
    await sleep(15000);
    const build=await api(repository,'/pages/builds/latest');
    if(build.status==='built') {console.log('GitHub Pages build successful.');return;}
    if(build.status==='errored') throw new Error('GitHub Pages build failed');
  }
  throw new Error('Pages build timed out; next scheduled run will retry');
}

async function publicBytes(payload,relative) {
  const res=await fetch(payload.site+relative+'?release=week05-'+Date.now(),{signal:AbortSignal.timeout(30000),cache:'no-store'});
  if(!res.ok) throw new Error('Public site returned '+res.status);
  return Buffer.from(await res.arrayBuffer());
}
async function verifyLive(payload) {
  assert.equal(sha(await publicBytes(payload,'published/'+payload.id+'/lesson.json')),payload.lessonSha256);
  const catalog=JSON.parse(await publicBytes(payload,'published/catalog.json'));
  assert.equal(catalog.lessons.find(x=>x.id===payload.id).status,'available');
  for(const [name,image] of Object.entries(payload.images))
    assert.equal(sha(await publicBytes(payload,'published/'+payload.id+'/'+name)),image.sha256);
}
async function main() {
  const root=process.cwd(),repo=process.env.GITHUB_REPOSITORY;
  assert.ok(['cnartatez-lgtm/dgroups-luke-acts','cnartatez-lgtm/dgroups-lucas-hechos-es'].includes(repo));
  const payload=decode(root,process.env.DGROUPS_WEEK05_KEY||'',repo);
  delete process.env.DGROUPS_WEEK05_KEY;
  fixtureCheck(root,payload);
  const validation=process.env.VALIDATE_ONLY==='true';
  if(validation) {
    // Rebuild the unchanged public site to prove that GITHUB_TOKEN can deploy Pages.
    await rebuild(repo);
    if(!due(Date.now())) {
      const res=await fetch(payload.site+'published/'+payload.id+'/lesson.json?check='+Date.now());
      assert.equal(res.status,404,'Future commentary must remain private');
    }
    console.log('Cloud rehearsal passed. No scheduled teaching was published.');return;
  }
  if(!due(Date.now())) {console.log('Not due. Public files unchanged.');return;}
  try {await verifyLive(payload);console.log('Already published and verified.');return;} catch {}
  const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  assert.equal(git('status','--porcelain'),'','Unexpected checkout changes');
  const files=applyPayload(root,payload);
  execFileSync('node',['.github/scripts/build-discovery.mjs',root],{cwd:root,stdio:'inherit'});
  files.push('devotionals','sitemap.xml','robots.txt','discovery.css');
  git('add','--',...files);
  if(git('diff','--cached','--name-only')) {
    git('config','user.name','github-actions[bot]');
    git('config','user.email','41898282+github-actions[bot]@users.noreply.github.com');
    git('commit','-m','Publish approved Luke 1 week 5 commentary');
    git('push','origin','HEAD:main');
  }
  await rebuild(repo);
  for(let n=0;n<12;n++) {
    try {await verifyLive(payload);console.log('Week 5 commentary and image are live and verified over HTTPS.');return;}
    catch {if(n===11)throw new Error('Public verification pending; next scheduled run will retry');await sleep(15000);}
  }
}
if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)
  main().catch(error=>{console.error(/^GitHub |^Pages build |^Public verification/.test(error.message)?error.message:'Release validation failed. No secrets or teaching content are logged.');process.exitCode=1;});
