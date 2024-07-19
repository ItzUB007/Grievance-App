import React, { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigations from './src/Navigations/TabNavigations';
import StackNavigator from './src/Navigations/StackNavigator.jsx';
import  store  from './redux/app/store';
import { AuthProvider } from "./src/contexts/AuthContext.js";

const App = () => {
  const [user, setUser] = useState();
  
  const onAuthStateSave = (user) => setUser(user);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateSave);
    return subscriber;
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
