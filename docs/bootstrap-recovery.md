# Bootstrap recovery and public-host verification

The first public Pages acceptance run exposed a lifecycle bug that the local server did not: an initial WebAssembly asset request failed with a CORS/network error, but the .NET loader retried the same URL and received HTTP 200 with `Access-Control-Allow-Origin: *`. The runtime then created its Uno view. LearnUno had already treated the initial global rejected promise as a terminal startup failure and rejected the later ready message.

The host now distinguishes **diagnostics** from **terminal initialization failures**. Global errors/rejections during bootstrap are reported as diagnostic messages; they are not swallowed or assumed to prove that the runtime has irreversibly failed. Explicit managed initialization failures and an unavailable exported bridge remain terminal. The parent's bounded startup deadline still fails a runtime that never becomes ready.

This is not a general instruction to ignore unhandled exceptions. It is a specific policy for a loader that retries failed network attempts. User-code exceptions remain compiler/runtime errors and are surfaced through the request protocol or browser diagnostics. The sandbox origin checks and permission boundary are unchanged.

Regression tests exercise a transient bootstrap rejection followed by successful readiness and a real protocol request. Separate tests require explicit initialization failures to remain terminal and verify parent/origin/channel validation. Public acceptance tests exercise the complete editor/compiler/Uno workflow after deployment instead of assuming local success proves hosting correctness.
