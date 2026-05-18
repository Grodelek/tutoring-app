import { C } from './theme';

// Named slots used by useThemeColor. Both schemes now use Quest dark values
// since the app forces dark mode globally (see hooks/useColorScheme).
export const Colors = {
  light: {
    text:            C.text,
    background:      C.bg,
    tint:            C.amber,
    icon:            C.textDim,
    tabIconDefault:  C.textFaint,
    tabIconSelected: C.amber,
    cardBackground:  C.surface,
    secondaryText:   C.textDim,
    chipBackground:  C.surfaceUp,
    inputBackground: C.bgDeep,
    inputBorder:     C.border,
    placeholder:     C.textFaint,
  },
  dark: {
    text:            C.text,
    background:      C.bg,
    tint:            C.amber,
    icon:            C.textDim,
    tabIconDefault:  C.textFaint,
    tabIconSelected: C.amber,
    cardBackground:  C.surface,
    secondaryText:   C.textDim,
    chipBackground:  C.surfaceUp,
    inputBackground: C.bgDeep,
    inputBorder:     C.border,
    placeholder:     C.textFaint,
  },
};
