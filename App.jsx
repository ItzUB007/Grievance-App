import React, { useEffect, useState } from 'react';

import auth from '@react-native-firebase/auth';
// import LoginScreen from './src/Screen/LoginScreen/LoginScreen.jsx';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigations from './src/Navigations/TabNavigations';
import StackNavigator from './src/Navigations/StackNavigator.jsx';

const App = () => {
  const [user, setUser] = useState();

  const onAuthStateSave = (user) => setUser(user);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateSave);
    return subscriber;
  }, []);

  return (
    <>
   <NavigationContainer>
   {user && user.emailVerified ? <TabNavigations /> : <StackNavigator />}
    </NavigationContainer>
    </>
  );
};

export default App;
