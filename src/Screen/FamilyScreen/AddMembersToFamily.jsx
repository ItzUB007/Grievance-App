import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';

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
    fetchMembers();
  }, []);

  useEffect(() => {
    setFilteredMembers(members); // Initialize filtered members with all members
  }, [members]);

  const fetchMembers = async () => {
    try {
      const membersRef = firestore().collection('Members');
      const memberSnapshot = await membersRef.where('ProgramId', '==', family.ProgramId).get();

      const membersList = memberSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

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
      const familyRef = firestore().collection('Family').doc(family.id);
      const updatedMemberNames = [];
      const updatedMemberAadharList = [];
      const updatedMemberPhoneNumbers = [];

      const newMembers = selectedMembers.filter(id => !family.MemberIds.includes(id));
      const removedMembers = family.MemberIds.filter(id => !selectedMembers.includes(id));

      selectedMembers.forEach(memberId => {
        const member = members.find(m => m.id === memberId);
        if (member) {
          updatedMemberNames.push(member.name);
          updatedMemberAadharList.push(member.AadharlastFourDigits);
          updatedMemberPhoneNumbers.push(member.phoneNumber);
        }
      });

      await familyRef.update({
        MemberNames: updatedMemberNames,
        MemberAadharList: updatedMemberAadharList,
        MemberPhoneNumbers: updatedMemberPhoneNumbers,
        MemberIds: selectedMembers
      });

      const addFamilyIdToMember = async (memberId) => {
        const memberRef = firestore().collection('Members').doc(memberId);
        await memberRef.update({ FamilyId: family.id });
      };

      const removeFamilyIdFromMember = async (memberId) => {
        const memberRef = firestore().collection('Members').doc(memberId);
        await memberRef.update({ FamilyId: "" });
      };

      await Promise.all(newMembers.map(addFamilyIdToMember));
      await Promise.all(removedMembers.map(removeFamilyIdFromMember));

      alert('Family members updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating family members: ', error);
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

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add Members to Family: {family.FamilyName}</Text>
      
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
          <Text style={[styles.tableCell, styles.headerCell]}>Action</Text>
        </View>
        {currentMembers.map((member, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{member.name}</Text>
            <Text style={styles.tableCell}>{member.AadharlastFourDigits}</Text>
            <TouchableOpacity
              style={[
                styles.selectButton,
                selectedMembers.includes(member.id) && styles.selectedButton
              ]}
              onPress={() => toggleMemberSelection(member)}
            >
              <Text style={styles.buttonText}>
                {selectedMembers.includes(member.id) ? 'Remove' : 'Add'}
              </Text>
            </TouchableOpacity>
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

      <TouchableOpacity style={styles.addButton} onPress={addSelectedMembersToFamily}>
        <Text style={styles.buttonText}>Update Family Members</Text>
      </TouchableOpacity>
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
    position: 'relative'
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
    zIndex: 5
  },
  searchButton: {
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 5,
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectButton: {
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 5,
  },
  selectedButton: {
    backgroundColor: '#FF6347',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    marginBottom: 50,
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
  },
  paginationButton: {
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 5,
    marginBottom: 50,
  },
});
