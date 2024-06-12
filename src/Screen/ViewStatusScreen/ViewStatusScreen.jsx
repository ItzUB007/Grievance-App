import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const ViewStatusScreen = ({ navigation }) => {
  const [tickets, setTickets] = useState([]);
  const user = auth().currentUser;
  const currentUserID = user.uid; // This should be dynamically set based on logged-in user.

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('Tickets')
      .where('user_id', '==', currentUserID)
      .onSnapshot(querySnapshot => {
        const ticketsArray = querySnapshot.docs.map(documentSnapshot => {
          return {
            id: documentSnapshot.id,
            ...documentSnapshot.data(),
          };
        });
        setTickets(ticketsArray);
      });

    return () => unsubscribe();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Open':
      case 'Pending':
        return styles.openStatus;
      case 'Completed':
        return styles.completedStatus;
      default:
        return styles.defaultStatus;
    }
  };    


  return (
    <View style={styles.container}>
      
      <FlatList
        data={tickets}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.ticketItem}
            onPress={() => navigation.navigate('TicketDetails', { ticketId: item.id })}
          >
            <Text style={styles.categoryText}>Category: {item.category}</Text>
            <Text style={styles.baseText}>Full Name: {item.fullName}</Text>
            <Text style={[styles.baseText,getStatusStyle(item.status)]}>Status: {item.status}</Text>
            <Text style={styles.baseText}>Phone No: {item.phoneNo}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0'
  },
  ticketItem: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 10,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 1, height: 1 },
  },
  openStatus: {
  color: '#FFD700' // A yellow color for open or pending status
  },
  completedStatus: {
    color: '#32CD32' // Green color for completed status
  },
  defaultStatus: {
    color: 'white' // Default white background
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333'
  },
  baseText: {
    fontSize: 14,
    color: '#555'
  }
});

export default ViewStatusScreen;
