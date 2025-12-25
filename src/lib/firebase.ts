import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDSx1b2NwYUYVcVZdnzZyG4zkJgSAwISQs",
  authDomain: "cobrapro-ee07d.firebaseapp.com",
  projectId: "cobrapro-ee07d",
  storageBucket: "cobrapro-ee07d.firebasestorage.app",
  messagingSenderId: "356840104358",
  appId: "1:356840104358:web:b6a8e094fd963789576f67"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Autenticação
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore Database
export const db = getFirestore(app);