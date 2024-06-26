// HomeStackNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../Screen/HomeScreen/HomeScreen';
import PostScreen from '../Screen/PostScreen/PostScreen';
import ViewStatusScreen from '../Screen/ViewStatusScreen/ViewStatusScreen';
import TicketDetails from '../Screen/ViewStatusScreen/TicketsDetails';

const Stack = createStackNavigator();

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator>
    <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ headerShown: false }} // Hide the header for HomeMain
      />
      <Stack.Screen name="Post" component={PostScreen} />
      <Stack.Screen name="ViewStatus" component={ViewStatusScreen} />
      <Stack.Screen name="TicketDetails" component={TicketDetails} />
    </Stack.Navigator>

  );
};

export default HomeStackNavigator;
