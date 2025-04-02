import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Button, TextInput, ActivityIndicator, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
// import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../contexts/AuthContext';
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import colors from '../../styles/colors';

const ViewStatusScreen = ({ navigation }) => {
  const { currentUser, permissions,userData } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [firstDoc, setFirstDoc] = useState(null);
  const [firstDocArr, setFirstDocArr] = useState([]);
  // const user = auth().currentUser;
  const ProgramId = userData?.ProgramId;
  const currentUserID = currentUser.uid;
  const pageSize = 10;
  const hasPermission = (permission) => {
    // If roleId and ProgramId match, the user has all permissions
    if (userData?.roleId === userData?.ProgramId) {
      return true;
    }
    // Otherwise, check specific permissions
    return permissions.includes(permission);
  };

  const fetchTickets = async (direction = 'next', startPoint = null) => {
    if (!currentUserID) return;
    let id = currentUserID;
    let field = 'createdBy_userId';
    if (userData?.roleId === userData?.ProgramId) {
      field = 'ProgramId'
      id = ProgramId;
    }

    setLoading(true);
    let query = firestore()
      .collection('Tickets')
      .where(`${field}`, '==', id)
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
    hasPermission && fetchTickets();
  }, [currentUserID]);


 


  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      setFilteredTickets(tickets);
      setSearching(false);
    } else {
      setLoading(true);
      const querySnapshot = await firestore()
        .collection('Tickets')
        .where('createdBy_userId', '==', currentUserID)
        .orderBy('updated_on', 'desc')
        .get();

      if (!querySnapshot.empty) {
        const allTickets = querySnapshot.docs.map(documentSnapshot => ({
          id: documentSnapshot.id,
          ...documentSnapshot.data(),
        }));

        const filtered = allTickets.filter(ticket => 
          ticket.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.phoneNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.status.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setTickets(allTickets);
        setFilteredTickets(filtered);
        setCurrentPage(0); // Reset to the first page on new search
        setSearching(true);
      }
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredTickets(tickets);
    setCurrentPage(0);
    setSearching(false);
    fetchTickets();
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
    if (lastDoc && !searching) {
      fetchTickets('next', lastDoc);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0 && firstDocArr[currentPage - 1] && !searching) {
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

  if (!hasPermission('ticket_view')) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.innerContainer}>
          <Text style={styles.errorText}>
            You don't have permissions to view tickets.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grievance Redressal Status</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search Tickets"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={'black'}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Icon name="close-circle" size={24} color="#6200ee" />
          </TouchableOpacity>
        ) : null}
        <Button
          title="Search"
          onPress={handleSearch}
          
        />
      </View>
      <FlatList
        data={filteredTickets}
        keyExtractor={item => item.id}
        renderItem={renderTicketItem}
      />
      <View style={styles.paginationButtons}>
        <Button
          title="Previous"
          onPress={handlePrevPage}
          disabled={currentPage === 0 || searching}
        />
        <Button
          title="Next"
          onPress={handleNextPage}
          disabled={filteredTickets.length < pageSize || searching}
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
  title: {
    fontSize: responsiveFontSize(2), // Approx 15px
    fontWeight: 'bold',
    marginBottom: responsiveHeight(3), // Approx 24px
    color: colors.themered,
    fontFamily: 'Montserrat-Regular',
    lineHeight: responsiveFontSize(2.4), // Approx 18px
    marginTop: responsiveHeight(2.5), // Approx 20px
    padding: responsiveWidth(1.25), // Approx 5px
    marginLeft: responsiveWidth(5), // Approx 20px
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  searchBar: {
    flex: 1,
    padding: 10,
    marginRight: 10,
    borderColor: '#CCC',
    borderWidth: 0.5,
    borderRadius: 15,
    backgroundColor: '#FFF',
    color: '#6200ee',
  },
  clearButton: {
    position: 'absolute',
    right: 80,
    padding: 10,
  },
  ticketItem: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 10,
    elevation: 0.5,
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
  permissionContainer: {
    flex: 1,
    flexDirection: 'column',
    paddingBottom: 106,
  },
  innerContainer: {
    padding: 16,
  },
  errorText: {
    fontSize: 24, // h4 equivalent in React Native
    color: 'red', // equivalent to the "error" color
    textAlign: 'center',
  },
});

export default ViewStatusScreen;
