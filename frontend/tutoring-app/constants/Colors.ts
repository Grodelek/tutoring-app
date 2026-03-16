/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    cardBackground: '#f2f2f2',
    secondaryText: '#687076',
    chipBackground: '#e5e5e5',
    inputBackground: '#ffffff',
    inputBorder: '#d0d0d0',
    placeholder: '#9BA1A6',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    cardBackground: '#1e1e1e',
    secondaryText: '#9BA1A6',
    chipBackground: '#1f2933',
    inputBackground: '#1a1a1a',
    inputBorder: '#333',
    placeholder: '#9BA1A6',
  },
};
