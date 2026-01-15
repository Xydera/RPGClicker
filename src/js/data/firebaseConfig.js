// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

  const firebaseConfig = {
    apiKey: "AIzaSyBOwALyE3QRObcRkQmTR4axszufS_szbxQ",
    authDomain: "rpgclicker-47d8a.firebaseapp.com",
    projectId: "rpgclicker-47d8a",
    storageBucket: "rpgclicker-47d8a.firebasestorage.app",
    messagingSenderId: "250207786655",
    appId: "1:250207786655:web:5d436d50a2a2e01708b4aa",
    measurementId: "G-72HY2MWV7H"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, doc, getDoc, setDoc };
