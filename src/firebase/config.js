import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAMUj-krSK1AyikMXk0wz0C8N7C68rMBpU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "academy-app-26019.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "academy-app-26019",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "academy-app-26019.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "134371771937",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:134371771937:web:b47689ee8ca1ed04e70560"
};

let app = null;
let auth = null;
let db = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase initialization warning (running in offline mode):", error);
}

export { app, auth, db };
