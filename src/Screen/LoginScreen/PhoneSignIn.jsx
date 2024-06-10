import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import auth from '@react-native-firebase/auth';
import OTPScreen from './OtpScreen.jsx';

const PhoneSignIn = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(false);

  async function signInWithPhoneNumber(phoneNumber) {
    if (phoneNumber.length !== 10) {
      Alert.alert('Invalid Phone Number', 'Phone number must be 10 digits long.');
      return;
    }

    setLoading(true);
    try {
      const confirmation = await auth().signInWithPhoneNumber("+91" + phoneNumber);
      setConfirm(confirmation);
    } catch (error) {
      console.log('Error signing in with phone number:', error);
      Alert.alert('Error signing in', 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {confirm ? (
        <OTPScreen confirm={confirm} />
      ) : (
        <>
          <Text style={styles.title}>Phone Sign In</Text>
          <View style={styles.phoneInputContainer}>
            <Text style={styles.prefix}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              value={phoneNumber}
              onChangeText={text => setPhoneNumber(text)}
              keyboardType="phone-pad"
              placeholderTextColor="gray"
            />
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => signInWithPhoneNumber(phoneNumber)}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In with Phone Number</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  prefix: {
    fontSize: 16,
    color: 'black',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: 'black',
    paddingVertical: 8,
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PhoneSignIn;
