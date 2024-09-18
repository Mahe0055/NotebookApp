// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZwwsvLvtn5XOiwZ6EJKBb44GxCPfbMII",
  authDomain: "notebook-abf81.firebaseapp.com",
  projectId: "notebook-abf81",
  storageBucket: "notebook-abf81.appspot.com",
  messagingSenderId: "1009157378188",
  appId: "1:1009157378188:web:83fae6867a8f7390daeba9",
  measurementId: "G-TYY10GP1ML"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getFirestore(app)
export { app, database }