(() => {
  'use strict';
  globalThis.unoRootElement = document.getElementById('uno-host');
  const params = new URLSearchParams(location.hash.slice(1));
  const channel = params.get('channel');
  const parentOrigin = params.get('parent');
  let request;
  const send = payload => parent.postMessage({ protocol: 'learnuno:1', channel, ...payload }, parentOrigin || '*');
  const messageOf = error => String(error?.message || error || 'Unknown runtime error').slice(0, 4000);

  // Only explicit host/managed initialization failures are terminal. The .NET asset
  // loader retries transient fetch failures and may report a rejected first attempt.
  // A global rejection by itself must not poison a subsequently successful startup.
  window.learnUnoBootError = error => {
    const message = messageOf(error);
    const boot = document.getElementById('boot');
    if (boot) boot.textContent = 'Uno could not start: ' + message;
    send({ type: 'error', error: message });
  };
  const diagnostic = error => {
    if (!request) send({ type: 'diagnostic', phase: 'bootstrap', error: messageOf(error) });
  };

  window.learnUnoRuntimeReady = async () => {
    try {
      const runtime = globalThis.getDotnetRuntime?.(0);
      const getExports = runtime?.getAssemblyExports || globalThis.Module?.getAssemblyExports;
      const exports = getExports ? await getExports('LearnUnoRunner.dll') : globalThis.DotnetExports?.LearnUnoRunner;
      request = exports?.LearnUnoRunner?.Bridge?.Request;
      if (!request) throw new Error('The .NET runtime did not expose LearnUnoRunner.Bridge.Request.');
      document.getElementById('boot')?.remove();
      send({ type: 'ready', engine: 'Uno WebAssembly', protocolVersion: 1 });
    } catch (error) { window.learnUnoBootError(error); }
  };
  window.addEventListener('error', event => diagnostic(event.error || event.message));
  window.addEventListener('unhandledrejection', event => diagnostic(event.reason));
  window.addEventListener('message', async event => {
    if (event.source !== parent || (parentOrigin && event.origin !== parentOrigin)) return;
    const data = event.data;
    if (!data || data.protocol !== 'learnuno:1' || data.channel !== channel || data.type !== 'request') return;
    if (!request) return send({ type: 'response', id: data.id, payload: { ok: false, error: 'Runtime is not ready.' } });
    try { send({ type: 'response', id: data.id, payload: JSON.parse(await request(JSON.stringify(data.payload))) }); }
    catch (error) { send({ type: 'response', id: data.id, payload: { ok: false, error: messageOf(error) } }); }
  });
})();
