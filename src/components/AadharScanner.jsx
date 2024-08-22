import React, { useEffect, useState } from 'react';
import { View, Button, Alert, ActivityIndicator, Text } from 'react-native';
import { RNCamera } from 'react-native-camera';
import TextRecognition from 'react-native-text-recognition';

export default function AadharScanner({ onScan }) {
  const [loading, setLoading] = useState(false);

  const handleCapture = async (camera) => {
    setLoading(true);
    try {
      const options = { quality: 0.5, base64: true };
      const data = await camera.takePictureAsync(options);
      const detectedText = await TextRecognition.recognize(data.uri);

      // Assuming that the name is in uppercase and the last four digits are numbers in the format shown in the image.
      const name = extractName(detectedText);
      const lastFourDigits = extractLastFourDigits(detectedText);

      if (name && lastFourDigits) {
        onScan({ name, lastFourDigits });
      } else {
        Alert.alert('Failed to scan Aadhar. Please try again.');
      }
    } catch (error) {
      console.error('Error scanning Aadhar:', error);
      Alert.alert('An error occurred while scanning. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const extractName = (textArray) => {
    // Example logic to extract name
    const namePattern = /^[A-Z\s]+$/;
    const name = textArray.find(line => namePattern.test(line));
    return name || null;
  };

  const extractLastFourDigits = (textArray) => {
    // Example logic to extract last four digits
    const digitsPattern = /\d{4}\s\d{4}\s\d{4}/;
    const match = textArray.find(line => digitsPattern.test(line));
    if (match) {
      return match.split(' ')[2];
    }
    return null;
  };

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Processing...</Text>
        </View>
      ) : (
        <RNCamera
          style={{ flex: 1 }}
          captureAudio={false}
          onCameraReady={() => console.log('Camera ready')}
        >
          {({ camera, status }) => {
            if (status !== 'READY') return null;
            return (
              <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                <Button title="Capture" onPress={() => handleCapture(camera)} />
                <Button title="Cancel" onPress={() => onScan(null)} />
              </View>
            );
          }}
        </RNCamera>
      )}
    </View>
  );
}
