import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const requestImagePickerPermissions = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Sorry, we need camera roll permissions to upload images!'
    );
    return false;
  }
  return true;
};

export const pickImage = async () => {
  const hasPermission = await requestImagePickerPermissions();
  if (!hasPermission) return null;

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0];
    }
    return null;
  } catch (error) {
    Alert.alert('Error', 'Failed to pick image. Please try again.');
    return null;
  }
};

export const takePhoto = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Sorry, we need camera permissions to take photos!'
    );
    return null;
  }

  try {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0];
    }
    return null;
  } catch (error) {
    Alert.alert('Error', 'Failed to take photo. Please try again.');
    return null;
  }
};







