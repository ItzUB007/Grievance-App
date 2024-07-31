import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';

export default function MemberDetails({ route, navigation }) {
  const { member } = route.params;
  const [questionAnswers, setQuestionAnswers] = useState([]);

  useEffect(() => {
    console.log('Member Details', member);
    setQuestionAnswers(member.QuestionAnswers);
  }, [member]);

  const renderSelectedOptions = (options) => {
    if (Array.isArray(options)) {
      return options.map((option, index) => {
        if (typeof option === 'object' && option !== null) {
          return option.name || JSON.stringify(option);
        }
        return option;
      }).join(', ');
    }
    return options;
  };

  if (!member.QuestionAnswers && !member.eligibleSchemes) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.innerContainer}>
          <Text style={styles.errorText}>
            You are not eligible for Schemes
          </Text>
          {member.TicketId &&
             <Text style={styles.baseText}>Available Tickets : {member.TicketId.length} </Text>
          
          }
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.detailsContainer}>
      <Text style={styles.baseText}>Member Name : {member.name} </Text>
      <Text style={styles.baseText}>Member PhoneNo : {member.phoneNumber} </Text>
      {member.TicketId &&
             <Text style={styles.baseText}>Available Tickets : {member.TicketId.length} </Text>
          
          }
          {member.eligibleSchemes &&
           <Text style={styles.baseText}>Eligible Schemes: {member.eligibleSchemes?.length}</Text>
          }
       
       
        {member.eligibleSchemes && member.eligibleSchemes?.map((scheme, index) => (
          <TouchableOpacity
            key={index}
            style={styles.schemeItem}
            onPress={() => navigation.navigate('EligibleSchemeDetails', { schemeId: scheme.id })}
          >
            <Text style={styles.schemeText}> {scheme.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.questionsContainer}>
        <Text style={styles.questionHeader}>Questions and Selected Options:</Text>
        {questionAnswers?.map((answer, index) => (
          <View key={index} style={styles.questionContainer}>
            <Text style={styles.questionText}>{answer.conceptName}</Text>
            <Text style={styles.optionText}>
              Selected Options: {renderSelectedOptions(answer.selectedOptions)}
            </Text>
          </View>
        ))}
      </View>
  
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 20,
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
  schemeText: {
    fontSize: 14,
    color: 'blue',
    textAlign: 'center',
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
  questionsContainer: {
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
  questionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },   permissionContainer: {
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
});
