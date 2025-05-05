import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons'; // Importing the Icon component
import colors from '../../styles/colors';

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
    const filtered = families.filter(family => {
      // Check if the search query matches the FamilyName
      const nameMatch = family.FamilyName.toLowerCase().includes(searchQuery.toLowerCase());
      // Check if the search query matches any Aadhar last four digits
      const aadharMatch = family.MemberAadharList.some(aadhar =>
        aadhar.includes(searchQuery)
      );

      // Return true if either FamilyName or any Aadhar last four digits match
      return nameMatch || aadharMatch;
    });

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
  const totalPages = Math.ceil(filteredFamilies.length / pageSize);

  return (
    <ScrollView style={styles.container}>
      {/* <Text style={styles.title}>All Families</Text> */}
      {/* <View style={styles.searchContainer}>
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
      </View> */}

           <View style={styles.searchCard}>
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search Families"
                    placeholderTextColor="#979797"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchButtonText}>Search </Text>
                  </TouchableOpacity>
                </View>
              </View>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.headerCell]}>Family Name</Text>
          <Text style={[styles.tableCell, styles.headerCell]}>Members Aadhaar</Text>
          <Text style={[styles.tableCell, styles.headerCell]}>Members Name</Text>
        </View>
        {currentFamilies.map((family, index) => (
          <TouchableOpacity key={index} style={styles.tableRow} onPress={() => handleViewMembers(family)}>
            <Text style={styles.tableCell}>{family.FamilyName}</Text>
            <Text style={styles.tableCell}>
  {family.MemberAadharList.join('\n')}
</Text>

            <Text style={styles.tableCell}>{family.MemberNames.join('\n')}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* <View style={styles.paginationContainer}>
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
      </View> */}
        {/* Pagination */}
                <View style={styles.paginationContainer}>
                  <Text style={styles.pageInfo}>Page {currentPage + 1} of {totalPages}</Text>
                  <View style={styles.paginationButtons}>
                    <TouchableOpacity
                      style={[styles.paginationArrow, currentPage === 0 && styles.disabledButton]}
                      onPress={handlePrevPage}
                      disabled={currentPage === 0}
                    >
                      <Icon name="chevron-back" size={20} color="#343434" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.paginationArrowNext, (currentPage + 1) * pageSize >= filteredFamilies.length && styles.disabledButton]}
                      onPress={handleNextPage}
                      disabled={(currentPage + 1) * pageSize >= filteredFamilies.length}
                    >
                      <Icon name="chevron-forward" size={20} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
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
  searchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: '#dadada',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    color: '#343434',
  },
  searchButton: {
    backgroundColor: '#ea3838',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 16,
  },
  clearButton: {
    position: 'absolute',
    right: 85,
    top: 12,
    zIndex: 5,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  table: {
    width: '100%',
    borderRadius: 10,
   
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.themered,
    paddingVertical: 10,
    alignItems:"center",
    borderRadius:10

    
   
 
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
    color: '#3D3636',
  },
  headerCell: {
    fontWeight: 'bold',
    // backgroundColor: '#f7f7f7',
    color:"#FFFFFF"
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  pageInfo: {
    fontSize: 14,
    color: '#343434',
  },
  paginationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paginationArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dadada',
    marginRight: 8,
  },
  paginationArrowNext: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#343434',
  },
  disabledButton: {
    opacity: 0.5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
