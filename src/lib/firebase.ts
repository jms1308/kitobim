// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

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

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let persistenceEnabled = false;

if (typeof window !== 'undefined') {
    // Initialize Firebase
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);

    // Enable offline persistence only once
    if (!persistenceEnabled) {
        try {
            enableIndexedDbPersistence(db)
                .then(() => {
                    persistenceEnabled = true;
                    console.log("Firebase persistence enabled.");
                })
                .catch((err) => {
                    if (err.code == 'failed-precondition') {
                        console.warn("Firebase persistence failed: multiple tabs open. Persistence might not work.");
                        persistenceEnabled = true; // Still mark as "attempted" to avoid retries
                    } else if (err.code == 'unimplemented') {
                        console.warn("Firebase persistence not available in this browser.");
                    }
                });
        } catch (error) {
            console.error("Error enabling offline persistence: ", error);
        }
    }
} else {
    // Server-side rendering or build environment
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
}


export { db, auth };
