# Fluent-inspired learning shell

## Design intent and implementation boundary

This is a web implementation inspired by Microsoft Fluent, not a native Windows
backdrop and not a claim to read the user's desktop wallpaper. A static, opaque
tinted shell approximates Mica; solid content cards establish the reading layer.
Acrylic-style CSS backdrop blur is limited to the transient navigation drawer
and modal dialogs. A static, low-opacity caustic highlight appears only on the
welcome surface. It never follows the pointer or runs an animation/GPU loop.

The hierarchy follows Microsoft's material guidance: Mica for a persistent base,
Acrylic for transient surfaces, and a smoke overlay for modal interaction.

- https://learn.microsoft.com/en-us/windows/apps/design/style/mica
- https://learn.microsoft.com/en-us/windows/apps/design/style/acrylic
- https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/materials

No font package, CDN, UI library or runtime dependency was added. The system font
stack prefers Segoe UI Variable/Segoe UI where installed and otherwise uses the
platform's available UI fonts. It is not a redistribution of Microsoft's fonts.

## Materials, density and scope

`fluent.css` imports token/surface, reading and responsive layers after the
previous design styles. Existing atlas illustrations and explicitly themed HTML
specimens retain their own palette contracts. The Uno iframe's renderer,
resources and sandbox permissions are unchanged.

Presentation preferences are additive to the existing progress object:

- `density: compact | comfortable` (default compact).
- `materials: subtle | solid` (default subtle).

Compact reduces chrome, card spacing and repeated heading gaps rather than
shrinking body text. Reading paragraphs remain at least 15px in the main reader.
Comfortable increases spacing and uses 16px reading text. Solid mode removes the
optional tint/caustic effects and overlay blur. Reduced-transparency, increased
contrast and forced-colors system preferences override optional effects.
Unsupported backdrop filters fall back to solid surfaces. These are browser
preferences; no assertion is made about detecting OS battery-saver state.

## Navigation and lessons

The twelve primary destinations are grouped into Learn, Explore and Your library.
The fifteen path links are available in a disclosure instead of always doubling
the rail's height. All destinations, lesson IDs and course content remain intact.

Below 1100px, navigation becomes a modal drawer. It has a close control and smoke
backdrop; background content becomes inert. Keyboard focus is contained, Escape
restores focus to the opener, selection closes the drawer, and resizing back to
desktop releases modal state. Hidden mobile navigation is inert as well as hidden.

Below 980px, the chapter outline defaults to a single disclosure row. Choosing a
section moves focus using the existing chapter jump, closes the disclosure and
preserves the URL. The current section and chapter scroll position are shown;
scroll position is explicitly not a completion or mastery score. Event listeners,
ResizeObserver and pending animation frames are released with the chapter.

Headers and lesson tabs stay visible without layering acrylic behind text.
Section scroll margins keep focused headings clear of the sticky controls.
Existing source cards, all four detailed steps, infographics, notes and runnable
source variants remain present; no learning material is removed for compactness.

## Mobile playground

At 720px and below, Code and Preview are presentation panes over the same editor
and iframe. Switching does not destroy Monaco, change a draft or restart Uno.
A successful run opens Preview; returning to Code preserves the exact source.
The inactive pane is inert. Larger screens show both again. This adapts all core,
workshop and design exercises because they share the same workspace component.

Safe-area padding, dynamic viewport heights, 16px form inputs and touch-sized
controls are provided. Wide diagrams/code retain local scroll instead of making
the document wider. Material effects are not needed to operate any control.

## Verification

Tests cover preference defaults and preservation, lifecycle cleanup, mobile
navigation focus, disclosure/jump behavior, solid/forced-color fallbacks,
320/390/768/1024px route overflow, content preservation, and mobile editor/runtime
identity across pane changes. The main workflow still compiles and executes all
216 authored Uno variants and retains the original semantic-service and GPU tests.
Screenshots and validation results identify the specific tested commit; local
component previews are not substituted for full browser/public-site results.

The previously delivered rich-text regression-guard follow-up is included as a
separate source change. It leaves all runnable variants unchanged, keeps the
RichTextBlock implementation boundary visible, and strengthens text/link/export
checks. The theme does not remove or hide those notices.
