/** Additive presentation settings. They do not change lesson progress or drafts. */
export function presentationPreferences(value) {
  return {
    density: value?.density === 'comfortable' ? 'comfortable' : 'compact',
    materials: value?.materials === 'solid' ? 'solid' : 'subtle'
  };
}

export function applyPresentation(value, root = document.documentElement) {
  const preferences = presentationPreferences(value);
  root.dataset.fluent = 'true';
  root.dataset.density = preferences.density;
  root.dataset.materials = preferences.materials;
  return preferences;
}
