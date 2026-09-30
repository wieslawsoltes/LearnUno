/** A single responsive navigation controller, independent of the course router. */
export function installNavigation({sidebar, page, toggle, backdrop, closeButton}) {
  const controller = new AbortController();
  const {signal} = controller;
  const media = matchMedia('(max-width: 1100px)');
  let open = false;
  let returnFocus = null;

  function focusable() {
    return [...sidebar.querySelectorAll('a[href],button,summary,[tabindex="0"]')]
      .filter(node => !node.disabled && node.getClientRects().length > 0 && !node.closest('[inert]'));
  }
  function close(restoreFocus = true) {
    if (!open) return;
    open = false;
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    page.inert = false;
    backdrop.hidden = true;
    sidebar.removeAttribute('role');
    sidebar.removeAttribute('aria-modal');
    if (restoreFocus) (returnFocus?.isConnected ? returnFocus : toggle).focus({preventScroll: true});
    else if (sidebar.contains(document.activeElement)) page.querySelector('#main')?.focus({preventScroll: true});
    sidebar.inert = media.matches;
    returnFocus = null;
  }
  function show() {
    if (!media.matches || open) return;
    returnFocus = document.activeElement;
    open = true;
    sidebar.inert = false;
    sidebar.setAttribute('role', 'dialog');
    sidebar.setAttribute('aria-modal', 'true');
    document.body.classList.add('nav-open');
    toggle.setAttribute('aria-expanded', 'true');
    backdrop.hidden = false;
    page.inert = true;
    (sidebar.querySelector('.main-nav a.active') || closeButton).focus({preventScroll: true});
  }
  function resize() {
    if (!media.matches) close(false);
    sidebar.inert = media.matches && !open;
  }
  toggle.addEventListener('click', () => open ? close() : show(), {signal});
  closeButton.addEventListener('click', () => close(), {signal});
  backdrop.addEventListener('click', () => close(), {signal});
  sidebar.addEventListener('click', event => {
    if (event.target.closest('a[href]')) close(false);
  }, {signal});
  document.addEventListener('keydown', event => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      close();
    } else if (event.key === 'Tab') {
      const candidates = focusable();
      const first = candidates[0], last = candidates.at(-1);
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || !sidebar.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !sidebar.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    }
  }, {capture: true, signal});
  window.addEventListener('hashchange', () => close(false), {signal});
  media.addEventListener('change', resize, {signal});
  resize();
  return () => { close(false); sidebar.inert = false; controller.abort(); };
}
