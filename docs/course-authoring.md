# Authoring a lesson

## The learning contract

Each lesson should teach a specific observable behavior, not just introduce an API name. Start with a prediction, explain a causal model, provide a runnable experiment, and ask the learner to transfer the idea to a new situation.

The course currently has ten modules under `site/src/course`. Each exports six lessons built with `L`. The helper records an ID, title, summary, concept sections, starter, focused edit, retrieval question, source-search term, and optional advanced material.

```js
import { L, xaml } from './helpers.mjs';

L(
  'clear-example',
  'A visible property change',
  'Predict how a TextBlock property changes its output.',
  [
    ['Own the value', 'Explain the owning object, the relevant property, and the behavior being tested.'],
    ['Follow the change', 'Explain how this value reaches the rendered result and which assumptions matter.'],
    ['Test a boundary', 'Describe a nearby failure or boundary case and how to observe it.']
  ],
  xaml('  <TextBlock Text="Hello" FontSize="24" />'),
  ['FontSize="24"', 'FontSize="32"', 'Increase the text size to 32'],
  [
    'Which property did you change?',
    ['FontSize', 'DataContext', 'Grid.Column'],
    0,
    'FontSize changes the text-size request. It does not select a data source or a grid track.'
  ],
  'custom-fonts'
);
```

The example illustrates the schema; production lessons need sufficiently developed explanations and meaningful boundary/transfer work.

## Runnable C#

The `cs` helper adds common using directives and the `Lesson.Build()` wrapper. A lab must return a real Uno `UIElement`. Keep external I/O deterministic: use explicit fixtures instead of depending on a public endpoint being available during tests.

Remember that the authored file is JavaScript while the generated text is C#. A C# escaped newline must survive JavaScript parsing:

```js
cs('return new TextBlock { Text = "First line\\nSecond line" };');
```

The physical JavaScript string uses two backslashes to emit the one backslash required in C# source. Compile tests validate the resulting C#, not merely the JavaScript module.

## Runtime XAML and project-only examples

Runtime XAML must include the presentation namespace and be compatible with `XamlReader.Load`. Do not put `x:Class`, compiled `x:Bind`, or compiled event-handler names into a purportedly runnable runtime-XAML example.

Use `projectCode` and `projectNote` for package-dependent or generator-dependent material. State required packages, surrounding class members, and whether the example is illustrative or a complete project. Keep the executable lab honest about what it actually demonstrates.

## Visual models and the coach

Select a diagram family: `pipeline`, `binding`, `tree`, `layout`, `box`, `state`, `timeline`, or `virtualization`. State that a model is explanatory and keep an accessible description outside the canvas.

The coach’s source checks are focused hints, not an adversarial or semantic grader. Design an observable runtime interaction to accompany them. Do not claim mastery because a source substring is present.

## Reference attribution

Use a source term that finds relevant material in the pinned reference library. Verify its results. Add a pinned source link when a statement depends on a precise implementation. Do not silently use a newer API than the runner supports.

Updating the upstream snapshot is a deliberate change to `sources.lock.json` and the checkout revision in CI. Rebuild the catalog, review changed APIs, and run all examples before publishing.

## Acceptance checklist

The lesson has an original explanation, prediction, runnable starter, correct solution, progressive hints, misconception feedback, source reference, and independent transfer exercise. Its code compiles and executes. The knowledge-check explanation teaches why, not just which letter to choose. The narrow-screen view is usable. The example does not rely on a missing package, a generated member, or a fabricated native capability.

Run `npm test` and the browser suite. CI also compiles C# against the exact runtime references and executes both starter and solution for every lesson.
