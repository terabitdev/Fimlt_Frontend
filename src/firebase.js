// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDX3mfPP56yz451ncumMiUZtD_6N0zgcPQ",
  authDomain: "daily-helper-74a49.firebaseapp.com",
  databaseURL: "https://daily-helper-74a49.firebaseio.com",
  projectId: "daily-helper-74a49",
  storageBucket: "daily-helper-74a49.appspot.com",
  messagingSenderId: "243906716015",
  appId: "1:243906716015:web:538223570176de4e1d489a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);