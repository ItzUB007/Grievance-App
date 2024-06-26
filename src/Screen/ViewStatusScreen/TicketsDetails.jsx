import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import ReactNativeBlobUtil from 'react-native-blob-util';

// Helper function to format Firestore Timestamp
const formatDate = (timestamp) => {
  if (timestamp && timestamp.seconds) {
    const date = new Date(timestamp.seconds * 1000);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`; // Adjusted formatting
  }
  return '';
};

const TicketDetails = ({ route }) => {
  const { ticketId } = route.params;
  const [ticketDetails, setTicketDetails] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [comments, setComments] = useState([]);

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
        <View style={styles.detailsContainer}>
          <Text style={styles.detailText}>Category Applied: {ticketDetails.category}</Text>
          <Text style={styles.detailText}>Full Name: {ticketDetails.fullName}</Text>
          <Text style={styles.detailText}>Status: {ticketDetails.status}</Text>
          <Text style={styles.detailText}>Phone No: {ticketDetails.phoneNo}</Text>
          <Text style={styles.detailText}>Created On: {ticketDetails.created_on}</Text>
          <Text style={styles.detailText}>Updated On: {ticketDetails.updated_on}</Text>
          <Text style={styles.detailText}>Description: {ticketDetails.description}</Text>
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
          <Text style={styles.commentText}>{comment.text}</Text>
     
          <Text style={styles.commentDate}>Date & Time : {formatDate(comment.updated_at)}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0' // Consistent background with ViewStatusScreen
  },
  detailsContainer: {
    backgroundColor: 'white', // Card-like style for details
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
    color: '#333' // Dark color for text for better readability
  },
  attachmentHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10
  },
  attachment: {
    backgroundColor: 'white', // Card-like style for attachments
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  attachmentText: {
    fontSize: 16,
    color: '#007BFF' // Using a bootstrap blue for links
  },
  attachmentLink: {
    fontSize: 14,
    color: '#28a745', // Bootstrap success green for actionable items
    textDecorationLine: 'underline',
    marginTop: 5
  },
  commentHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10
  },
  comment: {
    backgroundColor: 'white',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  commentText: {
    fontSize: 16,
    color: '#333'
  },
  commentDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5
  }
});

export default TicketDetails;

