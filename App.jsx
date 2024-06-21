import React, { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigations from './src/Navigations/TabNavigations';
import StackNavigator from './src/Navigations/StackNavigator.jsx';
import  store  from './redux/app/store';

const App = () => {
  const [user, setUser] = useState();
  
  const onAuthStateSave = (user) => setUser(user);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateSave);
    return subscriber;
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        {user && user.emailVerified ? <TabNavigations /> : <StackNavigator />}
      </NavigationContainer>
    </Provider>
  );
};

export default App;
