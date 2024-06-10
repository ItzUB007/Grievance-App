import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const onRegister = () => {
    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      Alert.alert('All fields are required!');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (phoneNumber.length !== 10) {
      Alert.alert('Invalid Phone Number', 'Phone number must be 10 digits long.');
      return;
    }

    setLoading(true);
    auth()
      .createUserWithEmailAndPassword(email, password)
      .then(response => {
        const uid = response.user.uid;
        const displayName = `${firstName} ${lastName}`;
        response.user.sendEmailVerification(); // Send email verification
        firestore()
          .collection('users')
          .doc(uid)
          .set({
            email: email,
            firstName: firstName,
            lastName: lastName,
            displayName: displayName,
            phoneNumber: phoneNumber,
            uid: uid,
            emailVerified: false, // Default to false
          })
          .then(() => {
            setLoading(false);
            Alert.alert('User registered successfully! Please verify your email.');
            auth().signOut(); // Sign out the user after registration
            navigation.navigate('Login'); // Navigate to login screen
          })
          .catch(error => {
            setLoading(false);
            console.error('Error saving user to Firestore: ', error);
            Alert.alert('Error saving user data');
          });
      })
      .catch(error => {
        setLoading(false);
        if (error.code === 'auth/email-already-in-use') {
          Alert.alert('The email address is already in use by another account.');
          setError('email');
        } else {
          console.error('Error creating user: ', error);
          Alert.alert('Error creating user');
        }
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.signup}>Register Here</Text>
      <TextInput
        placeholder="Enter Your First Name"
        style={[styles.inputBox, error === 'firstName' && styles.errorInput]}
        value={firstName}
        onChangeText={value => setFirstName(value)}
        placeholderTextColor="gray"
      />
      <TextInput
        placeholder="Enter Your Last Name"
        style={[styles.inputBox, error === 'lastName' && styles.errorInput]}
        value={lastName}
        onChangeText={value => setLastName(value)}
        placeholderTextColor="gray"
      />
      <TextInput
        placeholder="Enter Your Phone Number"
        style={[styles.inputBox, error === 'phoneNumber' && styles.errorInput]}
        value={phoneNumber}
        onChangeText={value => setPhoneNumber(value)}
        placeholderTextColor="gray"
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Enter Your Email"
        style={[styles.inputBox, error === 'email' && styles.errorInput]}
        value={email}
        onChangeText={value => {
          setEmail(value);
          setError(null);  // Clear the error when user changes the input
        }}
        placeholderTextColor="gray"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Enter Your Password"
        style={[styles.inputBox, error === 'password' && styles.errorInput]}
        value={password}
        onChangeText={value => setPassword(value)}
        placeholderTextColor="gray"
        secureTextEntry={true}
      />
      <TouchableOpacity onPress={onRegister} style={styles.register} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text style={styles.registerTitle}>Register</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    backgroundColor: '#fff',  // Set a background color for the container
  },
  inputBox: {
    borderWidth: 1,
    borderColor: 'grey',
    paddingHorizontal: 12,
    borderRadius: 5,
    width: '90%',
    marginTop: 20,
    color: 'black',  // Ensure text color is black
    backgroundColor: '#f0f0f0',  // Light grey background for the inputs
  },
  register: {
    width: '90%',
    backgroundColor: '#FCAF03',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  registerTitle: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  signup: {
    fontSize: 20,
    color: '#000000',
    fontWeight: '600',
    marginBottom: 20,
  },
  errorInput: {
    borderColor: 'red',  // Change border color to red if there's an error
  },
});

export default RegisterScreen;
