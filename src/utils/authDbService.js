import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const fetchUserAndDbService = async () => {
  const currentUser = auth().currentUser;
  if (!currentUser) return { user: null, permissions: [], programs: null };

  const userId = currentUser.uid;
  const userDoc = await firestore().collection('users').doc(userId).get();
  
  if (userDoc.exists) {
    const userData = userDoc.data();
    const roleDoc = await firestore().collection('Roles').doc(userData.roleId).get();
    
    let permissions = [];
    if (roleDoc.exists) {
      const roleData = roleDoc.data();
      const permissionsIds = roleData.PermissionIds || [];
      const permissionsPromises = permissionsIds.map((id) => firestore().collection('Permissions').doc(id).get());
      const permissionsDocs = await Promise.all(permissionsPromises);
      permissions = permissionsDocs.map(doc => doc.data().Name);
    }

    let programData = null;
    if (userData.ProgramId) {
      const programDoc = await firestore().collection('Programs').doc(userData.ProgramId).get();
      if (programDoc.exists) {
        programData = programDoc.data();
      }
    }
    
    return { user: userData, permissions, programs: programData };
  }
  
  return { user: null, permissions: [], programs: null };
};

export { fetchUserAndDbService };
