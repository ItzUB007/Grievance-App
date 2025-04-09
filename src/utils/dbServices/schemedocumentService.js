// src/services/dbService.js
import firestore from '@react-native-firebase/firestore';

/**
 * Fetch scheme details from the 'Documents' collection if schemeDetails not provided.
  * @param {string} schemeId 
 * @returns {Object} scheme data
 */
export const fetchDocumentDetails = async (schemeId) => {
  try {
    const schemeDoc = await firestore().collection('Documents').doc(schemeId).get();
    if (schemeDoc.exists) {
      return schemeDoc.data();
    } else {
      throw new Error('Scheme not found.');
    }
  } catch (error) {
    throw error;
  }
};
export const fetchSchemeDetails = async (schemeId) => {
    try {
      const schemeDoc = await firestore().collection('Schemes').doc(schemeId).get();
      if (schemeDoc.exists) {
        return schemeDoc.data();
      } else {
        throw new Error('Scheme not found.');
      }
    } catch (error) {
      throw error;
    }
  };

/**
 * Fetch questions based on the given schemeQuestions array.
 * Each element should include a 'question' field and an 'option' field.
 * Returns an array of question objects with their options, operation and input values.
 * @param {Array} schemeQuestions 
 * @returns {Array} fetched questions
 */
export const fetchQuestions = async (schemeQuestions) => {
  if (!Array.isArray(schemeQuestions)) return [];
  try {
    const fetchedQuestions = await Promise.all(
      schemeQuestions.map(async (schemeQuestion) => {
        const questionDoc = await firestore().collection('MemberQuestions').doc(schemeQuestion.question).get();
        const questionData = questionDoc.data();
        let correctOptions = [];
        const operation = schemeQuestion.option?.Operation;
        const inputValue = schemeQuestion?.option?.inputValue;

        // If nested options exist, fetch each nested option's data
        if (schemeQuestion.option?.options) {
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
          questionType: questionData?.ConceptType,
          options: correctOptions.map(option => {
            if (option && option.nestedOptions) {
              return {
                name: option.Name,
                nestedOptions: option.nestedOptions.map(nestedOption => nestedOption.Name),
              };
            }
            return option ? option.Name : 'Unknown';
          }),
          operation,
          inputValue
        };
      })
    );
    return fetchedQuestions;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch documents details based on schemeDocumentQuestions array.
 * Each element should include a documentQuestion field and an array of documentIds.
 * Returns an array of objects with document question name and list of document details.
 * @param {Array} schemeDocumentQuestions 
 * @returns {Array} fetched documents
 */
export const fetchDocuments = async (schemeDocumentQuestions) => {
  if (!Array.isArray(schemeDocumentQuestions)) return [];
  try {
    const fetchedDocuments = await Promise.all(
      schemeDocumentQuestions.map(async (docQuestion) => {
        const documentQuestionDoc = await firestore().collection('DocumentQuestions').doc(docQuestion.documentQuestion).get();
        const documentQuestionData = documentQuestionDoc.data();

        const documentIdsData = await Promise.all(
          docQuestion.documentIds.map(async (documentId) => {
            const documentDoc = await firestore().collection('Documents').doc(documentId).get();
            return documentDoc.data();
          })
        );

        return {
          documentQuestionName: documentQuestionData?.Name,
          documents: documentIdsData
            .map(docData => ({
              name: docData?.Name,
              required: docQuestion.required
            }))
            .filter(doc => doc.name) // filter out undefined/null names
        };
      })
    );
    return fetchedDocuments;
  } catch (error) {
    throw error;
  }
};
