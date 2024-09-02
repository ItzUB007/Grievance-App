import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons'; // Importing the Icon component

export default function ViewMembers({ navigation, route }) {
  const { members } = route.params;
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10); // Number of members per page
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMembers, setFilteredMembers] = useState(members || []); // Initialize with members from route.params

  useEffect(() => {
    setFilteredMembers(members); // Set filtered members initially
  }, [members]);

  const handleSearch = () => {
    const filtered = members.filter(member =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.AadharlastFourDigits.includes(searchQuery)
    );
    setFilteredMembers(filtered);
    setCurrentPage(0);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredMembers(members);
    setCurrentPage(0);
  };

  const handleNextPage = () => {
    if ((currentPage + 1) * pageSize < filteredMembers.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const startIndex = currentPage * pageSize;
  const currentMembers = filteredMembers.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>All Members</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Members"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Icon name="close-circle" size={24} color="#333" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.headerCell]}>Name</Text>
          <Text style={[styles.tableCell, styles.headerCell]}>Aadhaar No</Text>
          <Text style={[styles.tableCell, styles.headerCell]}>Phone No</Text>
        </View>
        {currentMembers.map((member, index) => (
          <View key={index} style={styles.tableRow}>
            <TouchableOpacity
              style={styles.tableCell}
              onPress={() => navigation.navigate('MemberDetails', { member: member })}
            >
              <Text style={styles.linkText}>{member.name}</Text>
            </TouchableOpacity>
            <Text style={styles.tableCell}>{member.AadharlastFourDigits}</Text>
            <Text style={styles.tableCell}>{member.phoneNumber}</Text>
          </View>
        ))}
      </View>
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={styles.paginationButton}
          onPress={handlePrevPage}
          disabled={currentPage === 0}
        >
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.paginationButton}
          onPress={handleNextPage}
          disabled={(currentPage + 1) * pageSize >= filteredMembers.length}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  table: {
    width: '100%',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
    color: 'black',
  },
  headerCell: {
    fontWeight: 'bold',
    backgroundColor: '#f7f7f7',
  },
  linkText: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 50,
  },
  paginationButton: {
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    paddingRight: 40,
  },
  searchButton: {
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 5,
  },
  clearButton: {
    position: 'absolute', // Change to absolute position
    right: 85, // Adjust as needed to place inside the input
    top: 12,
    zIndex: 5, // Adjust as needed to vertically center within input
  },
  buttonContainer: {
    marginBottom: 25,
  },
});
