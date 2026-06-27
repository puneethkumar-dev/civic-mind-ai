import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Clean config map using strip-quotes helper if quotes are included in string
const cleanEnvVar = (value) => {
  if (!value) return '';
  return value.replace(/^["']|["']$/g, ''); // strip leading/trailing quotes
};

const firebaseConfig = {
  apiKey: cleanEnvVar(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: cleanEnvVar(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnvVar(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnvVar(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  appId: cleanEnvVar(import.meta.env.VITE_FIREBASE_APP_ID),
};

const hasRequiredEnv = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'YOUR_FIREBASE_PROJECT_ID';

let app = null;
let auth = null;
let db = null;
let storage = null;
let googleProvider = null;
let isInitialized = false;
let initError = null;

if (hasRequiredEnv) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    isInitialized = true;
  } catch (error) {
    console.error('Firebase SDK failed to initialize:', error);
    initError = error;
  }
} else {
  initError = new Error('Firebase environment variables are missing or configured with default placeholder values.');
}

export { app, auth, db, storage, googleProvider, isInitialized, initError };
