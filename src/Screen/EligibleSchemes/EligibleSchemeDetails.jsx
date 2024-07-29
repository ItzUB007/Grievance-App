import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const EligibleSchemeDetails = ({ route }) => {
  const { schemeDetails, schemeId } = route.params;
  const [scheme, setScheme] = useState(schemeDetails);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(!schemeDetails);
  const [operation, setOperation] = useState('')
  const [inputValue, setInputValue] = useState([])

  useEffect(() => {
    const fetchSchemeDetails = async () => {
      if (!schemeDetails && schemeId) {
        setLoading(true);
        try {
          const schemeDoc = await firestore().collection('Schemes').doc(schemeId).get();
          if (schemeDoc.exists) {
            const schemeData = schemeDoc.data();
            setScheme(schemeData);
            await fetchQuestions(schemeData.schemeQuestions);
          } else {
            Alert.alert('Error', 'Scheme not found.');
          }
        } catch (error) {
          console.error('Error fetching scheme details: ', error);
          Alert.alert('Error', 'Failed to fetch scheme details.');
        } finally {
          setLoading(false);
        }
      } else {
        await fetchQuestions(schemeDetails.schemeQuestions);
      }
    };

    const fetchQuestions = async (schemeQuestions) => {
      if (Array.isArray(schemeQuestions)) {
        try {
          const fetchedQuestions = await Promise.all(
            schemeQuestions.map(async (schemeQuestion) => {
              const questionDoc = await firestore().collection('MemberQuestions').doc(schemeQuestion.question).get();
              const questionData = questionDoc.data();
              let correctOptions = [];
              setOperation(schemeQuestion.option.Operation)
                setInputValue(schemeQuestion?.option?.inputValue)
                console.log('Operation',schemeQuestion.option.Operation);
                console.log('InputValue',schemeQuestion?.option?.inputValue);

              if (schemeQuestion.option.options) {
                const nestedOptionDocs = await Promise.all(
                  schemeQuestion.option.options.map(async (nestedOptionId) => {
                    const nestedOptionDoc = await firestore().collection('Options').doc(nestedOptionId).get();
                    return nestedOptionDoc.data();
                  })
                );
                correctOptions = nestedOptionDocs;
              } else if (Array.isArray(schemeQuestion.option)) {
                const correctOptionDocs = await Promise.all(
                  schemeQuestion.option.map(async (optionId) => {
                    const optionDoc = await firestore().collection('Options').doc(optionId).get();
                    return optionDoc.data();
                  })
                );
                correctOptions = correctOptionDocs;
              }

              return {
                question: questionData?.ConceptName,
                questionType : questionData?.ConceptType,
                options: correctOptions.map(option => {
                  if (option.nestedOptions) {
                    return {
                      name: option.Name,
                      nestedOptions: option.nestedOptions.map(nestedOption => nestedOption.Name),
                    };
                  }
                  return option.Name;
                }),
              };
            })
          );
          setQuestions(fetchedQuestions);
          console.log('QuestionData',fetchedQuestions);
        } catch (error) {
          console.error('Error fetching questions: ', error);
          Alert.alert('Error', 'Failed to fetch questions.');
        }
      }
    };

    fetchSchemeDetails();
  }, [schemeDetails, schemeId]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if(!schemeId && !schemeDetails ) {

    return (
      <View style={styles.permissionContainer}>
        <View style={styles.innerContainer}>
          <Text style={styles.errorText}>
          Schemes Details is not available  
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {scheme && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailText}>Scheme Name: {scheme.Name}</Text>
          <Text style={styles.detailText}>Application Method: {scheme.ApplicationMethod}</Text>
          <Text style={styles.detailText}>Govt Fee: {scheme.GovtFee}</Text>
          <Text style={styles.detailText}>Description: {scheme.Description}</Text>
          <Text style={styles.detailText}>Eligibility: {scheme.Eligibility}</Text>
          <Text style={styles.detailText}>Scheme Type: {scheme.SchemeType}</Text>
          <Text style={styles.detailText}>Benefit Description: {scheme.benefitDescription}</Text>
          <Text style={styles.detailText}>Process: {scheme.process}</Text>
        </View>
      )}
      {questions.length > 0 && (
        <View style={styles.questionsContainer}>
          <Text style={styles.questionHeader}>Questions and Correct Options:</Text>
          {questions.map((question, index) => (
            <View key={index} style={styles.questionContainer}>
              <Text style={styles.questionText}>{question.question}</Text>
              <Text style={styles.optionText}>
                Correct Options: {Array.isArray(question.options) ? question.options.map(option =>
                  typeof option === 'string' ? option : `${option.name} (Nested: ${option.nestedOptions.join(', ')})`
                ).join(', ') : question.options} {question.questionType == 'Number' && `${"See Operation & Values"}`}
              </Text>
              {question.questionType == 'Number' && 
                  <Text style={styles.optionText}>Operation : {operation}</Text>
          
                  }
                     {question.questionType == 'Number' && 
                   <Text style={styles.optionText}>
                   Value: {inputValue.length > 1 ? inputValue.join(', ') : inputValue}
                 </Text>
                  
                  }
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  detailsContainer: {
    backgroundColor: 'white',
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
    color: '#333',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionsContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  questionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },  permissionContainer: {
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

export default EligibleSchemeDetails;
