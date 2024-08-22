import React, { useState, useEffect, useRef } from 'react';
import { View, Button, Text, StyleSheet, Alert, Platform } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';

export default function AadharScanner({ onScan }) {
  const [hasPermission, setHasPermission] = useState(false);
  const cameraRef = useRef(null);
  const device = useCameraDevice('back');

  useEffect(() => {
    const requestPermissions = async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      setHasPermission(cameraPermission === 'granted');
      console.log(cameraPermission);
    };

    requestPermissions();
  }, []);

  const handleCapture = async () => {
    try {
      if (cameraRef.current) {
        console.log('Camera ref is initialized');
        
        // Configuring the camera settings (You can adjust these based on your needs)
        const photo = await cameraRef.current.takePhoto({
          qualityPrioritization: 'quality',
        });

        if (photo && photo.path) {
          console.log('Photo path:', photo.path);

          // Convert the path to URI (important for Android)
          let photoUri = photo.path;
          if (Platform.OS === 'android') {
            photoUri = `file://${photo.path}`;
          }

          console.log('Photo URI:', photoUri);

          // Perform text recognition
          const result = await TextRecognition.recognize(photoUri);
          const recognizedText = result.text;

          // Extract data from recognized text
          const name = extractName(recognizedText);
          const lastFourDigits = extractLastFourDigits(recognizedText);

          if (name && lastFourDigits) {
            onScan({ name, lastFourDigits });
          } else {
            Alert.alert('Failed to scan Aadhar. Please try again.');
          }
        } else {
          console.log('No valid photo path obtained');
          Alert.alert('Failed to capture image. Please try again.');
        }
      } else {
        console.log('Camera ref is null');
      }
    } catch (error) {
      console.error('Error scanning Aadhar:', error);
      Alert.alert('An error occurred while scanning. Please try again.');
    }
  };

  const extractName = (text) => {
    const namePattern = /^[A-Z\s]+$/;
    const name = text.split('\n').find(line => namePattern.test(line));
    return name || null;
  };

  const extractLastFourDigits = (text) => {
    const digitsPattern = /\d{4}\s\d{4}\s\d{4}/;
    const match = text.match(digitsPattern);
    if (match) {
      return match[0].split(' ')[2];
    }
    return null;
  };

  if (!hasPermission || !device) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        videoStabilizationMode="auto"
        hdr={false}
        lowLightBoost={true}
      />
      <Button title="Capture" onPress={handleCapture} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
