import { rehydrateAll } from './../rehydrate.js';
import { updateLeaderboard } from './firebase.js';

let saveTimeout = null;
const SAVE_DEBOUNCE_MS = 1500;
const KEY = 'dungeonClicker_v0.2';
let _autoSaveId = null;

// ----------------------
// Core save functions
// ----------------------
function saveImmediate(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Save failed', err);
  }
}

export function saveDebouncedWithLeaderboard(game) {
  if (!game?.player) return;

  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveImmediate(game.serialize());
    saveTimeout = null;

    // Update Firestore leaderboard
    updateLeaderboard(game.player);
  }, SAVE_DEBOUNCE_MS);
}

export function saveNowWithLeaderboard(game) {
  if (!game?.player) return;

  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }

  saveImmediate(game.serialize());
  updateLeaderboard(game.player);
}

// ----------------------
// Load & clear
// ----------------------
export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;

    // Parse and automatically rehydrate classes (Sword, Potion, etc)
    const game = JSON.parse(raw);
    return rehydrateAll(game);
  } catch (err) {
    console.error('Load failed', err);
    return null;
  }
}

export function clear() {
  console.log('Clearing save data');
  try {
    localStorage.removeItem(KEY);
    localStorage.setItem('skipSave', '1'); // guard against autosave
  } catch (err) {
    console.error('clear() failed', err);
  }
}

// ----------------------
// Autosave
// ----------------------
export function startAutoSave(game, intervalMs = 60000) {
  if (_autoSaveId) return _autoSaveId;

  _autoSaveId = setInterval(() => {
    if (localStorage.getItem('skipSave') === '1') {
      localStorage.removeItem('skipSave');
      return;
    }

    try {
      saveNowWithLeaderboard(game);
    } catch (e) {
      console.error('Autosave failed:', e);
    }
  }, intervalMs);

  return _autoSaveId;
}

export function stopAutoSave() {
  if (_autoSaveId) {
    clearInterval(_autoSaveId);
    _autoSaveId = null;
  }
}
