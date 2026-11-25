function stop(selector, title, text, ms) {
  return {selector, title, text, ms};
}

function introductionSteps() {
  return [
    stop('.guide-sections .group-guide:nth-child(1) h3', 'What Is a D-Group?', 'Learn who can join and how often to meet.', 4900),
    stop('.guide-sections .group-guide:nth-child(2) h3', 'Your First Meeting', 'Follow six steps from welcoming everyone to planning your next meeting.', 5200),
    stop('.guide-sections .group-guide:nth-child(3) h3', 'Facilitator', 'Find questions that help everyone share what they noticed.', 5600),
    stop('.guide-sections .group-guide:nth-child(4) h3', 'Try an Example', 'Follow Hagar’s story through observation, interpretation and application.', 4400),
    stop('#intro-journey-title', 'Your Journey Through Act I', 'Find your module by date and read its opening question.', 5400)
  ];
}

function pastoralSteps() {
  const completion = document.querySelector('.pastoral-progress-control .completion-control button');
  let completionText = 'Mark this week complete after your group finishes the study.';
  if (completion?.disabled) completionText = 'You can mark this week complete once it opens.';
  else if (completion?.getAttribute('aria-pressed') === 'true') completionText = 'You marked this week complete. Select it again to undo.';
  // Keep the pointer on one week as it moves from the passage to its commentary.
  const readButton = document.querySelector('.pastoral-week-row.current [data-lesson]') || document.querySelector('.pastoral-week-row [data-lesson]');
  const weekButton = readButton?.closest('.pastoral-week-row').querySelector('[data-pastoral-week]') ||
    document.querySelector('.pastoral-week-row.current [data-pastoral-week]');
  const weekSelector = weekButton ? `[data-pastoral-week="${weekButton.dataset.pastoralWeek}"]` : '.pastoral-week-select';
  const commentarySelector = readButton ? `[data-lesson="${readButton.dataset.lesson}"]` : '.pastoral-week-action [data-lesson]';
  return [
    stop('.journey-progress strong', 'Your Progress', 'See how many studies you’ve completed in this browser.', 4900),
    stop('.pastoral-progress-control .completion-control button', 'Mark a Study Complete', completionText, 4800),
    stop('#module-filter', 'Find a Module', 'Choose one module or select All Modules to see every week.', 5300),
    stop(weekSelector + ' .schedule-date', 'Choose a Study Week', 'Select a date to make it your current study week.', 4700),
    stop(commentarySelector, 'Read Commentaries', 'Open this week’s teaching from the pastors of EIC Paris.', 5500),
    stop('.pastoral-week-status', 'Upcoming Commentaries', 'A lock means the teaching for that week is still to come.', 4400)
  ];
}

function storySteps() {
  return [
    stop('.section-head h2', 'Follow the Story', 'Revisit the story together at the end of each module.', 5800),
    stop('.module-reading-button .module-reading-label', 'Read a Reflection', 'Select Read Reflection to see how the passages fit together.', 4900),
    stop('.module-unlock-cover .series-lock', 'When a Module Opens', 'The date below the lock tells you when to return.', 5000),
    stop('#reflection-module-4', 'The Interlude', 'Return here after Module 3 for the final part of Act I.', 4500)
  ];
}

function toolsSteps() {
  return [
    stop('.tools-week-selector #week', 'Choose a Passage', 'Choose a week. All three tools will use its passage.', 4900),
    stop('#tool-tab-words', 'Repeated Words', 'The number beside each word shows how often it appears.', 5200),
    stop('#tool-tab-glossary', 'Glossary', 'Explore what words in the passage meant to its first readers.', 5500),
    stop('#tool-tab-tsk', 'TSK Bible Concordance', 'Find related Bible passages and discover what connects them.', 4400),
    stop('.word-cloud [data-word]', 'Explore a Word', 'Choose a word for its meaning. Turn on highlighting in Read.', 5700),
    stop('.word-cloud > p', 'Word Counts', 'No keywords repeat here. Try the glossary or another week.', 5000),
    stop('#glossary-search', 'Search This Week’s Glossary', 'Type a word to filter entries. Clear it to see them all.', 5400),
    stop('#glossary-list summary', 'Read a Definition', 'Select an entry to see its meaning in this passage.', 4900),
    stop('#glossary-list > .annotation', 'Try Another Word', 'No entries match. Clear the search or try a shorter word.', 4700),
    stop('.concordance-card [data-connection]', 'Read a Connection', 'Select a reference to read the verses and the accompanying note.', 5100)
  ];
}

function resourcesSteps() {
  return [
    stop('.resource-section > h3', 'Historical Setting', 'Find timelines and background on the world of the passage.', 4600),
    stop('.resource-card .text-link', 'Open a Resource', 'Select a card. Its website opens in another tab.', 5500),
    stop('.resource-section + .resource-section > h3', 'Study the Passage', 'Compare translations or look more closely at a verse.', 4800),
    stop('.resource-section + .resource-section + .resource-section > h3', 'Places and Words', 'Find Bible maps and articles about unfamiliar people and customs.', 4700),
    stop('.method-detail summary', 'Plan Your Time Together', 'Open a step for a question or activity to try together.', 4900)
  ];
}

function downloadsSteps() {
  return [
    stop('#guide-title-members', 'For Group Members', 'Learn how to prepare and take part in your first meeting.', 5600),
    stop('#guide-title-facilitator', 'Facilitator Guide', 'Use this guide to plan a thirty-minute meeting when it’s your turn.', 5500),
    stop('#guide-edition-study-mobile', 'Act I on Your Phone', 'Keep the reading plan and discussion questions on your phone.', 5400),
    stop('#guide-edition-study-print', 'Act I in Print', 'Print this A4 handout for your group to use together.', 4700),
    stop('[data-download-guide="study-print"] .guide-download', 'Download a PDF', 'Use the Download button beside the format you want.', 5300)
  ];
}

export const sectionTours = {
  introduction: {name: 'Intro', steps: introductionSteps},
  studies: {name: 'Pastoral', steps: pastoralSteps},
  story: {name: 'Story', steps: storySteps},
  tools: {name: 'Tools', steps: toolsSteps},
  resources: {name: 'Resources', steps: resourcesSteps},
  downloads: {name: 'Downloads', steps: downloadsSteps}
};
