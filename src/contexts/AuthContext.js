import React, { createContext, useContext, useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { fetchUserAndDbService } from '../utils/authDbService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [userData, setUserData] = useState(null);
  const [programData, setProgramData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        const { user: userData, permissions, programs: programData } = await fetchUserAndDbService();
        // console.log("Fetched user data:", userData);
        // console.log("Fetched permissions:", permissions);
        // console.log("Fetched program data:", programData);
        
        setUserData(userData);
        setPermissions(permissions);
        setProgramData(programData);
      } else {
        setCurrentUser(null);
        setUserData(null);
        setPermissions([]);
        setProgramData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    permissions,
    userData,
    programData,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
