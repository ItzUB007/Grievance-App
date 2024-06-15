import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Button } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const ViewStatusScreen = ({ navigation }) => {
  const [tickets, setTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const user = auth().currentUser;
  const currentUserID = user.uid;
  const pageSize = 10;

  const fetchTickets = async () => {
    let query = firestore()
      .collection('Tickets')
      .where('user_id', '==', currentUserID)
      .orderBy('updated_on', 'desc');

    const querySnapshot = await query.get();
    if (!querySnapshot.empty) {
      const allTickets = querySnapshot.docs.map(documentSnapshot => ({
        id: documentSnapshot.id,
        ...documentSnapshot.data(),
      }));
      setTickets(allTickets);
    }
  };

  useEffect(() => {
    fetchTickets();
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

  const renderTickets = tickets.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  return (
    <View style={styles.container}>
      <FlatList
        data={renderTickets}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.ticketItem}
            onPress={() => navigation.navigate('TicketDetails', { ticketId: item.id })}
          >
            <Text style={styles.categoryText}>Category: {item.category}</Text>
            <Text style={styles.baseText}>Full Name: {item.fullName}</Text>
            <Text style={[styles.baseText, getStatusStyle(item.status)]}>Status: {item.status}</Text>
            <Text style={styles.baseText}>Phone No: {item.phoneNo}</Text>
            <Text style={styles.baseText}>Updated On: {new Date(item.updated_on.toDate()).toLocaleString()}</Text>
          </TouchableOpacity>
        )}
      />
      <View style={styles.paginationButtons}>
        <Button
          title="Previous"
          onPress={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
        />
        <Button
          title="Next"
          onPress={() => setCurrentPage(prev => (prev + 1) * pageSize < tickets.length ? prev + 1 : prev)}
          disabled={(currentPage + 1) * pageSize >= tickets.length}
        />
      </View>
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
    color: 'blue' // Default color background
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
  },
  paginationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10,
  }
});

export default ViewStatusScreen;

