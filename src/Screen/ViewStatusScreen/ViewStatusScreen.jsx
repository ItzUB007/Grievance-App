// ViewStatusScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ViewStatusScreen = () => {
  return (
    <View style={styles.container}>
      <Text>View Status</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default ViewStatusScreen;
