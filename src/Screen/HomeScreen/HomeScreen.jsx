import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import ManageExternalStorage from 'react-native-manage-external-storage';

import { toggleSlider } from '../../../redux/features/sliderSlice';

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isOn = useSelector((state) => state.slider.isOn);

  const [result, setResult] = useState(false);

  useEffect(() => {
    async function AskPermission() {
      await ManageExternalStorage.checkAndGrantPermission(
        err => {
          setResult(false);
        },
        res => {
          setResult(true);
        },
      );
    }

    // AskPermission()  // This function is only executed once if the user allows the permission and this package retains that permission 
  }, []);

  // useEffect(() => {
  //   console.log('AI Suggestions State:', isOn ? 'On' : 'Off');
  // }, [isOn]);

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
      {/* Slider for AI Suggestions */}
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderText}>AI Assist: {isOn ? 'On' : 'Off'}</Text>
        <Switch
          value={isOn}
          onValueChange={() => dispatch(toggleSlider())}
        />
      </View>
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
  sliderContainer: {
    position: 'absolute',
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  sliderText: {
    marginRight: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default HomeScreen;
