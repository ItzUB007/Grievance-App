// dbService.js
import firestore from '@react-native-firebase/firestore';

// Fetch families based on ProgramId
export const fetchFamilies = async (programId) => {
  try {
    const familiesRef = firestore().collection('Family');
    const familiesSnapshot = await familiesRef.where('ProgramId', '==', programId).get();
    return familiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

// Fetch schemes and documents, then process questions from them
export const fetchSchemesAndDocuments = async (schemeIds, documentIds) => {
  try {
    // Fetch schemes
    const schemeQuery = await firestore()
      .collection('Schemes')
      .where(firestore.FieldPath.documentId(), 'in', schemeIds)
      .get();
    const fetchedSchemes = schemeQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch documents
    const documentQuery = await firestore()
      .collection('Documents')
      .where(firestore.FieldPath.documentId(), 'in', documentIds)
      .get();
    const fetchedDocuments = documentQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const schemeQuestions = [];
    const documentQuestions = [];

    // Process scheme questions
    fetchedSchemes.forEach(scheme => {
      if (scheme.schemeQuestions) {
        scheme.schemeQuestions.forEach(question => {
          schemeQuestions.push({
            question: question.question,
            correctOptions: question.option,
            TypeOfMCQ: question.option?.TypeOfMCQ
          });
        });
      }
    });

    // Process document questions
    fetchedDocuments.forEach(document => {
      if (document.schemeQuestions) {
        document.schemeQuestions.forEach(question => {
          documentQuestions.push({
            question: question.question,
            correctOptions: question.option,
            TypeOfMCQ: question.option?.TypeOfMCQ
          });
        });
      }
    });

    return {
      fetchedSchemes,
      fetchedDocuments,
      schemeQuestions,
      documentQuestions
    };
  } catch (error) {
    throw error;
  }
};

// Fetch questions data with options
export const fetchQuestions = async (allQuestions) => {
  try {
    const questionIds = [...new Set(allQuestions.map(q => q.question))];
    const questionQuery = await firestore()
      .collection('MemberQuestions')
      .where(firestore.FieldPath.documentId(), 'in', questionIds)
      .get();
    const questionsData = questionQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // For each question, fetch related options
    const optionPromises = questionsData.flatMap(question =>
      question.ConceptOptions
        ? question.ConceptOptions.map(optionId =>
            firestore().collection('Options').doc(optionId).get()
          )
        : []
    );
    const optionDocs = await Promise.all(optionPromises);
    const options = optionDocs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Map options to questions
    questionsData.forEach(question => {
      question.options = question.ConceptOptions
        ? question.ConceptOptions.map(optionId => {
            const foundOption = options.find(o => o.id === optionId);
            return { id: optionId, name: foundOption ? foundOption.Name : 'Unknown' };
          })
        : [];
    });

    // Update questions with additional MCQ info from allQuestions
    allQuestions.forEach(item => {
      if (item.TypeOfMCQ) {
        questionsData.forEach(q => {
          if (q.id === item.question) {
            q.TypeOfMCQ = item.TypeOfMCQ;
          }
        });
      }
    });

    return questionsData;
  } catch (error) {
    throw error;
  }
};
