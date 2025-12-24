import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
  Animated,
  StatusBar,
  PermissionsAndroid,
  Image,
  BackHandler,
  Linking
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Geolocation from '@react-native-community/geolocation';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Replace with your actual Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyClbig43rDJiDAjE8QVefX2LNZpczeBt5w';

const TrackLiveScreen = ({ route, navigation }) => {
  const application = route?.params?.application || {};
  const user = application?.userId || {};
  console.log("usersss", user._id);

  const offerLetter = application?.offerLetter || {};

  const [currentLocation, setCurrentLocation] = useState(null);
  const [workLocation, setWorkLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [locationSource, setLocationSource] = useState('');

  const mapRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const watchIdRef = useRef(null);
  const isMountedRef = useRef(true);

  const defaultRegion = {
    latitude: 13.0767716,
    longitude: 77.5385581,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  useEffect(() => {
    isMountedRef.current = true;

    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse',
      locationProvider: 'auto',
    });

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    initializeTracking().catch((err) => {
      console.error('Failed to initialize tracking:', err);
      if (isMountedRef.current) {
        setError('Failed to initialize tracking');
        setLoading(false);
      }
    });

    startPulseAnimation();

    return () => {
      isMountedRef.current = false;
      backHandler.remove();
      stopTracking();
    };
  }, []);

  const startPulseAnimation = () => {
    if (!isMountedRef.current) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const initializeTracking = async () => {
    if (!isMountedRef.current) return;

    try {
      setLoading(true);
      setError('');

      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      await fetchWorkLocation();
      const apiLocation = await fetchUserLocationFromAPI();

      if (apiLocation) {
        setCurrentLocation({
          latitude: apiLocation.latitude,
          longitude: apiLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setLastUpdated(new Date(apiLocation.updatedAt));
        setLocationSource('User');
        setLocationAccuracy(null);
      } else {
        await getCurrentLocation();
      }

      startLocationTracking();
    } catch (err) {
      console.error('Initialize tracking error:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Failed to initialize location tracking');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const fetchUserLocationFromAPI = async () => {
    try {
      const response = await fetch(`https://laborlink.co.in/api/user/location/${user._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      const data = await response.json();
      if (response.ok && data.latitude && data.longitude) {
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          updatedAt: data.updatedAt,
        };
      }
      console.warn('API returned invalid data:', data);
      return null;
    } catch (err) {
      console.warn('Error fetching user location from API:', err);
      return null;
    }
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This app needs to access your location to track employee position',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true; // iOS handles permissions via Info.plist
    } catch (err) {
      console.warn('Location permission error:', err);
      return false;
    }
  };

  const fetchWorkLocation = async () => {
    try {
      const address = offerLetter?.workLocation || user?.location || 'Bengaluru, India';
      if (!GOOGLE_MAPS_API_KEY) {
        console.warn('Google Maps API key not configured, using default location');
        if (isMountedRef.current) {
          setWorkLocation({
            latitude: 12.9716,
            longitude: 77.5946,
          });
        }
        return;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${GOOGLE_MAPS_API_KEY}`,
        { timeout: 10000 }
      );

      const data = await response.json();
      if (data.status === 'OK' && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        if (isMountedRef.current) {
          setWorkLocation({
            latitude: lat,
            longitude: lng,
          });
        }
      } else {
        console.warn('Geocoding failed:', data.status);
        if (isMountedRef.current) {
          setWorkLocation({
            latitude: 12.9716,
            longitude: 77.5946,
          });
        }
      }
    } catch (err) {
      console.warn('Error fetching work location:', err);
      if (isMountedRef.current) {
        setWorkLocation({
          latitude: 12.9716,
          longitude: 77.5946,
        });
      }
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!isMountedRef.current) {
        resolve();
        return;
      }

      Geolocation.getCurrentPosition(
        (position) => {
          if (!isMountedRef.current) return;

          const { latitude, longitude, accuracy } = position.coords;
          const newLocation = {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };

          console.log(`Location found: ${latitude}, ${longitude} (±${accuracy}m)`);

          setCurrentLocation(newLocation);
          setLocationAccuracy(accuracy);
          setLastUpdated(new Date());
          setLocationSource('GPS');
          resolve(newLocation);
        },
        (error) => {
          console.warn('Location error:', error);
          setError('Unable to fetch current location');
          setCurrentLocation(defaultRegion);
          setLocationSource('Default');
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 10000,
        }
      );
    });
  };

  const startLocationTracking = () => {
    if (!isMountedRef.current) return;

    setIsTracking(true);

    const watchId = Geolocation.watchPosition(
      (position) => {
        if (!isMountedRef.current) return;

        const { latitude, longitude, accuracy } = position.coords;
        const newLocation = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        console.log(`Location updated: ${latitude}, ${longitude} (±${accuracy}m)`);

        setCurrentLocation(newLocation);
        setLocationAccuracy(accuracy);
        setLastUpdated(new Date());
        setLocationSource('GPS (Live)');

        if (error && error.includes('GPS signal not available')) {
          setError('');
        }
      },
      (error) => {
        console.warn('Location tracking error:', error);
        if (isMountedRef.current) {
          setError('Unable to track location continuously');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 45000,
        maximumAge: 10000,
        distanceFilter: 5,
      }
    );

    watchIdRef.current = watchId;
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const centerOnCurrentLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(currentLocation, 1000);
    }
  };

  const showFullMap = () => {
    if (currentLocation && workLocation && mapRef.current) {
      mapRef.current.fitToCoordinates([currentLocation, workLocation], {
        edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
        animated: true,
      });
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAccuracyColor = (accuracy) => {
    if (!accuracy) return '#6B7280';
    if (accuracy < 10) return '#10B981';
    if (accuracy < 50) return '#F59E0B';
    return '#EF4444';
  };

  const getLocationSourceColor = (source) => {
    if (source.includes('GPS')) return '#10B981';
    if (source.includes('Network')) return '#F59E0B';
    if (source.includes('User')) return '#3B82F6';
    return '#6B7280';
  };

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 0],
  });

  const handleBackPress = () => {
    navigation.goBack();
    return true;
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError('');
      const apiLocation = await fetchUserLocationFromAPI();
      if (apiLocation) {
        setCurrentLocation({
          latitude: apiLocation.latitude,
          longitude: apiLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setLastUpdated(new Date(apiLocation.updatedAt));
        setLocationSource('User');
        setLocationAccuracy(null);
      } else {
        await getCurrentLocation();
      }
    } catch (error) {
      console.warn('Refresh location error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#134083" />
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Live Tracking</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: isTracking ? '#10B981' : '#EF4444' }]} />
            <Text style={styles.statusText}>{isTracking ? 'Active' : 'Inactive'}</Text>
            {locationSource && (
              <Text style={[styles.locationSource, { color: getLocationSourceColor(locationSource) }]}>
                • {locationSource}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Icon name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.employeeCard, { opacity: fadeAnim }]}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            {user?.profile ? (
              <Image source={{ uri: user.profile }} style={styles.avatar} />
            ) : (
              <Text style={styles.avatarText}>{(user?.fullName || 'U').charAt(0).toUpperCase()}</Text>
            )}
          </View>
          <View style={styles.employeeInfo}>
            <Text style={styles.employeeName}>{user?.fullName || 'Unknown Employee'}</Text>
            <Text style={styles.jobTitle}>{application?.jobTitle || 'No Position'}</Text>
          </View>
          <View style={styles.accuracyBadge}>
            <Icon name="gps-fixed" size={12} color={getAccuracyColor(locationAccuracy)} />
            <Text style={[styles.accuracyText, { color: getAccuracyColor(locationAccuracy) }]}>
              {locationAccuracy ? `±${Math.round(locationAccuracy)}m` : 'No GPS'}
            </Text>
          </View>
        </View>
        {lastUpdated && (
          <View style={styles.lastUpdated}>
            <Icon name="access-time" size={14} color="#6B7280" />
            <Text style={styles.lastUpdatedText}>Last updated: {formatTime(lastUpdated)}</Text>
          </View>
        )}
      </Animated.View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Fetching location...</Text>
          <Text style={styles.loadingSubtext}>
            This may take a moment if GPS signal is weak
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="location-off" size={64} color="#DC2626" />
          <Text style={styles.errorTitle}>Location Issue</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={initializeTracking}>
            <Icon name="refresh" size={20} color="#fff" style={styles.retryIcon} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.View style={[styles.mapContainer, { opacity: fadeAnim }]}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={currentLocation || defaultRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}
            mapType="standard"
          >
            {currentLocation && (
              <>
                <Marker
                  coordinate={currentLocation}
                  title="Current Location"
                  description={`${user?.fullName || 'Employee'} - ${locationSource}`}
                >
                  <View style={styles.currentLocationMarker}>
                    <Animated.View
                      style={[
                        styles.pulseRing,
                        { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
                      ]}
                    />
                    <View
                      style={[
                        styles.currentLocationDot,
                        { backgroundColor: getLocationSourceColor(locationSource) },
                      ]}
                    />
                  </View>
                </Marker>
                {locationAccuracy && locationAccuracy > 0 && (
                  <Circle
                    center={currentLocation}
                    radius={Math.max(locationAccuracy, 10)}
                    fillColor="rgba(59, 130, 246, 0.1)"
                    strokeColor="rgba(59, 130, 246, 0.3)"
                    strokeWidth={1}
                  />
                )}
              </>
            )}
            {workLocation && (
              <Marker
                coordinate={workLocation}
                title="Work Location"
                description={offerLetter?.workLocation || user?.location || 'Office'}
                pinColor="#EF4444"
              />
            )}
          </MapView>
          <View style={styles.mapControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={centerOnCurrentLocation}
            >
              <Icon name="my-location" size={24} color="#4F46E5" />
            </TouchableOpacity>
            {workLocation && (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={showFullMap}
              >
                <Icon name="zoom-out-map" size={24} color="#4F46E5" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#134083',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  locationSource: {
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 4,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  employeeCard: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 20,
    padding: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  accuracyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  accuracyText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  lastUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  mapContainer: {
    flex: 1,
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  map: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#DC2626',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryIcon: {
    marginRight: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    top: 16,
    flexDirection: 'column',
  },
  controlButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currentLocationMarker: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
  },
  currentLocationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});

export default TrackLiveScreen;