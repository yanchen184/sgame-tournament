// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v9-compat and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCigfC9SYs8RGwRmF4dAnNJ_qyCu_bFSig",
  authDomain: "squash-72502.firebaseapp.com",
  databaseURL: "https://squash-72502-default-rtdb.firebaseio.com",
  projectId: "squash-72502",
  storageBucket: "squash-72502.firebasestorage.app",
  messagingSenderId: "592036326649",
  appId: "1:592036326649:web:54d1a65a5d2da819504628",
  measurementId: "G-1W5NH4GCW0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

console.log('Firebase initialized with project:', firebaseConfig.projectId);
console.log('Firestore initialized:', !!db);

export default app;