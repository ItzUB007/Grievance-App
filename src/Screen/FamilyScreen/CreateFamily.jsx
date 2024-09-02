import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons'; // Importing the Icon component

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

  const toggleMemberSelection = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const handleCreateFamily = async () => {
    if (!familyName || selectedMembers.length === 0) {
      Alert.alert('Please enter a family name and select at least one member.');
      return;
    }

    const selectedMembersData = members.filter(member => selectedMembers.includes(member.id));
    const memberAadharList = selectedMembersData.map(member => member.AadharlastFourDigits);
    const memberNames = selectedMembersData.map(member => member.name);
    const memberPhoneNumbers = selectedMembersData.map(member => member.phoneNumber);


    const familyData = {
      FamilyName: familyName,
      MemberIds: selectedMembers,
      MemberAadharList: memberAadharList,
      ProgramId: ProgramId,
      MemberNames: memberNames,
      MemberPhoneNumbers: memberPhoneNumbers,
    };

    try {
      await firestore().collection('Family').add(familyData);
      Alert.alert('Family created successfully!');
      
      navigation.navigate('ViewFamily')
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
      // || member.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create a Family</Text>

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
      <TextInput
        style={styles.input}
        placeholder="Enter Family Name"
        value={familyName}
        onChangeText={setFamilyName}
      />
      <TouchableOpacity
        style={[styles.createButton, (!familyName || selectedMembers.length === 0) && styles.disabledButton]}
        onPress={handleCreateFamily}
      >
        <Text style={[
          styles.buttonText,
          (!familyName || selectedMembers.length === 0) && styles.disabledButtonText
        ]}>
          Create a Family
        </Text>
      </TouchableOpacity>
      <Text style={styles.subtitle}>Select Members:</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableCell, styles.headerCell]}>Name</Text>
        <Text style={[styles.tableCell, styles.headerCell]}>Aadhar No</Text>
        <Text style={[styles.tableCell, styles.headerCell]}>Phone No</Text>
      </View>
      {currentMembers.map((member) => (

        <TouchableOpacity
          key={member.id}
          style={[styles.tableRow, selectedMembers.includes(member.id) ? styles.selectedRow : null]}
          onPress={() => toggleMemberSelection(member.id)}
        >
          <Text style={styles.tableCell}>{member.name}</Text>
          <Text style={styles.tableCell}>{member.AadharlastFourDigits}</Text>
          <Text style={styles.tableCell}>{member.phoneNumber}</Text>
        </TouchableOpacity>
      ))}


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
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
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
    position: 'absolute', // Change to absolute position
    right: 85, // Adjust as needed to place inside the input
    top: 12,
    zIndex: 5 // Adjust as needed to vertically center within input
  },
  searchButton: {
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 5,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  memberItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  text: {
    color: 'black',
  },
  selectedText: {
    color: '#3B82F6',
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
  createButton: {
    backgroundColor: '#6200ee',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }, tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
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
  selectedRow: {
    backgroundColor: '#e0f7fa',
  }, disabledButton: {
    backgroundColor: '#B0C4DE', // Light gray color for disabled state
    opacity: 0.8,
    color: '#B0C4DE'// Reduce opacity to indicate disabled state
  }, disabledButtonText: {
    color: '#000000', // Black color for disabled state text
  },
});
