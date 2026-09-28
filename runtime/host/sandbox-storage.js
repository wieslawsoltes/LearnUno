/* Per-frame, bounded, ephemeral settings. Never reads the embedding origin's storage. */
(() => {
  'use strict';
  function createStorage(limit = 1024 * 1024) {
    const entries = new Map();
    let bytes = 0;
    const size = (key, value) => 2 * (key.length + value.length);
    const api = {
      get length() { return entries.size; },
      key(index) { return [...entries.keys()][Number(index) >>> 0] ?? null; },
      getItem(key) { return entries.get(String(key)) ?? null; },
      setItem(key, value) {
        key = String(key); value = String(value);
        const previous = entries.has(key) ? size(key, entries.get(key)) : 0;
        const next = bytes - previous + size(key, value);
        if (next > limit) throw new DOMException('The ephemeral lesson settings limit is 1 MiB.', 'QuotaExceededError');
        entries.set(key, value); bytes = next;
      },
      removeItem(key) {
        key = String(key);
        if (entries.has(key)) { bytes -= size(key, entries.get(key)); entries.delete(key); }
      },
      clear() { entries.clear(); bytes = 0; }
    };
    return new Proxy(Object.create(api), {
      get(target, property, receiver) {
        if (property === Symbol.toStringTag) return 'Storage';
        return Reflect.has(target, property) ? Reflect.get(target, property, receiver) : entries.get(String(property));
      },
      set(_target, property, value) { if (typeof property !== 'string') return false; api.setItem(property, value); return true; },
      deleteProperty(_target, property) { api.removeItem(property); return true; },
      has(target, property) { return entries.has(String(property)) || Reflect.has(target, property); },
      ownKeys() { return [...entries.keys()]; },
      getOwnPropertyDescriptor(_target, property) {
        return entries.has(String(property)) ? { value: entries.get(String(property)), writable: true, enumerable: true, configurable: true } : undefined;
      },
      defineProperty(_target, property, descriptor) {
        if (typeof property !== 'string' || !('value' in descriptor)) return false;
        api.setItem(property, descriptor.value); return true;
      }
    });
  }
  for (const name of ['localStorage', 'sessionStorage']) {
    const storage = createStorage();
    Object.defineProperty(globalThis, name, { configurable: true, enumerable: true, get: () => storage });
  }
  globalThis.learnUnoSettingsMode = 'ephemeral-per-frame';
})();
