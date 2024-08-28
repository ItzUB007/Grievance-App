import React, { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'; // Import Firestore
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigations from './src/Navigations/TabNavigations';
import StackNavigator from './src/Navigations/StackNavigator.jsx';
import store from './redux/app/store';
import { AuthProvider } from "./src/contexts/AuthContext.js";
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import PushNotification from 'react-native-push-notification';
import Geolocation from 'react-native-geolocation-service';
import { UserLocationContext } from './src/contexts/UserlocationContext.js';

// Create notification channel
const createChannel = () => {
  PushNotification.createChannel(
    {
      channelId: "default-channel-id",
      channelName: "Default Channel",
      channelDescription: "A default channel",
      soundName: "default",
      importance: 4,
      vibrate: true,
    },
    (created) => console.log(`CreateChannel returned '${created}'`)
  );
};

// Set background message handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

const App = () => {
  const [user, setUser] = useState();
  const [fcmToken, setFcmToken] = useState(null);
  const [location, setLocation] = useState(null);

  const onAuthStateSave = (user) => setUser(user);

  const getDeviceToken = async () => {
    try {
      const token = await messaging().getToken();
      setFcmToken(token);
      console.log('FCM Token:', token);
      return token; // Return the token so it can be used by another function
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const saveFcmTokenToFirestore = async (uid, token) => {
    try {
      await firestore()
        .collection('users')
        .doc(uid)
        .update({
          fcmToken: token
        });
      console.log('FCM token saved successfully!');
    } catch (error) {
      console.error('Error saving FCM token to Firestore:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to show your current location on the map.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted');
        getLocation();
      } else {
        console.log('Location permission denied');
        Alert.alert('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        console.log('User location:', latitude, longitude);
      },
      error => {
        console.error('Location error:', error);
        Alert.alert('Error', 'Unable to retrieve your location.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      requestLocationPermission(); // Ask for location permission on app start
    }
    const subscriber = auth().onAuthStateChanged(onAuthStateSave);
    createChannel();
    return subscriber;
  }, []);

  // New useEffect to handle user change or login
  useEffect(() => {
    const handleUserChange = async () => {
      if (user) {
        const token = await getDeviceToken(); // Get FCM token
        if (token) {
          saveFcmTokenToFirestore(user.uid, token); // Save FCM token if there's a user
        }
      }
    };

    handleUserChange();
  }, [user]); // Trigger when the user state changes

  useEffect(() => {
    getDeviceToken();

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));

      const notificationTitle = remoteMessage.notification?.title || remoteMessage.data?.title;
      const notificationBody = remoteMessage.notification?.body || remoteMessage.data?.body;

      if (notificationTitle && notificationBody) {
        PushNotification.localNotification({
          channelId: "default-channel-id", // Ensure this matches the channel ID created
          title: notificationTitle,
          message: notificationBody,
        });
      }
    });

    return unsubscribe;
  }, []);

  return (
    <Provider store={store}>
      <AuthProvider>
        <UserLocationContext.Provider value={{location, setLocation}}>
          <NavigationContainer>
            {user ? <TabNavigations /> : <StackNavigator />}
          </NavigationContainer>
        </UserLocationContext.Provider>
      </AuthProvider>
    </Provider>
  );
};

export default App;
