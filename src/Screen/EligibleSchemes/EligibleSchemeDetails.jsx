import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const EligibleSchemeDetails = ({ route }) => {
  const { schemeDetails, schemeId } = route.params;
  const [scheme, setScheme] = useState(schemeDetails);
  const [loading, setLoading] = useState(!schemeDetails);

  useEffect(() => {
    const fetchSchemeDetails = async () => {
      if (!schemeDetails && schemeId) {
        setLoading(true);
        try {
          const schemeDoc = await firestore().collection('Schemes').doc(schemeId).get();
          if (schemeDoc.exists) {
            setScheme(schemeDoc.data());
          } else {
            Alert.alert('Error', 'Scheme not found.');
          }
        } catch (error) {
          console.error('Error fetching scheme details: ', error);
          Alert.alert('Error', 'Failed to fetch scheme details.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSchemeDetails();
  }, [schemeDetails, schemeId]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {scheme && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailText}>Scheme Name: {scheme.Name}</Text>
          <Text style={styles.detailText}>Application Method: {scheme.ApplicationMethod}</Text>
          <Text style={styles.detailText}>Govt Fee: {scheme.GovtFee}</Text>
          <Text style={styles.detailText}>Description: {scheme.Description}</Text>
          <Text style={styles.detailText}>Eligibility: {scheme.Eligibility}</Text>
          <Text style={styles.detailText}>Scheme Type: {scheme.SchemeType}</Text>
          <Text style={styles.detailText}>Benefit Description: {scheme.benefitDescription}</Text>
          <Text style={styles.detailText}>Process: {scheme.process}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  detailsContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EligibleSchemeDetails;
