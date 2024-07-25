import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { ScrollView } from 'react-native-gesture-handler';

export default function UpdateaMember({ navigation }) {
  const { userData } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
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
 
  return members && (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>All Members</Text>
      {members.map((member, index) => (
        <View key={index} style={styles.memberContainer}>
          <Text style={styles.baseText}>Name: {member.name}</Text>
          <Text style={styles.baseText}>Phone No: {member.phoneNumber}</Text>
          <Text style={styles.baseText}>Eligible Schemes: </Text>
          {member.eligibleSchemes && member.eligibleSchemes.map((scheme, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.schemeItem}
              onPress={() => navigation.navigate('EligibleSchemeDetails', { schemeId: scheme.id })}
            >
              <Text style={styles.schemeText}>Scheme Name : {scheme.name}</Text>
              
            </TouchableOpacity>
          ))}
          {member.TicketId &&
             <Text style={styles.baseText}>Available Tickets : {member.TicketId.length} </Text>
          
          }
       
             
        </View>
      ))}
       

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 20,
    // marginBottom:20
  },
  memberContainer: {
    marginBottom: 20,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    elevation: 1,
  },
  schemeItem: {
    
    marginVertical: 5,
    borderRadius: 5,
   
  },
  baseText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#ccc',
    marginTop: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },  schemeText: {
    fontSize: 14,
    color: 'blue',
    textAlign: 'center',
  },
});
