import {sectionTours} from './section-tours.js?v=e58c13e772fd';

const downloadsStep = {selector: '#navigation a[href="#downloads"]', title: 'Downloads', text: 'Download guides for your phone or print a copy for your group.', ms: 4300};

const homeStops = [
  {selector: '.hero-actions a[href="#reading"]', title: 'Begin the Journey', text: 'Open the Bible reader and choose your group’s study week.', ms: 3800},
  {selector: '.sidebar .brand', title: 'D-Groups', text: 'This logo brings you back to Home.', ms: 2400},
  {selector: '#navigation a[href="#introduction"]', title: 'Introduction', text: 'Find the group guide, tips for your Facilitator and the Act I outline.', ms: 4600},
  {selector: '#navigation a[href="#reading"]', title: 'Read the Text', text: 'Read the highlighted passage in context and discuss it with your group.', ms: 4500},
  {selector: '#navigation a[href="#studies"]', title: 'Pastoral Commentaries', text: 'Read weekly commentaries from the pastors of EIC Paris and mark your study complete.', ms: 5000},
  {selector: '#navigation a[href="#story"]', title: 'The Story So Far', text: 'See how each module’s passages tell one story about Jesus.', ms: 3700},
  {selector: '#navigation a[href="#tools"]', title: 'Bible Study Tools', text: 'Explore repeated words, the glossary and related Bible passages.', ms: 3700},
  {selector: '#navigation a[href="#resources"]', title: 'External Resources', text: 'Find maps, timelines and study websites for your group.', ms: 3600},
  downloadsStep,
  {selector: '#motion-toggle', title: 'Animations', text: 'Turn the app’s animations on or off.', ms: 3100},
  {selector: '#theme', title: 'Light and Dark Mode', text: 'Choose a light or dark background for reading.', ms: 3800}
];

function readingStops([first, second]) {
  const steps = [
    {selector: '#rhythm', title: 'Meeting Rhythm', text: 'Choose Every Week for one passage or Every Two Weeks for a pair.', ms: 5000},
    {selector: '#week', title: second ? 'Two-Week Gathering' : 'Study Week',
      text: second ? 'Choose a pair of dates. Both passages appear below, in order.' : 'Choose your group’s week. Each date is listed with its Bible passage.', ms: 4900},
    {selector: '.study-selector .week-arrows button:enabled', title: 'Previous and Next',
      text: second ? 'Use the arrows to move between two-week gatherings.' : 'Use the arrows to move one study week at a time.', ms: 3800},
    {selector: '.reader-toolbar [data-size="-1"]', title: 'Smaller Bible Text', text: 'Use A− to make the Bible text smaller.', ms: 3500},
    {selector: '.reader-toolbar [data-size="1"]', title: 'Larger Bible Text', text: 'Use A+ to make the letters larger until they feel comfortable to read.', ms: 5000},
    {selector: `[data-study-jump="${first.number}"]`, title: 'Jump to the Passage', text: 'This shortcut takes you straight to the first marked verse.', ms: 4600},
    {selector: `#study-start-${first.number} .eyebrow`, title: second ? 'First Passage' : 'This Week’s Passage',
      text: `Read ${first.passage}. The line beside the verses marks your group’s passage.`, ms: 5700}
  ];
  if (second) steps.push({selector: `#study-start-${second.number} .eyebrow`, title: 'Second Passage',
    text: `Read ${second.passage} for the second week of this gathering.`, ms: 4500});
  steps.push(downloadsStep);
  return steps;
}

