/** Compact mobile outline + scroll position, never a completion/mast​ery score. */
export function installChapterNavigation(root, signal) {
  const aside = root.querySelector('.study-outline');
  const inner = aside?.querySelector('.study-outline-inner');
  if (!inner) return;
  const media = matchMedia('(max-width: 980px)');
  const disclosure = document.createElement('details');
  disclosure.className = 'chapter-contents';
  const summary = document.createElement('summary');
  summary.innerHTML = '<span>In this lesson</span><span class="chapter-location">Overview</span>';
  disclosure.append(summary, inner);
  aside.append(disclosure);
  disclosure.open = !media.matches;
  media.addEventListener('change', () => { disclosure.open = !media.matches; }, {signal});

  const chapters = [...root.querySelectorAll('.study-intro[id],.study-section-heading[id],article[data-chapter-step][id]')];
  const progress = document.createElement('div');
  progress.className = 'chapter-reading-position';
  progress.setAttribute('role', 'progressbar');
  progress.setAttribute('aria-label', 'Position in chapter, not lesson completion');
  progress.setAttribute('aria-valuemin', '0');
  progress.setAttribute('aria-valuemax', '100');
  progress.innerHTML = '<i></i>';
  aside.prepend(progress);
  let frame = 0, current = '';
  function update() {
    frame = 0;
    if (signal.aborted || !root.isConnected) return;
    const anchor = chapters[0] || root.querySelector('.study-main');
    const top = parseFloat(getComputedStyle(anchor).scrollMarginTop) || 128;
    const active = chapters.filter(node => node.getBoundingClientRect().top <= top + 24).at(-1) || chapters[0];
    if (active && current !== active.id) {
      current = active.id;
      const buttons = [...aside.querySelectorAll('[data-study-jump]')];
      const button = buttons.find(node => current.endsWith('-' + node.dataset.studyJump));
      buttons.forEach(node => {
        if (node === button) node.setAttribute('aria-current', 'location');
        else node.removeAttribute('aria-current');
      });
      summary.querySelector('.chapter-location').textContent = button?.textContent || 'Overview';
    }
    const main = root.querySelector('.study-main');
    const bounds = main.getBoundingClientRect();
    const available = Math.max(1, bounds.height - Math.max(1, innerHeight - top));
    const percent = Math.round(Math.min(100, Math.max(0, (top - bounds.top) / available * 100)));
    progress.setAttribute('aria-valuenow', String(percent));
    progress.firstElementChild.style.width = percent + '%';
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  // Close after the jump listener focuses the target, avoiding a hidden focused button.
  root.addEventListener('click', event => {
    if (media.matches && aside.contains(event.target) && event.target.closest('[data-study-jump]')) {
      disclosure.open = false;
    }
    schedule();
  }, {signal});
  window.addEventListener('scroll', schedule, {passive: true, signal});
  window.addEventListener('resize', schedule, {passive: true, signal});
  const observer = new ResizeObserver(schedule);
  observer.observe(root.querySelector('.study-main'));
  signal.addEventListener('abort', () => { cancelAnimationFrame(frame); observer.disconnect(); }, {once: true});
  schedule();
}
