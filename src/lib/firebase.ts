// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// Enable offline persistence. This should be done only once.
if (typeof window !== 'undefined') {
  try {
    enableIndexedDbPersistence(db)
      .catch((err) => {
        if (err.code == 'failed-precondition') {
          console.warn("Firebase persistence failed: multiple tabs open.");
        } else if (err.code == 'unimplemented') {
          console.warn("Firebase persistence not available in this browser.");
        }
      });
  } catch (error) {
      console.error("Error enabling offline persistence: ", error);
  }
}

export { db, auth };
