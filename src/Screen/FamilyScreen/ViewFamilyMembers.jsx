import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';

export default function ViewFamilyMembers({ route, navigation }) {
  const { family } = route.params; // family object with id
  const [familyData, setFamilyData] = useState(null); // State to store fetched family data
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchFamilyData = async () => {
      try {
        const familyRef = firestore().collection('Family').doc(family.id); // Reference to family document
        const familySnapshot = await familyRef.get();

        if (familySnapshot.exists) {
          setFamilyData(familySnapshot.data()); // Set the fetched family data
        } else {
          console.log('No such family!');
        }
      } catch (error) {
        console.error('Error fetching family: ', error);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    fetchFamilyData();
  }, []);

  const handleAddMember = () => {
    // Navigate to the AddMembersToFamily screen, passing the current family data
    if (familyData) {
      navigation.navigate('AddMembersToFamily', { family: { ...familyData, id: family.id } });
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!familyData) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No Family Data Found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Family Members: {familyData.FamilyName}</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.headerCell]}>Name</Text>
          <Text style={[styles.tableCell, styles.headerCell]}>Aadhaar No</Text>
          <Text style={[styles.tableCell, styles.headerCell]}>Phone No</Text>
        </View>
        {familyData.MemberNames.map((name, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{name}</Text>
            <Text style={styles.tableCell}>{familyData.MemberAadharList[index]}</Text>
            <Text style={styles.tableCell}>{familyData.MemberPhoneNumbers[index]}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.addButton} onPress={handleAddMember}>
        <Text style={styles.buttonText}>Add New Member</Text>
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
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});