(() => {
  const params = new URLSearchParams(location.hash.slice(1));
  const channel = params.get('channel');
  const parentOrigin = params.get('parent');
  let request;
  const send = payload => parent.postMessage({ protocol: 'learnuno:1', channel, ...payload }, parentOrigin || '*');
  window.learnUnoBootError = error => { document.getElementById('boot').textContent = 'Uno could not start: ' + error.message; send({ type: 'error', error: error.message }); };
  window.learnUnoRuntimeReady = async () => {
    try {
      let exports;
      if (globalThis.getDotnetRuntime) exports = await globalThis.getDotnetRuntime(0).getAssemblyExports('LearnUnoRunner.dll');
      else exports = globalThis.DotnetExports?.LearnUnoRunner;
      request = exports?.LearnUnoRunner?.Bridge?.Request;
      if (!request) throw new Error('The .NET runtime did not expose LearnUnoRunner.Bridge.Request.');
      document.getElementById('boot').remove();
      send({ type: 'ready', engine: 'Uno WebAssembly', protocolVersion: 1 });
    } catch (error) { window.learnUnoBootError(error); }
  };
  window.addEventListener('message', async event => {
    if (event.source !== parent || (parentOrigin && event.origin !== parentOrigin)) return;
    const data = event.data;
    if (!data || data.protocol !== 'learnuno:1' || data.channel !== channel || data.type !== 'request') return;
    if (!request) return send({ type: 'response', id: data.id, payload: { ok: false, error: 'Runtime is not ready.' } });
    try { send({ type: 'response', id: data.id, payload: JSON.parse(await request(JSON.stringify(data.payload))) }); }
    catch (error) { send({ type: 'response', id: data.id, payload: { ok: false, error: error.message } }); }
  });
})();
