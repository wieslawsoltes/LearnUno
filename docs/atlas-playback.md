# Visual atlas playback

The explanation, transport and step navigation now form one block immediately below the diagram. Next step no longer lives in a distant, icon-only toolbar. Previous/Next, Play/Pause/Replay, Restart, a seek slider, labelled speed selection and opt-in Loop remain available on narrow displays. Reset experiment and Expand remain separate utilities.

## Behaviour contract

| Interaction | Result |
| --- | --- |
| Play / Pause | Resume or freeze the exact fractional timeline position; the icon and visible text match the state. |
| Next / Previous / phase button | Pause automatic playback and seek the selected phase. No stale clock can move the selection backwards. |
| First / last phase | Previous / Next are disabled at their respective boundaries; stepping never wraps unexpectedly. |
| End of playback | Stop at 100%, retain the final view and offer Replay. Loop is off by default. |
| Restart steps | Return to the beginning without restoring unrelated experiment parameters. |
| Reset experiment | Restore the lab's authored inputs and align its timeline with those defaults. |
| Seek slider | Pause and scrub a single authoritative timeline. |
| Speed | Settle elapsed time at the previous rate, then change the rate without seeking. |
| Edit an input, choose a preset or drag an object | Pause first so the animation cannot overwrite the user's work. |
| Hidden document / offscreen diagram and transport | Suspend frame scheduling without losing the user's play intent or counting hidden time. Explicit Pause cancels that intent. |
| Reduced motion / disabled motion preference | Stop timed playback; keep manual steps, seeking and input controls available. Re-enabling motion does not start playback. |
| Navigate away | Dispose the controller, pending frame, observers and listeners. |

For the easing and async-race labs, inspector time values, playback position and the four explanation phases are synchronized. A saved example may therefore open partway through its explanation, matching its existing time value. For other labs playback moves a spotlight through the relevant diagram regions without pretending to execute Uno code or changing the experiment's parameters.

## Implementation

`site/src/atlas/playback.mjs` implements a deterministic `AtlasPlayback` controller with injected monotonic time, request-frame and cancellation functions. It separates user intent from a set of suspension reasons, holds at most one outstanding animation callback, and uses elapsed time rather than frame counts. There is no arbitrary slow-frame clamp or second clock that can drift from manual navigation.

`phase-focus.mjs` maps each explanation stage to the corresponding scene geometry. The rendering adapter limits transport updates to 30 Hz, rebuilds static scenes only when needed, avoids rewriting unchanged code/readout blocks, and submits GPU tile work only when classification inputs change. Narration status updates announce state/phase changes rather than every animation frame.

The UI uses native buttons, selects and range inputs. Phase selection preserves keyboard focus; Escape restores the expanded-view control's label and focus. The timeline's percentage and accessible value text reflect its actual position. Code and numerical readouts remain separate from status announcements.

## Tests and scope

Controller tests use a manually advanced clock and frame queue to exercise pause/resume precision, seeking, rate changes, completion, looping, multiple suspension reasons, motion preferences, disposal and reentrant callbacks. Browser regression tests cover the moved controls, visible icons, step boundaries, shared inspector clock, manual-edit ownership, mobile keyboard operation, reduced motion and navigation cleanup. Existing course and actual Uno/Roslyn tests remain required.

The timeline durations are teaching parameters, not measurements of framework or GPU execution. Browser tests do not constitute a screen-reader certification on every platform.

Reference: W3C WAI's guidance on user-controlled pause/resume and keyboard-operable navigation: https://www.w3.org/WAI/tutorials/carousels/ and https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.
