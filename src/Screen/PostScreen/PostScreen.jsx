import React, { useState, useEffect } from 'react';
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
import auth from '@react-native-firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import storage from '@react-native-firebase/storage';
import DocumentPicker from 'react-native-document-picker';
import RNFetchBlob from 'rn-fetch-blob';

const PostScreen = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState('High');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [applicationMethod, setApplicationMethod] = useState('');
  const [documentRequired, setDocumentRequired] = useState([]);
  var [documents, setDocuments] = useState([]);

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

    fetchCategories();
    
  }, []);







  const pickDocuments = async (docName) => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
        allowMultiSelection: true,
      });
  
      res.forEach(doc => {
        console.log(`Picked document URI: ${doc.uri}, type: ${doc.type}`);
      });
  
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
  
  const getRealPathFromURI = async (uri) => {
    try {
      if (Platform.OS === 'android' && uri.startsWith('content://')) {
        const base64Data = await RNFetchBlob.fs.readFile(uri, 'base64');
        console.log(`Base64 data: ${base64Data}`);
        return base64Data;
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
  
    setLoading(true);
  
    try {
      const user = auth().currentUser;
      const userEmail = user.email;
      const userId = user.uid;
      const createdOn = new Date();
  
      const ticketData = {
        assigned_to: '',
        category: selectedCategory,
        created_on: createdOn,
        description: description,
        priority: priority,
        resolved_on: '',
        status: 'Open',
        subject: subject,
        updated_on: createdOn,
        user_email: userEmail,
        user_id: userId,
        fullName: fullName,
        phoneNo: phoneNo,
        gender: gender,
        dob: dob.toDateString(),
        category_id: categories.find(category => category.categoryName === selectedCategory)?.id || '',
        applicationMethod: applicationMethod,
        documentRequired: documentRequired,
      };
  
      const ticketRef = await firestore().collection('Tickets').add(ticketData);
  
      for (const doc of documents) {
        console.log('Processing document:', doc);
        if (!doc.uri) {
          console.error('Document URI is undefined:', doc);
          continue;
        }
  
        const base64Data = await getRealPathFromURI(doc.uri);
        if (!base64Data) {
          console.error('Failed to get real path for URI:', doc.uri);
          continue;
        }
  
        const fileRef = storage().ref(`documents/${ticketRef.id}/${Date.now()}_${doc.docName}`);
        await fileRef.putString(base64Data, 'base64', { contentType: doc.type });
        const filePath = await fileRef.getDownloadURL();
        await firestore().collection('Tickets').doc(ticketRef.id).collection('Attachments').add({
          file_name: doc.docName,
          file_path: filePath,
        });
      }
  
      setLoading(false);
      Alert.alert('Ticket submitted successfully!');
      setSelectedCategory('');
      setSubject('');
      setDescription('');
      setGender('Male');
      setDob(new Date());
      setPriority('High');
      setDocuments([]);
      setFullName('');
      setPhoneNo('');
    } catch (error) {
      setLoading(false);
      console.error('Error submitting ticket: ', error);
      Alert.alert('Error submitting ticket. Please try again.');
    }
  };
  
  




  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dob;
    setShowDatePicker(false);
    setDob(currentDate);
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
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Grievance Redressal Form</Text>

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
                <Icon name="close" size={25} color="gray" />
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
        <TouchableOpacity onPress={showDatepicker} style={styles.dateButton}>
          <Text style={styles.buttonText}>Selected Date: {dob.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dob}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

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

        {/* <Text style={styles.label}>Upload Documents</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={pickDocuments}>
          <Text style={styles.uploadButtonText}>Upload Documents</Text>
        </TouchableOpacity> */}
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
              <TouchableOpacity key={index} style={styles.uploadButton} onPress={() => pickDocuments(doc)}>
                <Text style={styles.uploadButtonText} >{doc}</Text>
              </TouchableOpacity>
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
    justifyContent: 'space-between',
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
    top: 10,
    right: 10,
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
});

export default PostScreen;
