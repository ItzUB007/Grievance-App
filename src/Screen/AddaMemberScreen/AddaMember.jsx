import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

export default function AddaMember() {
  const { programData, permissions, userData } = useAuth();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    console.log('Program Data: ', programData);
    fetchSchemes(programData.schemes);
  }, [programData]);

  const fetchSchemes = async (schemeIds) => {
    console.log('Fetching schemes with IDs: ', schemeIds);
    try {
      const schemeQuery = await firestore().collection('Schemes').where(firestore.FieldPath.documentId(), 'in', schemeIds).get();
      const schemes = schemeQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('SchemesData :',schemes);


      const schemeQuestions = [];
      schemes.forEach(scheme => {
        scheme.schemeQuestions.forEach(question => {
          schemeQuestions.push({ question: question.question, correctOption: question.option });
        });
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
    setAnswers(prevAnswers => ({ ...prevAnswers, [questionId]: optionId }));
  };

  const handleSubmit = () => {
    const allAnswered = questions.every(q => answers[q.id]);
    if (!allAnswered) {
      Alert.alert('Please answer all questions before submitting.');
      return;
    }

    checkEligibility();
  };

  const checkEligibility = async () => {
    try {
      const correctAnswers = await Promise.all(
        questions.map(async (q) => {
          const doc = await firestore().collection('Schemes').doc(q.id).get();
          return doc.data().schemeQuestions.find(sq => sq.question === q.id);
        })
      );

      const isEligible = correctAnswers.every(ca => answers[ca.question] === ca.correctOption);
      const eligibilityStatus = isEligible ? 'eligible' : 'not eligible';
      Alert.alert(isEligible ? 'You are eligible for the Scheme' : 'You are not eligible for the Scheme');

      await firestore().collection('Members').add({
        name,
        phoneNumber,
        programId: programData.programId,
        eligibility: eligibilityStatus,
        answers
      });
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
        title="Submit"
        onPress={() => setShowModal(true)}
      />
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        style={{marginVertical:100}}
      >
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {questions.map((question, index) => (
              <View key={question.id} style={styles.questionContainer}>
                <Text style={styles.questionText}>{`${index + 1}. ${question.ConceptName}`}</Text>
                {question.options.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      answers[question.id] === option.id && styles.selectedOption
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
    color:'black'
  },
  optionButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 5,
    color:'blue'
  },
  selectedOption: {
    backgroundColor: '#cce5ff',
  },
  optionText: {
    fontSize: 16,
    color:'blue'
  },
});

