// src/theme/theme.ts
// Single light theme shared across the app. Values are re-exported flat
// (colors, spacing, radius, ...) so screens can `import { colors, spacing } from '../theme/theme'`.

export const colors = {
  // brand
  primary: '#B91C1C',
  primaryDark: '#7F1D1D',
  primaryLight: '#FEE2E2',

  // surfaces
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  overlay: 'rgba(15, 23, 42, 0.55)',

  // text
  text: '#0F172A',
  textMuted: '#64748B',
  textFaint: '#94A3B8',
  onPrimary: '#FFFFFF',

  // borders
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',

  // status
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  info: '#2563EB',
  infoLight: '#DBEAFE',

  // misc
  outing: '#0E7490',
  outingLight: '#CFFAFE',
  event: '#9D174D',
  eventLight: '#FCE7F3',
  live: '#16A34A',
  disabled: '#CBD5E1',
};

// Curated gradient pairs assigned to plans/backgrounds for visual variety
// without needing real photography.
export const gradients: [string, string][] = [
  ['#F97066', '#B91C1C'], // sunset
  ['#38BDF8', '#0E7490'], // ocean
  ['#84CC16', '#166534'], // forest
  ['#E879F9', '#86198F'], // berry
  ['#64748B', '#0F172A'], // midnight
  ['#FDE68A', '#B45309'], // gold
  ['#2DD4BF', '#0F766E'], // teal
  ['#C084FC', '#6D28D9'], // plum
  ['#FB923C', '#9A3412'], // amber
  ['#60A5FA', '#1E40AF'], // sky
];

export const icons = [
  '🎉', '🍕', '🎮', '⚽️', '🎨', '🎵', '🍹', '🏖️', '🎬', '📚',
  '🏕️', '🍔', '🎸', '🧘', '🚴', '🎯', '🍜', '🎤', '🧗', '🍷',
];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const font = {
  size: {
    xs: 12,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    display: 32,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};

export const shadow = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 8,
  },
};

export function pickGradient(seedKey: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seedKey.length; i++) {
    hash = (hash * 31 + seedKey.charCodeAt(i)) >>> 0;
  }
  return gradients[hash % gradients.length];
}

export function pickIcon(seedKey: string): string {
  let hash = 0;
  for (let i = 0; i < seedKey.length; i++) {
    hash = (hash * 17 + seedKey.charCodeAt(i)) >>> 0;
  }
  return icons[hash % icons.length];
}
