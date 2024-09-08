import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';

export default function AddMembersToFamily({ navigation, route }) {
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { family } = route.params; // Receive current family data

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const membersRef = firestore().collection('Members');
      const memberSnapshot = await membersRef.where('ProgramId', '==', family.ProgramId).get();

      const membersList = memberSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Set initial selectedMembers based on current family members
      const initiallySelected = membersList
        .filter(member => family.MemberIds.includes(member.id))
        .map(member => member.id);

      setMembers(membersList);
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
      // Update family document with new members
      const familyRef = firestore().collection('Family').doc(family.id);

      const updatedMemberNames = [];
      const updatedMemberAadharList = [];
      const updatedMemberPhoneNumbers = [];

      // Identify newly added members and removed members
      const newMembers = selectedMembers.filter(id => !family.MemberIds.includes(id));
      const removedMembers = family.MemberIds.filter(id => !selectedMembers.includes(id));

      // Include only selected members in the update
      selectedMembers.forEach(memberId => {
        const member = members.find(m => m.id === memberId);
        if (member) {
          updatedMemberNames.push(member.name);
          updatedMemberAadharList.push(member.AadharlastFourDigits);
          updatedMemberPhoneNumbers.push(member.phoneNumber);
        }
      });

      // Update family data in Firestore
      await familyRef.update({
        MemberNames: updatedMemberNames,
        MemberAadharList: updatedMemberAadharList,
        MemberPhoneNumbers: updatedMemberPhoneNumbers,
        MemberIds: selectedMembers // Update MemberIds with only selected members
      });

      // Update the FamilyId for newly added members
      const addFamilyIdToMember = async (memberId) => {
        const memberRef = firestore().collection('Members').doc(memberId);
        await memberRef.update({ FamilyId: family.id });
      };

      // Remove the FamilyId for removed members
      const removeFamilyIdFromMember = async (memberId) => {
        const memberRef = firestore().collection('Members').doc(memberId);
        await memberRef.update({ FamilyId: "" }); // Clear the FamilyId
      };

      // Perform Firestore updates for adding/removing FamilyId
      await Promise.all(newMembers.map(addFamilyIdToMember));
      await Promise.all(removedMembers.map(removeFamilyIdFromMember));

      alert('Family members updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating family members: ', error);
    }
  };

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
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.headerCell]}>Name</Text>
          <Text style={[styles.tableCell, styles.headerCell]}>Aadhaar No</Text>
          <Text style={[styles.tableCell, styles.headerCell]}>Action</Text>
        </View>
        {members.map((member, index) => (
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
              <Text style={styles.buttonText}>{selectedMembers.includes(member.id) ? 'Remove' : 'Add'}</Text>
            </TouchableOpacity>
          </View>
        ))}
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
});
