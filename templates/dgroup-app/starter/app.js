import {initTutorials} from './tutorial.js';

const element = id => document.getElementById(id);
const content = element('passages');
let weeks = [];
let groups = [];
let selected = 1;
let size = 1.25;

function showSection() {
  const active = location.hash === '#reading' ? 'reading' : 'home';
  for (const id of ['home', 'reading']) element(id).hidden = id !== active;
  for (const link of element('navigation').querySelectorAll('a')) {
    if (link.hash === '#' + active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}

function displayPassages() {
  content.replaceChildren();
  const group = groups.find(items => items[0].number === selected);
  if (!group) {
    content.textContent = 'Readings will appear here when the study opens.';
    return;
  }
  for (const week of group) {
    const article = document.createElement('article');
    const heading = document.createElement('h3');
    heading.textContent = week.reference;
    const verse = document.createElement('p');
    verse.className = 'scripture';
    verse.textContent = week.scripture;
    article.append(heading, verse);
    content.append(article);
  }
}

function fillWeeks() {
  const interval = Number(element('rhythm').value);
  const byGathering = new Map();
  for (const week of weeks) {
    const key = Math.floor((week.number - 1) / interval);
    if (!byGathering.has(key)) byGathering.set(key, []);
    byGathering.get(key).push(week);
  }
  groups = [...byGathering.values()];
  const select = element('week');
  const previous = groups.find(items => items.some(item => item.number === selected));
  selected = (previous || groups[0])?.[0].number;
  select.replaceChildren();
  for (const group of groups) {
    const [first, second] = group;
    const label = second ? `Weeks ${first.number}–${second.number}` : `Week ${first.number} · ${first.reference}`;
    select.add(new Option(label, String(first.number)));
  }
  select.value = String(selected);
  element('week-label').textContent = interval === 2 ? 'Two-Week Gathering' : 'Study Week';
  for (const id of ['filters', 'reader-controls']) element(id).hidden = !groups.length;
  displayPassages();
}

function resize(delta) {
  size = Math.min(2, Math.max(1, size + delta));
  content.style.setProperty('--reading-size', size + 'rem');
  element('smaller').disabled = size <= 1;
  element('larger').disabled = size >= 2;
}

const tours = {
  home: {
    name: 'Home',
    steps: () => [
      {selector: '#home-title', title: 'Your Meeting', text: 'Start here to prepare for your time together.', ms: 4200},
      {selector: '#navigation a[href="#reading"]', title: 'Read the Text', text: 'Open Read to find the passage for your group.', ms: 4500}
    ]
  },
  reading: {
    name: 'Read',
    steps: () => [
      {selector: '#rhythm', title: 'Meeting Rhythm', text: 'Choose one week or a two-week gathering.', ms: 4300},
      {selector: '#week', title: 'Choose a Reading', text: 'Select the week your group is studying.', ms: 4200},
      {selector: '#larger', title: 'Larger Bible Text', text: 'Use A+ to increase the size of the passage.', ms: 4500},
      {selector: '#passages h3', title: 'Your Passage', text: 'Find the reference above the passage you will read together.', ms: 4800},
      ...(!weeks.length ? [{selector: '#read-title', title: 'Upcoming Studies', text: 'Readings appear here when your study opens.', ms: 4300}] : [])
    ]
  }
};

window.addEventListener('hashchange', showSection);
element('rhythm').addEventListener('change', fillWeeks);
element('week').addEventListener('change', event => {
  selected = Number(event.target.value);
  displayPassages();
});
element('smaller').addEventListener('click', () => resize(-.125));
element('larger').addEventListener('click', () => resize(.125));
showSection();
fillWeeks();
initTutorials(tours, message => {element('status').textContent = message;});

try {
  const response = await fetch('./study.json');
  if (!response.ok) throw new Error('Study unavailable');
  const study = await response.json();
  document.title = study.title + ' · D-Groups';
  element('series-title').textContent = study.title;
  weeks = study.weeks;
  element('edition').textContent = study.edition;
  fillWeeks();
} catch {
  element('status').textContent = 'The study could not be loaded. Refresh to try again.';
}
