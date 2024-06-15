import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import  ManageExternalStorage  from 'react-native-manage-external-storage';

const HomeScreen = () => {
  const navigation = useNavigation();
 



  const [result, setResult] = useState(false);
  useEffect(() => {
     async function AskPermission() {
     await ManageExternalStorage.checkAndGrantPermission(
            err => { 
              setResult(false)
           },
           res => {
            setResult(true)
           },
         )
    }
  
      // AskPermission()  // This function is only executed once if the user allows the permission and this package retains that permission 
   }, []);

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Welcome To Adhikar Grievance</Text>
      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Post')}>
        <Image source={require('../../Assets/post.png')} style={styles.image} />
        <Text style={styles.optionText}>Raise a Ticket</Text>
      </TouchableOpacity>
      {/* Add a border line here between these two buttons */}
      <View style={styles.separator} />
      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('ViewStatus')}>
        <Image source={require('../../Assets/view.png')} style={styles.image} />
        <Text style={styles.optionText}>VIEW STATUS</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column', // Change this to 'column' if you want them to stack vertically on smaller screens
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  option: {
    alignItems: 'center',
    // marginVertical: 20, // Add some margin between the buttons and the separator
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 10,
    objectFit:'contain'
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  separator: {
    width: '90%', // Adjust the width as needed
    height: 1,
    backgroundColor: '#ccc',
    // marginVertical: 20, // Add some vertical margin to space the separator from the buttons
  },  title: {
    fontSize: 20,
    color: '#6200ee',
    fontWeight: '600',
    marginBottom: 10,
  },
});

export default HomeScreen;
