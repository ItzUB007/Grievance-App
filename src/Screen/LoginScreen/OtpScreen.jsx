import { TextInput, TouchableOpacity, View, StyleSheet, Text, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';

const OTPScreen = ({ confirm }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function confirmCode() {
    setLoading(true);
    try {
      await confirm.confirm(code);
      setLoading(false);
      Alert.alert('Authentication Successful');
    } catch (error) {
      setLoading(false);
      console.log('Invalid code.');
      setError('Invalid code. Please try again.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter verification code"
        value={code}
        onChangeText={text => setCode(text)}
        keyboardType="number-pad"
        placeholderTextColor="gray"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={confirmCode} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Confirm Code</Text>
        )}
      </TouchableOpacity>
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
    color: 'black',
    backgroundColor: '#f0f0f0',
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
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default OTPScreen;
