import React, { useState, useEffect, useRef } from 'react';
import { View, Button, Text, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';

export default function AadharScanner({ onScan }) {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(false); // State to manage the loader
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
    setLoading(true); // Start the loader

    try {
      if (cameraRef.current) {
        console.log('Camera ref is initialized');
        
        const photo = await cameraRef.current.takePhoto({
          qualityPrioritization: 'quality',
          skipMetadata: true,  // This might help avoid configuration issues
        });

        if (photo && photo.path) {
          console.log('Photo path:', photo.path);

          let photoUri = photo.path;
          if (Platform.OS === 'android') {
            photoUri = `file://${photo.path}`;
          }

          console.log('Photo URI:', photoUri);

          const result = await TextRecognition.recognize(photoUri);
          const recognizedText = result.text;
          console.log(recognizedText)

          const name = extractName(recognizedText);
          const lastFourDigits = extractLastFourDigits(recognizedText);
          const dob = extractDOB(recognizedText); // Extract DOB

          if (name && lastFourDigits ) {
            onScan({ name, lastFourDigits,dob });
            
            
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
    } finally {
      setLoading(false); // Stop the loader
    }
  };

  const extractName = (text) => {
    // Keywords to exclude from name extraction
    const excludeKeywords = ['GOVERNMENT OF INDIA', 'DOB', 'MALE', 'FEMALE', 'FEMALE', 'INDIA', 'AADHAAR', 'UIDAI'];
  
    // Regex to match lines that contain names (allow both upper and lowercase)
    const namePattern = /^[a-zA-Z\s]+$/;
  
    // Split text into lines and find a line matching the name pattern
    const name = text
      .split('\n')
      .map(line => line.trim()) // Trim spaces from each line
      .find(line => {
        const isName = namePattern.test(line) && !excludeKeywords.some(keyword => line.toUpperCase().includes(keyword));
        return isName;
      });
  
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
  const extractDOB = (text) => {
    const dobPattern = /(?:DOB[:\s]*)(\d{2}\/\d{2}\/\d{4})/i; // Regex to match DOB format
    const match = text.match(dobPattern);
    
    if (match && match[1]) {
      // Use the matched date string to create a Date object
      const dateParts = match[1].split('/');
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1; // Months are 0-based in JavaScript
      const year = parseInt(dateParts[2], 10);
  
      const dob = new Date(year, month, day);
  
      // Return the formatted date string
      return dob.toLocaleDateString('en-GB'); // dd/mm/yyyy format
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
         hdr={true}
         lowLightBoost={true}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" /> // Loader while capturing
      ) : (
        <Button title="Capture" onPress={handleCapture} />
      )}
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





