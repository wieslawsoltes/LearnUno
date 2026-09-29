/** Site-wide coloring; Monaco and the isolated Uno document keep their own ownership. */
export function installCodeColoring(root = document.body) {
  const states = new WeakMap();
  const pending = new Map();
  const queue = new Set();
  let worker = null, serial = 0, timer = 0, watchdog = 0, inflight = null, disposed = false;

  // The rendered PRE language badge is output, not a future input hint. Otherwise
  // an inferred C# block can never change to XML when its source is replaced.
  function hint(node) {
    return node.dataset.language
      || String(node.className).match(/\blanguage-([\w#+-]+)/)?.[1]
      || node.parentElement?.closest('[data-language]')?.dataset.language
      || '';
  }

  function stopWorker() {
    worker?.terminate();
    worker = null;
    clearTimeout(watchdog);
    inflight = null;
    pending.clear();
  }

  function ensureWorker() {
    if (worker) return true;
    try {
      worker = new Worker(new URL('./coloring.worker.js', import.meta.url), {type: 'module'});
      worker.onmessage = receive;
      worker.onerror = () => { stopWorker(); drain(); };
      return true;
    } catch { return false; }
  }

  function receive({data}) {
    const job = pending.get(data?.id);
    pending.delete(data?.id);
    if (inflight === data?.id) { clearTimeout(watchdog); inflight = null; }
    if (job && !data.error && job.node.isConnected
        && job.node.textContent === job.code && hint(job.node) === job.hint) {
      job.node.innerHTML = data.html;
      job.node.dataset.colored = data.language;
      job.node.classList.add('syntax-code');
      if (job.node.parentElement?.tagName === 'PRE') job.node.parentElement.dataset.codeLanguage = data.language;
    }
    drain();
  }

  function visit(node) {
    if (node.nodeType !== 1) return;
    if (node.matches('code')) queue.add(node);
    for (const code of node.querySelectorAll('code')) queue.add(code);
  }

  function scan(records) {
    for (const record of records) {
      const node = record.target.nodeType === 3 ? record.target.parentElement : record.target;
      if (node?.closest?.('.monaco-editor, .view-lines, [data-no-color]')) continue;
      if (record.type === 'attributes' && record.attributeName === 'class' && node?.tagName !== 'CODE') continue;
      const code = node?.closest?.('code');
      if (code) queue.add(code);
      if (record.type === 'attributes' && record.attributeName === 'data-language') visit(node);
      for (const added of record.addedNodes) visit(added);
    }
    clearTimeout(timer);
    timer = setTimeout(drain, 30);
  }

  function drain() {
    if (disposed || inflight !== null) return;
    for (const node of queue) {
      queue.delete(node);
      if (!node.isConnected || node.closest('.monaco-editor, [data-no-color]')) continue;
      const code = node.textContent, language = hint(node), key = language + '\0' + code;
      if (states.get(node) === key) continue;
      states.set(node, key);
      if (!code.trim()) continue;
      if (!ensureWorker()) return;
      const id = ++serial;
      pending.set(id, {node, code, hint: language});
      inflight = id;
      try {
        worker.postMessage({id, code, language});
        watchdog = setTimeout(() => {
          if (node.isConnected && node.textContent === code) {
            node.textContent = code;
            node.dataset.colored = 'plaintext';
            if (node.parentElement?.tagName === 'PRE') node.parentElement.dataset.codeLanguage = 'plaintext';
          }
          stopWorker();
          drain();
        }, 1800);
      } catch { stopWorker(); drain(); }
      return;
    }
  }

  const observer = new MutationObserver(scan);
  observer.observe(root, {
    childList: true, subtree: true, characterData: true,
    attributes: true, attributeFilter: ['data-language', 'class']
  });
  visit(root);
  drain();
  return () => {
    disposed = true;
    clearTimeout(timer);
    stopWorker();
    queue.clear();
    observer.disconnect();
  };
}
