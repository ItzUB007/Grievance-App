import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity ,ScrollView} from 'react-native';

export default function EligibleSchemes({ route,navigation }) {
  const { eligibleSchemesDetails,name, phoneNumber } = route.params;


  useEffect(() => {
    console.log('Eligible Schemes Details :', eligibleSchemesDetails);
    
  }, [eligibleSchemesDetails]);

  if(!eligibleSchemesDetails ) {

    return (
      <View style={styles.permissionContainer}>
        <View style={styles.innerContainer}>
        <Text style={styles.memberTitle}>Members Details</Text>
      <View style={styles.memberContainer}>
      <Text style={styles.baseText}> Name : {name}</Text>
      <Text style={styles.baseText}> Phone No : {phoneNumber}</Text>
      </View>
      <View style={styles.separator} />
          <Text style={styles.errorText}>
            You Are Not Eligible for Schemes.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Eligible Schemes </Text>
      <Text style={styles.memberTitle}>Members Details</Text>
      <View style={styles.memberContainer}>
      <Text style={styles.baseText}> Name : {name}</Text>
      <Text style={styles.baseText}> Phone No : {phoneNumber}</Text>
      </View>
      <View style={styles.separator} />
      {eligibleSchemesDetails && eligibleSchemesDetails.map((scheme, index) => (
        <TouchableOpacity style={styles.SchemeItem} key={index}
        onPress={() => navigation.navigate('EligibleSchemeDetails', { schemeDetails:scheme })}>
          <Text style={styles.baseText}>Scheme Name: {scheme.Name}</Text>
          {/* <Text>Scheme ID: {scheme.id}</Text> */}
          <Text style={styles.baseText}>Application Method : {scheme.ApplicationMethod}</Text>
          {/* Add more details as required */}
          <Text style={styles.baseText}>SchemeType : {scheme.SchemeType}</Text>
          <Text style={styles.baseText}>Govt Fee : {scheme.GovtFee}</Text>
          
          
        </TouchableOpacity>
        
      ))}
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#fff',
        
      },
    SchemeItem: {
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 10,
        borderRadius: 10,
        elevation: 2,
        shadowOpacity: 0.1,
        shadowRadius: 3,
        shadowOffset: { width: 1, height: 1 },
      },
      baseText: {
        fontSize: 14,
        color: '#555',
        textAlign:'center'
      },
      title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
        color: '#333',
      }, memberTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
        color: 'blue',
      },
      separator: {
        width: '100%',
        height: 1,
        backgroundColor: '#ccc',
        marginTop:20
      },
      memberContainer: {
        marginTop: -10
      }, permissionContainer: {
        flex: 1,
        flexDirection: 'column',
        paddingBottom: 106,
      },
      innerContainer: {
        padding: 16,
      },
      errorText: {
        fontSize: 24, // h4 equivalent in React Native
        color: 'red', // equivalent to the "error" color
        textAlign: 'center',
      },
})