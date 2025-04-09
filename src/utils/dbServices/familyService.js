// src/services/familyService.js
import firestore from '@react-native-firebase/firestore';

/**
 * Fetches members for a given ProgramId.
 * @param {string} ProgramId 
 * @returns {Array} members list
 */
export const fetchMembers = async (ProgramId) => {
  try {
    const membersRef = firestore().collection('Members');
    const snapshot = await membersRef.where('ProgramId', '==', ProgramId).get();
    const membersList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return membersList;
  } catch (error) {
    throw error;
  }
};

/**
 * Updates the given family document with the selected members.
 * Also updates each member's FamilyId field accordingly.
 * @param {Object} family - The current family object.
 * @param {Array} selectedMembers - Array of selected member IDs.
 * @param {Array} members - Full members list to lookup additional member details.
 * @returns {Promise<boolean>}
 */
export const updateFamilyMembers = async (family, selectedMembers, members) => {
  try {
    const familyRef = firestore().collection('Family').doc(family.id);
    const updatedMemberNames = [];
    const updatedMemberAadharList = [];
    const updatedMemberPhoneNumbers = [];

    // Determine new members (added) and removed members
    const newMembers = selectedMembers.filter(id => !family.MemberIds.includes(id));
    const removedMembers = family.MemberIds.filter(id => !selectedMembers.includes(id));

    selectedMembers.forEach(memberId => {
      const member = members.find(m => m.id === memberId);
      if (member) {
        updatedMemberNames.push(member.name);
        updatedMemberAadharList.push(member.AadharlastFourDigits);
        updatedMemberPhoneNumbers.push(member.phoneNumber);
      }
    });

    // Update the family document with new member arrays and IDs
    await familyRef.update({
      MemberNames: updatedMemberNames,
      MemberAadharList: updatedMemberAadharList,
      MemberPhoneNumbers: updatedMemberPhoneNumbers,
      MemberIds: selectedMembers
    });

    // Update each member's FamilyId field accordingly
    const addFamilyIdToMember = async (memberId) => {
      const memberRef = firestore().collection('Members').doc(memberId);
      await memberRef.update({ FamilyId: family.id });
    };

    const removeFamilyIdFromMember = async (memberId) => {
      const memberRef = firestore().collection('Members').doc(memberId);
      await memberRef.update({ FamilyId: "" });
    };

    await Promise.all(newMembers.map(addFamilyIdToMember));
    await Promise.all(removedMembers.map(removeFamilyIdFromMember));

    return true;
  } catch (error) {
    throw error;
  }
};


/**
 * Creates a new family document and updates each selected member's FamilyId.
 *
 * @param {string} familyName - The name for the new family.
 * @param {Array} selectedMembers - Array of selected member IDs.
 * @param {Array} members - The full members list (used to look up details).
 * @param {string} ProgramId - The program ID for filtering.
 *
 * @returns {Promise<string>} - The newly created family document ID.
 */
export const createFamily = async (familyName, selectedMembers, members, ProgramId) => {
    if (!familyName || selectedMembers.length === 0) {
      throw new Error('Please enter a family name and select at least one member.');
    }
  
    // Get detailed data for selected members
    const selectedMembersData = members.filter(member => selectedMembers.includes(member.id));
  
    // Log the selected members data for debugging
    console.log('Selected Members Data:', selectedMembersData);
  
    const memberAadharList = selectedMembersData.map(member => member.AadharlastFourDigits);
    const memberNames = selectedMembersData.map(member => member.name);
    const memberPhoneNumbers = selectedMembersData.map(member => member.phoneNumber);
  
    const familyData = {
      FamilyName: familyName,
      MemberIds: selectedMembers,
      MemberAadharList: memberAadharList,
      ProgramId: ProgramId,
      MemberNames: memberNames,
      MemberPhoneNumbers: memberPhoneNumbers,
    };
  
    console.log('Family Data to be created:', familyData);
  
    // Create the family document
    const familyRef = await firestore().collection('Family').add(familyData);
    const familyId = familyRef.id;
  
    console.log('Family created with ID:', familyId);
  
    // Helper function to update FamilyId for a given member
    const updateMemberFamilyId = async (memberId) => {
      console.log(`Updating member ${memberId} with FamilyId: ${familyId}`);
      const memberRef = firestore().collection('Members').doc(memberId);
      await memberRef.update({ FamilyId: familyId });
    };
  
    // Run the update for each selected member
    await Promise.all(selectedMembersData.map(member => {
      console.log('Processing member with id:', member.id);
      return updateMemberFamilyId(member.id);
    }));
  
    return familyId;
  };
