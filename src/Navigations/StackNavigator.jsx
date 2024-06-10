import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../Screen/LoginScreen/LoginScreen';
import PhoneSignIn from '../Screen/LoginScreen/PhoneSignIn';
import RegisterScreen from '../Screen/LoginScreen/RegisterScreen';
import HomeScreen from '../Screen/HomeScreen/HomeScreen';


const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen}
       options={{ headerShown: false }}/>
      <Stack.Screen name="PhoneSignIn" component={PhoneSignIn} />
      <Stack.Screen name="Register" component={RegisterScreen} />
     <Stack.Screen name="Home" component={HomeScreen} />
      
    </Stack.Navigator>
  );
};

export default StackNavigator;
