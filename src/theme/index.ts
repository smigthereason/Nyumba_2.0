export { colors } from './colors';
export { spacing, radius } from './spacing';
export { typography } from './typography';

export const shadows = {
  card: {
    shadowColor: '#1A1F1C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  soft: {
    shadowColor: '#1A1F1C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sticky: {
    shadowColor: '#1A1F1C',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
} as const;
