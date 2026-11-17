import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const requestLocationPermissions = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Sorry, we need location permissions to show nearby stores!'
    );
    return false;
  }
  return true;
};

export const getCurrentLocation = async () => {
  const hasPermission = await requestLocationPermissions();
  if (!hasPermission) return null;

  try {
    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    Alert.alert('Error', 'Failed to get your location. Please try again.');
    return null;
  }
};

export const getNearbyStores = async (userLocation) => {
  // Mock data for nearby stores
  // In a real app, you would call a geocoding API or store location service
  const mockStores = [
    {
      id: 1,
      name: 'Tech Store Downtown',
      address: '123 Main St, Downtown',
      distance: '0.5 miles',
      latitude: userLocation.latitude + 0.001,
      longitude: userLocation.longitude + 0.001,
    },
    {
      id: 2,
      name: 'Electronics Plus',
      address: '456 Oak Ave, Midtown',
      distance: '1.2 miles',
      latitude: userLocation.latitude - 0.002,
      longitude: userLocation.longitude + 0.003,
    },
    {
      id: 3,
      name: 'Gadget World',
      address: '789 Pine St, Uptown',
      distance: '2.1 miles',
      latitude: userLocation.latitude + 0.003,
      longitude: userLocation.longitude - 0.001,
    },
  ];

  return mockStores;
};







