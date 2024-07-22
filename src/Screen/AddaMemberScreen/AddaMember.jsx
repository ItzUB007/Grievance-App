import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function AddaMember() {
  const { programData, permissions, userData } = useAuth();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showModal, setShowModal] = useState(false);
  var [schemes, setSchemes] = useState([]);


  useEffect(() => {
    console.log('Program Data: ', programData);
    if (programData && programData.schemes ) {
      fetchSchemes(programData.schemes);
    }
  }, [programData]);

  const fetchSchemes = async (schemeIds) => {
    console.log('Fetching schemes with IDs: ', schemeIds);
    try {
      const schemeQuery = await firestore().collection('Schemes').where(firestore.FieldPath.documentId(), 'in', schemeIds).get();
      schemes = schemeQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSchemes(schemeQuery.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      console.log('SchemesData :', schemes);

      const schemeQuestions = [];
      schemes.forEach(scheme => {
        if (scheme.schemeQuestions) {
          scheme.schemeQuestions.forEach(question => {
            schemeQuestions.push({ question: question.question, correctOptions: question.option });
          });
        }
      });

      console.log('Fetched Questions: ', schemeQuestions);
      fetchQuestions(schemeQuestions);
    } catch (error) {
      console.error('Error fetching schemes: ', error);
    }
  };

  const fetchQuestions = async (schemeQuestions) => {
    const questionIds = [...new Set(schemeQuestions.map(q => q.question))];
    console.log('Fetching question data for IDs: ', questionIds);
    try {
      const questionQuery = await firestore().collection('MemberQuestions').where(firestore.FieldPath.documentId(), 'in', questionIds).get();
      const questions = questionQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const optionPromises = questions.flatMap(question => question.ConceptOptions.map(optionId =>
        firestore().collection('Options').doc(optionId).get()
      ));

      const optionDocs = await Promise.all(optionPromises);
      const options = optionDocs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      questions.forEach(question => {
        question.options = question.ConceptOptions.map(optionId => {
          const foundOption = options.find(o => o.id === optionId);
          return {
            id: optionId,
            name: foundOption ? foundOption.Name : 'Unknown'
          };
        });
      });

      setQuestions(questions);
      console.log('Fetched Questions with Options: ', questions);
    } catch (error) {
      console.error('Error fetching questions: ', error);
    }
  };

  const handleAnswerSelect = (questionId, optionId) => {
    setAnswers(prevAnswers => {
      const updatedAnswers = { ...prevAnswers };
      if (!updatedAnswers[questionId]) {
        updatedAnswers[questionId] = [];
      }
      if (updatedAnswers[questionId].includes(optionId)) {
        updatedAnswers[questionId] = updatedAnswers[questionId].filter(id => id !== optionId);
      } else {
        updatedAnswers[questionId].push(optionId);
      }
      return updatedAnswers;
    });
  };

  const handleSubmit = () => {
    const allAnswered = questions.every(q => answers[q.id] && answers[q.id].length > 0);
    if (!allAnswered) {
      Alert.alert('Please answer all questions before submitting.');
      return;
    }

    checkEligibility();
  };

  const checkEligibility = async () => {
    try {
      function haveCommonItems(arr1, arr2) {
        const set1 = new Set(arr1);
        const commonItems = arr2.filter(item => set1.has(item));
        return commonItems.length > 0;
      }

      let eligibleSchemes = [];

      schemes.forEach((scheme) => {
        let bool = true;
        scheme.schemeQuestions.forEach((SQ) => {
          let existingQuestion = answers[SQ.question];

          if (!haveCommonItems(SQ.option, existingQuestion)) {
            bool = false;
          }
        });

        if (bool) {
          eligibleSchemes.push({ id: scheme.id, name: scheme.Name });
        }
      });

      console.log("eligibleSchemes", eligibleSchemes);

      if (!name) {
        console.error('Name is missing or undefined');
      }
      if (!phoneNumber) {
        console.error('Phone Number is missing or undefined');
      }
      if (!userData.ProgramId) {
        console.error('Program ID is missing or undefined');
      }

      if (!answers || Object.keys(answers).length === 0) {
        console.error('Answers are missing or undefined');
      }

      const formattedAnswers = questions.map(q => ({
        id: q.id,
        conceptName: q.ConceptName,
        selectedOptions: (answers[q.id] || []).map(optionId => {
          const option = q.options.find(o => o.id === optionId);
          return { id: optionId, name: option ? option.name : 'Unknown' };
        })
      }));

      if (name && phoneNumber && userData.ProgramId && answers) {
        await firestore().collection('Members').add({
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
    } catch (error) {
      console.error('Error checking eligibility and saving data: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Name"
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
        onPress={() => setShowModal(true)}
      />
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
                <Text style={styles.questionText}>{`${index + 1}. ${question.ConceptName}`}</Text>
                {question.options.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      answers[question.id] && answers[question.id].includes(option.id) && styles.selectedOption
                    ]}
                    onPress={() => handleAnswerSelect(question.id, option.id)}
                  >
                    <Text style={styles.optionText}>{option.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
            <Button
              title="Submit"
              onPress={handleSubmit}
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
});
