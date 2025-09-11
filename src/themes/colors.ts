// src/themes/colors.ts
import { COLORS } from '../constants/colors';

export const lightTheme = {
  colors: {
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
  },
};

export const darkTheme = {
  colors: {
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
  },
};

export type Theme = typeof lightTheme;