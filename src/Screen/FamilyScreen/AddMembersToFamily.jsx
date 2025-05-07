// AddMembersToFamily.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  TextInput,
  SafeAreaView,
  StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
// Import the familyService functions
import { fetchMembers, updateFamilyMembers } from '../../utils/dbServices/familyService';
import colors from '../../styles/colors';
import { width } from '../../styles/responsiveSize';

export default function AddMembersToFamily({ navigation, route }) {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10); // Number of members per page
  const [searchQuery, setSearchQuery] = useState('');
  const { family } = route.params; // Receive current family data

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    setFilteredMembers(members); // Initialize filtered members with all members
  }, [members]);

  const loadMembers = async () => {
    try {
      const membersList = await fetchMembers(family.ProgramId);
      // Determine already selected members based on family.MemberIds
      const initiallySelected = membersList
        .filter(member => family.MemberIds.includes(member.id))
        .map(member => member.id);
      setMembers(membersList);
      setFilteredMembers(membersList);
      setSelectedMembers(initiallySelected);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching members: ', error);
      setLoading(false);
    }
  };

  const toggleMemberSelection = (member) => {
    if (selectedMembers.includes(member.id)) {
      setSelectedMembers(selectedMembers.filter(id => id !== member.id));
    } else {
      setSelectedMembers([...selectedMembers, member.id]);
    }
  };

  const addSelectedMembersToFamily = async () => {
    try {
      await updateFamilyMembers(family, selectedMembers, members);
      alert('Family members updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating family members: ', error);
      alert('Error updating family members. Please try again.');
    }
  };

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
      {/* Header */}
      <View style={styles.header}>
        {/* <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color="#ea3838" />
        </TouchableOpacity> */}
        <Text style={styles.headerTitle}>{family.FamilyName}</Text>
      </View>
      
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
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Update Family Members Button */}
        <TouchableOpacity style={styles.updateButton} onPress={addSelectedMembersToFamily}>
          <Text style={styles.updateButtonText}>Update Family Members</Text>
        </TouchableOpacity>
        
        {/* Members Table */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Name</Text>
            <Text style={styles.headerCell}>Aadhar No.</Text>
            <Text style={styles.headerCell}>Action</Text>
          </View>
          
          {currentMembers.map((member, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{member.name}</Text>
              <Text style={styles.tableCell}>{member.AadharlastFourDigits}</Text>
              <View style={styles.actionCell}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    selectedMembers.includes(member.id) ? styles.removeButton : styles.addButton
                  ]}
                  onPress={() => toggleMemberSelection(member)}
                >
                  <Text style={styles.actionButtonText}>
                    {selectedMembers.includes(member.id) ? 'Remove' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
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
    justifyContent:'center',
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
    borderRadius: 50,
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
  updateButton: {
    backgroundColor: '#ea3838',
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  updateButtonText: {
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
  },
  headerCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#343434',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dadada',
    paddingVertical: 12,
    alignItems: 'center',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: '#343434',
    textAlign: 'center',
  },
  actionCell: {
    flex: 1,
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
    minWidth: 80,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ea3838',
  },
  removeButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ea3838',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ea3838',
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