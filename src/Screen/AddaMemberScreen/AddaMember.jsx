import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function AddaMember({ navigation }) {
  const { programData, permissions, userData } = useAuth();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  var [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [schemeQuestion, setSchemeQuestion] = useState([]);


  useEffect(() => {
    console.log('Program Data: ', programData);
  }, [programData]);

  const fetchSchemes = async (schemeIds) => {
    console.log('Fetching schemes with IDs: ', schemeIds);
    try {
      const schemeQuery = await firestore().collection('Schemes').where(firestore.FieldPath.documentId(), 'in', schemeIds).get();
      const schemes = schemeQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSchemes(schemes);
      console.log('SchemesDataQuestions :', schemes?.schemeQuestions);

      const schemeQuestions = [];
      schemes.forEach(scheme => {
        if (scheme.schemeQuestions) {
          scheme.schemeQuestions.forEach(question => {
            schemeQuestions.push({ question: question.question, correctOptions: question.option, TypeOfMCQ: question.option.TypeOfMCQ });
            
          });
    
          
        }
      });
          setSchemeQuestion(schemeQuestions)
      // console.log('Fetched Questions: ', schemeQuestions);
      // console.log(questions);
      
      await fetchQuestions(schemeQuestions);
    } catch (error) {
      console.error('Error fetching schemes: ', error);
    }
  };

  const fetchQuestions = async (schemeQuestions) => {
    const questionIds = [...new Set(schemeQuestions.map(q => q.question))];
    // console.log('Fetching question data for IDs: ', questionIds);
    
    console.log('SchemesDataQuestions :', schemes);
 
    
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
           
      schemeQuestions.map(item => {
        if (item.TypeOfMCQ) {
         questions.forEach(q => {
          
           if(q.id == item.question){
             q.TypeOfMCQ = item.TypeOfMCQ;
            //  console.log("checking", q)
           }
         })
          //console.log(`TypeOfMCQ: ${item.correctOptions.TypeOfMCQ}`);
          // console.log("After Adding TypeOfMCQ", questions)
          // console.log(questions.find(q => q.ConceptName == "Age").TypeOfMCQ)
         
        } 
       
        })


      setQuestions(questions);
      console.log('Here we want ',questions);
      // schemes.forEach((scheme)=> {
      // console.log(scheme.schemeQuestions)
      // })

      // console.log('Fetched Questions with Options: ', questions);
    } catch (error) {
      console.error('Error fetching questions: ', error);
    }
  };

  const handleAnswerSelect = (questionId, optionId, type) => {
    // console.log(type);
    // console.log(optionId)
    // console.log(questionId)
   
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
      await fetchSchemes(programData.schemes);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching schemes and questions: ', error);
      Alert.alert('Error fetching schemes and questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    try {
      function haveCommonItems(arr1, arr2) {
        const set1 = new Set(arr1);
        console.log(arr1,arr2);
        const commonItems = arr2?.filter(item => set1.has(item));

        return commonItems?.length > 0;
      }

      let eligibleSchemes = [];
      let eligibleSchemesDetails = [];
      let bool = true;
      
  

   
      schemes.forEach((scheme) => {
       
        scheme.schemeQuestions.forEach((SQ) => {
          let existingQuestion = answers[SQ.question];
          console.log('existingQuesstion-',existingQuestion);
          if (SQ.option.Operation) {
            if (SQ.option.Operation == '==' && SQ.option.inputValue[0] !== existingQuestion) {
                  bool = false;
                  console.log('Condition is checking == & answere is not correct');
                } else if (SQ.option.Operation === 'between') {
                  console.log('Condition is checking between');
                      const [min, max] = SQ.option.inputValue.map(Number);
                      const answerValue = Number(existingQuestion);
                      if (answerValue < min || answerValue > max) {
                        bool = false;
                        console.log('Working Fine');
                      } }

          }
          
          else if (!SQ.option.Operation && !haveCommonItems(SQ.option, existingQuestion)) {
            bool = false;
          }
        });

        if (bool) {
          eligibleSchemes.push({ id: scheme.id, name: scheme.Name });
          eligibleSchemesDetails.push(scheme);
        }
      });

      console.log("eligibleSchemes", eligibleSchemes);

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
        .where('phoneNumber', '==', phoneNumber)
        .where('name', '==', name)
        .where('ProgramId', '==', userData.ProgramId);
      const memberSnapshot = await memberQuery.get();

      if (!memberSnapshot.empty) {
        const memberDoc = memberSnapshot.docs[0];
        await memberDoc.ref.update({
          QuestionAnswers: formattedAnswers,
          eligibleSchemes: eligibleSchemes
        });
        Alert.alert('Data updated successfully!');
        navigation.navigate('EligibleSchemes', { eligibleSchemesDetails: eligibleSchemesDetails, name, phoneNumber });
      } else {
        if (name && phoneNumber && userData.ProgramId && answers) {
          await membersRef.add({
            name,
            phoneNumber,
            ProgramId: userData.ProgramId,
            QuestionAnswers: formattedAnswers,
            eligibleSchemes: eligibleSchemes
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
      <Button
        title="Proceed"
        onPress={handleSubmit}
      />
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        style={{ marginVertical: 100 }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeButton}>
              <Icon name="close" size={25} color="red" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {questions.map((question, index) => (
            
              <View key={question.id} style={styles.questionContainer}>
                <Text style={styles.questionText}>{`${index + 1}. ${question.ConceptName}`} </Text>
                {question.ConceptType === 'Number' ? (
                  <TextInput
                    style={styles.numberInput}
                    keyboardType="numeric"
                    onChangeText={(value) => handleNumberInput(question.id, value)}
                  />  
                ) : (

                  question.options.map(option => (
                  
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionButton,
                        answers[question.id] && answers[question.id].includes(option.id) && styles.selectedOption
                      ]}
                      onPress={() => handleAnswerSelect(question.id, option.id, question.TypeOfMCQ === 'multiple' ? 'multiple' : 'single')}
                    > 
                      <Text style={styles.optionText}>{option.name}  </Text>
                    </TouchableOpacity>
                   
                  ))
                
                )}
                   

              </View>
            ))}
            <Button
              title="Submit"
              onPress={checkEligibility}
            />
          </ScrollView>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    position: 'absolute',
    top: 7,
    right: 10,
    zIndex: 5
  },
  closeButton: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: 'black',
  },
  scrollContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 10,
    color: 'black',
  },
  optionButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 5,
    color: 'blue',
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
  },
});
