// // FCMService.js
// import messaging from '@react-native-firebase/messaging';
// import { Alert, PermissionsAndroid, Platform } from 'react-native';
// import { useEffect } from 'react';

// // Request permission and get FCM token
// export async function requestUserPermission() {
//   // Android 13+ requires POST_NOTIFICATIONS permission
//   if (Platform.OS === 'android' && Platform.Version >= 33) {
//     const permission = await PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
//     );
//     if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
//       console.log('Notification permission denied');
//       return null;
//     }
//   }

//   const authStatus = await messaging().requestPermission();
//   const enabled =
//     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//   if (enabled) {
//     const fcmToken = await messaging().getToken();
//     console.log('✅ FCM Token:', fcmToken);
//     return fcmToken;
//   } else {
//     console.log('🚫 Notification permission not granted');
//     return null;
//   }
// }

// // Foreground notification handler
// export function setupForegroundNotificationListener() {
//   useEffect(() => {
//     const unsubscribe = messaging().onMessage(async remoteMessage => {
//       console.log('📬 Foreground Notification:', remoteMessage);

//       Alert.alert(
//         remoteMessage.notification.title,
//         remoteMessage.notification.body
//       );
//     });

//     return unsubscribe;
//   }, []);
// }
  
  
// FCMService.js
import messaging from '@react-native-firebase/messaging';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { useEffect } from 'react';

// Request permission and get FCM token
export async function requestUserPermission() {
  // Android 13+ requires POST_NOTIFICATIONS permission
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const permission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Notification permission denied');
      return null;
    }
  }

  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    const fcmToken = await messaging().getToken();
    console.log('✅ FCM Token:', fcmToken);
    return fcmToken;
  } else {
    console.log('🚫 Notification permission not granted');
    return null;
  }
}

// Background notification handler
// This must be called OUTSIDE of your application lifecycle (before AppRegistry.registerComponent)
export function setupBackgroundNotificationHandler() {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('📱 Background Notification:', remoteMessage);
    
    // Handle the background notification here
    // You can save data to AsyncStorage, update local database, etc.
    // Note: You cannot show alerts or update UI directly in background handler
    
    // Example: Save notification to local storage for later processing
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const notifications = await AsyncStorage.getItem('background_notifications') || '[]';
      const notificationArray = JSON.parse(notifications);
      
      notificationArray.push({
        ...remoteMessage,
        receivedAt: Date.now(),
        isBackground: true
      });
      
      await AsyncStorage.setItem('background_notifications', JSON.stringify(notificationArray));
      console.log('📦 Background notification saved to storage');
    } catch (error) {
      console.error('Error saving background notification:', error);
    }
  });
}

// Foreground notification handler
export function setupForegroundNotificationListener() {
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('📬 Foreground Notification:', remoteMessage);

      Alert.alert(
        remoteMessage.notification.title,
        remoteMessage.notification.body
      );
    });

    return unsubscribe;
  }, []);
}

// Handle notification when app is opened from quit state
export function setupNotificationOpenedHandler() {
  useEffect(() => {
    // Handle notification when app is opened from quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('🚀 App opened from quit state by notification:', remoteMessage);
          // Handle the notification that opened the app
          handleNotificationNavigation(remoteMessage);
        }
      });

    // Handle notification when app is in background and opened by tapping notification
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('📂 App opened from background by notification:', remoteMessage);
      // Handle the notification that opened the app from background
      handleNotificationNavigation(remoteMessage);
    });

    return unsubscribe;
  }, []);
}

// Helper function to handle navigation based on notification data
function handleNotificationNavigation(remoteMessage) {
  // Example: Navigate to specific screen based on notification data
  if (remoteMessage.data?.screen) {
    // Use your navigation library to navigate
    // Example with React Navigation:
    // NavigationService.navigate(remoteMessage.data.screen, remoteMessage.data.params);
    console.log('Navigate to:', remoteMessage.data.screen);
  }
}

// Utility function to get pending background notifications
export async function getPendingBackgroundNotifications() {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const notifications = await AsyncStorage.getItem('background_notifications');
    return notifications ? JSON.parse(notifications) : [];
  } catch (error) {
    console.error('Error getting background notifications:', error);
    return [];
  }
}

// Utility function to clear processed background notifications
export async function clearBackgroundNotifications() {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.removeItem('background_notifications');
    console.log('📭 Background notifications cleared');
  } catch (error) {
    console.error('Error clearing background notifications:', error);
  }
}