import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC4eNenhMt5Xxuv_I6OC2nFFYjnNJfQbB4",
  authDomain: "bogey-462fa.firebaseapp.com",
  projectId: "bogey-462fa",
  storageBucket: "bogey-462fa.appspot.com", // Fixed this line - should be appspot.com not firebasestorage.app
  messagingSenderId: "185320406244",
  appId: "1:185320406244:web:35a4e6e25a6f29ece2c0f1",
  measurementId: "G-DWWS7SNNZF"
};

// Initialize Firebase - fixed to properly call getApps()
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);