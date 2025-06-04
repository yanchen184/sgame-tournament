// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCigfC9SYs8RGwRmF4dAnNJ_qyCu_bFSig",
  authDomain: "squash-72502.firebaseapp.com",
  projectId: "squash-72502",
  storageBucket: "squash-72502.firebasestorage.app",
  messagingSenderId: "592036326649",
  appId: "1:592036326649:web:54d1a65a5d2da819504628",
  measurementId: "G-1W5NH4GCW0"
};

// Initialize Firebase
let app;
let db;
let auth;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  
  // Initialize Firestore
  db = getFirestore(app);
  
  // Initialize Auth
  auth = getAuth(app);
  
  // Initialize Analytics (only in production)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    analytics = getAnalytics(app);
  }
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  
  // Fallback: create a mock database for development
  db = null;
  auth = null;
  analytics = null;
}

export { db, auth, analytics };
export default app;