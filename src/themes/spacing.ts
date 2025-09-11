// src/themes/spacing.ts
export const SPACING = {
    // Base spacing unit (8px system)
    BASE: 8,
    
    // Spacing scale
    XS: 4,   // 0.5 * BASE
    SM: 8,   // 1 * BASE  
    MD: 16,  // 2 * BASE
    LG: 24,  // 3 * BASE
    XL: 32,  // 4 * BASE
    XXL: 48, // 6 * BASE
    
    // Component specific spacing
    COMPONENT: {
      BUTTON_PADDING_VERTICAL: 12,
      BUTTON_PADDING_HORIZONTAL: 24,
      INPUT_PADDING: 16,
      CARD_PADDING: 16,
      SCREEN_PADDING: 20,
      SECTION_MARGIN: 24,
    },
    
    // Border radius
    BORDER_RADIUS: {
      SM: 4,
      MD: 8,
      LG: 12,
      XL: 16,
      ROUND: 50,
    },
    
    // Shadow elevation
    ELEVATION: {
      NONE: 0,
      LOW: 2,
      MEDIUM: 4,
      HIGH: 8,
    },
  } as const;