import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore'

// This is a server-only module.

let db: Firestore;

function initializeDbOnServer() {
    if (!getApps().length) {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
    } else {
        db = getFirestore(getApp());
    }
    return db;
}

export function getDb(): Firestore {
  if (!db) {
    db = initializeDbOnServer();
  }
  return db;
}
