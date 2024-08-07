import React, { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigations from './src/Navigations/TabNavigations';
import StackNavigator from './src/Navigations/StackNavigator.jsx';
import store from './redux/app/store';
import { AuthProvider } from "./src/contexts/AuthContext.js";
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import PushNotification from 'react-native-push-notification';

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

  const onAuthStateSave = (user) => setUser(user);

  const getDeviceToken = async () => {
    try {
      const token = await messaging().getToken();
      setFcmToken(token);
      console.log('FCM Token:', token);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    }
    const subscriber = auth().onAuthStateChanged(onAuthStateSave);
    createChannel();
    return subscriber;
  }, []);

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
        <NavigationContainer>
          {user && user.emailVerified ? <TabNavigations /> : <StackNavigator />}
        </NavigationContainer>
      </AuthProvider>
    </Provider>
  );
};

export default App;
