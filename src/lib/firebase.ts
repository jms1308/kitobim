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

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length) {
  app = getApp();
} else {
  app = initializeApp(firebaseConfig);
}

auth = getAuth(app);
db = getFirestore(app);

if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code == 'failed-precondition') {
        console.warn(
          'Firebase persistence failed: multiple tabs open. Persistence might not work.'
        );
      } else if (err.code == 'unimplemented') {
        console.warn('Firebase persistence not available in this browser.');
      }
    });
}


export { db, auth };
