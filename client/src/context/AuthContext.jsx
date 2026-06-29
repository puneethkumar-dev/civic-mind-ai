import { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, isInitialized, initError } from '../services/firebaseConfig';
import { loginWithGoogle as loginWithGoogleService, logoutUser, onAuthStateChangedListener } from '../services/authService';
import { getOrCreateUserDoc } from '../services/firestoreService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getFriendlyErrorMessage = (error) => {
    if (!error) return null;
    const code = error.code || '';
    if (code === 'auth/popup-closed-by-user') {
      return 'The login popup was closed before completion. Please try again.';
    }
    if (code === 'auth/network-request-failed') {
      return 'A network request error occurred. Please verify your internet connection.';
    }
    if (code === 'auth/permission-denied' || error.message?.includes('permission')) {
      return 'Database Access Denied: You do not have permissions to read/write this user record.';
    }
    return error.message || 'An unexpected error occurred during authentication. Please try again.';
  };

  const loginWithGoogle = async (requestedRole = null) => {
    if (!isInitialized) {
      setError(`Authentication is unavailable: ${initError?.message || 'Firebase not initialized.'}`);
      return;
    }

    if (!navigator.onLine) {
      setError('You are currently offline. Please reconnect to the internet to sign in.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const fbUser = await loginWithGoogleService();
      const userDoc = await getOrCreateUserDoc(fbUser);
      
      let finalRole = userDoc.role || 'citizen';
      if (requestedRole && requestedRole !== userDoc.role) {
        finalRole = requestedRole;
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          await updateDoc(userDocRef, { role: requestedRole });
        } catch (dbErr) {
          console.warn('Could not update role in Firestore, using selected role in state:', dbErr.message);
        }
      }

      setUser({
        uid: fbUser.uid,
        displayName: fbUser.displayName || userDoc.displayName || 'Citizen',
        email: fbUser.email,
        photoURL: fbUser.photoURL || userDoc.photoURL || '',
        role: finalRole,
        points: userDoc.points !== undefined ? userDoc.points : 0,
        badges: userDoc.badges || [],
      });
    } catch (err) {
      console.error('Login process error:', err);
      setError(getFriendlyErrorMessage(err));
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    if (!isInitialized) {
      setUser(null);
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } catch (err) {
      console.error('Logout process error:', err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleUserRole = async () => {
    if (!user) return;
    if (!isInitialized) {
      setError('Firebase not initialized. Cannot update user roles.');
      return;
    }
    const newRole = user.role === 'admin' ? 'citizen' : 'admin';
    const userDocRef = doc(db, 'users', user.uid);
    setLoading(true);
    setError(null);
    try {
      await updateDoc(userDocRef, { role: newRole });
      setUser((prev) => ({
        ...prev,
        role: newRole,
      }));
    } catch (err) {
      console.error('Error updating user role in Firestore:', err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const loginDeveloperMock = async (role = 'citizen', customName = null) => {
    setError(null);
    setLoading(true);
    try {
      if (isInitialized && auth.currentUser) {
        try {
          await auth.signOut();
        } catch (signOutErr) {
          console.warn('Firebase signout during mock login failed:', signOutErr.message);
        }
      }
      let mockUid = role === 'admin' ? 'mock-admin-uid-123' : 'mock-citizen-uid-456';
      let mockDisplayName = role === 'admin' ? 'Admin Officer' : 'Lakshmi Prasad';
      let mockEmail = role === 'admin' ? 'admin@civicmind.gov' : 'citizen@civicmind.org';

      if (role === 'citizen' && customName) {
        mockDisplayName = customName;
        if (customName === 'Vikas Shah') {
          mockUid = 'mock-citizen-uid-789';
          mockEmail = 'vikas@civicmind.org';
        } else if (customName === 'Karan Malhotra') {
          mockUid = 'mock-citizen-uid-321';
          mockEmail = 'karan@civicmind.org';
        }
      }
      
      const mockUser = {
        uid: mockUid,
        displayName: mockDisplayName,
        email: mockEmail,
        photoURL: '',
        role: role,
        points: 120,
        badges: ['Helper'],
      };

      if (isInitialized) {
        try {
          const userDocRef = doc(db, 'users', mockUid);
          await setDoc(userDocRef, {
            uid: mockUid,
            displayName: mockDisplayName,
            email: mockEmail,
            role: role,
            createdAt: serverTimestamp(),
            points: 120,
            badges: ['Helper'],
          }, { merge: true });
        } catch (dbErr) {
          console.warn('Could not write mock user to Firestore, proceeding with local state:', dbErr.message);
        }
      }

      setUser(mockUser);
    } catch (err) {
      console.error('Mock login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) {
      setError(`Firebase Initialization Error: ${initError?.message || 'Check environment variables.'}`);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChangedListener(async (fbUser) => {
      if (fbUser) {
        try {
          const userDoc = await getOrCreateUserDoc(fbUser);
          setUser({
            uid: fbUser.uid,
            displayName: fbUser.displayName || userDoc.displayName || 'Citizen',
            email: fbUser.email,
            photoURL: fbUser.photoURL || userDoc.photoURL || '',
            role: userDoc.role || 'citizen',
            points: userDoc.points !== undefined ? userDoc.points : 0,
            badges: userDoc.badges || [],
          });
        } catch (err) {
          console.error('Error fetching user document on auth status change:', err);
          setError(getFriendlyErrorMessage(err));
          setUser({
            uid: fbUser.uid,
            displayName: fbUser.displayName || 'Citizen',
            email: fbUser.email,
            photoURL: fbUser.photoURL || '',
            role: 'citizen',
            points: 0,
            badges: [],
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateUserPoints = async (amount) => {
    if (!user) return;
    const newPoints = (user.points || 0) + amount;
    setUser(prev => prev ? { ...prev, points: newPoints } : null);

    // If online, also update user's points doc in Firestore
    if (isInitialized && auth.currentUser) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { points: newPoints }, { merge: true });
      } catch (err) {
        console.warn('Error updating points in Firestore:', err.message);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, isOffline, loginWithGoogle, loginDeveloperMock, logout, toggleUserRole, clearError, updateUserPoints }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
