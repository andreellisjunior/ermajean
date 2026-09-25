import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
/** Call only after an explicit user action. No permission prompt at launch. */
export async function registerForPushNotificationsAsync(){
 if(Platform.OS==='web'||!Device.isDevice)throw Error('Push notifications need a physical iOS or Android device.');
 const projectId=Constants.expoConfig?.extra?.eas?.projectId??Constants.easConfig?.projectId;
 if(!projectId)throw Error('Push notifications are not configured for this build.');
 if(Platform.OS==='android')await Notifications.setNotificationChannelAsync('default',{name:'Kitchen reminders',importance:Notifications.AndroidImportance.DEFAULT});
 let {status}=await Notifications.getPermissionsAsync();
 if(status!=='granted')({status}=await Notifications.requestPermissionsAsync());
 if(status!=='granted')throw Error('Notifications are off. You can enable them in device settings.');
 return (await Notifications.getExpoPushTokenAsync({projectId})).data;
}
