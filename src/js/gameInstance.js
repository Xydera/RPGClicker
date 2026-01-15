// src/js/gameInstance.js
import { Player } from './objects/player.js';
import { Creature } from './objects/creature.js';
import { Sword } from './items/sword.js';
import { Potion } from './items/potion.js';
import { AchievementManager } from './objects/achievements.js';
import { load, saveNowWithLeaderboard } from './data/storage.js';
import { Armour } from './items/armour.js';

export class GameInstance {
  constructor({ player, logger }) {
    this.player = player || null;
    this.creature = null;
    this.sword = null;
    this.potion = null;
    this.armour = null;
    this.achievements = null;
    this.subscribers = [];
    this.latest = {};
    this.version = "0.2.1";

    // logger wrapper: uses injected logger, fallback to global bridge, else console
    this._logger = typeof logger === 'function'
        ? logger
        : (msg, type = 'system') => {
            if (typeof window !== 'undefined' && window.__appLogger__?.log) {
              window.__appLogger__.log(msg, type);
            } else {
              console.log(`[${type}] ${msg}`);
            }
          };

    this.initialize();
  }

    // Public logging method
  log(msg, type = 'info') {
    try { this._logger(msg, type); 
    } catch {}
  }

  // Initialize or load game state
  initialize() {
    if (this._initialized) return; // 🔒 prevent repeated init
    this._initialized = true;
    const raw = load();
    if (raw) {
      this.player = new Player(raw.player || this.player || {});
      this.creature = new Creature(raw.creature || {});
      this.sword = new Sword(raw.sword || {});
      this.potion = new Potion(raw.potion || {});
      this.armour = new Armour(raw.armour || {});
    } else {
      this.log('✨ No save found — creating new game...', 'system');
      const s = this.defaultState();
      this.player = s.player;
      this.creature = s.creature;
      this.sword = s.sword;
      this.potion = s.potion;
      this.armour = s.armour;
    }

    // Always initialize achievements
    this.achievements = new AchievementManager(this.player, this._logger);

  }

  // Default starter state
  defaultState() {
    const p = this.player ?? new Player({ name: 'Hero' });
    const c = new Creature({ name: 'Slime', level: 1, baseHealth: 10, baseGold: 1,  baseDamage: 1});
    const s = new Sword({ name: 'Common Copper Sword', level: 1, rarity: 1 });
    const po = new Potion({ name: 'Lesser Potion of Restoration', level: 1, rarity: 1, amount: 0 });
    const a = new Armour({ name: "Copper Armour", level: 1, rarity: 1});
    return { player: p, creature: c, sword: s, potion: po, armour: a };
  }

  // Subscribe / notify system for UI reactivity
  subscribe(fn) {
    this.subscribers.push(fn);
    return () => { this.subscribers = this.subscribers.filter(f => f !== fn); };
  }

  notify() {
    this.subscribers.forEach(cb => cb());
    this.save();
  }

  // Game tick logic
  tick() {
    // Any idle/passive effects can go here

    // Notify subscribers (UI, etc.)
    this.notify();
  }


  // Serialize for saving
  serialize() {
    return {
      player: this.player,
      creature: this.creature,
      sword: this.sword,
      potion: this.potion,
      armour: this.armour,
    };
  }

  // Save current game state
  save() {
    saveNowWithLeaderboard(this);
  }

  // Optional cleanup
  stop() {}
}
