import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity, Alert, TextInput, Button } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { serverTimestamp } from '@react-native-firebase/firestore';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { Picker } from '@react-native-picker/picker'; // Import for dropdown picker
import { launchCamera } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import storage from '@react-native-firebase/storage';
import { useAuth } from '../../contexts/AuthContext';
import { updateDoc, doc } from '@react-native-firebase/firestore'; 
import colors from '../../styles/colors';
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import { width } from '../../styles/responsiveSize';


// Helper function to format Firestore Timestamp
const formatDate = (timestamp) => {
  if (timestamp && timestamp.seconds) {
    const date = new Date(timestamp.seconds * 1000);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`; // Adjusted formatting
  }
  return '';
};

const TicketDetails = ({ route }) => {
  const { currentUser, userData } = useAuth();
  const { ticketId } = route.params;
  const [ticketDetails, setTicketDetails] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [comments, setComments] = useState([]);
  const [statusType, setStatusType] = useState('Comment'); // Default is Comment
  const [fromStatus, setFromStatus] = useState('');
  const [toStatus, setToStatus] = useState('');
  const [commentMsg, setCommentMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]); // Store the captured photos
  const removeDocument = (index) => {
    const newDocuments = [...documents];
    newDocuments.splice(index, 1);
    setDocuments(newDocuments);
  };
  const ProgramId = userData?.ProgramId;

  // const [attachments, setAttachments] = useState([]); 

  const uploadDocumentsToFirebase = async () => {
    const uploadedFiles = await Promise.all(
      documents.map(async (doc) => {
        const fileRef = storage().ref(`Comments/Attachments/${doc.name}`); // Use Firebase Storage instead of Firestore
        await fileRef.putFile(doc.uri); // Upload file to Firebase Storage
        const filePath = await fileRef.getDownloadURL(); // Get file path after upload
        return {
          fileName: doc.name,
          filePath, // Save the file URL to be stored in Firestore
        };
      })
    );
    return uploadedFiles;
  };

  const handleAddCommentOrRequest = async () => {
    let uploadedAttachments = [];
  
    // Only attempt to upload documents if any exist
    if (documents.length > 0) {
      uploadedAttachments = await uploadDocumentsToFirebase();
    }
  
    const commentData = {
      ticketId,
      ProgramId,
      commentType: statusType,
      fromStatus: statusType === 'changeStatus' ? ticketDetails?.status : null,
      toStatus: statusType === 'changeStatus' ? toStatus : null,
      commentMsg,
      commented_by: userData?.displayName,
      commentStatus: 'Open',
      attachments: statusType === 'changeStatus' && uploadedAttachments.length > 0 ? uploadedAttachments : null,
      created_on: firestore.FieldValue.serverTimestamp(), // Set server timestamp
      updated_on: firestore.FieldValue.serverTimestamp(), // Set server timestamp
    };
  
    try {
      // Add the comment
      await firestore().collection('Comments').add(commentData);
  
      // Create a notification document
      const notificationData = {
        NotificationType: 'Ticket', // This can change based on what type of notification you're adding (Scheme, Ticket, etc.)
        TypeId: ticketId, // Ticket ID or Scheme ID
        NotificationText: commentMsg,
        NotificationBy: userData?.displayName,
        RequestType: statusType === 'changeStatus' ? 'changeStatus' : 'Comment',
        NotificationTime: firestore.FieldValue.serverTimestamp(),
        Status: 'Unread', // Initial status as Unread
        ProgramId: ProgramId // Relating the notification to the specific program
      };
  
      // Add the notification to the Notifications collection
      await firestore().collection('Notifications').add(notificationData);
  
      // Update the ticket document
      await firestore().collection('Tickets').doc(ticketId).update({
        updated_on: firestore.FieldValue.serverTimestamp(), // Only update timestamp
      });
  
      // Reset form states after submission
      setCommentMsg('');
      setFromStatus('');
      setToStatus('');
      setDocuments([]); // Clear documents after upload
  
      Alert.alert('Success', 'Comment or Status Change Request submitted successfully!');
    } catch (error) {
      console.error('Error adding comment/request: ', error);
      Alert.alert('Error', 'Failed to submit your comment or request.');
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

        const photo = { uri: res.assets[0].uri, type: res.assets[0].type, name: res.assets[0].fileName, docName };

        const updatedDocuments = documents.map(doc => (doc.docName === docName ? photo : doc));

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


  useEffect(() => {
    const unsubscribeDetails = firestore()
      .collection('Tickets')
      .doc(ticketId)
      .onSnapshot(documentSnapshot => {
        const data = documentSnapshot.data();
        // Format the date fields
        if (data.updated_on) {
          data.updated_on = formatDate(data.updated_on);
        }
        if (data.created_on) { // Ensure this field exists in your Firestore document
          data.created_on = formatDate(data.created_on);
        }
        setTicketDetails(data);
      });

    const unsubscribeAttachments = firestore()
      .collection('Tickets')
      .doc(ticketId)
      .collection('Attachments')
      .onSnapshot(querySnapshot => {
        const attachmentsArray = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAttachments(attachmentsArray);
      });

    const unsubscribeComments = firestore()
      .collection('Comments')
      .where('ticketId', '==', ticketId)
      .onSnapshot(querySnapshot => {
        const commentsArray = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(commentsArray);
      });

    return () => {
      unsubscribeDetails();
      unsubscribeAttachments();
      unsubscribeComments();
    };
  }, [ticketId]);

  const downloadAttachment = async (url, fileName) => {
    try {
      const dirs = ReactNativeBlobUtil.fs.dirs;
      const downloadDest = Platform.OS === 'ios' ? `${dirs.DocumentDir}/${fileName}` : `${dirs.DownloadDir}/${fileName}`;

      ReactNativeBlobUtil.config({
        path: downloadDest,
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: downloadDest,
          description: 'Downloading file.',
        }
      })
        .fetch('GET', url)
        .then(res => {
          if (res) {
            Alert.alert('Success', `File downloaded to ${res.path()}`);
          } else {
            Alert.alert('Error', `Failed to download file. Status code: ${res.info().status}`);
          }
        })
        .catch(err => {
          Alert.alert('Error', `Failed to download file: ${err.message}`);
        });
    } catch (error) {
      Alert.alert('Error', `An error occurred while downloading the file: ${error.message}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {ticketDetails && (
        <View>
          <View style={styles.detailsTop}></View>
       
        <View style={styles.detailsContainer}>
          
          <Text style={styles.detailText}> {ticketDetails.category}</Text>
          <Text style={styles.detailText}>Full Name: {ticketDetails.fullName}</Text>
          
          <Text style={styles.detailText}>Phone No: {ticketDetails.phoneNo}</Text>
          <Text style={styles.detailText}>Created On: {ticketDetails.created_on}</Text>
          <Text style={styles.detailText}>Updated On: {ticketDetails.updated_on}</Text>
          <Text style={styles.detailText}>Description: {"\n"} {ticketDetails.description}</Text>
          <Text style={styles.detailText}>Status: {ticketDetails.status}</Text>
        </View>
        </View>
      )}
      <Text style={styles.attachmentHeader}>Attachments:</Text>
      {attachments.map(attachment => (
        <View key={attachment.id} style={styles.attachment}>
          <Text style={styles.attachmentText}>{attachment.file_name}</Text>
          <TouchableOpacity onPress={() => downloadAttachment(attachment.file_path, attachment.file_name)}>
            <Text style={styles.attachmentLink}>Download File</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(attachment.file_path)}>
            <Text style={styles.attachmentLink}>View File</Text>
          </TouchableOpacity>
        </View>
      ))}
      <Text style={styles.commentHeader}>Comments:</Text>
      {comments.map(comment => (
        <View key={comment.id} style={styles.comment}>
          <Text style={styles.commentText}>Message: {comment.commentMsg}</Text>
          <Text style={styles.commentText}>By {comment.commented_by}</Text>
          <Text style={styles.commentText}>Comment Type : {comment.commentType}</Text>
          {comment.toStatus &&
          <Text style={styles.commentText}>Requested Status: {comment.toStatus}</Text>}
           {comment.commentStatus &&
          <Text style={styles.commentText}>Comment Status: {comment.commentStatus}</Text>}
           
          {comment.attachments &&
            <TouchableOpacity onPress={() => Linking.openURL(comment.attachments[0]?.filePath)}>
              <Text style={styles.attachmentLink}>View File</Text>
            </TouchableOpacity>}



          <Text style={styles.commentDate}>Date & Time : {formatDate(comment.updated_on)}</Text>
        </View>
      ))}
         <Text style={styles.label}>Status Type:</Text>
<View style={styles.pickerinput}>
     
        <Picker
          selectedValue={statusType}
          onValueChange={(itemValue) => setStatusType(itemValue)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
          mode="dropdown"
        >
          <Picker.Item label="Comment" value="Comment" />
          <Picker.Item label="Request Status Change" value="changeStatus" />
        </Picker>
        <Icon
    name="arrow-drop-down"
    size={responsiveFontSize(3)} // Adjust size as needed
    color="gray" // Set to a visible color
    style={styles.pickerIcon}
  />
      </View>

      {statusType === 'changeStatus' && (
        <>
          {/* <Text style={styles.commentText}>From Status: {ticketDetails?.status}</Text> */}
          <Text style={styles.commentText}>Select  Status Change:</Text>
          <View style={styles.pickerinput}>
        
            <Picker
              selectedValue={toStatus}
              onValueChange={(itemValue) => setToStatus(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              mode="dropdown"

            >
              <Picker.Item label="Open" value="Open" />
              <Picker.Item label="Pending" value="Pending" />
              <Picker.Item label="Rejected" value="Rejected" />
              <Picker.Item label="Resolved" value="Resolved" />
            </Picker>
            <Icon
    name="arrow-drop-down"
    size={responsiveFontSize(3)} // Adjust size as needed
    color="gray" // Set to a visible color
    style={styles.pickerIcon}
  />
          </View>
        </>
      )}

      <Text style={styles.commentText}>Comment:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setCommentMsg}
        value={commentMsg}
        placeholder="Add your comment here"
        placeholderTextColor={'gray'}
        
      />


      {statusType === 'changeStatus' && (
        <>
          <TouchableOpacity style={styles.uploadButton} onPress={() => takePhoto('commentAttachment')}>
            <Text style={styles.buttonText}>Add Attachment</Text>
          </TouchableOpacity>
          {documents.map((doc, index) => (
            <View key={index} style={styles.documentContainer}>
              <Text style={styles.documentText}>{doc.name}</Text>
              <TouchableOpacity onPress={() => removeDocument(index)} style={styles.removeButton}>
                <Icon name="close" size={20} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      <TouchableOpacity onPress={handleAddCommentOrRequest} style={styles.button} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Submit</Text>
        )}
      </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.themewhite,
    // margin: '0 auto'
  },
  detailsContainer: {
  // borderWidth:0.4,
  width:'90%',
  alignSelf:'center',
  padding:'8%'

  },
   detailsTop : {
      backgroundColor:colors.greyTheme,
      borderTopRightRadius:responsiveWidth(3),
      borderTopLeftRadius:responsiveWidth(3),
      width:'90%',
      alignSelf:'center',
      height:'8%',
      // paddingTop:responsiveWidth(1),
      marginTop:responsiveWidth(3)
     
  
    },
  detailText: {
    fontSize: 16,
    // marginBottom: 12,
    color: '#4a4a4a',
  },
  attachmentHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  attachment: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  attachmentText: {
    fontSize: 16,
    color: '#1e88e5', // Blue for links
  },
  attachmentLink: {
    fontSize: 14,
    color: '#4caf50', // Green for action links
    marginTop: 5,
  },
  commentHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  comment: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  commentText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    textAlign:'center'
  },
  commentDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  dropdownContainer: {
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
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
  picker: {
    flex: 1,
    color: 'black',
  },
  input: {
    height: 60,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  button: {
    backgroundColor: colors.themered,
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 15,
    // marginTop: 20,
    marginBottom:width * 0.3
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: colors.themered,
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 16,
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 15,
    marginBottom: 10,
  },
  documentText: {
    flex: 1,
    color: '#333',
  },
  removeButton: {
    marginLeft: 10,
  },
  pickerIcon: {
    position: 'absolute',
    right: responsiveWidth(2.5),
    top: Platform.OS === 'android' ? responsiveHeight(1.8) : responsiveHeight(2.5),
    pointerEvents: 'none', // Ensures the icon doesn't intercept touch events
  },
});



export default TicketDetails;

