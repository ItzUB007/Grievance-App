// CreateFamily.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  SafeAreaView
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';

// Import the createFamily function from familyService
import { createFamily } from '../../utils/dbServices/familyService';

export default function CreateFamily({ navigation, route }) {
  const { members } = route.params;
  const { userData } = useAuth();
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [familyName, setFamilyName] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10); // Number of members per page
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMembers, setFilteredMembers] = useState(members);
  const ProgramId = userData?.ProgramId;

  useEffect(() => {
    setFilteredMembers(members); // Initialize filtered members with all members
  }, [members]);

  const toggleMemberSelection = (member) => {
    if (selectedMembers.some(m => m.id === member.id)) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleCreateFamily = async () => {
    if (!familyName || selectedMembers.length === 0) {
      Alert.alert('Please enter a family name and select at least one member.');
      return;
    }
    
    try {
      const selectedMemberIds = selectedMembers.map(member => member.id);
      const familyId = await createFamily(familyName, selectedMemberIds, members, ProgramId);
      console.log('FamilyId', familyId);
      Alert.alert('Family created and members updated successfully!');
      navigation.navigate('ViewFamily', { familyId });
    } catch (error) {
      console.error('Error creating family: ', error);
      Alert.alert('Failed to create family.');
      navigation.goBack();
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
  
  const removeSelectedMember = (memberId) => {
    setSelectedMembers(selectedMembers.filter(member => member.id !== memberId));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color="#ea3838" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create a Family</Text>
      </View> */}
      
      <ScrollView style={styles.container}>
        {/* Top Card Section */}
        <View style={styles.topCard}>
          {/* Search Bar */}
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
          
          {/* Family Name Input */}
          <TextInput
            style={styles.familyNameInput}
            placeholder="Family Name"
            placeholderTextColor="#979797"
            value={familyName}
            onChangeText={setFamilyName}
          />
          
          {/* Selected Members Chips */}
          <View style={styles.selectedMembersContainer}>
            {selectedMembers.map((member) => (
              <View key={member.id} style={styles.memberChip}>
                <Text style={styles.memberChipText}>{member.name}</Text>
                <TouchableOpacity onPress={() => removeSelectedMember(member.id)}>
                  <Icon name="close-circle" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          {/* Create Family Button */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateFamily}
            disabled={!familyName || selectedMembers.length === 0}
          >
            <Text style={styles.createButtonText}>Create Family</Text>
          </TouchableOpacity>
        </View>
        
        {/* Members Table */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Name</Text>
            <Text style={styles.headerCell}>Aadhar No.</Text>
            <Text style={styles.headerCell}>Phone No.</Text>
          </View>
          
          {currentMembers.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={[
                styles.tableRow,
                selectedMembers.some(m => m.id === member.id) && styles.selectedRow
              ]}
              onPress={() => toggleMemberSelection(member)}
            >
              <Text style={styles.tableCell}>{member.name}</Text>
              <Text style={styles.tableCell}>{member.AadharlastFourDigits}</Text>
              <Text style={styles.tableCell}>{member.phoneNumber}</Text>
            </TouchableOpacity>
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
  topCard: {
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
    marginBottom: 16,
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
  familyNameInput: {
    height: 46,
    borderWidth: 1,
    borderColor: '#dadada',
    borderRadius: 50,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: '#343434',
  },
  selectedMembersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#343434',
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  memberChipText: {
    color: '#ffffff',
    marginRight: 4,
    fontSize: 14,
  },
  createButton: {
    backgroundColor: '#ea3838',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
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
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: '#343434',
    textAlign: 'center',
  },
  selectedRow: {
    backgroundColor: '#f5f5f5',
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
});