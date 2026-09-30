# Actual control state versus browser roles

The pinned Uno NativeRenderer creates a Button host as a DOM div. Browser role lookup alone does not discover every unannotated control in this configuration. Initial app-building tests stopped before clicking those hosts; this was not evidence that their managed commands had failed.

The host provides a bounded, read-only `inspect` request. It traverses the current Uno visual tree and open popups, reports actual control type, content, handle, enabled state and visible geometry, and stops at 2,048 nodes. It never invokes handlers, runs commands, changes properties or fabricates DOM roles. String fields are bounded. The request uses the existing validated iframe protocol.

Interaction tests require one visible Uno Button with the expected content, assert its real IsEnabled state, then send an actual browser pointer click to that control's xamlhandle. Text editing and resulting UI assertions still use the actual browser-rendered controls. No test calls a Click handler or Execute method on behalf of the browser.

This establishes interaction behavior and managed availability, not full browser screen-reader conformance. The surrounding HTML course/mockups are tested by accessible roles; the NativeRenderer's platform accessibility limitations remain an explicit boundary. Moving to another renderer requires adapting the host locator and independently validating its accessibility output.

The source scan and lessons continue to distinguish a declared API, a passing model, a rendered example, a working user interaction and target-specific accessibility evidence. None is a substitute for the others.
