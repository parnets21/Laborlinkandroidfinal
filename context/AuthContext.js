import React, { createContext, useContext, useState, useEffect } from "react";
import messaging from '@react-native-firebase/messaging';
// import auth from '@react-native-firebase/auth';
// import firestore from '@react-native-firebase/firestore';
// import DeviceInfo from 'react-native-device-info';
import { PermissionsAndroid, Platform } from 'react-native';
// Optional load of react-native-device-info to avoid crashes if not installed/linked
let DeviceInfoModule;
try {
  // eslint-disable-next-line global-require
  DeviceInfoModule = require('react-native-device-info');
} catch (e) {
  console.log('AuthContext: react-native-device-info not available, using fallbacks');
}
import AsyncStorage from "@react-native-async-storage/async-storage";
const BASE_URL = "https://laborlink.co.in"; 
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
const [user, setUser] = useState(null);
const [fcmToken, setFcmToken] = useState(null);
const [deviceInfo, setDeviceInfo] = useState(null);
const [isFCMReady, setIsFCMReady] = useState(false);
const [fcmInitializationAttempted, setFcmInitializationAttempted] = useState(false);

useEffect(() => {
    console.log('AuthContext: Initializing FCM and device info...');
    initializeFCM();
    getDeviceInfo();
  }, []);
const requestNotificationPermission = async () => {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        console.log('Notification permission:', granted);
      }
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        const token = await messaging().getToken();
        setFcmToken(token);
        console.log('FCM Token:', token);
      } else {
        console.log('FCM permission denied');
      }
    } catch (error) {
      console.error('FCM setup error:', error);
    }
  };
const initializeFCM = async () => {
    if (fcmInitializationAttempted) return;
    setFcmInitializationAttempted(true);

    try {
      messaging().onMessage(async remoteMessage => {
        console.log('AuthContext: Foreground message received:', remoteMessage);
      });
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('AuthContext: Background message received:', remoteMessage);
      });
      messaging().onTokenRefresh(async (newToken) => {
        console.log('AuthContext: FCM token refreshed:', newToken);
        setFcmToken(newToken);
        await AsyncStorage.setItem('fcmToken', newToken);
        await sendTokenToServer(newToken);
      });
    } catch (error) {
      console.error('AuthContext: FCM initialization error:', error);
    } finally {
      setIsFCMReady(true);
    }
  }; 
const getDeviceInfo = async () => {
    try { 
      console.log('AuthContext: Getting device info...');
      const DeviceInfo = DeviceInfoModule?.default || DeviceInfoModule;
      const info = {
        deviceId: DeviceInfo?.getUniqueId ? await DeviceInfo.getUniqueId() : 'unknown',
        platform: Platform.OS,
        deviceModel: DeviceInfo?.getModel ? DeviceInfo.getModel() : 'unknown',
        osVersion: DeviceInfo?.getSystemVersion ? DeviceInfo.getSystemVersion() : 'unknown',
        appVersion: DeviceInfo?.getVersion ? DeviceInfo.getVersion() : 'unknown'
      };
      setDeviceInfo(info);
      console.log('AuthContext: Device info retrieved successfully');
    } catch (error) {
      console.error('AuthContext: Device info error:', error);
      setDeviceInfo({
        deviceId: 'unknown',
        platform: Platform.OS,
        deviceModel: 'unknown',
        osVersion: 'unknown',
        appVersion: 'unknown'
      });
    }
  };
const sendTokenToServer = async (token) => {
    try {
      const employeeId = await AsyncStorage.getItem('employeeId');
      const userToken = await AsyncStorage.getItem('token');

      if (!employeeId || !userToken) {
        console.log('AuthContext: User not logged in, skipping token send');
        return;
      }

      const response = await fetch(
        `${BASE_URL}/api/user/update-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            employeeId,
            fcmToken: token,
          }),
        },
      );

      if (response.ok) {
        console.log('AuthContext: FCM token sent to server successfully');
      } else {
        console.error('AuthContext: Failed to send token to server');
      }
    } catch (error) {
      console.error('AuthContext: Error sending FCM token to server:', error);
    }
  };
const getFCMData = () => {
    const data = {
     
      deviceId: deviceInfo?.deviceId || 'unknown-device-id',
      platform: deviceInfo?.platform || Platform.OS
    };
    console.log('AuthContext: getFCMData() returning:', data);
    return data;
  };
const waitForFCMReady = async (timeout = 15000) => {
    if (isFCMReady) return true;
    
    console.log('AuthContext: Waiting for FCM to be ready...');
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (isFCMReady) {
          clearInterval(checkInterval);
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          console.log('AuthContext: FCM ready timeout reached');
          resolve(false);
        }
      }, 100);
    });
  };
useEffect(()=>{
requestNotificationPermission()
  },[])
const value = {
    user,
    setUser,
    fcmToken,
    deviceInfo,
    isFCMReady,
    getFCMData,
    waitForFCMReady
  };
return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
