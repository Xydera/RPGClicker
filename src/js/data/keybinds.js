// keybinds.js
const STORAGE_KEY = 'game_keybinds_v1';

const DEFAULTS = {
  toggleMenu: 'Escape',
  statMenu: 's',
  exitKey: 'Escape',
  leaderboard: 'l',
  inventory: 'i',
  equipment: 'e',
  shop: 'b',
  usePotion: 'h',
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch (e) {
    console.warn('Failed to load keybinds:', e);
    return { ...DEFAULTS };
  }
}

function save(map) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('Failed to save keybinds:', e);
  }
}

let keymap = load();

export function getKeybind(action) {
  return keymap[action];
}

export function setKeybind(action, key) {
  keymap[action] = key;
  save(keymap);
}

export function resetKeybinds() {
  keymap = { ...DEFAULTS };
  save(keymap);
}

export function getAllKeybinds() {
  return { ...keymap };
}

// helper: compares keyboard event with key name (case-insensitive)
export function keyMatches(action, event) {
  if (!event || !action) return false;
  const key = getKeybind(action);
  if (!key) return false;
  // support single keys or things like "Ctrl+S" in future (basic now)
  return event.key.toLowerCase() === key.toLowerCase();
}