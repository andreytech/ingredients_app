import { Alert, Button, Platform, View } from 'react-native';
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  useCameraPermissions,
  useMediaLibraryPermissions,
  PermissionStatus,
  MediaTypeOptions,
  getPendingResultAsync
} from 'expo-image-picker';
import axios from 'axios';

const API_BASE = 'http://81.200.151.98:8000'

function OCRImagePicker({ handleResponse, handleLoading }) {
  const [cameraPermissionInformation, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermissionInformation, requestMediaLibraryPermission] = useMediaLibraryPermissions();

  async function verifyPermissions() {
    if (mediaLibraryPermissionInformation.status === PermissionStatus.GRANTED) {
      return true;
    }

    if (mediaLibraryPermissionInformation.status === PermissionStatus.DENIED
      && cameraPermissionInformation.status === PermissionStatus.GRANTED) {
      return true;
    }

    if (mediaLibraryPermissionInformation.status === PermissionStatus.UNDETERMINED) {
      const permissionResponse = await requestMediaLibraryPermission();

      return permissionResponse.granted;
    }

    if (cameraPermissionInformation.status === PermissionStatus.UNDETERMINED) {
      const permissionResponse = await requestCameraPermission();

      return permissionResponse.granted;
    }

    if (cameraPermissionInformation.status === PermissionStatus.DENIED) {
      Alert.alert(
        'Insufficient Permissions!',
        'You need to grant camera permissions to use this app.'
      );
      return false;
    }

    return true;
  }

  async function handleImagePick() {
    const hasPermission = await verifyPermissions();

    if (!hasPermission) {
      return;
    }

    handleResponse('');
    handleLoading(true);

    let prepareResult = null;

    console.log('Media library permission:' + mediaLibraryPermissionInformation.status)
    try {
      if (mediaLibraryPermissionInformation.status === PermissionStatus.GRANTED) {
        console.log('open library')
        prepareResult = await launchImageLibraryAsync({
          mediaTypes: MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 1,
        });
      } else {
        console.log('open camera')
        prepareResult = await launchCameraAsync({
          mediaTypes: MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 1,
        });
      }
    } catch (err) {
      console.log('image retrieve error');
      console.log(err);
      return;
    }

    const androidResult = await getPendingResultAsync();

    const image = androidResult?.length ? androidResult[0] : prepareResult;

    if (image.canceled) {
      return;
    }

    const systemUri = image.assets[0].uri;
    const uri =
      Platform.OS === "android"
        ? systemUri
        : systemUri.replace("file://", "");
    const filename = systemUri.split('/').pop();

    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    const formData = new FormData();
    formData.append('image', { uri: uri, name: filename, type });

    let result;
    try {
      result = await axios.post(`${API_BASE}/api/v1/ocr`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    } catch (err) {
      console.log('ocr api error');
      console.log(err);
      handleLoading(false);
      return;
    }

    console.log(result.data)

    handleResponse(result.data.ingredients);
    handleLoading(false);
  }

  return (
    <Button title="Срочно нажми!!!" onPress={handleImagePick} />
  );
}

export default OCRImagePicker;