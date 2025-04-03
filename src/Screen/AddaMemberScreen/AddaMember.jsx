// AddaMember.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, ScrollView,
  Modal, ActivityIndicator, TouchableWithoutFeedback, FlatList, Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import AadharScanner from '../../components/AadharScanner';
import { UserLocationContext } from '../../contexts/UserlocationContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import colors from '../../styles/colors';
import { apiPost } from '../../utils/apiService';
import { CHECK_ELIGIBLITY } from '../../config/urls';
import { fetchFamilies,fetchSchemesAndDocuments, fetchQuestions } from '../../utils/dbServices/AddaMemberService';




export default function AddaMember({ navigation }) {
  const { programData, permissions, userData } = useAuth();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [questions, setQuestions] = useState([]);
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
  const [tempDob, setTempDob] = useState(dob);
  const [families, setFamilies] = useState([]);
  const [filteredFamilies, setFilteredFamilies] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedFamilyId, setSelectedFamilyId] = useState('');
  const userId = userData?.uid;
  const [isCreatingNewFamily, setIsCreatingNewFamily] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');

  useEffect(() => {
    console.log(programData);
  }, []);

  useEffect(() => {
    // Fetch families using dbService
    const loadFamilies = async () => {
      try {
        const fetchedFamilies = await fetchFamilies(userData?.ProgramId);
        setFamilies(fetchedFamilies);
        setFilteredFamilies(fetchedFamilies.slice(0, 5));
      } catch (error) {
        console.error('Error fetching families: ', error);
      }
    };
    loadFamilies();
  }, [userData?.ProgramId]);

  const handleSearch = (text) => {
    setSearchText(text);
    if (text) {
      const filtered = families.filter(family =>
        family.FamilyName.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredFamilies(filtered);
    } else {
      setFilteredFamilies(families.slice(0, 5));
    }
  };

  const handleFamilySelect = (familyName, familyId) => {
    setSelectedFamily(familyName);
    setSelectedFamilyId(familyId);
    setModalVisible(false);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = selectedDate.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      setTempDob(formattedDate);
      setDob(formattedDate);
    } else if (event.type === 'dismissed') {
      setDob(tempDob);
    }
  };

  const showDatepicker = () => {
    setTempDob(dob);
    setShowDatePicker(true);
  };

  const handleScanComplete = (data) => {
    if (data) {
      setName(data.name);
      setLastFourDigits(data.lastFourDigits);
      setDob(data.dob);
      setShowScanner(false);
      setManualEntry(false);
    }
  };

  
  const loadSchemesDocumentsQuestions = async (schemeIds, documentIds) => {
    try {
      const {
        fetchedSchemes,
        fetchedDocuments,
        schemeQuestions,
        documentQuestions
      } = await fetchSchemesAndDocuments(schemeIds, documentIds);
      
      setSchemes(fetchedSchemes);
      setDocuments(fetchedDocuments);
      setSchemeQuestions(schemeQuestions);
      setDocumentQuestions(documentQuestions);
      
      const allQuestions = [...schemeQuestions, ...documentQuestions];
      const questionsData = await fetchQuestions(allQuestions);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error fetching schemes, documents or questions: ', error);
    }
  };

  const handleAnswerSelect = (questionId, optionId, type) => {
    setAnswers(prevAnswers => {
      const updatedAnswers = { ...prevAnswers };
      if (type === 'multiple') {
        if (!updatedAnswers[questionId]) updatedAnswers[questionId] = [];
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
      [questionId]: [value]
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
  
      if (!memberSnapshot?.empty) {
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
                setLoading(true);
                try {
                  const memberDoc = memberSnapshot.docs[0];
                  const existingAnswers = memberDoc.data().QuestionAnswers || [];
                  const prefilledAnswers = {};
                  existingAnswers.forEach(answer => {
                    if (Array.isArray(answer.selectedOptions) && answer.selectedOptions.length > 0) {
                      const isNumber = !isNaN(answer.selectedOptions[0]);
                      prefilledAnswers[answer.id] = isNumber
                        ? answer.selectedOptions
                        : answer.selectedOptions.map(option => option.id);
                    }
                  });
                  setAnswers(prefilledAnswers);
  
                  await loadSchemesDocumentsQuestions(programData.schemes, programData.documents);
                  setShowModal(true);
                } catch (fetchError) {
                  console.error('Error fetching data for update:', fetchError);
                  Alert.alert('Error fetching data. Please try again.');
                } finally {
                  setLoading(false);
                }
              },
            },
          ],
          { cancelable: true }
        );
      } else {
        await loadSchemesDocumentsQuestions(programData.schemes, programData.documents);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error checking member existence or fetching schemes and documents: ', error);
      Alert.alert('Error checking member existence or fetching schemes and documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  

  
  const checkEligibility = async () => { 
    setLoading(true);
    // console.log('CheckEligibility',CHECK_ELIGIBLITY)
    try {
      const response = await apiPost(CHECK_ELIGIBLITY, {
        name,
        phoneNumber,
        lastFourDigits,
        dob,
        answers,
        questions,
        schemes,
        documents,
        programData,
        userData,
        location,
        selectedFamilyId,
        isCreatingNewFamily,
        newFamilyName
      });
      
      // Check for response.ok and parse JSON data accordingly
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Data saved successfully!');
        navigation.navigate('EligibleDocumentSchemes', {
          eligibleSchemesDetails: data.eligibleSchemesDetails,
          eligibleDocumentsDetails: data.eligibleDocumentsDetails,
          name,
          phoneNumber
        });
      } else {
        Alert.alert(data.error || 'Error checking eligibility and saving data');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error checking eligibility and saving data. Please try again.');
    } finally {
      setLoading(false);
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
          {/* Dropdown for Selecting or Creating a Family */}
          <Text style={styles.label}>Select or Create Family</Text>
          <View style={styles.pickerinput}>
          <Picker
            selectedValue={isCreatingNewFamily ? 'create' : 'select'}
            style={styles.picker}
           
            mode="dropdown"
            onValueChange={(value) => {
              if (value === 'create') {
                setIsCreatingNewFamily(true);
                setSelectedFamily(''); // Clear selected family when creating a new one
              } else {
                setIsCreatingNewFamily(false);
              }
            }}
          >
            <Picker.Item label="Create a New Family" value="create" />
            <Picker.Item label="Select Family" value="select" />
          </Picker>
          <Icon
    name="arrow-drop-down"
    size={responsiveFontSize(3)} // Adjust size as needed
    color="gray" // Set to a visible color
    style={styles.pickerIcon}
  />
</View>
          {/* Conditionally show TextInput for creating a new family or the existing family selection */}
          {isCreatingNewFamily ? (
            <TextInput
              placeholder="Enter Family Name"
              value={newFamilyName}
              onChangeText={setNewFamilyName}
              style={styles.input}
              placeholderTextColor="gray"
            />
          ) : (
            <TouchableOpacity style={styles.input} onPress={() => setModalVisible(true)}>
              <Text style={styles.inputText}>{selectedFamily || 'Search Family'}</Text>
              <Icon name="search" size={20} color="gray" style={styles.searchIcon} />
            </TouchableOpacity>
          )}

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
            placeholderTextColor={'gray'}
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
      color:'black'
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
    pickerIcon: {
      position: 'absolute',
      right: responsiveWidth(2.5),
      top: Platform.OS === 'android' ? responsiveHeight(1.8) : responsiveHeight(2.5),
      pointerEvents: 'none', // Ensures the icon doesn't intercept touch events
    },
    picker: {
      flex: 1,
      color: 'black',
    },
    pickerinput: {
      borderWidth: 0.5,
      borderColor: colors.greyHeading,
      paddingHorizontal: responsiveWidth(1.5),
      paddingVertical: Platform.OS === 'android' ? 0 : responsiveHeight(1),
      borderRadius: responsiveWidth(4),
      marginBottom: responsiveHeight(2),
      backgroundColor: colors.themewhite,
      flexDirection: 'row',
      alignItems: 'center',
      position: 'relative',
    },
  });
  