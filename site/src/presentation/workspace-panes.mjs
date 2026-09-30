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
    // Move focus before making its previous owner inert. For an editor shortcut
    // this exposes the selected view to keyboard users; a focused Run button or
    // another external control keeps focus. The controller never replaces nodes.
    const hiddenPane = pane === 'code' ? preview : code;
    if (media.matches && hiddenPane.contains(document.activeElement)) {
      buttons.find(button => button.dataset.pane === pane)?.focus({preventScroll: true});
    }
    grid.dataset.pane = pane;
    code.inert = media.matches && pane !== 'code';
    preview.inert = media.matches && pane !== 'preview';
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.pane === pane)));
  }

  function select(next) {
    if (disposed || (next !== 'code' && next !== 'preview')) return;
    pane = next;
    update();
  }
  const listener = event => {
    const button = event.target.closest('button[data-pane]');
    if (button && group.contains(button)) select(button.dataset.pane);
  };
  const rememberFocus = () => {
    if (disposed) return;
    // Update the selected owner while both panes are visible. CSS can hide a
    // newly inactive pane before matchMedia dispatches its change notification.
    if (code.contains(document.activeElement)) select('code');
    else if (preview.contains(document.activeElement)) select('preview');
  };
  const resize = () => {
    if (disposed) return;
    // A desktop resize must not hide the editor or preview the user is working
    // in merely because a different mobile pane was selected earlier.
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
    showPreview() { if (media.matches) select('preview'); },
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
