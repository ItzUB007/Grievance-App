import { View, Text, StyleSheet, Button } from 'react-native'
import React from 'react'
import LogoutButton from './LogoutButton';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
     <LogoutButton/>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: 20,
    },
  });