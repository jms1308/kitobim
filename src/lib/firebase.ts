// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "kitob-bozori",
  "appId": "1:943356218150:web:17303cb3f5b7b45632cfe7",
  "storageBucket": "kitob-bozori.firebasestorage.app",
  "apiKey": "AIzaSyA6YV1fDvxm6Bk06lZ8E4rcj9p8w6T-lqs",
  "authDomain": "kitob-bozori.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "943356218150"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
