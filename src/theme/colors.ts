export const colors = {
  primary: '#0B6E4F',
  primaryDark: '#085A40',
  primarySoft: '#E6F5EF',
  accent: '#C45C26',
  accentSoft: '#FDF0E9',
  gold: '#D4A017',

  background: '#F7F8F6',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  text: '#1A1F1C',
  textSecondary: '#5C675F',
  textMuted: '#8A938C',
  textInverse: '#FFFFFF',

  border: '#E4E8E5',
  borderStrong: '#D0D6D2',

  success: '#0B6E4F',
  warning: '#D4A017',
  error: '#C0392B',
  info: '#2B6CB0',

  overlay: 'rgba(26, 31, 28, 0.45)',
  shadow: 'rgba(26, 31, 28, 0.12)',

  chip: '#EEF2EF',
  chipActive: '#0B6E4F',
  star: '#F5B301',
  verified: '#0B6E4F',
  mapPin: '#C45C26',
} as const;

export type ColorName = keyof typeof colors;
