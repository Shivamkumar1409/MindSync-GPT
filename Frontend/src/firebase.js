// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC9xwKMgTSjBYsogdKjVqYaxWjTrwG8GzU",
  authDomain: "mindsync-auth.firebaseapp.com",
  projectId: "mindsync-auth",
  storageBucket: "mindsync-auth.firebasestorage.app",
  messagingSenderId: "303378011895",
  appId: "1:303378011895:web:9f471b0aa9f4cd43d3e5f2",
  measurementId: "G-4T6EFP6BMF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();