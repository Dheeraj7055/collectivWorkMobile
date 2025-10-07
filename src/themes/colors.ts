
// src/themes/colors.ts
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { COLORS } from '../constants/colors';

// ✅ Extend React Native Paper’s default MD3 theme safely
export const lightTheme = {
  ...MD3LightTheme,
  myAppTheme: 'light', // optional identifier for your logic
  colors: {
    ...MD3LightTheme.colors,

    // Your existing palette
    primary: COLORS.PRIMARY,
    primaryContainer: COLORS.PRIMARY_LIGHT,
    secondary: COLORS.SECONDARY,
    secondaryContainer: COLORS.SECONDARY_LIGHT,
    surface: COLORS.SURFACE,
    surfaceVariant: COLORS.GRAY_LIGHT,
    background: COLORS.BACKGROUND,
    error: COLORS.ERROR,
    errorContainer: '#FFEBEE',
    onPrimary: COLORS.WHITE,
    onSecondary: COLORS.WHITE,
    onSurface: COLORS.TEXT_PRIMARY,
    onSurfaceVariant: COLORS.TEXT_SECONDARY,
    onBackground: COLORS.TEXT_PRIMARY,
    onError: COLORS.WHITE,
    outline: COLORS.BORDER,
    outlineVariant: COLORS.DIVIDER,
    inverseSurface: COLORS.GRAY_DARK,
    inverseOnSurface: COLORS.WHITE,
    inversePrimary: COLORS.PRIMARY_LIGHT,
    shadow: COLORS.BLACK,
    scrim: COLORS.BLACK,
    backdrop: 'rgba(0, 0, 0, 0.5)',

    // ✅ Required for Paper <Menu> & elevation-based components
    elevation: {
      level0: 'transparent',
      level1: '#f5f5f5',
      level2: '#eaeaea',
      level3: '#e0e0e0',
      level4: '#d6d6d6',
      level5: '#cccccc',
    },
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  myAppTheme: 'dark',
  colors: {
    ...MD3DarkTheme.colors,

    primary: COLORS.PRIMARY_LIGHT,
    primaryContainer: COLORS.PRIMARY_DARK,
    secondary: COLORS.SECONDARY_LIGHT,
    secondaryContainer: COLORS.SECONDARY_DARK,
    surface: '#121212',
    surfaceVariant: '#2C2C2C',
    background: '#000000',
    error: '#CF6679',
    errorContainer: '#B00020',
    onPrimary: COLORS.BLACK,
    onSecondary: COLORS.BLACK,
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#CCCCCC',
    onBackground: '#FFFFFF',
    onError: COLORS.BLACK,
    outline: '#888888',
    outlineVariant: '#444444',
    inverseSurface: '#FFFFFF',
    inverseOnSurface: COLORS.BLACK,
    inversePrimary: COLORS.PRIMARY,
    shadow: COLORS.BLACK,
    scrim: COLORS.BLACK,
    backdrop: 'rgba(0, 0, 0, 0.7)',

    elevation: {
      level0: 'transparent',
      level1: '#1e1e1e',
      level2: '#2c2c2c',
      level3: '#333333',
      level4: '#3a3a3a',
      level5: '#444444',
    },
  },
};

// Optional type for consistency
export type Theme = typeof lightTheme;
