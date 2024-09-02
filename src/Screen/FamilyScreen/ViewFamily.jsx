import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons'; // Importing the Icon component

export default function ViewFamily({ navigation }) {
  const [families, setFamilies] = useState([]);
  const [filteredFamilies, setFilteredFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5); // Number of families per page

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    try {
      const familiesRef = firestore().collection('Family');
      const familySnapshot = await familiesRef.get();

      const familiesList = familySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setFamilies(familiesList);
      setFilteredFamilies(familiesList); // Initialize filtered list
      setLoading(false);
    } catch (error) {
      console.error('Error fetching family: ', error);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filtered = families.filter(family =>
      family.FamilyName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredFamilies(filtered);
    setCurrentPage(0); // Reset to first page after search
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredFamilies(families);
    setCurrentPage(0);
  };

  const handleNextPage = () => {
    if ((currentPage + 1) * pageSize < filteredFamilies.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleViewMembers = (family) => {
    navigation.navigate('ViewFamilyMembers', { family });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const startIndex = currentPage * pageSize;
  const currentFamilies = filteredFamilies.slice(startIndex, startIndex + pageSize);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>All Families</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Families"
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
          <Text style={[styles.tableCell, styles.headerCell]}>Family Name</Text>
          <Text style={[styles.tableCell, styles.headerCell]}>Members' Aadhaar</Text>
          <Text style={[styles.tableCell, styles.headerCell]}>Members' Name</Text>
        </View>
        {currentFamilies.map((family, index) => (
          <TouchableOpacity key={index} style={styles.tableRow} onPress={() => handleViewMembers(family)}>
            <Text style={styles.tableCell}>{family.FamilyName}</Text>
            <Text style={styles.tableCell}>{family.MemberAadharList.join(', ')}</Text>
            <Text style={styles.tableCell}>{family.MemberNames.join(', ')}</Text>
          </TouchableOpacity>
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
          disabled={(currentPage + 1) * pageSize >= filteredFamilies.length}
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
  clearButton: {
    position: 'absolute',
    right: 85,
    top: 12,
    zIndex: 5,
  },
  searchButton: {
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 10,
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 10,
    textAlign: 'center',
    color: 'black',
  },
  headerCell: {
    fontWeight: 'bold',
    backgroundColor: '#f7f7f7',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  paginationButton: {
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
