import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Button, TextInput, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const ViewStatusScreen = ({ navigation }) => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [firstDoc, setFirstDoc] = useState(null);
  const [firstDocArr, setFirstDocArr] = useState([]);
  const user = auth().currentUser;
  const currentUserID = user.uid;
  const pageSize = 10;

  const fetchTickets = async (direction = 'next', startPoint = null) => {
    if (!currentUserID) return;

    setLoading(true);
    let query = firestore()
      .collection('Tickets')
      .where('user_id', '==', currentUserID)
      .orderBy('updated_on', 'desc')
      .limit(pageSize);

    if (direction === 'next' && startPoint) {
      query = query.startAfter(startPoint);
    } else if (direction === 'prev' && startPoint) {
      query = query.startAt(startPoint);
    }

    const querySnapshot = await query.get();
    if (!querySnapshot.empty) {
      const ticketsData = querySnapshot.docs.map(documentSnapshot => ({
        id: documentSnapshot.id,
        ...documentSnapshot.data(),
      }));

      setTickets(ticketsData);
      setFilteredTickets(ticketsData);

      if (direction === 'next') {
        setFirstDocArr([...firstDocArr, firstDoc]);
        setCurrentPage((prev) => prev + 1);
      } else if (direction === 'prev') {
        setCurrentPage((prev) => prev - 1);
      }

      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setFirstDoc(querySnapshot.docs[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, [currentUserID]);

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
        return styles.openStatus;
      case 'Pending':
        return styles.pendingStatus;
      case 'Resolved':
        return styles.resolvedStatus;
      case 'Rejected':
        return styles.rejectedStatus;
      default:
        return styles.defaultStatus;
    }
  };

  const handleNextPage = () => {
    if (lastDoc) {
      fetchTickets('next', lastDoc);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0 && firstDocArr[currentPage - 1]) {
      fetchTickets('prev', firstDocArr.pop());
    }
  };

  const renderTicketItem = ({ item }) => (
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
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

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
        data={filteredTickets}
        keyExtractor={item => item.id}
        renderItem={renderTicketItem}
      />
      <View style={styles.paginationButtons}>
        <Button
          title="Previous"
          onPress={handlePrevPage}
          disabled={currentPage === 0}
        />
        <Button
          title="Next"
          onPress={handleNextPage}
          disabled={filteredTickets.length < pageSize}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    padding: 10,
  },
  searchBar: {
    padding: 10,
    margin: 10,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#FFF',
    color: '#6200ee',
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
    color: '#FFD700', // Yellow color for open status
  },
  pendingStatus: {
    color: '#FFA500', // Orange color for pending status
  },
  resolvedStatus: {
    color: '#32CD32', // Green color for resolved status
  },
  rejectedStatus: {
    color: '#FF4500', // Red color for rejected status
  },
  defaultStatus: {
    color: 'blue', // Default color
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  baseText: {
    fontSize: 14,
    color: '#555',
  },
  paginationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ViewStatusScreen;
