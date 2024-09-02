import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { ScrollView } from 'react-native-gesture-handler';


export default function UpdateaMember({ navigation }) {
  const { userData } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const membersRef = firestore().collection('Members');
      const memberSnapshot = await membersRef.where('ProgramId', '==', userData.ProgramId).get();

      const membersList = memberSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setMembers(membersList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching members: ', error);
      setLoading(false);
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
      <Text style={styles.title}>Update a Member</Text>
     
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.viewMembersButton}
          onPress={() => navigation.navigate('ViewMembers', { members })}
        >
          <Text style={styles.buttonText}>View Members</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.viewFamilyButton}
          onPress={() => navigation.navigate('ViewFamily')}
        >
          <Text style={styles.buttonText}>View Families</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.createFamilyButton}
          onPress={() => navigation.navigate('CreateFamily', { members })}
        >
          <Text style={styles.buttonText}>Create Family</Text>
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

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewMembersButton: {
    backgroundColor: '#4CAF50', // Modern green color for the button
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  createFamilyButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  viewFamilyButton: {
    backgroundColor: '#2196F3', // Blue color for the View Family button
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginBottom: 25,
  },
});
