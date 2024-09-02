import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, ScrollView,
   Modal, ActivityIndicator, 
   TouchableWithoutFeedback,
   FlatList} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import AadharScanner from '../../components/AadharScanner';
import { UserLocationContext } from '../../contexts/UserlocationContext';
import DateTimePicker from '@react-native-community/datetimepicker';
//import { Picker } from '@react-native-picker/picker';
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
  const [documents, setDocuments] = useState([]);
  const [schemeQuestions, setSchemeQuestions] = useState([]);
  const [documentQuestions, setDocumentQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const { location } = useContext(UserLocationContext);
  const [dob, setDob] = useState('');
  const [tempDob, setTempDob] = useState(dob); // Temporary state for DOB
  const [families, setFamilies] = useState([]);
  const [filteredFamilies, setFilteredFamilies] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedFamilyId,setSelectedFamilyId] = useState('');

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const familiesRef = firestore().collection('Family');
        const familiesSnapshot = await familiesRef
          .where('ProgramId', '==', userData?.ProgramId)
          .get();
  
        const fetchedFamilies = familiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
  
        setFamilies(fetchedFamilies);
        setFilteredFamilies(fetchedFamilies.slice(0, 5)); // Set initial state to first 5 families
      } catch (error) {
        console.error('Error fetching families: ', error);
      }
    };
  
    fetchFamilies();
  }, [userData?.ProgramId]);
  

