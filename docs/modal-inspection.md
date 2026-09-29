# Inspecting the real modal boundary

A full browser regression found that the ContentDialog was visibly open, but its buttons were absent from the runner's read-only inspection snapshot. The inspector seeded the Popup object and walked its visual children. On this renderer, the actual Popup.Child is hosted under the popup visual root, not exposed as a direct visual child of that Popup object.

The inspector now explicitly seeds each open popup's Child from the same XamlRoot, retaining the bounded queue and visited set. It records ButtonBase membership from the actual managed type instead of guessing that every actionable button has the exact Button type name. This is read-only inspection: no click handler, command or managed input method is invoked by the inspector.

Tests still click the control's real DOM host and require the actual managed enabled/visible state. A modal regression verifies that repeated inspection does not choose a decision, that handles are unique, and that the modal controls disappear after the real Keep draft action. DOM accessibility is a separate contract; this inspection is not a fabricated ARIA implementation.

The source-map regression was also corrected to match its intended substring search: ScrollViewer and related ScrollViewer types remain discoverable. It verifies the exact ScrollViewer card and its learning link without asserting that associated types should disappear.

These regressions are included in the full pre-deployment and public-site browser suites. Their existence alone is not a claim of passing results; consult the release workflow.
