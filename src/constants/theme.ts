// Design tokens for the Ballers app

export const colors = {
  // Primary
  primary: '#0D9488',
  primaryDark: '#0B7A70',
  primaryLight: '#E6F7F7',

  // Background
  background: '#FAFAF9',
  surface: '#FFFFFF',

  // Text
  text: '#1C1917',
  textSecondary: '#78716C',
  textMuted: '#A8A29E',
  textPlaceholder: '#D6D3D1',

  // UI
  border: '#E7E5E4',
  borderFocused: '#0D9488',
  error: '#EF4444',
  disabled: '#A8A29E',

  // Skill levels
  skillBeginner: '#22C55E',
  skillIntermediate: '#3B82F6',
  skillAdvanced: '#A855F7',
  skillPro: '#EF4444',
} as const;

export const fonts = {
  // Headings (Manrope)
  heading: 'Manrope_700Bold',
  headingExtra: 'Manrope_800ExtraBold',
  headingSemibold: 'Manrope_600SemiBold',

  // Body (Plus Jakarta Sans)
  body: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodySemibold: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
} as const;

export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 14,
  base: 15,
  lg: 16,
  xl: 20,
  '2xl': 28,
  '3xl': 32,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  '2xl': 16,
  full: 9999,
} as const;

export const shadows = {
  button: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    shadowColor: colors.disabled,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

export const animation = {
  duration: {
    fast: 200,
    normal: 500,
  },
  scale: {
    pressed: 0.97,
    normal: 1,
  },
  slide: {
    initial: 20,
    final: 0,
  },
} as const;
