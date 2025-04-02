import React, { createContext, useEffect, useState } from 'react';
import { getFirestore, collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import db from "../firebase"

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { userData } = useAuth();

//   const db = getFirestore();

  useEffect(() => {
    if (!userData) return;

    const q = query(
      collection(db, 'Notifications'),
      where('ProgramId', '==', userData?.ProgramId),
      orderBy('Status', 'asc'), // "Unread" comes before "Read"
      orderBy('NotificationTime', 'desc') // Order by the latest notifications
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(newNotifications);
      // Count only unread notifications
      setUnreadCount(newNotifications.filter(notification => notification.Status === 'Unread').length);
    });

    return () => unsubscribe();
  }, [db, userData]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, setUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};
