import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from '../../styles/colors';
import fontFamily from '../../styles/fontFamily';



const GrievanceScreen = () => {
  const navigation = useNavigation();


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome To Adhikar Grievance</Text>
      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Post')}>
        <Image source={require('../../Assets/img/post.png')} style={styles.image} />
        <Text style={styles.optionText}>Raise a Ticket</Text>
      </TouchableOpacity>
      {/* Add a border line here between these two buttons */}
      <View style={styles.separator} />
      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('ViewStatus')}>
        <Image source={require('../../Assets/img/status.png')} style={styles.image} />
        <Text style={styles.optionText}>VIEW STATUS</Text>
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
    color: colors.themered,
    fontWeight: '600',
    marginTop: 10,
    fontFamily:fontFamily.medium,
  },

});

export default GrievanceScreen;
