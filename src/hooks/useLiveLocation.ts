import { setLocation } from '@/redux/slices/locationSlices';
import { useEffect } from 'react';
import { PermissionsAndroid, Platform, Linking } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { useDispatch } from 'react-redux';
// import { setLocation } from '@/redux/slices/locationSlice';

const useLiveLocation = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Linking.openSettings();
          return false;
        } else {
          return false;
        }
      }
      return true; // iOS permissions handled in Info.plist
    };

    const fetchAddress = async (lat: number, lon: number) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
          {
            headers: {
              'User-Agent': 'CollectivWork/1.0 (your-email@example.com)',
            },
          },
        );

        if (!res.ok) {
          throw new Error('Failed to fetch location');
        }

        const json = await res.json();
        console.log('json', json);
        return json.display_name || 'Unknown Location';
      } catch (e) {
        console.error('Error fetching address:', e);
        return 'Unknown Location';
      }
    };


    const startWatching = async () => {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      const watchId = Geolocation.watchPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const address = await fetchAddress(latitude, longitude);

          dispatch(
            setLocation({
              latitude,
              longitude,
              address,
            })
          );
        },
        (err) => console.log('Location error:', err),
        { enableHighAccuracy: true, distanceFilter: 10, interval: 10000 }
      );

      return () => Geolocation.clearWatch(watchId);
    };

    startWatching();
  }, [dispatch]);
};

export default useLiveLocation;
