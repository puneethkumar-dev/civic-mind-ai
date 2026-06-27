import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db, isInitialized } from './firebaseConfig';

// LocalStorage issues fallback store helpers
const getLocalIssues = () => {
  try {
    const list = localStorage.getItem('civicmind_local_issues');
    return list ? JSON.parse(list) : [];
  } catch (e) {
    console.error('Error reading local storage issues:', e);
    return [];
  }
};

const saveLocalIssues = (issues) => {
  try {
    localStorage.setItem('civicmind_local_issues', JSON.stringify(issues));
  } catch (e) {
    console.error('Error writing local storage issues:', e);
  }
};

export const getOrCreateUserDoc = async (firebaseUser) => {
  if (!firebaseUser) return null;

  const userDocRef = doc(db, 'users', firebaseUser.uid);
  try {
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      };
    } else {
      const userData = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || 'Citizen',
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL || '',
        role: 'citizen',
        createdAt: serverTimestamp(),
        points: 0,
        badges: [],
      };
      
      await setDoc(userDocRef, userData);
      
      return {
        ...userData,
        createdAt: new Date(),
      };
    }
  } catch (error) {
    console.warn('Error in getOrCreateUserDoc, falling back to local user details:', error.message);
    return {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || 'Citizen',
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL || '',
      role: 'citizen',
      createdAt: new Date(),
      points: 0,
      badges: [],
    };
  }
};

export const createIssueDoc = async (issueData, user) => {
  if (!user) throw new Error('Unauthenticated user cannot create reports.');

  const trackingId = 'CM-' + Math.floor(10000 + Math.random() * 90000); // Unique 5-digit code
  const mockId = 'local-' + Math.floor(100000 + Math.random() * 900000);
  
  let issueId = mockId;
  let useFirestore = isInitialized && !user.uid.startsWith('mock-');
  let issueDocRef = null;

  if (useFirestore) {
    try {
      issueDocRef = doc(collection(db, 'issues'));
      issueId = issueDocRef.id;
    } catch (err) {
      console.warn('Firebase DB connection failed, falling back to local storage', err);
      useFirestore = false;
    }
  }

  const newIssue = {
    issueId,
    trackingId,
    reportedBy: {
      uid: user.uid,
      displayName: user.displayName || 'Citizen',
      email: user.email || '',
    },
    imageReference: issueData.imageReference || '',
    description: issueData.description || '',
    location: issueData.location || null, // { latitude, longitude, address }
    status: 'Reported',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [
      {
        title: 'Reported',
        description: 'Issue reported by citizen.',
        actor: 'Citizen',
        timestamp: new Date().toISOString(),
      }
    ]
  };

  // If using Firestore, try writing it
  if (useFirestore) {
    try {
      const firestoreIssue = {
        ...newIssue,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(issueDocRef, firestoreIssue);
      
      // Keep a local copy for merge
      const locals = getLocalIssues();
      locals.push(newIssue);
      saveLocalIssues(locals);

      return { issueId, trackingId };
    } catch (error) {
      console.warn('Firestore write permission denied, saving report locally:', error.message);
    }
  }

  // Local storage fallback
  const locals = getLocalIssues();
  locals.push(newIssue);
  saveLocalIssues(locals);

  return { issueId, trackingId };
};

export const getUserIssues = async (uid) => {
  if (!uid) return [];
  
  let localIssues = getLocalIssues().filter(issue => issue.reportedBy.uid === uid);
  
  if (!isInitialized || uid.startsWith('mock-')) {
    return localIssues.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  try {
    const issuesRef = collection(db, 'issues');
    const q = query(issuesRef, where('reportedBy.uid', '==', uid));
    const querySnapshot = await getDocs(q);
    
    const dbIssues = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      dbIssues.push({
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      });
    });

    // Merge both Firestore issues and local issues (avoid duplicate issueId)
    const merged = [...dbIssues];
    for (const local of localIssues) {
      if (!merged.some(item => item.issueId === local.issueId)) {
        merged.push(local);
      }
    }

    return merged.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.warn('Error in getUserIssues fetch, returning local issues:', error.message);
    return localIssues.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }
};

/**
 * Updates a locally stored issue in localStorage after the backend AI pipeline runs.
 * 
 * @param {string} issueId 
 * @param {object} aiAnalysis 
 * @param {Array} timeline 
 */
export const updateLocalIssue = (issueId, aiAnalysis, timeline) => {
  const list = getLocalIssues();
  const index = list.findIndex(item => item.issueId === issueId);
  if (index !== -1) {
    list[index] = {
      ...list[index],
      aiAnalysis,
      timeline,
      status: 'AI Verified',
      updatedAt: new Date().toISOString()
    };
    saveLocalIssues(list);
    console.log(`[LocalStorage] Updated issue "${issueId}" with AI decision pipeline results.`);
  }
};
