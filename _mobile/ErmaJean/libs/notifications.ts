import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export async function registerForPushNotificationsAsync() {
    try {
        let token;

        // Set up Android notification channel
        if (Platform.OS === 'android') {
            try {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            } catch (error) {
                console.log('Error setting up Android notification channel:', error);
            }
        }

        // Check if running on a physical device
        if (!Device.isDevice) {
            console.log('Push notifications require a physical device');
            return undefined;
        }

        // Request permissions
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            
            if (finalStatus !== 'granted') {
                console.log('Push notification permissions not granted');
                return undefined;
            }
        } catch (error) {
            console.log('Error requesting notification permissions:', error);
            return undefined;
        }

        // Get push token
        try {
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
            
            if (!projectId) {
                console.log('EAS Project ID not configured, skipping push token generation');
                return undefined;
            }
            
            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            console.log('Push token generated successfully');
            return token;
        } catch (error) {
            console.log('Error generating push token:', error);
            return undefined;
        }
    } catch (error) {
        console.log('Unexpected error in registerForPushNotificationsAsync:', error);
        return undefined;
    }
}
