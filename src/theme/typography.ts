import { TextStyle } from 'react-native';

export const typography = {
  hero: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 34,
  } satisfies TextStyle,
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 28,
  } satisfies TextStyle,
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
    lineHeight: 24,
  } satisfies TextStyle,
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  } satisfies TextStyle,
  bodyBold: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  } satisfies TextStyle,
  caption: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  } satisfies TextStyle,
  captionBold: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  } satisfies TextStyle,
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    lineHeight: 16,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  price: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 24,
  } satisfies TextStyle,
  priceLarge: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 30,
  } satisfies TextStyle,
} as const;
