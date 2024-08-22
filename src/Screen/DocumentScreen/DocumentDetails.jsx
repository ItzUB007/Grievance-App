import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const DocumentDetails = ({ route }) => {
  const { schemeDetails, schemeId } = route.params;
  const [scheme, setScheme] = useState(schemeDetails);
  const [questions, setQuestions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(!schemeDetails);
  const [language, setLanguage] = useState('English'); // Default language
  const [alertShown, setAlertShown] = useState(false);
  const [languageAvailable, setLanguageAvailable] = useState(true);



  useEffect(() => {
    const fetchSchemeDetails = async () => {
      if (!schemeDetails && schemeId) {
        setLoading(true);
        try {
          const schemeDoc = await firestore().collection('Documents').doc(schemeId).get();
          if (schemeDoc.exists) {
            const schemeData = schemeDoc.data();
            setScheme(schemeData);
            await fetchQuestions(schemeData.schemeQuestions);
            await fetchDocuments(schemeData.schemeDocumentQuestions);
          } else {
            Alert.alert('Error', 'Scheme not found.');
          }
        } catch (error) {
          console.error('Error fetching scheme details: ', error);
          Alert.alert('Error', 'Failed to fetch scheme details.');
        } finally {
          setLoading(false);
        }
      } else {
        await fetchQuestions(schemeDetails.schemeQuestions);
        await fetchDocuments(schemeDetails.schemeDocumentQuestions);
      }
    };

    const fetchQuestions = async (schemeQuestions) => {
      if (Array.isArray(schemeQuestions)) {
        try {
          const fetchedQuestions = await Promise.all(
            schemeQuestions.map(async (schemeQuestion) => {
              const questionDoc = await firestore().collection('MemberQuestions').doc(schemeQuestion.question).get();
              const questionData = questionDoc.data();
              let correctOptions = [];
              const operation = schemeQuestion.option.Operation;
              const inputValue = schemeQuestion?.option?.inputValue;

              if (schemeQuestion.option.options) {
                const nestedOptionDocs = await Promise.all(
                  schemeQuestion.option.options.map(async (nestedOptionId) => {
                    const nestedOptionDoc = await firestore().collection('Options').doc(nestedOptionId).get();
                    return nestedOptionDoc.data();
                  })
                );
                correctOptions = nestedOptionDocs;
              } else if (Array.isArray(schemeQuestion.option)) {
                const correctOptionDocs = await Promise.all(
                  schemeQuestion.option.map(async (optionId) => {
                    const optionDoc = await firestore().collection('Options').doc(optionId).get();
                    return optionDoc.data();
                  })
                );
                correctOptions = correctOptionDocs;
              }

              return {
                question: questionData?.ConceptName,
                questionType: questionData?.ConceptType,
                options: correctOptions.map(option => {
                  if (option.nestedOptions) {
                    return {
                      name: option.Name,
                      nestedOptions: option.nestedOptions.map(nestedOption => nestedOption.Name),
                    };
                  }
                  return option.Name;
                }),
                operation,
                inputValue
              };
            })
          );
          setQuestions(fetchedQuestions);
          console.log('QuestionData', fetchedQuestions);
        } catch (error) {
          console.error('Error fetching questions: ', error);
          Alert.alert('Error', 'Failed to fetch questions.');
        }
      }
    };

    const fetchDocuments = async (schemeDocumentQuestions) => {
      if (Array.isArray(schemeDocumentQuestions)) {
        try {
          const fetchedDocuments = await Promise.all(
            schemeDocumentQuestions.map(async (docQuestion) => {
              const documentQuestionDoc = await firestore().collection('DocumentQuestions').doc(docQuestion.documentQuestion).get();
              const documentQuestionData = documentQuestionDoc.data();

              const documentIdsData = await Promise.all(
                docQuestion.documentIds.map(async (documentId) => {
                  const documentDoc = await firestore().collection('Documents').doc(documentId).get();
                  return documentDoc.data();
                })
              );

              return {
                documentQuestionName: documentQuestionData?.Name,
                documents: documentIdsData.map(docData => ({
                  name: docData?.Name,
                  required: docQuestion.required
                })).filter(doc => doc.name) // Filter out undefined or null names
              };
            })
          );

          setDocuments(fetchedDocuments);
        } catch (error) {
          console.error('Error fetching documents: ', error);
          Alert.alert('Error', 'Failed to fetch documents.');
        }
      }
    };

    fetchSchemeDetails();
  }, [schemeDetails, schemeId]);

  useEffect(() => {
    const checkLanguageAvailability = () => {
      let available = true;
      if (language === 'Hindi') {
        available = Object.keys(scheme || {}).some(key => key.endsWith('_Hindi'));
      } else if (language === 'Marathi') {
        available = Object.keys(scheme || {}).some(key => key.endsWith('_Marathi'));
      }
      setLanguageAvailable(available);
  
      if (!available) {
        Alert.alert('This Language is not available. Reverting back to English.');
        setLanguage('English');
      }
    };
  
    checkLanguageAvailability();
  }, [language, scheme]);
  const getLocalizedField = (field) => {
    if (language === 'Hindi') {
      return scheme[`${field}_Hindi`] || scheme[field];
    } else if (language === 'Marathi') {
      return scheme[`${field}_Marathi`] || scheme[field];
    }
    return scheme[field];
  };
  
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  
  if (!schemeId && !schemeDetails) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.innerContainer}>
          <Text style={styles.errorText}>
            Document Details is not available
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
        <Picker
      selectedValue={language}
      style={styles.picker}
      onValueChange={(itemValue) => setLanguage(itemValue)}
    >
      <Picker.Item label="English" value="English" />
      <Picker.Item label="Hindi" value="Hindi" />
      <Picker.Item label="Marathi" value="Marathi" />
    </Picker>
         {scheme && (
      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>Scheme Name: {getLocalizedField('Name')}</Text>
        <Text style={styles.detailText}>Application Method: {getLocalizedField('ApplicationMethod')}</Text>
        <Text style={styles.detailText}>Govt Fee: {getLocalizedField('GovtFee')}</Text>
        <Text style={styles.detailText}>Description: {getLocalizedField('Description')}</Text>
        <Text style={styles.detailText}>Eligibility: {getLocalizedField('Eligibility')}</Text>
        <Text style={styles.detailText}>Scheme Type: {getLocalizedField('SchemeType')}</Text>
        <Text style={styles.detailText}>Benefit Description: {getLocalizedField('benefitDescription')}</Text>
        <Text style={styles.detailText}>Process: {getLocalizedField('process')}</Text>
      </View>
    )}
      {questions.length > 0 && (
        <View style={styles.questionsContainer}>
          <Text style={styles.questionHeader}>Questions and Correct Options:</Text>
          {questions.map((question, index) => (
            <View key={index} style={styles.questionContainer}>
              <Text style={styles.questionText}>{question.question}</Text>
              <Text style={styles.optionText}>
                Correct Options: {Array.isArray(question.options) ? question.options.map(option =>
                  typeof option === 'string' ? option : `${option.name} (Nested: ${option.nestedOptions.join(', ')})`
                ).join(', ') : question.options} {question.questionType === 'Number' && `${"See Operation & Values"}`}
              </Text>
              {question.questionType === 'Number' && (
                <>
                  <Text style={styles.optionText}>Operation: {question.operation}</Text>
                  <Text style={styles.optionText}>
                    Value: {question.inputValue?.length > 1 ? question.inputValue.join(', ') : question.inputValue}
                  </Text>
                </>
              )}
            </View>
          ))}
        </View>
      )}
      {documents.length > 0 && (
        <View style={styles.documentsContainer}>
          <Text style={styles.documentHeader}>Required Documents:</Text>
          {documents.map((doc, index) => (
            <View key={index} style={styles.documentContainer}>
              <Text style={styles.documentQuestionText}>{doc.documentQuestionName}</Text>
              {doc.documents.map((document, idx) => (
                document.name && (
                  <Text key={idx} style={styles.documentText}>
                    {1 + idx} - {document.required ? document.name : `${document.name} *`}
                  </Text>
                )
              ))}
            </View>
          ))}
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
  documentsContainer: {
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
  documentHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  documentContainer: {
    marginBottom: 20,
  },
  documentQuestionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  documentText: {
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

export default DocumentDetails;
