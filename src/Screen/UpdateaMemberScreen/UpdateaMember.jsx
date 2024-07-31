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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>All Members</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.headerCell]}>Name</Text>
          <Text style={[styles.tableCell, styles.headerCell]}>Phone No</Text>
        </View>
        {members.map((member, index) => (
          <View key={index} style={styles.tableRow}>
            <TouchableOpacity
              style={styles.tableCell}
              onPress={() => navigation.navigate('MemberDetails', { member: member })}
            >
              <Text style={styles.linkText}>{member.name}</Text>
            </TouchableOpacity>
            <Text style={styles.tableCell}>{member.phoneNumber}</Text>
          </View>
        ))}
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
  table: {
    width: '100%',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
    color: 'black',
  },
  headerCell: {
    fontWeight: 'bold',
    backgroundColor: '#f7f7f7',
  },
  linkText: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
