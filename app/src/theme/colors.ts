// oklch → sRGB pre-computed for React Native (no oklch support)
export type ThemeName = 'purple' | 'rose' | 'teal' | 'sunset';

interface ThemeColors {
  accent: string;
  accentDark: string;
  bg: string;
}

export const THEMES: Record<ThemeName, ThemeColors> = {
  purple: { accent: '#7c3aed', accentDark: '#5b21b6', bg: '#f5f3ff' },
  rose:   { accent: '#e03e3e', accentDark: '#b91c1c', bg: '#fff1f2' },
  teal:   { accent: '#0d9488', accentDark: '#0f766e', bg: '#f0fdfa' },
  sunset: { accent: '#d97706', accentDark: '#b45309', bg: '#fffbeb' },
};

export const STATIC = {
  card:        '#ffffff',
  textPrimary: '#1c1917',
  textMuted:   '#78716c',
  textFaint:   '#a8a29e',
  track:       '#e7e5e4',
  border:      '#e2e0de',
  dangerBorder:'#e07a6a',
  dangerText:  '#c0392b',

  // Rating intensity ramp 1→5
  rating: ['#f5f4f2', '#f0e4de', '#dbbfb3', '#c09080', '#9b5f4f'] as string[],

  // Category swatch colors (oklch 58% 0.13 at hues 25,210,150,300,70,330)
  swatches: ['#c17a5e', '#3d82c4', '#3aaa72', '#a050c0', '#8a9a30', '#c04878'] as string[],
};

export function ratingColor(value: 1 | 2 | 3 | 4 | 5) {
  return STATIC.rating[value - 1];
}

export function swatchColor(index: number) {
  return STATIC.swatches[index % STATIC.swatches.length];
}
