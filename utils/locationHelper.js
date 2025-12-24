import Geolocation from 'react-native-geolocation-service';

export const getCurrentLocation = async () => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    console.log('Permission denied');
    return;
  }

  Geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      console.log('Latitude:', latitude, 'Longitude:', longitude);
      // Use these values as needed
    },
    (error) => {
      console.log('Location error:', error.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    }
  );
};
