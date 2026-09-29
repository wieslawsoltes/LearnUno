import {installCodeColoring} from './coloring/dom.mjs';
import './app.mjs';

// A skip link moves focus; it must not navigate the fragment-based SPA router.
document.querySelector('.skip')?.addEventListener('click', event => {
  const main = document.getElementById('main');
  if (!main) return;
  event.preventDefault();
  main.focus({preventScroll: true});
  main.scrollIntoView({block: 'start', behavior: 'instant'});
});

installCodeColoring();
