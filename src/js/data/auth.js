// auth.js
import { auth } from './firebase.js';
import { Player } from './../objects/player';
import {
  signInAnonymously,
  onAuthStateChanged
} from 'firebase/auth';
import { load } from './storage.js';
import { createItemFromId } from './../items/item';
import { registerAllItems } from './items.js'; // make sure you call this at boot

export function initPlayer() {
  return new Promise((resolve) => {
    let raw = load();
    let player = raw?.player ? new Player(raw.player) : null;

    registerAllItems();

    onAuthStateChanged(auth, (user) => {
      if (user) {
        if (!player) {
          // ✅ Create new player with starter weapon equipped
          const starterSword = createItemFromId(1, { level: 1, uid: `starter_${Date.now()}` });
          player = new Player({
            id: user.uid,
            name: "Hero",
            inventory: [], // start with empty inventory
            equipped: {
              weapon: starterSword,
              armour: null,
              accessory: null,
              potion: null,
            },
            sword: starterSword, // combat compatibility
          });
        } else {
          // ✅ Existing player: ensure Firebase UID stays synced
          player.id = user.uid;

          // ✅ Optional safety check: if no weapon is equipped, give one
          if (!player.equipped?.weapon) {
            const starterSword = createItemFromId(1, { level: 1, uid: `starter_${Date.now()}` });
            player.equipped.weapon = starterSword;
            player.sword = starterSword;
          }
        }

        resolve(player);
      } else {
        // sign in anonymously if no user yet
        signInAnonymously(auth).catch(console.error);
      }
    });
  });
}
