import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import React, { useState } from 'react';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const { width, height } = Dimensions.get('window');

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
        if (response.user) {
          firestore()
            .collection('users')
            .doc(uid)
            .update({ emailVerified: true }) // Update emailVerified field
            .then(() => {
              setLoading(false);
              // Alert.alert('Login successfully!');
              navigation.navigate('Home'); // Navigate to home screen
            });
        } else {
          setLoading(false);
          Alert.alert('User Not Found Try Again');
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: width * 0.04,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    backgroundColor: '#fff',
  },
  inputBox: {
    borderWidth: 1,
    borderColor: 'grey',
    paddingHorizontal: width * 0.03,
    borderRadius: width * 0.04,
    width: '90%',
    marginTop: height * 0.02,
    color: 'black',
    backgroundColor: '#f0f0f0',
    fontSize: width * 0.04,
  },
  register: {
    width: '90%',
    backgroundColor: '#E53535',
    paddingVertical: height * 0.015,
    borderRadius: width * 0.08,
    alignItems: 'center',
    marginTop: height * 0.03,
  },
  registerTitle: {
    fontSize: width * 0.045,
    color: '#ffffff',
    fontWeight: '600',
  },
  signup: {
    fontSize: width * 0.05,
    color: '#000000',
    fontWeight: '600',
    marginBottom: height * 0.02,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: '600',
    lineHeight: width * 0.065,
    color: '#E53535',
    marginBottom: height * 0.03,
  },
});

export default LoginScreen;





  {/*  <TouchableOpacity
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
      */}