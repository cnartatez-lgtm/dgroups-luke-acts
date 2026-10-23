// Shared opening for every pastoral commentary. Supplied teaching stays intact.
export const commentaryPreface = 'These commentaries grow out of this week’s passage. They are not required, and they are not the main thing. They are simply here to help, a little extra for your study. Feel free to use them or not, and to choose the point that best fits your group’s conversation. You do not need to cover everything. What matters most is to read the passage, pray, study it together and let it reach your hearts, so that we respond to God in obedience to his Word. Each point also opens other themes you can explore, as your time and energy allow. Our prayer is that God will guide you, give you wisdom and bring fruit from your time in his Word.';
export const commentaryAuthority = 'Only the Bible is inspired by God. These commentaries are human reflections, always read them under the authority of God’s Word.';

export function commentaryIntroduction(introduction='') {
  const blocks=String(introduction).replace(/^Before You Begin\s*\n/, '').split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean);
  // Remove only the known shared opening, preserving each lesson's own prose.
  if(blocks[0]==='Before You Begin') blocks.shift();
  if(blocks[0]===commentaryPreface) blocks.shift();
  if(blocks[0]===commentaryAuthority) blocks.shift();
  return blocks.join('\n\n');
}
