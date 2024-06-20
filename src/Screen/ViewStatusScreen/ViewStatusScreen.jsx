import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Button, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const ViewStatusScreen = ({ navigation }) => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
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
      setFilteredTickets(allTickets);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredTickets(tickets);
    } else {
      const filtered = tickets.filter(ticket => 
        ticket.fullName.toLowerCase().includes(query.toLowerCase()) ||
        ticket.category.toLowerCase().includes(query.toLowerCase()) ||
        ticket.phoneNo.toLowerCase().includes(query.toLowerCase()) ||
        ticket.status.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredTickets(filtered);
      setCurrentPage(0); // Reset to the first page on new search
    }
  };

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

  const renderTickets = filteredTickets.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search Tickets"
        value={searchQuery}
        onChangeText={handleSearch}
        placeholderTextColor={'black'}
      />
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
          onPress={() => setCurrentPage(prev => (prev + 1) * pageSize < filteredTickets.length ? prev + 1 : prev)}
          disabled={(currentPage + 1) * pageSize >= filteredTickets.length}
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
  searchBar: {
    padding: 10,
    margin: 10,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#FFF',
    color:'#6200ee'
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
