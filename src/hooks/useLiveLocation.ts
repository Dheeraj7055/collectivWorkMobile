import { useEffect } from 'react';
import { PermissionsAndroid, Platform, Linking } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

const useLiveLocation = () => {
  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          console.warn('Permission set to never ask again');
          // Open settings so user can manually enable
          Linking.openSettings();
          return false;
        } else {
          return false;
        }
      }
      return true; // iOS handled in Info.plist
    };

    const startWatching = async () => {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      const watchId = Geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          console.log('Updated position:', latitude, longitude);
        },
        (err) => console.log('Location error:', err),
        { enableHighAccuracy: true, distanceFilter: 10, interval: 10000 }
      );

      return () => Geolocation.clearWatch(watchId);
    };

    startWatching();
  }, []);
};

export default useLiveLocation;
