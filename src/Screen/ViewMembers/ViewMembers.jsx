import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ViewMembers({ navigation, route }) {
  const { members } = route.params;
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10); // Number of members per page
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMembers, setFilteredMembers] = useState(members || []);

  useEffect(() => {
    setFilteredMembers(members);
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
  const totalPages = Math.ceil(filteredMembers.length / pageSize);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ea3838" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color="#ea3838" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>View Members</Text>
      </View> */}
      
      <ScrollView style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchCard}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Members"
              placeholderTextColor="#979797"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Table */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.headerCell]}>Name</Text>
            <Text style={[styles.tableCell, styles.headerCell ]}>Aadhar No</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Phone No</Text>
          </View>
          
          {currentMembers.map((member, index) => (
            <View key={index} style={styles.tableRow}>
              <TouchableOpacity
                style={styles.tableCell}
                onPress={() => navigation.navigate('MemberDetails', { member: member })}
              >
                <Text style={styles.cellText}>{member.name}</Text>
              </TouchableOpacity>
              <Text style={[styles.tableCell,{textAlign:"center"}]}>{member.AadharlastFourDigits}</Text>
              <Text style={styles.tableCell}>{member.phoneNumber}</Text>
            </View>
          ))}
          
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
                style={[styles.paginationArrowNext, (currentPage + 1) * pageSize >= filteredMembers.length && styles.disabledButton]}
                onPress={handleNextPage}
                disabled={(currentPage + 1) * pageSize >= filteredMembers.length}
              >
                <Icon name="chevron-forward" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#ea3838',
    marginLeft: 8,
  },
  searchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    margin: 16,
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
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    margin: 16,
    marginTop: 0,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dadada',
    paddingBottom: 12,
    textAlign:'center',
    marginLeft:5
  },
  headerCell: {
    fontWeight: '500',
    color: '#343434',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dadada',
  },
  tableCell: {
    flex: 1,
    paddingVertical: 12,
    color: '#343434',
  },
  cellText: {
    color: '#343434',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
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