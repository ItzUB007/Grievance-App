import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStackNavigator from './HomeStackNavigation'; // Import the HomeStackNavigator
import AboutScreen from '../Screen/AboutScreen/AboutScreen';
import ProfileScreen from '../Screen/ProfileScreen/ProfileScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Text, StyleSheet, View } from 'react-native';
import NotificationScreen from '../Screen/NotificationScreen/Notification';


const Tab = createBottomTabNavigator();

const TabNavigations = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Search') {
            iconName = 'search';
          } else if (route.name === 'Notifications') {
            iconName = 'notifications';
          } else if (route.name === 'Profile') {
            iconName = 'account-circle';
          }
          return (
            <View style={styles.iconContainer}>
              <Icon name={iconName} size={size} color={color} />
              {/* {focused && route.name === 'Home' && (
                 <Icon name={iconName} size={size} color={color} />
                // <Text style={styles.label}>{route.name}</Text>
              )} */}
            </View>
          );
        },
        
        tabBarActiveTintColor: '#d32f2f',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarShowLabel: false, // Disable default label
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Search" component={AboutScreen} />
      <Tab.Screen name="Notifications" component={NotificationScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      
    </Tab.Navigator>
  );
};

export default TabNavigations;


const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    height: 70,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // label: {
  //   fontSize: 14,
  //   fontWeight: 'bold',
  //   color: '#d32f2f',
  //   marginTop: 2,
  // },
});
