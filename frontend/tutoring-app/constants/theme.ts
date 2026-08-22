// Quest dark design system — single source of truth for all visual tokens

export const C = {
  // Backgrounds
  bg:         '#1A1335',
  bgDeep:     '#120D26',
  surface:    '#241A47',
  surfaceUp:  '#312352',

  // Borders
  border: 'rgba(255,255,255,0.08)',

  // Text
  text:       '#FFFFFF',
  textDim:    'rgba(255,255,255,0.62)',
  textFaint:  'rgba(255,255,255,0.38)',

  // Accents — primary
  amber:      '#FFA53D',
  amberDark:  '#C97A1A',

  // Accents — streak / action
  coral:      '#FF6B4A',
  coralDark:  '#C84A2E',

  // Accents — rewards
  gold:       '#FFD15C',

  // Accents — success
  green:      '#5ED674',
  greenDark:  '#2EA84F',

  // Accents — info
  teal:       '#4FB8D9',

  // Accents — league
  purple:     '#B59CFF',
} as const;

export type ColorToken = keyof typeof C;

// Typography scale
export const T = {
  family: {
    regular:    'DMSans_400Regular',
    medium:     'DMSans_500Medium',
    bold:       'DMSans_700Bold',
    extraBold:  'DMSans_800ExtraBold',
    black:      'DMSans_900Black',
  },
  size: {
    micro:   11,
    body:    14,
    bodyLg:  15,
    h4:      18,
    h3:      22,
    h2:      28,
    h1:      34,
  },
  tracking: {
    micro: 1.5,   // uppercase micro-labels
    body:  0,
    h4:    -0.5,
    h3:    -0.7,
    h2:    -1.0,
    h1:    -1.2,
  },
  weight: {
    regular:   '400' as const,
    medium:    '500' as const,
    bold:      '700' as const,
    extraBold: '800' as const,
    black:     '900' as const,
  },
} as const;

// Spacing scale (4-base grid)
export const S = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  '2xl': 32,
  '3xl': 48,
} as const;

// Border radius scale
export const R = {
  xs:   6,
  sm:   10,
  md:   14,
  lg:   20,
  xl:   28,
  full: 9999,
} as const;

// Semantic text style presets (use spread: { ...TextStyles.h1 })
export const TextStyles = {
  h1: {
    fontFamily:     T.family.black,
    fontSize:       T.size.h1,
    letterSpacing:  T.tracking.h1,
    color:          C.text,
  },
  h2: {
    fontFamily:     T.family.extraBold,
    fontSize:       T.size.h2,
    letterSpacing:  T.tracking.h2,
    color:          C.text,
  },
  h3: {
    fontFamily:     T.family.extraBold,
    fontSize:       T.size.h3,
    letterSpacing:  T.tracking.h3,
    color:          C.text,
  },
  h4: {
    fontFamily:     T.family.bold,
    fontSize:       T.size.h4,
    letterSpacing:  T.tracking.h4,
    color:          C.text,
  },
  body: {
    fontFamily:    T.family.medium,
    fontSize:      T.size.body,
    letterSpacing: T.tracking.body,
    color:         C.text,
  },
  bodyDim: {
    fontFamily:    T.family.medium,
    fontSize:      T.size.body,
    letterSpacing: T.tracking.body,
    color:         C.textDim,
  },
  micro: {
    fontFamily:    T.family.black,
    fontSize:      T.size.micro,
    letterSpacing: T.tracking.micro,
    textTransform: 'uppercase' as const,
    color:         C.textDim,
  },
  numeric: {
    fontFamily:       T.family.black,
    fontVariant:      ['tabular-nums'] as const,
    letterSpacing:    T.tracking.body,
    color:            C.text,
  },
} as const;