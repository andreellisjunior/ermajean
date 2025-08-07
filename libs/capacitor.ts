import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Keyboard } from '@capacitor/keyboard';
import { Device } from '@capacitor/device';

export class CapacitorService {
  static isNative = Capacitor.isNativePlatform();
  static isIOS = Capacitor.getPlatform() === 'ios';
  static isAndroid = Capacitor.getPlatform() === 'android';
  static isWeb = Capacitor.getPlatform() === 'web';

  static async initialize() {
    if (this.isNative) {
      // Configure keyboard behavior
      await Keyboard.setAccessoryBarVisible({ isVisible: false });
      
      // Get device info
      const deviceInfo = await Device.getInfo();
      console.log('Device info:', deviceInfo);
    }
  }

  static async hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
    if (this.isNative) {
      try {
        switch (type) {
          case 'light':
            await Haptics.impact({ style: ImpactStyle.Light });
            break;
          case 'medium':
            await Haptics.impact({ style: ImpactStyle.Medium });
            break;
          case 'heavy':
            await Haptics.impact({ style: ImpactStyle.Heavy });
            break;
        }
      } catch (error) {
        console.warn('Haptic feedback not available:', error);
      }
    }
  }

  static async exitApp() {
    if (this.isNative) {
      await App.exitApp();
    }
  }

  static async getAppInfo() {
    if (this.isNative) {
      return await App.getInfo();
    }
    return null;
  }

  static async getDeviceInfo() {
    if (this.isNative) {
      return await Device.getInfo();
    }
    return null;
  }

  static async getLanguageCode() {
    if (this.isNative) {
      return await Device.getLanguageCode();
    }
    return 'en';
  }
} 