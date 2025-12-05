/**
 * Premium Design System Constants
 * 
 * This file contains the complete design system for the ErmaJean mobile app,
 * including colors, spacing, typography, shadows, and animation configurations.
 */

import { Platform } from 'react-native';

// ============================================================================
// COLORS
// ============================================================================

export const Colors = {
  // Primary Brand Colors
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // Main brand color (emerald)
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  // Secondary Colors
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Neutral Colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Semantic Colors
  success: {
    light: '#10b981',
    main: '#059669',
    dark: '#047857',
  },
  error: {
    light: '#ef4444',
    main: '#dc2626',
    dark: '#b91c1c',
  },
  warning: {
    light: '#f59e0b',
    main: '#d97706',
    dark: '#b45309',
  },
  info: {
    light: '#3b82f6',
    main: '#2563eb',
    dark: '#1d4ed8',
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
    dark: '#111827',
  },

  // Text Colors
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    inverse: '#ffffff',
    disabled: '#d1d5db',
  },

  // Overlay Colors
  overlay: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.3)',
    dark: 'rgba(0, 0, 0, 0.6)',
    heavy: 'rgba(0, 0, 0, 0.8)',
  },

  // Gradient Colors
  gradients: {
    primary: ['#10b981', '#059669'],
    secondary: ['#34d399', '#10b981'],
    sunset: ['#f59e0b', '#ef4444'],
    ocean: ['#3b82f6', '#8b5cf6'],
    emerald: ['#10b981', '#047857'],
  },
};

// ============================================================================
// SPACING
// ============================================================================

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,

  // Semantic spacing
  screenPadding: 16,
  cardPadding: 16,
  sectionSpacing: 24,
  componentSpacing: 12,
  elementSpacing: 8,
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const Typography = {
  // Font Families
  fontFamily: Platform.select({
    ios: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },
    android: {
      regular: 'Roboto',
      medium: 'Roboto-Medium',
      semibold: 'Roboto-Medium',
      bold: 'Roboto-Bold',
    },
    default: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },
  }),

  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  // Text Styles (Predefined combinations)
  styles: {
    h1: {
      fontSize: 36,
      lineHeight: 43,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '700' as const,
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 24,
      lineHeight: 29,
      fontWeight: '600' as const,
      letterSpacing: -0.2,
    },
    h4: {
      fontSize: 20,
      lineHeight: 24,
      fontWeight: '600' as const,
      letterSpacing: -0.1,
    },
    h5: {
      fontSize: 18,
      lineHeight: 22,
      fontWeight: '600' as const,
    },
    h6: {
      fontSize: 16,
      lineHeight: 19,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
    },
    bodySmall: {
      fontSize: 14,
      lineHeight: 21,
      fontWeight: '400' as const,
    },
    caption: {
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '400' as const,
    },
    button: {
      fontSize: 16,
      lineHeight: 19,
      fontWeight: '600' as const,
      letterSpacing: 0.5,
    },
    label: {
      fontSize: 14,
      lineHeight: 17,
      fontWeight: '500' as const,
      letterSpacing: 0.3,
    },
  },
};

// ============================================================================
// SHADOWS
// ============================================================================

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },

  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },

  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },

  // Colored shadows for emphasis
  primary: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  error: {
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// ============================================================================
// ANIMATION CONFIGS
// ============================================================================

export const AnimationConfig = {
  // Timing configurations
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },

  // Spring configurations
  spring: {
    gentle: {
      damping: 20,
      stiffness: 90,
      mass: 1,
    },
    bouncy: {
      damping: 10,
      stiffness: 100,
      mass: 1,
    },
    snappy: {
      damping: 15,
      stiffness: 150,
      mass: 0.8,
    },
    smooth: {
      damping: 25,
      stiffness: 120,
      mass: 1,
    },
  },

  // Easing functions
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
  },

  // Preset animations
  presets: {
    fadeIn: {
      duration: 300,
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    fadeOut: {
      duration: 300,
      from: { opacity: 1 },
      to: { opacity: 0 },
    },
    slideInUp: {
      duration: 400,
      from: { opacity: 0, translateY: 20 },
      to: { opacity: 1, translateY: 0 },
    },
    slideInDown: {
      duration: 400,
      from: { opacity: 0, translateY: -20 },
      to: { opacity: 1, translateY: 0 },
    },
    slideInLeft: {
      duration: 400,
      from: { opacity: 0, translateX: -20 },
      to: { opacity: 1, translateX: 0 },
    },
    slideInRight: {
      duration: 400,
      from: { opacity: 0, translateX: 20 },
      to: { opacity: 1, translateX: 0 },
    },
    scaleIn: {
      duration: 300,
      from: { opacity: 0, scale: 0.9 },
      to: { opacity: 1, scale: 1 },
    },
    scaleOut: {
      duration: 300,
      from: { opacity: 1, scale: 1 },
      to: { opacity: 0, scale: 0.9 },
    },
  },

  // Stagger delays for list animations
  stagger: {
    fast: 50,
    normal: 100,
    slow: 150,
  },
};

// ============================================================================
// LAYOUT
// ============================================================================

export const Layout = {
  // Screen dimensions
  maxWidth: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },

  // Common heights
  height: {
    header: 60,
    tabBar: 60,
    button: 48,
    input: 48,
    card: 120,
  },

  // Icon sizes
  iconSize: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
    xxl: 48,
  },
};

// ============================================================================
// OPACITY
// ============================================================================

export const Opacity = {
  disabled: 0.4,
  hover: 0.8,
  pressed: 0.6,
  overlay: 0.5,
};

// ============================================================================
// Z-INDEX
// ============================================================================

export const ZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
};

// ============================================================================
// EXPORTS
// ============================================================================

export const DesignSystem = {
  Colors,
  Spacing,
  Typography,
  Shadows,
  BorderRadius,
  AnimationConfig,
  Layout,
  Opacity,
  ZIndex,
};

export default DesignSystem;
