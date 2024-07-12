import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, } from 'react-native';
import { useNavigation } from '@react-navigation/native';



const AdhikarScreen = () => {
  const navigation = useNavigation();


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome To Adhikar </Text>
      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Post')}>
        <Image source={require('../../Assets/post.png')} style={styles.image} />
        <Text style={styles.optionText}>Add a Member</Text>
      </TouchableOpacity>
      {/* Add a border line here between these two buttons */}
      <View style={styles.separator} />
      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('ViewStatus')}>
        <Image source={require('../../Assets/status.png')} style={styles.image} />
        <Text style={styles.optionText}>Update a Member</Text>
      </TouchableOpacity>
  
 
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#fff',
    position: 'relative',
  },
  option: {
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 10,
    objectFit: 'contain',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  separator: {
    width: '90%',
    height: 1,
    backgroundColor: '#ccc',
  },
  title: {
    fontSize: 20,
    color: '#6200ee',
    fontWeight: '600',
    marginTop: 10,
  },

});

export default AdhikarScreen;
