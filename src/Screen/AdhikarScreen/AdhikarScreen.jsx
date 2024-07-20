import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AdhikarScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image source={require('../../Assets/logo.jpeg')} style={styles.logo} />
      <Text style={styles.title}>Welcome To Adhikar</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddaMember')}>
        <Text style={styles.buttonText}>Add a Member</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UpdateaMember')}>
        <Text style={styles.buttonText}>Update a Member</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
    borderRadius:50
  },
  title: {
    fontSize: 24,
    color: '#6200ee',
    fontWeight: '700',
    marginBottom: 40,
  },
  button: {
    width: '80%',
    padding: 15,
    backgroundColor: '#6200ee',
    alignItems: 'center',
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdhikarScreen;
