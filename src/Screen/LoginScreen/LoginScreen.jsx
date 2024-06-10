import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const onLogin = () => {
    if (!email || !password) {
      Alert.alert('Email and password are mandatory');
      return;
    }

    setLoading(true);
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(response => {
        const uid = response.user.uid;
        if (response.user.emailVerified) {
          firestore()
            .collection('users')
            .doc(uid)
            .update({ emailVerified: true }) // Update emailVerified field
            .then(() => {
              setLoading(false);
              Alert.alert('Login successfully!');
              navigation.navigate('Home'); // Navigate to home screen
            });
        } else {
          setLoading(false);
          Alert.alert('Verify your email first');
          auth().signOut();
        }
      })
      .catch(error => {
        setLoading(false);
        if (error.code === 'auth/wrong-password') {
          Alert.alert('Password is not correct!');
        } else {
          Alert.alert('Error logging in. Please try again.');
        }
        console.log('error :', error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome To Adhikar Grievance</Text>
      <Text style={styles.signup}>Login Screen</Text>
      <TextInput
        placeholder="Enter Your Email"
        style={styles.inputBox}
        value={email}
        onChangeText={value => setEmail(value)}
        placeholderTextColor='black'
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Enter Your Password"
        style={styles.inputBox}
        value={password}
        onChangeText={value => setPassword(value)}
        placeholderTextColor='black'
        secureTextEntry={true}
      />
      <TouchableOpacity onPress={onLogin} style={styles.register}>
        {loading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text style={styles.registerTitle}>Login</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.registerLink}>Not Registered? Register here</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.phoneSignInButton}
        onPress={() => navigation.navigate('PhoneSignIn')}
      >
        <Text style={styles.phoneSignInButtonText}>Sign In with Phone Number</Text>
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
    backgroundColor: '#fff', // Set background color to white
  },
  inputBox: {
    borderWidth: 1,
    borderColor: 'grey',
    paddingHorizontal: 12,
    borderRadius: 5,
    width: '90%',
    marginTop: 20,
    color: 'black',
    backgroundColor: '#f0f0f0',
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
  registerLink: {
    fontSize: 16,
    color: '#0000FF',
  },
  linkContainer: {
    marginTop: 25,
  },
  phoneSignInButton: {
    width: '90%',
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  phoneSignInButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    color: '#6200ee',
    fontWeight: '600',
    marginBottom: 20,
  },
});

export default LoginScreen;
