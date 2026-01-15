// src/js/utils/safeGame.js

/**
 * Safely trigger achievement check or other optional game features.
 * This avoids errors when game or its submodules aren't fully loaded.
 */
export function safeCheckAchievements(game) {
  try {
    game?.achievements?.check?.(game);
  } catch (e) {
    console.error('Achievement check failed:', e);
  }
}

/**
 * Example reusable helper for other optional calls (like save)
 */
export function safeSave(game) {
  try {
    game?.save?.();
  } catch (e) {
    console.error('Game save failed:', e);
  }
}
