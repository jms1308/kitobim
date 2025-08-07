
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  projectId: 'kitob-bozori',
  appId: '1:943356218150:web:17303cb3f5b7b45632cfe7',
  storageBucket: 'kitob-bozori.firebasestorage.app',
  apiKey: 'AIzaSyA6YV1fDvxm6Bk06lZ8E4rcj9p8w6T-lqs',
  authDomain: 'kitob-bozori.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '943356218150',
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

export { db, auth };
