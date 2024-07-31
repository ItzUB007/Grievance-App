// HomeStackNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../Screen/HomeScreen/HomeScreen';
import PostScreen from '../Screen/PostScreen/PostScreen';
import ViewStatusScreen from '../Screen/ViewStatusScreen/ViewStatusScreen';
import TicketDetails from '../Screen/ViewStatusScreen/TicketsDetails';
import GrievanceScreen from '../Screen/GrievanceScreen/GrievanceScreen';
import AdhikarScreen from '../Screen/AdhikarScreen/AdhikarScreen';
import AddaMember from '../Screen/AddaMemberScreen/AddaMember';
import UpdateaMember from '../Screen/UpdateaMemberScreen/UpdateaMember';
import EligibleSchemes from '../Screen/EligibleSchemes/EligibleSchemes';
import EligibleSchemeDetails from '../Screen/EligibleSchemes/EligibleSchemeDetails';
import MemberDetails from '../Screen/MemberDetailsScreen/MemberDetails';

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
      <Stack.Screen name="Grievance" component={GrievanceScreen} />
      <Stack.Screen name="Adhikar" component={AdhikarScreen} />
      <Stack.Screen name="AddaMember" component={AddaMember} />
      <Stack.Screen name="UpdateaMember" component={UpdateaMember} />
      <Stack.Screen name="MemberDetails" component={MemberDetails} />
      <Stack.Screen name="EligibleSchemes" component={EligibleSchemes} />
      <Stack.Screen name="EligibleSchemeDetails" component={EligibleSchemeDetails} />
    </Stack.Navigator>

  );
};

export default HomeStackNavigator;
