# Ephemeral runtime settings

The preview remains an opaque-origin iframe with `sandbox="allow-scripts"`. It does not receive `allow-same-origin` and cannot access the parent course's browser storage or DOM.

Uno 6.7 initializes application-language preferences through `ApplicationData.Current.LocalSettings`. Its browser implementation expects Storage-style methods and named-key existence checks. Opaque-origin frames do not have access to real localStorage. `runtime/host/sandbox-storage.js` supplies an explicitly **in-memory, per-frame** implementation before the Uno bootstrapper starts.

Each local/session store has a 1 MiB UTF-16 accounting limit. It supports get/set/remove/clear, length, key enumeration, and the named-key checks used by Uno. Rejected oversized writes are atomic. The stores are independent and are destroyed with the frame. They are not durable storage, a bridge to the parent, or a complete replacement for every browser Storage edge case.

The course's own notes and progress remain in its separate origin-local storage. A lesson that serializes data in the runner must not imply that these ephemeral settings survive reset or reload. IndexedDB filesystem persistence is not enabled in the runner.

Tests verify key semantics, quota enforcement, and separation between instances and between local/session stores.
