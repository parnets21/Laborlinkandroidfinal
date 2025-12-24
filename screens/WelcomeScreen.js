import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, FlatList, Dimensions, ActivityIndicator, Alert, ToastAndroid, Linking, Platform, PermissionsAndroid } from 'react-native';
import wel1 from "../assets/16.png";
import wel2 from "../assets/9.png";
import wel3 from "../assets/7.png";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import { BASE_URL } from '../constants/config';
import appConfig from '../app.json';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: wel1,
    title: 'Find Your Dream Job',
    subtitle: 'Discover thousands of job opportunities with all the information you need.'
  },
  {
    id: '2',
    image: wel3 ,
    title: 'Easy Application Process',
    subtitle: 'Apply to jobs with a single click and track your applications easily.'
  },
  {
    id: '3',
    image: wel2,
    title: 'Get Hired Faster',
    subtitle: 'Connect with top employers and get hired for your dream position.'
  }
];

const WelcomeScreen = ({ navigation }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const slidesRef = useRef(null);

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
        Alert.alert('Location permission denied');
      }
      if (status === 'disabled') {
        Alert.alert(
          `Turn on Location Services to allow "${appConfig.displayName}" to determine your location.`,
          '',
          [
            { text: 'Go to Settings', onPress: openSetting },
            { text: "Don't Use Location", onPress: () => {} },
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

  useEffect(() => {
    // Check if user is already logged in when component mounts
    checkUserLoginStatus();
  }, []);

  const checkUserLoginStatus = async () => {
    try {
      // Retrieve stored user data and user type
      const userData = await AsyncStorage.getItem('userData');
      const userType = await AsyncStorage.getItem('userType');
      
      if (userData && userType) {
        // User is already logged in, redirect to appropriate dashboard
        const parsedUserData = JSON.parse(userData);
        console.log('Auto-login with stored credentials:', { userType, userId: parsedUserData._id });
        
        // Try to get location but don't block navigation if it fails
        const hasPermission = await hasLocationPermission();
        if (hasPermission) {
          // Don't await location - let it happen in background
          getCurrentLocationWithFallback(parsedUserData._id).catch(err => {
            console.warn('Background location failed:', err);
          });
        } else {
          console.log('Location permission not granted, proceeding without location');
        }

        if (userType === 'employee') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'EmployeeDashboard' }],
          });
        } else if (userType === 'employer') {
          // For employers, check if they are approved
          if (parsedUserData.isApproved && parsedUserData.status === 'Approved') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'EmployerDashboard' }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ 
                name: 'EmployerPending', 
                params: {
                  email: parsedUserData.email,
                  userId: parsedUserData._id
                }
              }],
            });
          }
        } else {
          // If userType is invalid or not recognized
          setIsLoading(false);
        }
      } else {
        // No stored credentials found, show welcome slides
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Auto-login check error:', error);
      setIsLoading(false);
    }
  };

  const updateCurrentSlideIndex = (e) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const Slide = ({ item }) => {
    return (
      <View style={[styles.slide, { width }]}>
        <View style={styles.imageContainer}>
          <Image 
            source={item.image}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
      </View>
    );
  };

  // Show loading indicator while checking login status
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={slidesRef}
        data={slides}
        renderItem={({ item }) => <Slide item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.paginationContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              currentSlideIndex === index && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('RoleSelection')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  imageContainer: {
    backgroundColor: '#fc3029',
    padding: 20,
    borderRadius: 25,
    marginBottom: 30,
    width: width * 0.8,
    height: width * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#134083',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#134083',
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: '#fc3029',
    width: 20,
  },
  button: {
    backgroundColor: '#134083',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
export default WelcomeScreen;