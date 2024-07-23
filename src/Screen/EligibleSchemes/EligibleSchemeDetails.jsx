import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity, Alert } from 'react-native';





const EligibleSchemeDetails = ({ route }) => {
  const { schemeDetails } = route.params;


  useEffect(() => {
  
console.log(schemeDetails);
  }, [schemeDetails]);

  

  return (
    <ScrollView style={styles.container}>
      {schemeDetails && (
        <View style={styles.detailsContainer}>
            <Text style={styles.detailText}>Scheme Name: {schemeDetails.Name}</Text>
          <Text style={styles.detailText}>Application Method : {schemeDetails.ApplicationMethod}</Text>
          <Text style={styles.detailText}>Govt Fee : {schemeDetails.GovtFee}</Text> 
           <Text style={styles.detailText}>Description: {schemeDetails.Description}</Text>
          <Text style={styles.detailText}>Eligibility {schemeDetails.Eligibility}</Text>
          <Text style={styles.detailText}>Scheme Type {schemeDetails.SchemeType}</Text>
          <Text style={styles.detailText}>benifitDescription {schemeDetails.benefitDescription}</Text>
          <Text style={styles.detailText}>Process {schemeDetails.process}</Text>
        </View>
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0' // Consistent background with ViewStatusScreen
  },
  detailsContainer: {
    backgroundColor: 'white', // Card-like style for details
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
    color: '#333' // Dark color for text for better readability
  },

 

});

export default EligibleSchemeDetails;

