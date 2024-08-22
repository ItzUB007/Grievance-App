import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
// import AadharScanner from '../../components/AadharScanner';
// import Icon from 'react-native-vector-icons/FontAwesome';

export default function AddaMember({ navigation }) {
  const { programData, permissions, userData } = useAuth();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  var [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [schemeQuestions, setSchemeQuestions] = useState([]);
  const [documentQuestions, setDocumentQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [showScanner, setShowScanner] = useState(false);


  useEffect(() => {
    console.log('Program Data: ', programData);
  }, [programData]);
   const handleScanComplete = (data) => {
    setShowScanner(false);
    if (data) {
      setName(data.name);
      setLastFourDigits(data.lastFourDigits);
    }
  };

  const fetchSchemesAndDocuments = async (schemeIds, documentIds) => {
    // console.log('Fetching schemes with IDs: ', schemeIds);
    // console.log('Fetching documents with IDs: ', documentIds);
    try {
      // Fetch schemes
      const schemeQuery = await firestore().collection('Schemes').where(firestore.FieldPath.documentId(), 'in', schemeIds).get();
      const fetchedSchemes = schemeQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSchemes(fetchedSchemes);
      console.log('Fetched Schemes: ', fetchedSchemes);

      // Fetch documents
      const documentQuery = await firestore().collection('Documents').where(firestore.FieldPath.documentId(), 'in', documentIds).get();
      const fetchedDocuments = documentQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocuments(fetchedDocuments);
      console.log('Fetched Documents: ', fetchedDocuments);

      const schemeQuestions = [];
      const documentQuestions = [];
      
      // Process scheme questions
      fetchedSchemes.forEach(scheme => {
        if (scheme.schemeQuestions) {
          scheme.schemeQuestions.forEach(question => {
            schemeQuestions.push({ question: question.question, correctOptions: question.option, TypeOfMCQ: question.option?.TypeOfMCQ });
          });
        }
      });

      // Process document questions
      fetchedDocuments.forEach(document => {
        if (document.schemeQuestions) {
          document.schemeQuestions.forEach(question => {
            documentQuestions.push({ question: question.question, correctOptions: question.option, TypeOfMCQ: question.option?.TypeOfMCQ });
          });
        }
      });

      setSchemeQuestions(schemeQuestions);
      setDocumentQuestions(documentQuestions);

      console.log('Fetched Scheme Questions: ', schemeQuestions);
      console.log('Fetched Document Questions: ', documentQuestions);
      
      await fetchQuestions([...schemeQuestions, ...documentQuestions]);
    } catch (error) {
      console.error('Error fetching schemes or documents: ', error);
    }
  };

  const fetchQuestions = async (allQuestions) => {
    const questionIds = [...new Set(allQuestions.map(q => q.question))];
    console.log('Fetching question data for IDs: ', questionIds);
    
    try {
      const questionQuery = await firestore().collection('MemberQuestions').where(firestore.FieldPath.documentId(), 'in', questionIds).get();
      const questions = questionQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const optionPromises = questions.flatMap(question => question.ConceptOptions ? question.ConceptOptions.map(optionId =>
        firestore().collection('Options').doc(optionId).get()
      ) : []);

      const optionDocs = await Promise.all(optionPromises);
      const options = optionDocs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      questions.forEach(question => {
        question.options = question.ConceptOptions ? question.ConceptOptions.map(optionId => {
          const foundOption = options.find(o => o.id === optionId);
          return {
            id: optionId,
            name: foundOption ? foundOption.Name : 'Unknown'
          };
        }) : [];
      });

      allQuestions.forEach(item => {
        if (item.TypeOfMCQ) {
          questions.forEach(q => {
            if (q.id === item.question) {
              q.TypeOfMCQ = item.TypeOfMCQ;
              console.log("checking", q);
            }
          });
        }
      });

      setQuestions(questions);
      console.log('Fetched Questions with Options: ', questions);
    } catch (error) {
      console.error('Error fetching questions: ', error);
    }
  };

  const handleAnswerSelect = (questionId, optionId, type) => {
    console.log(type);
    console.log(optionId);
    console.log(questionId);

    setAnswers(prevAnswers => {
      const updatedAnswers = { ...prevAnswers };
      if (type === 'multiple') {
        if (!updatedAnswers[questionId]) {
          updatedAnswers[questionId] = [];
        }
        if (updatedAnswers[questionId].includes(optionId)) {
          updatedAnswers[questionId] = updatedAnswers[questionId].filter(id => id !== optionId);
        } else {
          updatedAnswers[questionId].push(optionId);
        }
      } else {
        updatedAnswers[questionId] = [optionId];
      }
      return updatedAnswers;
    });
  };

  const handleNumberInput = (questionId, value) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    if (!name || !phoneNumber) {
      Alert.alert('Please enter both name and phone number.');
      return;
    }

    setLoading(true);
    try {
      await fetchSchemesAndDocuments(programData.schemes, programData.documents);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching schemes and documents: ', error);
      Alert.alert('Error fetching schemes and documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    try {
      function haveCommonItems(arr1, arr2) {
        const set1 = new Set(arr1);
        console.log(arr1, arr2);
        const commonItems = arr2?.filter(item => set1.has(item));
        return commonItems?.length > 0;
      }

      let eligibleSchemes = [];
      let eligibleDocuments = [];
      let eligibleSchemesDetails = [];
      let eligibleDocumentsDetails = [];

      // Check eligibility for schemes
      schemes.forEach((scheme) => {
        let bool = true; // Reset bool for each scheme

        if (scheme.schemeQuestions) {
          scheme.schemeQuestions.forEach((SQ) => {
            let existingQuestion = answers[SQ.question];
            console.log('existingQuestion-', existingQuestion);
            console.log('outer', SQ.option?.Operation);

            if (SQ.option?.Operation) {
              console.log('inside', SQ.option.Operation);

              const answerValue = Number(existingQuestion);
              const inputValue = Number(SQ.option.inputValue[0]);

              switch (SQ.option.Operation) {
                case '==':
                  if (inputValue !== answerValue) {
                    bool = false;
                    console.log('Condition is checking == & answer is not correct');
                  }
                  break;
                case '!=':
                  if (inputValue === answerValue) {
                    bool = false;
                    console.log('Condition is checking != & answer is not correct');
                  }
                  break;
                case '>':
                  if (answerValue <= inputValue) {
                    bool = false;
                    console.log('Condition is checking > & answer is not correct');
                  }
                  break;
                case '<':
                  if (answerValue >= inputValue) {
                    bool = false;
                    console.log('Condition is checking < & answer is not correct');
                  }
                  break;
                case '>=':
                  if (answerValue < inputValue) {
                    bool = false;
                    console.log('Condition is checking >= & answer is not correct');
                  }
                  break;
                case '<=':
                  if (answerValue > inputValue) {
                    bool = false;
                    console.log('Condition is checking <= & answer is not correct');
                  }
                  break;
                case 'between':
                  console.log('Condition is checking between');
                  const [min, max] = SQ.option.inputValue.map(Number);
                  if (answerValue < min || answerValue > max) {
                    bool = false;
                    console.log('Working Fine');
                  }
                  break;
                default:
                  break;
              }
            } else if (!SQ.option?.Operation && !haveCommonItems(SQ.option?.options || SQ.option, existingQuestion)) {
              bool = false;
              console.log('inside last if else', SQ.option.Operation);
            }
          });
        }

        if (bool) {
          eligibleSchemes.push({ id: scheme.id, name: scheme.Name });
          eligibleSchemesDetails.push(scheme);
        }
      });

      // Check eligibility for documents
      documents.forEach((document) => {
        let bool = true; // Reset bool for each document
          console.log('Document-',document)
        if (document.schemeQuestions) {
          document.schemeQuestions.forEach((DQ) => {
            let existingQuestion = answers[DQ.question];
            console.log('existingQuestion-', existingQuestion);
            console.log('outer', DQ.option?.Operation);

            if (DQ.option?.Operation) {
              console.log('inside', DQ.option.Operation);

              const answerValue = Number(existingQuestion);
              const inputValue = Number(DQ.option.inputValue[0]);

              switch (DQ.option.Operation) {
                case '==':
                  if (inputValue !== answerValue) {
                    bool = false;
                    console.log('Condition is checking == & answer is not correct');
                  }
                  break;
                case '!=':
                  if (inputValue === answerValue) {
                    bool = false;
                    console.log('Condition is checking != & answer is not correct');
                  }
                  break;
                case '>':
                  if (answerValue <= inputValue) {
                    bool = false;
                    console.log('Condition is checking > & answer is not correct');
                  }
                  break;
                case '<':
                  if (answerValue >= inputValue) {
                    bool = false;
                    console.log('Condition is checking < & answer is not correct');
                  }
                  break;
                case '>=':
                  if (answerValue < inputValue) {
                    bool = false;
                    console.log('Condition is checking >= & answer is not correct');
                  }
                  break;
                case '<=':
                  if (answerValue > inputValue) {
                    bool = false;
                    console.log('Condition is checking <= & answer is not correct');
                  }
                  break;
                case 'between':
                  console.log('Condition is checking between');
                  const [min, max] = DQ.option.inputValue.map(Number);
                  if (answerValue < min || answerValue > max) {
                    bool = false;
                    console.log('Working Fine');
                  }
                  break;
                default:
                  break;
              }
            } else if (!DQ.option?.Operation && !haveCommonItems(DQ.option?.options || DQ.option, existingQuestion)) {
              bool = false;
              console.log('inside last if else', DQ.option.Operation);
            }
          });
        }

        if (bool) {
          eligibleDocuments.push({ id: document.id, name: document.Name });
          eligibleDocumentsDetails.push(document);
         
        }
      });

      console.log("eligibleSchemes", eligibleSchemes);
      console.log("eligibleDocuments", eligibleDocuments);
      

      const formattedAnswers = questions.map(q => ({
        id: q.id,
        conceptName: q.ConceptName,
        selectedOptions: q.ConceptType === 'Number' ? [answers[q.id]] : (answers[q.id] || []).map(optionId => {
          const option = q.options.find(o => o.id === optionId);
          return { id: optionId, name: option ? option.name : 'Unknown' };
        })
      }));

      const membersRef = firestore().collection('Members');
      const memberQuery = membersRef
        .where('AadharlastFourDigits', '==', lastFourDigits)
        .where('name', '==', name)
        .where('ProgramId', '==', userData.ProgramId);
      const memberSnapshot = await memberQuery.get();

      if (!memberSnapshot.empty) {
        const memberDoc = memberSnapshot.docs[0];
        await memberDoc.ref.update({
          QuestionAnswers: formattedAnswers,
          eligibleSchemes: eligibleSchemes,
          eligibleDocuments: eligibleDocuments
        });
        Alert.alert('Data updated successfully!');
        navigation.navigate('EligibleDocuments&Schemes', { eligibleSchemesDetails, eligibleDocumentsDetails, name, phoneNumber });
      } else {
        if (name && phoneNumber && userData.ProgramId && answers) {
          await membersRef.add({
            name,
            phoneNumber,
            AadharlastFourDigits:lastFourDigits,
            ProgramId: userData.ProgramId,
            QuestionAnswers: formattedAnswers,
            eligibleSchemes: eligibleSchemes,
            eligibleDocuments: eligibleDocuments
          });
          Alert.alert('Data saved successfully!');
        } else {
          Alert.alert('Missing required fields. Please fill in all the details.');
        }
      }
    } catch (error) {
      console.error('Error checking eligibility and saving data: ', error);
    }
  };

  return (
    <View style={styles.container}>
      {questions.length === 0 && (
        <>
           {/* <AadharScanner onScan={(data) => {
          // setAadharData(data);
          setName(data.name);
          setLastFourDigits(data.lastFourDigits);
        }} /> */}
          <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor="gray"
          />
          <TextInput
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={styles.input}
            keyboardType="phone-pad"
            placeholderTextColor="gray"
          />
           <TextInput
        value={lastFourDigits}
        onChangeText={setLastFourDigits}
        keyboardType="numeric"
        maxLength={4}
        style={styles.input}
        placeholder="Enter Aadhar last 4 digits"
      />
          <Button
            title="Proceed"
            onPress={handleSubmit}
          />
        </>
      )}
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
  
      {questions.length > 0 && (
        <ScrollView contentContainerStyle={styles.fullScreenQuestionContainer}>
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{`${currentQuestionIndex + 1}. ${questions[currentQuestionIndex].ConceptName}`} </Text>
            {questions[currentQuestionIndex].ConceptType === 'Number' ? (
              <TextInput
                style={styles.numberInput}
                keyboardType="numeric"
                value={answers[questions[currentQuestionIndex].id] || ''}
                placeholder='Enter Your Answere'
                onChangeText={(value) => handleNumberInput(questions[currentQuestionIndex].id, value)}
              />  
            ) : (
              questions[currentQuestionIndex].options.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionButton,
                    answers[questions[currentQuestionIndex].id] && answers[questions[currentQuestionIndex].id].includes(option.id) && styles.selectedOption
                  ]}
                  onPress={() => handleAnswerSelect(questions[currentQuestionIndex].id, option.id, questions[currentQuestionIndex].TypeOfMCQ === 'multiple' ? 'multiple' : 'single')}
                > 
                  <Text style={styles.optionText}>{option.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
  
          {/* Add Previous and Next buttons */}
          <View style={styles.navigationButtons}>
            {currentQuestionIndex > 0 && (
              <Button
                title="Previous"
                onPress={() => setCurrentQuestionIndex(prevIndex => prevIndex - 1)}
              />
            )}
            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                title="Next"
                onPress={() => setCurrentQuestionIndex(prevIndex => prevIndex + 1)}
              />
            ) : (
              <Button
                title="Submit"
                onPress={checkEligibility}
              />
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'grey',
    padding: 12,
    borderRadius: 5,
    marginBottom: 16,
    color: 'black',
    backgroundColor: '#f0f0f0',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  fullScreenQuestionContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#fff',
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 20,
    marginBottom: 20,
    color: 'black',
    textAlign: 'center',
  },
  optionButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#cce5ff',
  },
  optionText: {
    fontSize: 16,
    color: 'blue',
  },
  numberInput: {
    borderWidth: 1,
    borderColor: 'grey',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    color: 'black',
    textAlign: 'center',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },  fullScreenQuestionContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#fff',
  },  
});

