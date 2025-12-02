// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB8W2KLVHZot4zP9_1fmgEs5E_ne1HXMos",
  authDomain: "restaurant-e4c24.firebaseapp.com",
  projectId: "restaurant-e4c24",
  storageBucket: "restaurant-e4c24.firebasestorage.app",
  messagingSenderId: "1052527169070",
  appId: "1:1052527169070:web:cbc682c4d4703496a2d9bf",
  measurementId: "G-FG953XJB2X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);