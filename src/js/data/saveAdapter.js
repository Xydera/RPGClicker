// src/js/data/saveAdapter.js
import { rehydrateAll } from './../rehydrate.js';
import { updateLeaderboard } from './firebase.js';
import { db, doc, getDoc, setDoc } from './firebaseConfig.js';

const LOCAL_KEY = 'dungeonClicker_v0.2';
const SAVE_DEBOUNCE_MS = 1500;
let saveTimeout = null;
let _autoSaveId = null;

/**
 * Convert any game state (with class instances) into plain JSON
 * so it can be safely stored in Firestore.
 */
function serializeForFirestore(state) {
  try {
    return JSON.parse(JSON.stringify(state));
  } catch (err) {
    console.warn("Failed to serialize game state for Firestore:", err);
    return {};
  }
}

export const SaveAdapter = {
  // ----------------------
  // Save immediately
  // ----------------------
  async saveNow(game, instanceId = null, userId = null) {
    if (!game?.player) return;

    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }

    const state = game.serialize();

    // ----------------------
    // LocalStorage
    // ----------------------
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Local save failed', err);
    }

    // ----------------------
    // Leaderboard
    // ----------------------
    updateLeaderboard(game.player);

    // ----------------------
    // Discord cloud save
    // ----------------------
    if (instanceId) {
      try {
        const docId = `${instanceId}-${userId ?? 'discord-user'}`;
        const plainState = serializeForFirestore(state);

        await setDoc(doc(db, 'discordSaves', docId), {
          instanceId,
          userId: userId ?? 'discord-user',
          updatedAt: new Date(),
          game: plainState
        }, { merge: true });

        console.log('Discord cloud save successful');
      } catch (err) {
        console.warn('Discord cloud save failed:', err);
      }
    }
  },

  // ----------------------
  // Save debounced
  // ----------------------
  saveDebounced(game, instanceId = null, userId = null) {
    if (!game?.player) return;

    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      SaveAdapter.saveNow(game, instanceId, userId);
      saveTimeout = null;
    }, SAVE_DEBOUNCE_MS);
  },

  // ----------------------
  // Load previous save
  // ----------------------
  async load(instanceId = null, userId = null) {
    let game = null;

    try {
      // ----------------------
      // Load local save first
      // ----------------------
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) game = rehydrateAll(JSON.parse(raw));

      // ----------------------
      // Load cloud save (Discord)
      // ----------------------
      if (instanceId) {
        try {
          const docId = `${instanceId}-${userId ?? 'discord-user'}`;
          const docSnap = await getDoc(doc(db, 'discordSaves', docId));
          if (docSnap.exists()) {
            const cloudData = docSnap.data();
            if (cloudData?.game) game = rehydrateAll(cloudData.game);
          }
        } catch (err) {
          console.warn('Firebase load failed:', err);
        }
      }

      return game;
    } catch (err) {
      console.error('Load failed:', err);
      return null;
    }
  },

  // ----------------------
  // Clear save
  // ----------------------
  clear() {
    try {
      localStorage.removeItem(LOCAL_KEY);
      localStorage.setItem('skipSave', '1'); // prevent autosave on reload
      console.log('Save cleared 🗑️');
    } catch (err) {
      console.error('Clear failed', err);
    }
  },

  // ----------------------
  // Auto-save
  // ----------------------
  startAutoSave(game, instanceId = null, userId = null, intervalMs = 60000) {
    if (_autoSaveId) return _autoSaveId;

    _autoSaveId = setInterval(() => {
      if (localStorage.getItem('skipSave') === '1') {
        localStorage.removeItem('skipSave');
        return;
      }
      try {
        SaveAdapter.saveNow(game, instanceId, userId);
      } catch (err) {
        console.error('Autosave failed', err);
      }
    }, intervalMs);

    return _autoSaveId;
  },

  stopAutoSave() {
    if (_autoSaveId) {
      clearInterval(_autoSaveId);
      _autoSaveId = null;
    }
  }
};
