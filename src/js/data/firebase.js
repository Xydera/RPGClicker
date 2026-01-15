// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  query,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';

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
export const db = getFirestore(app);
export const auth = getAuth(app);

// --- Debounce setup ---
const DEBOUNCE_MS = 3000;
const playerTimers = {};

// Update/create leaderboard entry (debounced)
export function updateLeaderboard(player) {
  if (!player?.id) {
    console.error("Player ID missing! Cannot update leaderboard.");
    return;
  }

  if (playerTimers[player.id]) clearTimeout(playerTimers[player.id]);

  playerTimers[player.id] = setTimeout(async () => {
    try {
      const ref = doc(db, "leaderboard", player.id);
      await setDoc(ref, {
        id: player.id,
        name: player.name,
        level: player.level,
        money: player.money,
        kills: player.kills?.total || 0,
        updatedAt: new Date()
      }, { merge: true });

      console.log("Leaderboard updated:", player.name);
    } catch (err) {
      console.error("Failed to update leaderboard:", err);
    }
    playerTimers[player.id] = null;
  }, DEBOUNCE_MS);
}

// Real-time leaderboard listener
export function getLeaderboardSnapshot(callback, top = 25) {
  try {
    const q = query(collection(db, "leaderboard"), orderBy("money", "desc"), limit(top));
    return onSnapshot(q, snapshot => {
      const leaderboard = [];
      snapshot.forEach(doc => leaderboard.push(doc.data()));
      callback(leaderboard);
    }, error => {
      console.error("Firestore snapshot error:", error);
    });
  } catch (err) {
    console.error("Failed to set up leaderboard listener:", err);
  }
}