// src/styles/index.ts
import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../constants/colors';
import { SPACING } from '../themes/spacing';


const { width, height } = Dimensions.get('window');

export const globalStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  
  screenContainer: {
    flex: 1,
    padding: SPACING.COMPONENT.SCREEN_PADDING,
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Card styles
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: SPACING.BORDER_RADIUS.MD,
    padding: SPACING.COMPONENT.CARD_PADDING,
    marginVertical: SPACING.SM,
    elevation: SPACING.ELEVATION.LOW,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  // Text styles
  heading1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  
  heading2: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  
  heading3: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  
  bodyText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 24,
  },
  
  caption: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  
  // Layout styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  // Margin and padding utilities
  mt_xs: { marginTop: SPACING.XS },
  mt_sm: { marginTop: SPACING.SM },
  mt_md: { marginTop: SPACING.MD },
  mt_lg: { marginTop: SPACING.LG },
  mt_xl: { marginTop: SPACING.XL },
  
  mb_xs: { marginBottom: SPACING.XS },
  mb_sm: { marginBottom: SPACING.SM },
  mb_md: { marginBottom: SPACING.MD },
  mb_lg: { marginBottom: SPACING.LG },
  mb_xl: { marginBottom: SPACING.XL },
  
  mx_sm: { marginHorizontal: SPACING.SM },
  mx_md: { marginHorizontal: SPACING.MD },
  
  my_sm: { marginVertical: SPACING.SM },
  my_md: { marginVertical: SPACING.MD },
  
  p_sm: { padding: SPACING.SM },
  p_md: { padding: SPACING.MD },
  
  // Border styles
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.DIVIDER,
  },
  
  // Shadow styles
  shadow: {
    elevation: SPACING.ELEVATION.MEDIUM,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
});

// Screen dimensions
export const SCREEN = {
  width,
  height,
  isSmall: width < 375,
  isMedium: width >= 375 && width < 768,
  isLarge: width >= 768,
};