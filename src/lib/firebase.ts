// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZo2m9kGP-b19SolAzMnFaBCS53TVD9fo",
  authDomain: "expenseai-rwiad.firebaseapp.com",
  projectId: "expenseai-rwiad",
  storageBucket: "expenseai-rwiad.firebasestorage.app",
  messagingSenderId: "798836222016",
  appId: "1:798836222016:web:400d77234a25498a1317a5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);