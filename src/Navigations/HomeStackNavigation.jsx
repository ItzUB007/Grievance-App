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
import DocumentDetails from '../Screen/DocumentScreen/DocumentDetails';
import CreateFamily from '../Screen/FamilyScreen/CreateFamily';
import ViewFamily from '../Screen/FamilyScreen/ViewFamily';
import ViewFamilyMembers from '../Screen/FamilyScreen/ViewFamilyMembers';
import ViewMembers from '../Screen/ViewMembers/ViewMembers';
import AddMembersToFamily from '../Screen/FamilyScreen/AddMembersToFamily';
import { width } from '../styles/responsiveSize';
import { responsiveFontSize } from 'react-native-responsive-dimensions';

const Stack = createStackNavigator();

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator
    >
    <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ headerShown: false }} // Hide the header for HomeMain
      />
      <Stack.Screen name="Post" component={PostScreen} options={{headerTitle:'Raise Ticket',    headerTintColor: '#EA3838',         // ← back button & back title color
          headerTitleStyle: { color: '#EA3838',fontSize: responsiveFontSize(2.1),  }, }}/>
      <Stack.Screen name="ViewStatus" component={ViewStatusScreen} options={{headerTitle:'View Status',    headerTintColor: '#EA3838',           // ← back button & back title color
          headerTitleStyle: { color: '#EA3838',fontSize: responsiveFontSize(2.1),  }, }}/>
      <Stack.Screen name="TicketDetails" component={TicketDetails} options={{headerTitle:'Ticket Details',    headerTintColor: '#EA3838',           // ← back button & back title color
          headerTitleStyle: { color: '#EA3838',fontSize: responsiveFontSize(2.1),  }, }}/>
      <Stack.Screen name="Grievance" component={GrievanceScreen} options={{headerTitle:'Grievance',    headerTintColor: '#EA3838',           // ← back button & back title color
          headerTitleStyle: { color: '#EA3838',fontSize: responsiveFontSize(2.1),  }, }}/>
      <Stack.Screen name="Adhikar" component={AdhikarScreen} options={{headerTitle:'Adhikar',    headerTintColor: '#EA3838',  headerTransparent:'true',         // ← back button & back title color
          headerTitleStyle: { color: '#EA3838',fontSize: responsiveFontSize(2.1)  }, }}/>
      <Stack.Screen name="AddaMember" component={AddaMember} options={{headerTitle:'Add Members',    headerTintColor: '#EA3838',           // ← back button & back title color
          headerTitleStyle: { color: '#EA3838',fontSize: responsiveFontSize(2.1),  }, }}/>
      <Stack.Screen name="UpdateaMember" component={UpdateaMember} options={{headerTitle:'Update Members',    headerTintColor: '#EA3838',           // ← back button & back title color
          headerTitleStyle: { color: '#EA3838',fontSize: responsiveFontSize(2.1),  }, }}/>
      <Stack.Screen name="MemberDetails" component={MemberDetails} options={{headerTitle:'Members Details',    headerTintColor: '#EA3838',           // ← back button & back title color
          headerTitleStyle: { color: '#EA3838',fontSize: responsiveFontSize(2.1),  }, }}/>
      <Stack.Screen name="ViewMembers" component={ViewMembers} options={{headerTitle:'View Members',    headerTintColor: '#EA3838',           // ← back button & back title color
          headerTitleStyle: { color: '#EA3838',fontSize: responsiveFontSize(2.1),  }, }}/>
      <Stack.Screen name="EligibleDocumentSchemes" component={EligibleSchemes} options={{headerTitle:'Eligible Schemes',    headerTintColor: '#EA3838',           // ← back button & back title color
          headerTitleStyle: { color: '#EA3838',fontSize: responsiveFontSize(2.1),  }, }}/>
      <Stack.Screen name="Scheme Details" component={EligibleSchemeDetails} options={{headerTitle:'Scheme Details',    headerTintColor: '#EA3838',           // ← back button & back title color
          headerTitleStyle: { color: '#EA3838',fontSize: responsiveFontSize(2.1),  }, }}/>
      <Stack.Screen name="Document Details" component={DocumentDetails} options={{headerTitle:'Document Details',    headerTintColor: '#EA3838',           // ← back button & back title color
          headerTitleStyle: { color: '#EA3838',fontSize: responsiveFontSize(2.1),  }, }}/>
      <Stack.Screen name="CreateFamily" component={CreateFamily} options={{headerTitle:'Create Family',    headerTintColor: '#EA3838',           // ← back button & back title color
          headerTitleStyle: { color: '#EA3838',fontSize: responsiveFontSize(2.1),  }, }}/>
      <Stack.Screen name="ViewFamily" component={ViewFamily} options={{headerTitle:'View Family',    headerTintColor: '#EA3838',           // ← back button & back title color
          headerTitleStyle: { color: '#EA3838',fontSize: responsiveFontSize(2.1),  }, }}/>
      <Stack.Screen name="ViewFamilyMembers" component={ViewFamilyMembers} options={{headerTitle:'View Family Members',    headerTintColor: '#EA3838',           // ← back button & back title color
          headerTitleStyle: { color: '#EA3838',fontSize: responsiveFontSize(2.1),  }, }}/>
      <Stack.Screen name="AddMembersToFamily" component={AddMembersToFamily} options={{headerTitle:'Add Members In Family',    headerTintColor: '#EA3838',           // ← back button & back title color
          headerTitleStyle: { color: '#EA3838',fontSize: responsiveFontSize(2.1),  }, }} />
    </Stack.Navigator>

  );
};

export default HomeStackNavigator;
