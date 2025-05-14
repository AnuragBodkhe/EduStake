// Firebase Configuration
// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-hLnUmU12N9ivvIq7efYLe16O4DSLFx4",
  authDomain: "edustake-ca45d.firebaseapp.com",
  databaseURL: "https://edustake-ca45d-default-rtdb.firebaseio.com",
  projectId: "edustake-ca45d",
  storageBucket: "edustake-ca45d.appspot.com",
  messagingSenderId: "885060407436",
  appId: "1:885060407436:web:90227dc8a8f582a8726ba9",
  measurementId: "G-R7M8MT3BN6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { analytics, app, auth, database, storage };
