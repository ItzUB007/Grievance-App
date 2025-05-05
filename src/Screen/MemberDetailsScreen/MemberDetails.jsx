import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

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

  // Render eligibility status with colored dot
  const renderEligibilityStatus = (isEligible) => {
    return (
      <View style={styles.eligibilityContainer}>
        <View style={[styles.statusDot, isEligible ? styles.eligibleDot : styles.notEligibleDot]} />
        <Text style={styles.eligibilityText}>
          {isEligible ? 'Eligible' : 'Not Eligible'}
        </Text>
      </View>
    );
  };

  if (!member.QuestionAnswers && !member.eligibleSchemes && !member.eligibleDocuments) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        {/* <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={24} color="#ea3838" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Member Details</Text>
        </View> */}
        
        <View style={styles.permissionContainer}>
          <View style={styles.innerContainer}>
            <Text style={styles.errorText}>
            You are not eligible for the scheme. Check scheme eligibility first
            </Text>
            
            {member.TicketId &&
              <Text style={styles.baseText}> Tickets Applied : {member.TicketId.length} </Text>
            }
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color="#ea3838" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Member Details</Text>
      </View> */}
      
      <ScrollView style={styles.container}>
        {/* Member Info Card */}
        <View style={styles.memberCard}>
          <View style={styles.memberInfoContainer}>
            {/* <Image 
              source={{ uri: member.photoUrl || 'https://via.placeholder.com/100' }} 
              style={styles.memberPhoto} 
            /> */}
            <View style={styles.memberDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Member Name</Text>
                <Text style={styles.detailColon}>:</Text>
                <Text style={styles.detailValue}>{member.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone No.</Text>
                <Text style={styles.detailColon}>:</Text>
                <Text style={styles.detailValue}>{member.phoneNumber}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Eligible Scheme</Text>
                <Text style={styles.detailColon}>:</Text>
                <Text style={styles.detailValue}>
                  {member.eligibleSchemes ? member.eligibleSchemes.length : '0'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Eligible Documents</Text>
                <Text style={styles.detailColon}>:</Text>
                <Text style={styles.detailValue}>
                  {member.eligibleDocuments ? member.eligibleDocuments.length : '0'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Eligible Schemes Section */}
        {member.eligibleSchemes && member.eligibleSchemes.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>Eligible Schemes</Text>
            </View>
            
            <View style={styles.tableContainer}>
              <View style={styles.tableHeaderRow}>
                <Text style={styles.tableHeaderCell}>Schemes Name</Text>
                <Text style={styles.tableHeaderCell}>Eligibility</Text>
              </View>
              
              {member.eligibleSchemes.map((scheme, index) => (
                <View key={index} style={styles.tableRow}>
                  <TouchableOpacity
                    style={styles.schemeNameCell}
                    onPress={() => navigation.navigate('Scheme Details', { schemeId: scheme.id })}
                  >
                    <Text style={styles.schemeNameText}>{scheme.name}</Text>
                  </TouchableOpacity>
                  <View style={styles.eligibilityCell}>
                    {renderEligibilityStatus(true)}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Eligible Documents Section */}
        {member.eligibleDocuments && member.eligibleDocuments.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>Eligible Documents</Text>
            </View>
            
            <View style={styles.tableContainer}>
              <View style={styles.tableHeaderRow}>
                <Text style={styles.tableHeaderCell}>Documents Name</Text>
                <Text style={styles.tableHeaderCell}>Eligibility</Text>
              </View>
              
              {member.eligibleDocuments.map((document, index) => (
                <View key={index} style={styles.tableRow}>
                  <TouchableOpacity
                    style={styles.schemeNameCell}
                    onPress={() => navigation.navigate('Document Details', { schemeId: document.id })}
                  >
                    <Text style={styles.schemeNameText}>{document.name}</Text>
                  </TouchableOpacity>
                  <View style={styles.eligibilityCell}>
                    {renderEligibilityStatus(true)}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Questions and Selected Options - Styled to match the theme */}
        {questionAnswers && questionAnswers.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>Questions and Selected Options</Text>
            </View>
            
            <View style={styles.questionsContainer}>
              {questionAnswers.map((answer, index) => (
                <View key={index} style={styles.questionItem}>
                  <Text style={styles.questionText}>{answer.conceptName}</Text>
                  <Text style={styles.optionText}>
                    Selected Options: {renderSelectedOptions(answer.selectedOptions)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#ea3838',
    marginLeft: 8,
  },
  memberCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  memberInfoContainer: {
    flexDirection: 'row',
  },
  memberPhoto: {
    width: 90,
    height: 90,
    borderRadius: 4,
    marginRight: 16,
  },
  memberDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 140,
    fontSize: 14,
    color: '#343434',
  },
  detailColon: {
    width: 10,
    fontSize: 14,
    color: '#343434',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#343434',
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    backgroundColor: '#ea3838',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sectionHeaderText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  tableContainer: {
    padding: 8,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dadada',
    paddingVertical: 12,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#343434',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dadada',
    paddingVertical: 12,
  },
  schemeNameCell: {
    flex: 1,
    justifyContent: 'center',
  },
  schemeNameText: {
    fontSize: 14,
    color: '#343434',
    textAlign: 'center',
  },
  eligibilityCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eligibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  eligibleDot: {
    backgroundColor: '#8BC34A',
  },
  notEligibleDot: {
    backgroundColor: '#F44336',
  },
  eligibilityText: {
    fontSize: 14,
    color: '#343434',
  },
  questionsContainer: {
    padding: 16,
  },
  questionItem: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#343434',
    marginBottom: 4,
  },
  optionText: {
    fontSize: 14,
    color: '#666666',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  innerContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#ea3838',
    textAlign: 'center',
    marginBottom: 8,
  },
  baseText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});