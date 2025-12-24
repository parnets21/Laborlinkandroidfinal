import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ToastAndroid,
  PermissionsAndroid,
  Platform,
  Linking,
  ScrollView,
  Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { BASE_URL } from '../constants/config';
import appConfig from '../app.json';
import employeelogo from '../assets/logo.jpeg';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message'; 
import DeviceInfo from 'react-native-device-info';
import { useAuth } from '../context/AuthContext';

const Login = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const { getFCMData, isFCMReady,fcmToken } = useAuth();

  // Check location permission for iOS
  const hasPermissionIOS = async () => {
    const openSetting = () => {
      Linking.openSettings().catch(() => {
        Alert.alert('Unable to open settings');
      });
    };
    try {
      const status = await Geolocation.requestAuthorization('whenInUse');
      if (status === 'granted') {
        return true;
      }
      if (status === 'denied') {
        ToastAndroid.show('Location permission denied', ToastAndroid.LONG);
      }
      if (status === 'disabled') {
        Alert.alert(
          `Turn on Location Services to allow "${appConfig.displayName}" to determine your location.`,
          '',
          [
            { text: 'Go to Settings', onPress: openSetting },
            { text: "Don't Use Location", onPress: () => { } },
          ],
        );
      }
      return false;
    } catch (error) {
      console.warn('iOS permission error:', error);
      return false;
    }
  };

  // Check location permission for both platforms
  const hasLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      return await hasPermissionIOS();
    }

    if (Platform.OS === 'android' && Platform.Version < 23) {
      return true;
    }

    try {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      if (hasPermission) {
        return true;
      }

      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      if (status === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }

      if (status === PermissionsAndroid.RESULTS.DENIED) {
        ToastAndroid.show('Location permission denied by user.', ToastAndroid.LONG);
      } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        ToastAndroid.show('Location permission revoked by user.', ToastAndroid.LONG);
      }

      return false;
    } catch (error) {
      console.warn('Android permission error:', error);
      return false;
    }
  };

  // Improved location fetching with fallback strategies
  const getCurrentLocationWithFallback = async (userId) => {
    return new Promise((resolve) => {
      // First attempt with high accuracy
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await sendLocationToServer(userId, latitude, longitude);
          resolve(true);
        },
        async (error) => {
          console.warn('High accuracy location failed:', error);

          // Fallback: Try with lower accuracy and longer timeout
          Geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              await sendLocationToServer(userId, latitude, longitude);
              resolve(true);
            },
            async (fallbackError) => {
              console.warn('Fallback location failed:', fallbackError);

              // Final fallback: Try watchPosition for a short time
              const watchId = Geolocation.watchPosition(
                async (position) => {
                  const { latitude, longitude } = position.coords;
                  Geolocation.clearWatch(watchId);
                  await sendLocationToServer(userId, latitude, longitude);
                  resolve(true);
                },
                (watchError) => {
                  console.warn('Watch position failed:', watchError);
                  Geolocation.clearWatch(watchId);
                  handleLocationError(watchError);
                  resolve(false);
                },
                {
                  enableHighAccuracy: false,
                  timeout: 10000,
                  maximumAge: 60000,
                  distanceFilter: 100,
                }
              );

              // Clear watch after 10 seconds if no position received
              setTimeout(() => {
                Geolocation.clearWatch(watchId);
                resolve(false);
              }, 10000);
            },
            {
              enableHighAccuracy: false,
              timeout: 20000,
              maximumAge: 30000,
            }
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        }
      );
    });
  };

  // Send location to server
  const sendLocationToServer = async (userId, latitude, longitude) => {
    try {
      await axios.post(`${BASE_URL}/api/user/location`, {
        userId,
        latitude,
        longitude,
      });
      console.log('Location sent successfully:', latitude, longitude);
      ToastAndroid.show('Location updated', ToastAndroid.SHORT);
    } catch (err) {
      console.error('Failed to send location:', err);
      ToastAndroid.show('Failed to update location', ToastAndroid.SHORT);
    }
  };

  // Handle location errors with user-friendly messages
  const handleLocationError = (error) => {
    let message = 'Location unavailable';

    switch (error.code) {
      case 1: // PERMISSION_DENIED
        message = 'Location permission denied. Please enable in settings.';
        break;
      case 2: // POSITION_UNAVAILABLE
        message = 'Location unavailable. Please check your GPS/network.';
        break;
      case 3: // TIMEOUT
        message = 'Location request timed out. Continuing without location.';
        break;
      case 4: // ACTIVITY_NULL
        message = 'Location service not available.';
        break;
      default:
        message = 'Unable to get location. Continuing without location.';
    }

    console.warn('Location error:', error);
    ToastAndroid.show(message, ToastAndroid.LONG);
  };

  
   
  const handleLogin = async () => {
  const email = formData.email.trim();
  const password = formData.password;

  if (!email || !password) {
    ToastAndroid.show('Please fill all fields', ToastAndroid.LONG);
    return;
  }

  if (!agreedToTerms) {
    ToastAndroid.show('You must agree to the Terms & Conditions to login', ToastAndroid.LONG);
    return;
  }

  // Wait for FCM to be ready if it's not yet
  if (!isFCMReady) {
    console.log('Login: FCM not ready yet, cannot proceed with login');
    ToastAndroid.show('Initializing app, please wait...', ToastAndroid.SHORT);
    return;
  }

  try {
    setLoading(true);
    console.log('Login: Starting login process...');

    // 🔑 Get FCM Token + Device Info from Context
    const fcmData = getFCMData();
    console.log('Login: Retrieved FCM data from context:', fcmData);

    console.log("Login: Sending login request with data:", { 
      email, 
      password: '***', // Don't log actual password
      fcmToken: fcmToken, 
      deviceId: fcmData.deviceId, 
      platform: fcmData.platform 
    });

    const response = await axios.post(`${BASE_URL}/api/user/userlogin`, {
      email,
      password,
      fcmToken: fcmToken,
      deviceId: fcmData.deviceId,
      platform: fcmData.platform,
    });

    console.log("Login: Server response:", response.data);

    if (response.data?.msg === "Successfully login" && response.data.success) {
      const userData = response.data.success;
      console.log('Login: Login successful, user data:', userData);

      
      
      // Store all user data and tokens in AsyncStorage
      const storageData = {
        userData,
        userType: 'employee',
        authToken: response.data.token || userData.token,
        fcmToken: fcmToken,
        deviceInfo: {
          deviceId: fcmData.deviceId,
          platform: fcmData.platform,
          deviceModel: DeviceInfo.getModel(),
          osVersion: DeviceInfo.getSystemVersion(),
          appVersion: DeviceInfo.getVersion()
        },
        loginTimestamp: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('userSession', JSON.stringify(storageData));
      console.log('Login: User session stored in AsyncStorage');
      
      // Also store individual items for easier access if needed
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('userType', 'employee');
      await AsyncStorage.setItem('authToken', response.data.token || userData.token || '');
      await AsyncStorage.setItem('fcmToken', fcmToken|| '');
      await AsyncStorage.setItem('deviceId', fcmData.deviceId || '');
      console.log('Login: Individual items stored in AsyncStorage');

      ToastAndroid.show("Login successful!", ToastAndroid.SHORT);

      // Try to get location but don't block login if it fails
      const hasPermission = await hasLocationPermission();
      if (hasPermission) {
        console.log('Login: Location permission granted, attempting to get location');
        // Don't await location - let it happen in background
        getCurrentLocationWithFallback(userData._id).catch(err => {
          console.warn('Login: Background location failed:', err);
        });
      } else {
        console.log('Login: Location permission not granted, proceeding without location');
      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'EmployeeDashboard' }],
      });
    } else {
      console.log('Login: Login failed with response:', response.data);
      ToastAndroid.show(response.data?.error || "Login failed!", ToastAndroid.LONG);
    }
  } catch (error) {
    console.error("Login: Login error:", error.response?.data || error.message);
    ToastAndroid.show(
      error.response?.data?.error || 'Login failed. Please try again.',
      ToastAndroid.LONG
    );
  } finally {
    setLoading(false);
    console.log('Login: Login process completed');
  }
};
  const handleForgotPassword = () => {
    Toast.show({
      type: 'success',
      text1: 'Password Link Sent',
      text2: 'Check your registered email address to reset your password.',
      position: 'top',
      visibilityTime: 3000,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <ScrollView>
        <View style={styles.content}>
          <FastImage
            source={employeelogo}
            style={styles.bannerImage}
            resizeMode={FastImage.resizeMode.contain}
          />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIconText}>
                    {showPassword ? '🕶' : '🙈'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text
                  style={styles.linkText}
                  onPress={() => navigation.navigate('TermsEmployee')}
                >
                  Terms & Conditions
                </Text>
                {' '}and{' '}
                <Text
                  style={styles.linkText}
                  onPress={() => navigation.navigate('Privacy')}
                >
                  Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, (!agreedToTerms || !isFCMReady) && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading || !agreedToTerms || !isFCMReady}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>
                  {!isFCMReady ? 'Initializing...' : 'Login'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  bannerImage: {
    width: '90%',
    height: Dimensions.get('window').height * 0.20,
    marginBottom: 10,
    marginTop: 22,
    alignSelf: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#134083',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: 'black',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#134083',
    borderColor: '#134083',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    flexWrap: 'wrap',
  },
  linkText: {
    color: '#134083',
    fontWeight: '500',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: 'black',
  },
  eyeIcon: {
    padding: 12,
    color: "black"
  },
  eyeIconText: {
    fontSize: 16,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: -10,
  },
  forgotPasswordText: {
    color: '#134083',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#134083',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    zIndex: 1,
    padding: 8,
    backgroundColor: '#134083',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default Login;