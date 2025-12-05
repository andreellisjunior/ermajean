/**
 * Haptic Feedback Utility
 * 
 * Provides consistent haptic feedback patterns across the app.
 * Uses Expo Haptics for cross-platform haptic feedback support.
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Light haptic feedback - for subtle interactions like hovering or selection
 */
export const lightHaptic = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Silently fail if haptics are not supported
    console.debug('Haptic feedback not available:', error);
  }
};

/**
 * Medium haptic feedback - for standard interactions like button presses
 */
export const mediumHaptic = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    console.debug('Haptic feedback not available:', error);
  }
};

/**
 * Heavy haptic feedback - for significant interactions like deletions or confirmations
 */
export const heavyHaptic = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    console.debug('Haptic feedback not available:', error);
  }
};

/**
 * Success haptic feedback - for successful operations
 */
export const successHaptic = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.debug('Haptic feedback not available:', error);
  }
};

/**
 * Error haptic feedback - for errors or failed operations
 */
export const errorHaptic = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    console.debug('Haptic feedback not available:', error);
  }
};

/**
 * Warning haptic feedback - for warnings or cautionary actions
 */
export const warningHaptic = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    console.debug('Haptic feedback not available:', error);
  }
};

/**
 * Selection haptic feedback - for changing selections in pickers or lists
 */
export const selectionHaptic = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    console.debug('Haptic feedback not available:', error);
  }
};

/**
 * Custom haptic pattern - for specific use cases
 * @param pattern - Array of durations in milliseconds for vibration pattern
 */
export const customHaptic = async (pattern: number[]): Promise<void> => {
  if (Platform.OS === 'web') return;
  
  try {
    // For iOS, we'll use a series of light impacts
    if (Platform.OS === 'ios') {
      for (let i = 0; i < pattern.length; i++) {
        if (i % 2 === 0) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        await new Promise(resolve => setTimeout(resolve, pattern[i]));
      }
    } else {
      // Android supports custom vibration patterns
      // Note: This requires additional permissions and native module setup
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  } catch (error) {
    console.debug('Haptic feedback not available:', error);
  }
};

/**
 * Haptic feedback for button press
 */
export const buttonPressHaptic = mediumHaptic;

/**
 * Haptic feedback for card tap
 */
export const cardTapHaptic = lightHaptic;

/**
 * Haptic feedback for swipe actions
 */
export const swipeHaptic = mediumHaptic;

/**
 * Haptic feedback for toggle switches
 */
export const toggleHaptic = selectionHaptic;

/**
 * Haptic feedback for delete actions
 */
export const deleteHaptic = heavyHaptic;

/**
 * Haptic feedback for save/submit actions
 */
export const submitHaptic = successHaptic;

/**
 * Haptic feedback for navigation
 */
export const navigationHaptic = lightHaptic;

/**
 * Haptic feedback for modal open/close
 */
export const modalHaptic = mediumHaptic;

/**
 * Haptic feedback for pull-to-refresh
 */
export const refreshHaptic = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise(resolve => setTimeout(resolve, 100));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    console.debug('Haptic feedback not available:', error);
  }
};

/**
 * Haptic feedback for long press
 */
export const longPressHaptic = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    console.debug('Haptic feedback not available:', error);
  }
};

// Export all haptic functions
export const Haptic = {
  light: lightHaptic,
  medium: mediumHaptic,
  heavy: heavyHaptic,
  success: successHaptic,
  error: errorHaptic,
  warning: warningHaptic,
  selection: selectionHaptic,
  custom: customHaptic,
  
  // Semantic haptics
  buttonPress: buttonPressHaptic,
  cardTap: cardTapHaptic,
  swipe: swipeHaptic,
  toggle: toggleHaptic,
  delete: deleteHaptic,
  submit: submitHaptic,
  navigation: navigationHaptic,
  modal: modalHaptic,
  refresh: refreshHaptic,
  longPress: longPressHaptic,
};

export default Haptic;
