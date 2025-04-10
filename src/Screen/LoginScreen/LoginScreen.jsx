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
import colors from '../../styles/colors';
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';

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
            .update({ emailVerified: true })
            .then(() => {
              setLoading(false);
              navigation.navigate('Home');
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
    <View style={styles.mainContainer}>
      <View style={styles.container}>
        <Text style={styles.signup}>Welcome To</Text>
        <Text style={styles.title}>Adhikar Grievance</Text>

        <TextInput
          placeholder="Enter Your Email"
          style={styles.inputBox}
          value={email}
          onChangeText={setEmail}
          placeholderTextColor={colors.greyHeading}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Enter Your Password"
          style={styles.inputBox}
          value={password}
          onChangeText={setPassword}
          placeholderTextColor={colors.greyHeading}
          secureTextEntry
        />

        <TouchableOpacity onPress={onLogin} style={styles.register}>
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.registerTitle}>Login</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Background circle */}
      <View style={styles.circle} />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.themered,
    position:'relative'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveWidth(4),
  },
  inputBox: {
    paddingHorizontal: width * 0.03,
    borderRadius: width * 0.07,
    width: '90%',
    marginTop: height * 0.02,
    color: 'black',
    backgroundColor: colors.themewhite,
    fontSize: width * 0.04,
    borderWidth: 0,
    borderColor: 'transparent',
    textAlign: 'center',
  },
  register: {
    width: '50%',
    backgroundColor: '#c32c2c',
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
    color: '#ffffff',
    fontWeight: '300',
    fontFamily: 'Montserrat-Regular',
    fontSize: responsiveFontSize(2.5),
  },
  title: {
    fontSize: responsiveFontSize(3.5),
    fontWeight: '700',
    lineHeight: width * 0.072,
    marginBottom: height * 0.03,
    color: '#ffffff',
    fontFamily: 'Montserrat-Regular',
  },
  circle: {
    position: 'absolute',
    width: '100%',
     height: '50%',
    borderRadius: width * 0.60,
    backgroundColor: colors.themewhite,
    opacity: 0.1,
    bottom: -115,
    left: -120,
    zIndex: -1,
  },
});

export default LoginScreen;
