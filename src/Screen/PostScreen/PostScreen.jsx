import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import storage from '@react-native-firebase/storage';
import DocumentPicker from 'react-native-document-picker';
import ReactNativeBlobUtil from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import { GoogleGenerativeAI } from "@google/generative-ai";
import services from '../../utils/services';
import { useSelector } from 'react-redux';
import { launchCamera } from 'react-native-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import AadharScanner from '../../components/AadharScanner';
import { UserLocationContext } from '../../contexts/UserlocationContext';






const PostScreen = () => {
  const { currentUser, permissions, userData, programData } = useAuth();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState('High');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [applicationMethod, setApplicationMethod] = useState('');
  const [documentRequired, setDocumentRequired] = useState([]);
  const [documents, setDocuments] = useState([]);
  const isOn = useSelector((state) => state.slider.isOn);
  const ProgramId = userData?.ProgramId;
  const [state, setState] = useState('Delhi')
  const [city, setCity] = useState('')
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const { location } = useContext(UserLocationContext);
  const [tempDob, setTempDob] = useState(dob);

  const handleScanComplete = (data) => {
    if (data) {
      setFullName(data.name); // Set full name using setFullName
      setLastFourDigits(data.lastFourDigits);
      setDob(data.dob); // Set DOB value
      setShowScanner(false);
      setManualEntry(false);
    }
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


  const hasPermission = (permission) => {
    // If roleId and ProgramId match, the user has all permissions
    if (userData?.roleId === userData?.ProgramId) {
      return true;
    }
    // Otherwise, check specific permissions
    return permissions.includes(permission);
  };

  const API_KEY = services.API_KEY;
  // Access your API key (see "Set up your API key" above)
  const genAI = new GoogleGenerativeAI(API_KEY);
  // Function to call Gemini and get the suggested category
  const GeminiCategory = async (description, subject, selectedCategory, categories) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const categoryNames = categories.map(category => category.categoryName);
      const prompt = `Review the user-selected category based on the given description and subject of a customer support ticket.
       If the selected category seems inaccurate, suggest the most suitable one from the provided list. 
      Return only the category name from the Possible Categories.

    Description: ${description}
    Subject: ${subject}
    Possible Categories: ${categoryNames.join(', ')}
    User-selected category: ${selectedCategory}
    
    Rules:
    1. If the selected category is appropriate, return it directly.
    2. If the selected category is "Other" and does not match the provided possible categories,
     suggest a new category based only on the description and subject.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      console.log('Gemini Response:', text);
      return text;

    } catch (error) {
      console.log('Gemini is not Working' + error);
    }

  }


  useEffect(() => {
    const fetchCategories = async () => {
      const categoryCollection = await firestore().collection('category').get();
      const categoryData = categoryCollection.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoryData);
      setFilteredCategories(categoryData);

    };
    fetchCategories()

  }, []);

  const pickDocuments = async (docName) => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
        allowMultiSelection: true,
      });

      for (let doc of res) {
        const filePath = await getRealPathFromURI(doc.uri);
        const fileStats = await RNFS.stat(filePath);

        if (fileStats.size > 200 * 1024) {
          Alert.alert('File Too Large', `The file ${doc.name} is larger than 200KB.`);
          return;
        }
      }

      // Add docName to the picked document
      res[0].docName = docName;


      // Check if the document name already exists and replace it
      const updatedDocuments = documents.map(doc =>
        doc.docName === docName ? res[0] : doc
      );

      // If the document name does not exist, add the new document
      const isNewDoc = !documents.some(doc => doc.docName === docName);
      if (isNewDoc) {
        updatedDocuments.push(res[0]);
      }

      setDocuments(updatedDocuments);

      // Log the documents
      console.log('Updated documents:', updatedDocuments);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled document picker');
      } else {
        console.error('Document Picker Error:', err);
        Alert.alert('Document Picker Error', 'An error occurred while picking documents.');
        throw err;
      }
    }
  };

  const takePhoto = async (docName) => {
    try {
      const res = await launchCamera({
        mediaType: 'photo',
        includeBase64: true,
        maxWidth: 1024,
        maxHeight: 1024,
      });
      res.docName = docName;
      if (res.didCancel) {
        console.log('User cancelled camera');
      } else if (res.errorCode) {
        console.error('Camera Error:', res.errorMessage);
        Alert.alert('Camera Error', 'An error occurred while taking a photo.');
      } else {
        const fileStats = { size: res.assets[0].fileSize };

        if (fileStats.size > 1024 * 1024) {
          Alert.alert('File Too Large', `The file is larger than 1MB.`);
          return;
        }
        // Add docName to the picked document

        const photo = { uri: res.assets[0].uri, type: res.assets[0].type, name: res.assets[0].fileName, docName };

        const updatedDocuments = documents.map(doc =>
          doc.docName === docName ? photo : doc
        );

        const isNewDoc = !documents.some(doc => doc.docName === docName);
        if (isNewDoc) {
          updatedDocuments.push(photo);
        }

        setDocuments(updatedDocuments);

        console.log('Updated documents:', updatedDocuments);
      }
    } catch (err) {
      console.error('Camera Error:', err);
      Alert.alert('Camera Error', 'An error occurred while taking a photo.');
      throw err;
    }
  };

  const getRealPathFromURI = async (uri) => {
    try {
      if (Platform.OS === 'android' && uri.startsWith('content://')) {
        const base64Data = await ReactNativeBlobUtil.fs.readFile(uri, 'base64');
        const path = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${Date.now()}`;
        await ReactNativeBlobUtil.fs.writeFile(path, base64Data, 'base64');
        return path;
      }

      return uri;
    } catch (error) {
      console.error(`Error getting real path: ${error}`);
      return null;
    }
  };

  const onSubmit = async () => {
    if (!selectedCategory || !subject || !description || !fullName || !phoneNo || !gender) {
      Alert.alert('All fields are required!');
      return;
    }

    if (documentRequired && documentRequired.length !== documents.length) {
      Alert.alert('All Documents are required!');
      return;
    }

    setLoading(true);


    let suggestedCategory = selectedCategory;

    if (isOn) {
      suggestedCategory = await GeminiCategory(description, subject, selectedCategory, categories);

      const normalizedSelectedCategory = selectedCategory.trim().toLowerCase();
      const normalizedSuggestedCategory = suggestedCategory.trim().toLowerCase();

      if (normalizedSuggestedCategory !== normalizedSelectedCategory) {
        Alert.alert(
          'Category Suggestion',
          `The suggested category is ${suggestedCategory}. Do you want to use this instead of the selected category (${selectedCategory})?`,
          [
            {
              text: 'No',
              onPress: () => {
                continueSubmission(selectedCategory);
              },
            },
            {
              text: 'Yes',
              onPress: () => {
                continueSubmission(suggestedCategory);
              },
            },
          ]
        );
        return;
      }
    }

    continueSubmission(selectedCategory);
  };

  const continueSubmission = async (category) => {
    try {
      const user = currentUser;
      const userEmail = user.email;
      const userId = user.uid;
      const createdOn = new Date();

      const ticketData = {
        assigned_to: '',
        category: category,
        selectedCategory: selectedCategory,
        suggestedCategory: category === selectedCategory ? null : category,
        created_on: createdOn,
        description: description,
        priority: priority,
        resolved_on: '',
        status: 'Open',
        subject: subject,
        updated_on: createdOn,
        createdBy_email: userEmail,
        createdBy_userId: userId,
        fullName: fullName,
        phoneNo: phoneNo,
        gender: gender,
        dob: dob,
        state: state,
        city: city,
        location: location,
        AadharlastFourDigits: lastFourDigits,
        category_id: categories.find(cat => cat.categoryName === category)?.id || '',
        applicationMethod: applicationMethod,
        mpName: programData?.MpName,
        mpName_Hindi: programData?.MpName_Hindi,


      };
      if (ProgramId) {
        ticketData.ProgramId = ProgramId;
      }

      let normalizedName = fullName.toLowerCase();
      const ticketRef = await firestore().collection('Tickets').add(ticketData);

      // Check if a member with the same name and phone number exists
      const membersRef = await firestore().collection('Members');
      const memberQuery = membersRef.where('normalizedName', '==', normalizedName).where('AadharlastFourDigits', '==', lastFourDigits).where('ProgramId', '==', userData.ProgramId);
      const memberSnapshot = await memberQuery.get();

      if (!memberSnapshot.empty) {
        // Member exists, add the TicketId to the existing member's TicketId array
        const memberDoc = memberSnapshot.docs[0];
        await memberDoc.ref.update({
          TicketId: firestore.FieldValue.arrayUnion(ticketRef.id),
          createdBy_userId: userId,
        });
      } else {
        // Member does not exist, create a new member document
        await membersRef.add({
          name: fullName,
          normalizedName,
          dob: dob,
          location: location,
          phoneNumber: phoneNo,
          TicketId: [ticketRef.id],
          ProgramId: userData.ProgramId,
          AadharlastFourDigits: lastFourDigits,
          mpName: programData?.MpName,
          mpName_Hindi: programData?.MpName_Hindi,
          createdBy_userId: userId,

        });
      }


      if (documents) {
        for (const doc of documents) {
          console.log('Processing document:', doc);
          if (!doc.uri) {
            console.error('Document URI is undefined:', doc);
            continue;
          }

          const filePath = await getRealPathFromURI(doc.uri);
          if (!filePath) {
            console.error('Failed to get real path for URI:', doc.uri);
            continue;
          }

          const fileData = await RNFS.readFile(filePath, 'base64');
          const fileRef = storage().ref(`documents/${ticketRef.id}/${Date.now()}_${doc.docName}`);
          await fileRef.putString(fileData, 'base64', { contentType: doc.type });
          const filePathUrl = await fileRef.getDownloadURL();
          await firestore().collection('Tickets').doc(ticketRef.id).collection('Attachments').add({
            file_name: doc.docName,
            file_path: filePathUrl,
          });
        }


      }

      setLoading(false);
      Alert.alert('Ticket submitted successfully!');
      resetForm();
    } catch (error) {
      setLoading(false);
      console.error('Error submitting ticket: ', error);
      Alert.alert('Error submitting ticket. Please try again.');
    }
  };

  const resetForm = () => {
    setSelectedCategory('');
    setSubject('');
    setDescription('');
    setGender('Male');
    setDob('');
    setPriority('Medium');
    setDocuments([]);
    setFullName('');
    setPhoneNo('');


  };


  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = categories.filter(category =>
      category.categoryName.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    const selected = categories.find(category => category.categoryName === categoryName);
    if (selected) {
      setApplicationMethod(selected.applicationMethod);
      setDocumentRequired(selected.documentRequired);
    }
    setModalVisible(false);
  };

  const removeDocument = (index) => {
    const newDocuments = [...documents];
    newDocuments.splice(index, 1);
    setDocuments(newDocuments);
  };

  if (!hasPermission('ticket_add')) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.innerContainer}>
          <Text style={styles.errorText}>
            You don't have permissions to Add tickets.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Grievance Redressal Form</Text>

        {showScanner ? (
          <AadharScanner onScan={handleScanComplete} />
        ) : (
          <View style={styles.container}>
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



            <Text style={styles.label}>Select Category</Text>
            <TouchableOpacity style={styles.input} onPress={() => setModalVisible(true)}>
              <Text style={styles.inputText}>{selectedCategory || 'Search Category'}</Text>
              <Icon name="search" size={20} color="gray" style={styles.searchIcon} />
            </TouchableOpacity>

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
                    placeholder="Search Category"
                    style={styles.searchInput}
                    value={searchText}
                    onChangeText={handleSearch}
                    placeholderTextColor="gray"
                  />
                  <FlatList
                    data={filteredCategories}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity onPress={() => handleCategorySelect(item.categoryName)}>
                        <Text style={styles.categoryItem}>{item.categoryName}</Text>
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



            <Text style={styles.label}>Subject</Text>
            <TextInput
              placeholder="Subject"
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholderTextColor="gray"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              placeholder="Description"
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholderTextColor="gray"
            />

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              placeholder="Full Name"
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor="gray"
              editable={manualEntry}
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
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              placeholder="Phone Number"
              style={styles.input}
              value={phoneNo}
              onChangeText={setPhoneNo}
              placeholderTextColor="gray"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Select Gender</Text>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
              style={styles.input}
            >
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>

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
                value={dob ? new Date(dob.split('/').reverse().join('-')) : new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()} // Optional: Prevent future dates
              />
            )}
            <Text style={styles.label}>Select State</Text>
            <Picker
              selectedValue={state}
              onValueChange={(itemValue) => setState(itemValue)}
              style={styles.input}
            >
              <Picker.Item label="Andhra Pradesh" value="Andhra Pradesh" />
              <Picker.Item label="Arunachal Pradesh" value="Arunachal Pradesh" />
              <Picker.Item label="Assam" value="Assam" />
              <Picker.Item label="Bihar" value="Bihar" />
              <Picker.Item label="Chhattisgarh" value="Chhattisgarh" />
              <Picker.Item label="Delhi" value="Delhi" />
              <Picker.Item label="Goa" value="Goa" />
              <Picker.Item label="Gujarat" value="Gujarat" />
              <Picker.Item label="Haryana" value="Haryana" />
              <Picker.Item label="Himachal Pradesh" value="Himachal Pradesh" />
              <Picker.Item label="Jharkhand" value="Jharkhand" />
              <Picker.Item label="Karnataka" value="Karnataka" />
              <Picker.Item label="Kerala" value="Kerala" />
              <Picker.Item label="Madhya Pradesh" value="Madhya Pradesh" />
              <Picker.Item label="Maharashtra" value="Maharashtra" />
              <Picker.Item label="Manipur" value="Manipur" />
              <Picker.Item label="Meghalaya" value="Meghalaya" />
              <Picker.Item label="Mizoram" value="Mizoram" />
              <Picker.Item label="Nagaland" value="Nagaland" />
              <Picker.Item label="Odisha" value="Odisha" />
              <Picker.Item label="Punjab" value="Punjab" />
              <Picker.Item label="Rajasthan" value="Rajasthan" />
              <Picker.Item label="Sikkim" value="Sikkim" />
              <Picker.Item label="Tamil Nadu" value="Tamil Nadu" />
              <Picker.Item label="Telangana" value="Telangana" />
              <Picker.Item label="Tripura" value="Tripura" />
              <Picker.Item label="Uttar Pradesh" value="Uttar Pradesh" />
              <Picker.Item label="Uttarakhand" value="Uttarakhand" />
              <Picker.Item label="West Bengal" value="West Bengal" />
            </Picker>

            <Text style={styles.label}>City</Text>
            <TextInput
              placeholder="Enter Your City Name"
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholderTextColor="gray"
            />


            <Text style={styles.label}>Select Priority</Text>
            <Picker
              selectedValue={priority}
              onValueChange={(itemValue, itemIndex) => setPriority(itemValue)}
              style={styles.input}
            >
              <Picker.Item label="High" value="High" />
              <Picker.Item label="Medium" value="Medium" />
              <Picker.Item label="Low" value="Low" />
            </Picker>


            {applicationMethod && (
              <>
                <Text style={styles.label}>Application Method</Text>
                <Text style={styles.userInfo}>{applicationMethod}</Text>
              </>
            )}
            {documentRequired && (
              <>
                <Text style={styles.label}>Documents Required - Upload Documents</Text>
                {documentRequired.map((doc, index) => (
                  <View key={index} style={styles.uploadOptionsContainer}>
                    <Text style={styles.uploadOptionsLabel}>{doc}</Text>
                    <View style={styles.uploadButtons}>
                      <TouchableOpacity style={styles.uploadButton} onPress={() => pickDocuments(doc)}>
                        <Text style={styles.uploadButtonText}>Pick Document</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.uploadButton} onPress={() => takePhoto(doc)}>
                        <Text style={styles.uploadButtonText}>Take Photo</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}

            <Text style={styles.label}>Uploaded Documents</Text>
            {documents.map((doc, index) => (
              <View key={index} style={styles.documentContainer}>
                <Text style={styles.documentText}>{doc.name}</Text>
                <TouchableOpacity onPress={() => removeDocument(index)} style={styles.removeButton}>
                  <Icon name="close" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity onPress={onSubmit} style={styles.button} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Submit</Text>
              )}
            </TouchableOpacity>

          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'grey',
    padding: 12,
    borderRadius: 5,
    marginBottom: 16,
    color: 'black',
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'center', // Center text vertically in the TouchableOpacity
    alignItems: 'center',
  },
  inputText: {
    color: 'gray',
  },
  searchIcon: {
    marginLeft: 'auto',
  },
  userInfo: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 16,
  },
  uploadButton: {
    backgroundColor: '#ff6347',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateButton: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
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
    padding: 16,
    borderRadius: 10,
    elevation: 10,
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
  closeButton: {
    position: 'absolute',
    top: -5,
    right: 0,

  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'grey',
    padding: 12,
    borderRadius: 5,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  documentText: {
    flex: 1,
    color: 'black',
  },
  removeButton: {
    marginLeft: 8,
  },
  searchIcon: {
    marginLeft: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  uploadOptionsLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center'
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

export default PostScreen;