function visibleControl(selector) {
  return Array.from(document.querySelectorAll(selector)).find(element => {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && getComputedStyle(element).visibility === 'visible';
  });
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Choose a position inside the safe area that leaves the highlighted control visible.
function placeCard(target, bounds, card) {
  const gap = 18;
  const x = (target.left + target.right - card.width) / 2;
  const y = (target.top + target.bottom - card.height) / 2;
  const sides = [[target.right + gap, y], [target.left - gap - card.width, y]];
  const vertical = [[x, target.bottom + gap], [x, target.top - gap - card.height]];
  const docks = [[x, bounds.bottom - card.height], [x, bounds.top]];
  const choices = card.width > bounds.width * .75 ? [...docks, ...vertical, ...sides] : [...sides, ...vertical];
  let best;
  let leastOverlap = Infinity;
  for (const [left, top] of choices) {
    const cx = clamp(left, bounds.left, bounds.right - card.width);
    const cy = clamp(top, bounds.top, bounds.bottom - card.height);
    const overlapWidth = Math.max(0, Math.min(cx + card.width, target.right + gap) - Math.max(cx, target.left - gap));
    const overlapHeight = Math.max(0, Math.min(cy + card.height, target.bottom + gap) - Math.max(cy, target.top - gap));
    const overlap = overlapWidth * overlapHeight;
    if (overlap < leastOverlap) {
      const coversTarget = cx < target.right && cx + card.width > target.left && cy < target.bottom && cy + card.height > target.top;
      best = {x: cx - bounds.left, y: cy - bounds.top, coversTarget};
      leastOverlap = overlap;
      if (overlap === 0) break;
    }
  }
  return best;
}

export function initTutorials(getReadingGroup, onComplete) {
  const main = document.getElementById('main');
  const dialog = document.createElement('dialog');
  dialog.id = 'home-tutorial';
  dialog.setAttribute('aria-labelledby', 'tutorial-title');
  dialog.setAttribute('aria-describedby', 'tutorial-text');
  dialog.innerHTML = `
    <div class="tutorial-spot" aria-hidden="true"></div>
    <div class="tutorial-cursor" aria-hidden="true"></div>
    <div class="tutorial-bounds">
      <div class="tutorial-card">
        <div class="tutorial-head">
          <span class="tutorial-count"></span>
          <button type="button" class="tutorial-exit">Exit Tutorial</button>
        </div>
        <div class="tutorial-message" aria-live="polite" aria-atomic="true">
          <h2 id="tutorial-title"></h2>
          <p id="tutorial-text"></p>
        </div>
        <div class="tutorial-choices">
          <div class="tutorial-mode-buttons">
            <button type="button" class="tutorial-watch" aria-describedby="tutorial-watch-note">Watch Animation</button>
            <button type="button" class="tutorial-manual" aria-describedby="tutorial-mode-help">At My Pace</button>
          </div>
          <p id="tutorial-mode-help">With At My Pace, use Next when you’re ready for each step.</p>
          <strong id="tutorial-watch-note" class="tutorial-watch-note"></strong>
        </div>
        <div class="tutorial-track" aria-hidden="true"><span></span></div>
        <div class="tutorial-actions">
          <button type="button" class="tutorial-back">Back</button>
          <button type="button" class="tutorial-pause">Pause</button>
          <button type="button" class="tutorial-next">Next</button>
        </div>
      </div>
    </div>`;
  document.body.append(dialog);

  const part = selector => dialog.querySelector(selector);
  const card = part('.tutorial-card');
  const spot = part('.tutorial-spot');
  const cursor = part('.tutorial-cursor');
  const bounds = part('.tutorial-bounds');
  const count = part('.tutorial-count');
  const title = part('#tutorial-title');
  const text = part('#tutorial-text');
  const choices = part('.tutorial-choices');
  const watch = part('.tutorial-watch');
  const manual = part('.tutorial-manual');
  const watchNote = part('#tutorial-watch-note');
  const actions = part('.tutorial-actions');
  const progress = part('.tutorial-track span');
  const back = part('.tutorial-back');
  const pause = part('.tutorial-pause');
  const next = part('.tutorial-next');
  let run;

  function stopClock() {
    if (!run?.timer) return;
    clearTimeout(run.timer);
    run.timer = 0;
    run.remaining = Math.max(0, run.deadline - performance.now());
  }

  function startClock() {
    if (run?.mode !== 'animation' || run.timer || run.paused || document.hidden) return;
    run.deadline = performance.now() + run.remaining;
    run.timer = setTimeout(() => {
      run.timer = 0;
      showStep(run.index + 1);
    }, run.remaining);
  }

  function finish(completed = false, restore = true) {
    if (!run) return;
    stopClock();
    const ended = run;
    run = null;
    ended.events.abort();
    ended.observer.disconnect();
    cancelAnimationFrame(ended.frame);
    dialog.close();
    document.documentElement.classList.remove('home-tutorial-open');
    const launcher = restore && visibleControl('#' + ended.launcherId);
    if (launcher) {
      for (const [element, left, top] of ended.rails) element.scrollTo({left, top, behavior: 'instant'});
      window.scrollTo({left: ended.x, top: ended.y, behavior: 'instant'});
      launcher.focus({preventScroll: true});
    }
    if (completed) onComplete(`${ended.name} tutorial complete.`);
  }

  function stickyTop(target, rect) {
    let topEdge = 0;
    for (const bar of document.querySelectorAll('.sidebar, .topbar')) {
      if (bar.contains(target) || !['sticky', 'fixed'].includes(getComputedStyle(bar).position)) continue;
      const box = bar.getBoundingClientRect();
      const midpoint = (rect.left + rect.right) / 2;
      if (box.left <= midpoint && box.right >= midpoint && box.top <= 2 + topEdge) topEdge = Math.max(topEdge, box.bottom);
    }
    return topEdge;
  }

  function revealControl(target) {
    const rect = target.getBoundingClientRect();
    const topEdge = stickyTop(target, rect);
    const screen = dialog.getBoundingClientRect();
    if (target.closest('.passage-start')) {
      window.scrollBy({top: rect.top - Math.max(topEdge + 12, screen.top + 18), behavior: 'instant'});
      return;
    }
    if (rect.top < topEdge || rect.bottom > screen.bottom - 30 || rect.left < screen.left || rect.right > screen.right) {
      target.scrollIntoView({block: target.closest('.sidebar') ? 'nearest' : 'center', inline: 'nearest', behavior: 'instant'});
    }
  }

  // Show the reference and the opening lines of its verse together when the screen allows it.
  function spotlightBounds(target, rect, screen) {
    const verse = target.closest('.passage-start')?.nextElementSibling;
    if (!verse?.matches('.focus-verse') || screen.height < 460) return rect;
    const box = verse.getBoundingClientRect();
    const style = getComputedStyle(verse);
    const bottom = Math.min(box.bottom, box.top + parseFloat(style.paddingTop) + 2 * parseFloat(style.lineHeight));
    return {left: Math.min(rect.left, box.left), right: Math.max(rect.right, box.right), top: rect.top, bottom};
  }

  // On a short screen, move the control to an edge if the card cannot fit beside it.
  function makeRoom(target, rect, frame, safe, size) {
    const bar = target.closest('.sidebar, .topbar');
    if (bar && ['sticky', 'fixed'].includes(getComputedStyle(bar).position)) return false;
    const page = document.scrollingElement;
    const maxScroll = page.scrollHeight - page.clientHeight;
    const top = Math.max(safe.top, stickyTop(target, rect)) + 5;
    const bottom = Math.min(safe.bottom - 5, window.innerHeight - 32);
    const distances = target.closest('.passage-start') ? [rect.top - top, rect.bottom - bottom] : [rect.bottom - bottom, rect.top - top];
    for (const distance of distances) {
      const scroll = clamp(window.scrollY + distance, 0, maxScroll);
      const delta = scroll - window.scrollY;
      if (Math.abs(delta) < 1 || rect.top - delta < top - 1 || rect.bottom - delta > bottom + 1) continue;
      const shifted = {...frame, top: frame.top - delta, bottom: frame.bottom - delta};
      if (!placeCard(shifted, safe, size).coversTarget) {
        window.scrollTo({top: scroll, behavior: 'instant'});
        return true;
      }
    }
    return false;
  }

  function position(reveal = false) {
    if (!run || run.index < 0) return;
    const target = visibleControl(run.steps[run.index].selector);
    if (!target) {
      if (run.mode === 'animation') showStep(run.index + 1);
      else {
        dialog.setAttribute('data-target-hidden', '');
        text.textContent = 'This control is hidden in this layout. Use Next to continue.';
      }
      return;
    }
    if (dialog.hasAttribute('data-target-hidden')) {
      dialog.removeAttribute('data-target-hidden');
      text.textContent = run.steps[run.index].text;
    }
    dialog.toggleAttribute('data-menu-step', Boolean(target.closest('#navigation')));
    if (reveal) revealControl(target);
    const rect = target.getBoundingClientRect();
    const screen = dialog.getBoundingClientRect();
    const focus = spotlightBounds(target, rect, screen);
    const frame = {
      left: Math.max(screen.left + 1, focus.left - 4),
      top: Math.max(screen.top + 1, focus.top - 4),
      right: Math.min(screen.right - 1, focus.right + 4),
      bottom: Math.min(screen.bottom - 1, focus.bottom + 4)
    };
    const safe = bounds.getBoundingClientRect();
    const size = card.getBoundingClientRect();
    // On an upright phone, keep the controls at the bottom as the next subject comes into view.
    if (reveal && screen.width <= 480 && screen.height > screen.width && !target.closest('.sidebar, .topbar')) {
      const shift = Math.ceil(frame.bottom - (safe.bottom - size.height - 18));
      const page = document.scrollingElement;
      const visibleTop = Math.max(safe.top, stickyTop(target, rect));
      if (shift > 0 && frame.top - shift >= visibleTop && window.scrollY + shift <= page.scrollHeight - page.clientHeight) {
        window.scrollBy({top: shift, behavior: 'instant'});
        position();
        return;
      }
    }
    const place = placeCard(frame, safe, size);
    if (reveal && place.coversTarget && makeRoom(target, focus, frame, safe, size)) {
      position();
      return;
    }
    spot.style.width = Math.max(1, frame.right - frame.left) + 'px';
    spot.style.height = Math.max(1, frame.bottom - frame.top) + 'px';
    spot.style.transform = `translate3d(${frame.left - screen.left}px, ${frame.top - screen.top}px, 0)`;
    const pointerX = clamp(rect.left + rect.width * .62, screen.left + 2, screen.right - 23);
    const pointerY = clamp(rect.top + rect.height * .57, Math.max(screen.top + 2, rect.top), Math.max(screen.bottom - 30, rect.top));
    cursor.style.transform = `translate3d(${pointerX - screen.left}px, ${pointerY - screen.top}px, 0)`;
    card.style.left = place.x + 'px';
    card.style.top = place.y + 'px';
  }

  function schedulePosition(reveal = false) {
    if (!run || run.index < 0) return;
    run.needsReveal ||= reveal;
    if (run.frame) return;
    run.frame = requestAnimationFrame(() => {
      if (!run) return;
      run.frame = 0;
      const shouldReveal = run.needsReveal;
      run.needsReveal = false;
      position(shouldReveal);
    });
  }

  function showStep(index) {
    if (!run || index < 0) return;
    if (!visibleControl('#' + run.launcherId)) {
      finish(false, false);
      return;
    }
    if (index >= run.steps.length) {
      finish(true);
      return;
    }
    stopClock();
    const step = run.steps[index];
    run.index = index;
    run.remaining = step.ms;
    dialog.dataset.phase = 'tour';
    count.textContent = `${run.name} Tutorial · ${index + 1} of ${run.steps.length}`;
    title.textContent = step.title;
    text.textContent = step.text;
    progress.style.width = ((index + 1) / run.steps.length * 100) + '%';
    back.hidden = false;
    if (index === 0 && document.activeElement === back) (run.mode === 'manual' ? next : pause).focus({preventScroll: true});
    back.disabled = index === 0;
    next.textContent = index === run.steps.length - 1 ? 'Finish' : 'Next';
    card.scrollTop = 0;
    position(true);
    startClock();
  }

  function openTutorial(launcher, name, stops) {
    if (run || !launcher.getClientRects().length) return;
    const events = new AbortController();
    const options = {signal: events.signal};
    run = {
      name, launcherId: launcher.id,
      steps: stops.filter(step => visibleControl(step.selector)),
      index: -1, mode: null, paused: false, timer: 0, frame: 0, remaining: 0, events,
      x: window.scrollX, y: window.scrollY,
      rails: Array.from(document.querySelectorAll('.sidebar, #navigation'), el => [el, el.scrollLeft, el.scrollTop]),
      observer: new ResizeObserver(() => schedulePosition(true))
    };
    dialog.dataset.tour = name.toLowerCase();
    dialog.dataset.phase = 'welcome';
    dialog.removeAttribute('data-target-hidden');
    const duration = run.steps.reduce((ms, step) => ms + step.ms, 0);
    const seconds = 5 * Math.round(duration / 5000);
    count.textContent = `${run.steps.length} steps`;
    title.textContent = `${name} Tutorial`;
    text.textContent = '';
    dialog.setAttribute('aria-describedby', 'tutorial-mode-help');
    watchNote.textContent = `For the animation, leave the screen untouched for about ${seconds} seconds.`;
    choices.hidden = false;
    actions.hidden = true;
    pause.hidden = false;
    back.hidden = true;
    pause.textContent = 'Pause';
    next.textContent = 'Next';
    progress.style.width = '0';
    card.style.removeProperty('left');
    card.style.removeProperty('top');
    card.scrollTop = 0;
    document.documentElement.classList.add('home-tutorial-open');
    dialog.showModal();
    const launchRect = launcher.getBoundingClientRect();
    cursor.style.transform = `translate3d(${launchRect.left + launchRect.width / 2}px, ${launchRect.top + launchRect.height / 2}px, 0)`;
    watch.focus({preventScroll: true});

    run.observer.observe(bounds);
    run.observer.observe(card);
    window.addEventListener('scroll', () => schedulePosition(), {...options, capture: true, passive: true});
    window.addEventListener('resize', () => schedulePosition(true), options);
    window.visualViewport?.addEventListener('resize', () => schedulePosition(true), options);
    window.visualViewport?.addEventListener('scroll', () => schedulePosition(), options);
    window.addEventListener('hashchange', () => finish(false, false), options);
    window.addEventListener('pagehide', () => finish(false, false), options);
    document.addEventListener('visibilitychange', () => document.hidden ? stopClock() : startClock(), options);
  }

  function begin(mode) {
    if (!run || run.mode) return;
    run.mode = mode;
    choices.hidden = true;
    dialog.setAttribute('aria-describedby', 'tutorial-text');
    actions.hidden = false;
    pause.hidden = mode === 'manual';
    showStep(0);
    if (run) (mode === 'manual' ? next : pause).focus({preventScroll: true});
  }

  main.addEventListener('click', event => {
    const launcher = event.target.closest('#home-tutorial-launch, [data-tutorial]');
    if (!launcher) return;
    if (launcher.id === 'home-tutorial-launch') return openTutorial(launcher, 'Home', homeStops);
    if (launcher.dataset.tutorial === 'reading') return openTutorial(launcher, 'Read', readingStops(getReadingGroup()));
    const tour = sectionTours[launcher.dataset.tutorial];
    if (tour) openTutorial(launcher, tour.name, tour.steps());
  });
  part('.tutorial-exit').addEventListener('click', () => finish());
  watch.addEventListener('click', () => begin('animation'));
  manual.addEventListener('click', () => begin('manual'));
  next.addEventListener('click', () => { if (run) showStep(run.index + 1); });
  back.addEventListener('click', () => { if (run) showStep(run.index - 1); });
  pause.addEventListener('click', () => {
    if (run?.mode !== 'animation') return;
    run.paused = !run.paused;
    pause.textContent = run.paused ? 'Resume' : 'Pause';
    if (run.paused) stopClock();
    else startClock();
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); finish(); });
  dialog.addEventListener('close', () => { if (!dialog.open) finish(); });
}
