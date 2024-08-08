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

  if (!member.QuestionAnswers && !member.eligibleSchemes && !member.eligibleDocuments) {
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
        {member.eligibleDocuments &&
          <Text style={styles.baseText}>Eligible Documents: {member.eligibleDocuments?.length}</Text>
        }
      </View>
      {member.eligibleSchemes && member.eligibleSchemes.length > 0 && (
        <View style={styles.tableContainer}>
          <Text style={styles.tableHeader}>Eligible Schemes</Text>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeader}>Name</Text>
            <Text style={styles.tableCellHeader}>Eligibility</Text>
          </View>
          {member.eligibleSchemes.map((scheme, index) => (
            <View key={index} style={styles.tableRow}>
              <TouchableOpacity
                style={styles.schemeItem}
                onPress={() => navigation.navigate('Scheme Details', { schemeId: scheme.id })}
              >
                <Text style={styles.schemeText}>{scheme.name}</Text>
              </TouchableOpacity>
              <Text style={styles.tableCell}>Eligible</Text>
            </View>
          ))}
        </View>
      )}
      {member.eligibleDocuments && member.eligibleDocuments.length > 0 && (
        <View style={styles.tableContainer}>
          <Text style={styles.tableHeader}>Eligible Documents</Text>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeader}>Name</Text>
            <Text style={styles.tableCellHeader}>Eligibility</Text>
          </View>
          {member.eligibleDocuments.map((document, index) => (
            <View key={index} style={styles.tableRow}>
              <TouchableOpacity
                style={styles.schemeItem}
                onPress={() => navigation.navigate('Document Details', { schemeId: document.id })}
              >
                <Text style={styles.schemeText}>{document.name}</Text>
              </TouchableOpacity>
              <Text style={styles.tableCell}>Eligible</Text>
            </View>
          ))}
        </View>
      )}
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
  tableContainer: {
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
  tableHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableCellHeader: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    color: 'black',
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
  },
  permissionContainer: {
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
