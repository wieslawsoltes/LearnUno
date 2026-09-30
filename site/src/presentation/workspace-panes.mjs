/** Switch mobile panes without remounting Monaco, losing drafts, or restarting Uno. */
export function installWorkspacePanes(root) {
  const media = matchMedia('(max-width: 720px)');
  const group = root.querySelector('.workspace-pane-switch');
  const grid = root.querySelector('.lab-grid');
  const code = grid.querySelector('.editor-pane'), preview = grid.querySelector('.preview-pane');
  let pane = 'code';
  function update() {
    grid.dataset.pane = pane;
    code.inert = media.matches && pane !== 'code';
    preview.inert = media.matches && pane !== 'preview';
    group.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.pane === pane)));
  }
  const listener = event => {
    const button = event.target.closest('[data-pane]');
    if (button) { pane = button.dataset.pane; update(); }
  };
  group.addEventListener('click', listener);
  media.addEventListener('change', update);
  update();
  return {
    showPreview() { if (media.matches) { pane = 'preview'; update(); } },
    dispose() { group.removeEventListener('click', listener); media.removeEventListener('change', update); code.inert = preview.inert = false; }
  };
}
