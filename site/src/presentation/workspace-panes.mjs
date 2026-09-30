/** Switch mobile panes without remounting Monaco, losing drafts, or restarting Uno. */
export function installWorkspacePanes(root) {
  const media = matchMedia('(max-width: 720px)');
  const group = root.querySelector('.workspace-pane-switch');
  const grid = root.querySelector('.lab-grid');
  const code = grid.querySelector('.editor-pane');
  const preview = grid.querySelector('.preview-pane');
  const buttons = [...group.querySelectorAll('button[data-pane]')];
  let pane = 'code';
  let narrow = media.matches;
  let disposed = false;

  function update() {
    if (disposed) return;
    // Move focus before making its previous owner inert. Outside controls retain
    // focus; the controller never replaces the code or preview nodes.
    const hiddenPane = pane === 'code' ? preview : code;
    if (media.matches && hiddenPane.contains(document.activeElement)) {
      buttons.find(button => button.dataset.pane === pane)?.focus({preventScroll: true});
    }
    grid.dataset.pane = pane;
    code.inert = media.matches && pane !== 'code';
    preview.inert = media.matches && pane !== 'preview';
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.pane === pane)));
  }

  function revealSelection() {
    if (!media.matches || document.hidden) return;
    const bounds = root.getBoundingClientRect();
    const top = Math.max(0, document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0);
    // Do not pull a learner back from another section after a slow first load.
    if (bounds.bottom <= top || bounds.top >= window.innerHeight) return;
    const selected = (pane === 'preview' ? preview : code).getBoundingClientRect();
    const usefulHeight = Math.min(160, selected.height);
    if (selected.top >= top && selected.top + usefulHeight <= window.innerHeight) return;
    group.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'instant'});
  }

  function select(next, reveal = false) {
    if (disposed || (next !== 'code' && next !== 'preview')) return;
    pane = next;
    update();
    if (reveal) revealSelection();
  }
  const listener = event => {
    const button = event.target.closest('button[data-pane]');
    if (button && group.contains(button)) select(button.dataset.pane, true);
  };
  const rememberFocus = () => {
    if (disposed) return;
    // Remember the owner while both panes are visible. CSS can hide a pane
    // before matchMedia dispatches its resize notification.
    if (code.contains(document.activeElement)) select('code');
    else if (preview.contains(document.activeElement)) select('preview');
  };
  const resize = () => {
    if (disposed) return;
    if (!narrow && media.matches) {
      if (code.contains(document.activeElement)) pane = 'code';
      else if (preview.contains(document.activeElement)) pane = 'preview';
    }
    narrow = media.matches;
    update();
  };
  group.addEventListener('click', listener);
  grid.addEventListener('focusin', rememberFocus);
  window.addEventListener('blur', rememberFocus);
  media.addEventListener('change', resize);
  update();
  return {
    showCode() { select('code'); },
    showPreview() { if (media.matches) select('preview', true); },
    dispose() {
      if (disposed) return;
      disposed = true;
      group.removeEventListener('click', listener);
      grid.removeEventListener('focusin', rememberFocus);
      window.removeEventListener('blur', rememberFocus);
      media.removeEventListener('change', resize);
      code.inert = preview.inert = false;
    }
  };
}
