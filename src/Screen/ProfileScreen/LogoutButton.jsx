import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import React from 'react'
import auth from '@react-native-firebase/auth';
export default function LogoutButton() {
 
    const onLogout = () => {
      auth()
        .signOut()
        .then(response => {
          console.log('response :', response);
          Alert.alert('User signed out!');
        })
        .catch(error => {
          console.log('error :', error);
          Alert.alert('Not able to logout!');
        });
    };
  return (
    <View>
      <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
        <Text style={styles.logout}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    color: '#000',
    fontWeight: '500',
    marginTop: 30,
  },
  logout: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#FCAF03',
    padding: 12,
    borderRadius: 20,
    width: '90%',
    alignItems: 'center',
    marginBottom: 30,
  },
});