const handleSearch = (text) => {
  setSearchText(text);
  if (text) {
    const filtered = families.filter((family) =>
      family.FamilyName.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredFamilies(filtered);
  } else {
    setFilteredFamilies(families.slice(0, 5)); // Show up to 5 families initially
  }
};


const handleFamilySelect = (familyName, familyId) => {
  setSelectedFamily(familyName);
  
  setSelectedFamilyId(familyId);
  setModalVisible(false);
  // Store the family ID to use in submission logic
};



const handleDateChange = (event, selectedDate) => {
  setShowDatePicker(false); // Hide the date picker after selection

  if (event.type === 'set' && selectedDate) {
    // If the user pressed "OK", update both tempDob and dob
    const day = selectedDate.getDate().toString().padStart(2, '0');
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = selectedDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    setTempDob(formattedDate); // Set the temporary DOB
    setDob(formattedDate); // Update the actual DOB state
  } else if (event.type === 'dismissed') {
    // If the user pressed "Cancel", do nothing, and restore tempDob
    setDob(tempDob); // Restore to last selected date
  }
};

const showDatepicker = () => {
  setTempDob(dob); // Save the current DOB before showing the picker
  setShowDatePicker(true);
};


  
  const handleScanComplete = (data) => {
   
    if (data) {
      setName(data.name);
      setLastFourDigits(data.lastFourDigits);
      setDob(data.dob); // Set DOB value
      setShowScanner(false);
      setManualEntry(false);
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
      [questionId]: [value] // Storing value as an array to be consistent with other answer types
    }));
  };

  const handleSubmit = async () => {
    if (!name || !phoneNumber) {
      Alert.alert('Please enter both name and phone number.');
      return;
    }
  
    setLoading(true);
    try {
      const membersRef = firestore().collection('Members');
      const normalizedName = name.toLowerCase();
      const memberQuery = membersRef
        .where('AadharlastFourDigits', '==', lastFourDigits)
        .where('normalizedName', '==', normalizedName)
        .where('ProgramId', '==', userData?.ProgramId);
      const memberSnapshot = await memberQuery.get();
  
      if (!memberSnapshot.empty) {
        Alert.alert(
          'Member already exists',
          'Do you want to update the details?',
          [
            {
              text: 'Cancel',
              onPress: () => {
                // Reset form on cancel
                setName('');
                setPhoneNumber('');
                setLastFourDigits('');
                setDob('');
                setAnswers({});
                setQuestions([]);
                setSchemes([]);
                setDocuments([]);
                setSchemeQuestions([]);
                setDocumentQuestions([]);
                setCurrentQuestionIndex(0);
                setManualEntry(false);
                setShowScanner(false);
                setShowModal(false);
                setTempDob('');
                Alert.alert('Form has been reset.');
              },
              style: 'cancel',
            },
            {
              text: 'Update',
              onPress: async () => {
                setLoading(true); // Show loader while fetching data
                try {
                  // Fetch the existing answers to pre-fill
                  const memberDoc = memberSnapshot.docs[0];
                  const existingAnswers = memberDoc.data().QuestionAnswers || [];
                  const prefilledAnswers = {};
                  existingAnswers.forEach(answer => {
                    // Check if answer is a number-type question or MCQ
                    if (Array.isArray(answer.selectedOptions) && answer.selectedOptions.length > 0) {
                      const isNumber = !isNaN(answer.selectedOptions[0]);
                      prefilledAnswers[answer.id] = isNumber
                        ? answer.selectedOptions // Directly set the answer
                        : answer.selectedOptions.map(option => option.id);
                    }
                  });
                  setAnswers(prefilledAnswers);
  
                  // Proceed to fetch schemes and documents
                  await fetchSchemesAndDocuments(programData.schemes, programData.documents);
                  setShowModal(true);
                } catch (fetchError) {
                  console.error('Error fetching data for update:', fetchError);
                  Alert.alert('Error fetching data. Please try again.');
                } finally {
                  setLoading(false); // Stop loading after fetching
                }
              },
            },
          ],
          { cancelable: true }
        );
      } else {
        await fetchSchemesAndDocuments(programData.schemes, programData.documents);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error checking member existence or fetching schemes and documents: ', error);
      Alert.alert('Error checking member existence or fetching schemes and documents. Please try again.');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  
  
  

  const checkEligibility = async () => {
    try {
      let newMemberData = {
        aadhar: lastFourDigits,
        phone: phoneNumber,
        name: name,
      };
  
      function haveCommonItems(arr1, arr2) {
        const set1 = new Set(arr1);
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
  
            if (SQ.option?.Operation) {
              const answerValue = Number(existingQuestion);
              const inputValue = Number(SQ.option.inputValue[0]);
  
              switch (SQ.option.Operation) {
                case '==':
                  if (inputValue !== answerValue) bool = false;
                  break;
                case '!=':
                  if (inputValue === answerValue) bool = false;
                  break;
                case '>':
                  if (answerValue <= inputValue) bool = false;
                  break;
                case '<':
                  if (answerValue >= inputValue) bool = false;
                  break;
                case '>=':
                  if (answerValue < inputValue) bool = false;
                  break;
                case '<=':
                  if (answerValue > inputValue) bool = false;
                  break;
                case 'between':
                  const [min, max] = SQ.option.inputValue.map(Number);
                  if (answerValue < min || answerValue > max) bool = false;
                  break;
                default:
                  break;
              }
            } else if (!SQ.option?.Operation && !haveCommonItems(SQ.option?.options || SQ.option, existingQuestion)) {
              bool = false;
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
        if (document.schemeQuestions) {
          document.schemeQuestions.forEach((DQ) => {
            let existingQuestion = answers[DQ.question];
  
            if (DQ.option?.Operation) {
              const answerValue = Number(existingQuestion);
              const inputValue = Number(DQ.option.inputValue[0]);
  
              switch (DQ.option.Operation) {
                case '==':
                  if (inputValue !== answerValue) bool = false;
                  break;
                case '!=':
                  if (inputValue === answerValue) bool = false;
                  break;
                case '>':
                  if (answerValue <= inputValue) bool = false;
                  break;
                case '<':
                  if (answerValue >= inputValue) bool = false;
                  break;
                case '>=':
                  if (answerValue < inputValue) bool = false;
                  break;
                case '<=':
                  if (answerValue > inputValue) bool = false;
                  break;
                case 'between':
                  const [min, max] = DQ.option.inputValue.map(Number);
                  if (answerValue < min || answerValue > max) bool = false;
                  break;
                default:
                  break;
              }
            } else if (!DQ.option?.Operation && !haveCommonItems(DQ.option?.options || DQ.option, existingQuestion)) {
              bool = false;
            }
          });
        }
  
        if (bool) {
          eligibleDocuments.push({ id: document.id, name: document.Name });
          eligibleDocumentsDetails.push(document);
        }
      });
  
      const formattedAnswers = questions.map(q => ({
        id: q.id,
        conceptName: q.ConceptName,
        selectedOptions: q.ConceptType === 'Number'
          ? (answers[q.id] && answers[q.id][0] !== undefined ? [answers[q.id][0]] : [''])
          : (answers[q.id] || []).map(optionId => {
            const option = q.options.find(o => o.id === optionId);
            return { id: optionId, name: option ? option.name : 'Unknown' };
          })
      }));
  
      let normalizedName = name.toLowerCase();
      const membersRef = firestore().collection('Members');
      const memberQuery = membersRef
        .where('AadharlastFourDigits', '==', lastFourDigits)
        .where('normalizedName', '==', normalizedName)
        .where('ProgramId', '==', userData.ProgramId);
      const memberSnapshot = await memberQuery.get();
  
      let memberId;
      if (!memberSnapshot.empty) {
        const memberDoc = memberSnapshot.docs[0];
        memberId = memberDoc.id;
        await memberDoc.ref.update({
          QuestionAnswers: formattedAnswers,
          eligibleSchemes: eligibleSchemes,
          eligibleDocuments: eligibleDocuments,
          phoneNumber: phoneNumber,
          dob: dob,
          FamilyId: selectedFamilyId,
          location: location,
        });
  
      } else {
        const newMemberRef = await membersRef.add({
          name,
          normalizedName: name.toLowerCase(),
          phoneNumber,
          dob,
          AadharlastFourDigits: lastFourDigits,
          ProgramId: userData.ProgramId,
          QuestionAnswers: formattedAnswers,
          eligibleSchemes: eligibleSchemes,
          eligibleDocuments: eligibleDocuments,
          FamilyId: selectedFamilyId,
          location: location,
        });
        memberId = newMemberRef.id;
      }
  
      // Update the selected family with new member details
      const familyRef = firestore().collection('Family').doc(selectedFamilyId);
      await familyRef.update({
        MemberAadharList: firestore.FieldValue.arrayUnion(newMemberData.aadhar),
        MemberIds: firestore.FieldValue.arrayUnion(memberId),
        MemberNames: firestore.FieldValue.arrayUnion(newMemberData.name),
        MemberPhoneNumbers: firestore.FieldValue.arrayUnion(newMemberData.phone),
      });
  
      navigation.navigate('EligibleDocumentSchemes', { eligibleSchemesDetails, eligibleDocumentsDetails, name, phoneNumber });
      Alert.alert('Data saved successfully!');
  
    } catch (error) {
      console.error('Error checking eligibility and saving data: ', error);
    }
  };
  
  
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {questions.length === 0 && (
        <>
          {showScanner ? (
            <AadharScanner onScan={handleScanComplete} />
          ) : (
            <View style={styles.container}>
              {/* Family Selection */}
              <Text style={styles.label}>Select Family</Text>
              <TouchableOpacity style={styles.input} onPress={() => setModalVisible(true)}>
                <Text style={styles.inputText}>{selectedFamily || 'Search Family'}</Text>
                <Icon name="search" size={20} color="gray" style={styles.searchIcon} />
              </TouchableOpacity>
  
              {/* Modal for Family Selection */}
              <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
              >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                  <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <TextInput
                      placeholder="Search Family"
                      style={styles.searchInput}
                      value={searchText}
                      onChangeText={handleSearch}
                      placeholderTextColor="gray"
                    />
                 <FlatList
  data={filteredFamilies.slice(0, 5)}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <TouchableOpacity onPress={() => handleFamilySelect(item.FamilyName, item.id)}>
      <Text style={styles.categoryItem}>{item.FamilyName}</Text>
    </TouchableOpacity>
  )}
  style={styles.categoryList}
/>
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                      <Icon name="close" size={35} color="gray" />
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
  
              <TouchableOpacity style={styles.button} onPress={() => setShowScanner(true)}>
                <Text style={styles.buttonText}>SCAN AADHAR</Text>
              </TouchableOpacity>
  
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  Alert.alert(
                    'Manual Entry',
                    'Do you want to enter information manually?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'OK', onPress: () => setManualEntry(true) },
                    ],
                    { cancelable: true }
                  )
                }
              >
                <Text style={styles.buttonText}>ENTER MANUALLY</Text>
              </TouchableOpacity>
  
              <TextInput
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholderTextColor="gray"
                editable={manualEntry} // Disable unless manualEntry is true
              />
  
              <Text style={styles.label}>Select Date of Birth</Text>
              <TouchableOpacity
                style={styles.input} // Reusing input style for consistency
                onPress={showDatepicker}
                disabled={!manualEntry} // Disable unless manualEntry is true
              >
                <Text style={{ color: dob ? '#000' : 'gray' }}>
                  {dob || 'Select DOB'}
                </Text>
              </TouchableOpacity>
  
              {showDatePicker && (
                <DateTimePicker
                  value={dob ? new Date(dob.split('/').reverse().join('-')) : new Date()} // Use last selected date or current date
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()} // Optional: Prevent future dates
                />
              )}
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
                editable={manualEntry} // Disable unless manualEntry is true
              />
  
              <TouchableOpacity style={styles.proceedButton} onPress={handleSubmit}>
                <Text style={styles.proceedButtonText}>PROCEED</Text>
              </TouchableOpacity>
            </View>
          )}
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
            <Text style={styles.questionText}>{`${currentQuestionIndex + 1}. ${questions[currentQuestionIndex].ConceptName}`}</Text>
            {questions[currentQuestionIndex].ConceptType === 'Number' ? (
              <TextInput
                style={styles.numberInput}
                keyboardType="numeric"
                value={
                  answers[questions[currentQuestionIndex].id]
                    ? answers[questions[currentQuestionIndex].id][0] // Directly use the first element for number
                    : '' // Default to an empty string if undefined
                }
                placeholder="Enter Your Answer"
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
    </ScrollView>
  );
  }
  
  const styles = StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      padding: 20,
    },
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff',
    },
    label: {
      fontSize: 16,
      color: '#333',
      marginBottom: 8,
    },
    input: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 12,
      backgroundColor: '#f8f8f8',
      marginBottom: 16,
    },
    inputText: {
      color: '#333',
      fontSize: 16,
    },
    searchIcon: {
      marginLeft: 10,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    modalContent: {
      width: '80%',
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 10,
      elevation: 10,
    },
    categoryList: {
      maxHeight: 200,
      marginBottom: 16,
    },
    categoryItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      color: 'black',
    },
    closeButton: {
      position: 'absolute',
      top: -5,
      right: 0,
    },
    searchInput: {
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
      flexGrow: 1,
      justifyContent: 'space-between',
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
    },
    button: {
      backgroundColor: '#3B82F6',
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 28,
      marginVertical: 10,
      alignItems: 'center',
      elevation: 3, // Add shadow for Android
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 }, // Add shadow for iOS
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    proceedButton: {
      backgroundColor: '#3B82F6',
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 28,
      marginVertical: 20,
      alignItems: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
    proceedButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
  