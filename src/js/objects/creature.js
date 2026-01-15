import { monsters } from "../data/monster.js";

// js/creature.js
export class Creature {
  constructor(data = {}) {
    this.name = data.name || 'Slime';
    this.level = data.level || 1;
    this.baseHealth = data.baseHealth || 10;
    this.baseGold = data.baseGold || 1;
    this.baseXp = data.baseXp || 1;
    this.baseDamage = data.baseDamage;
    this.maxDamage = data.maxDamage || Math.floor(this.baseDamage * this.level);
    this.maxHealth = data.maxHealth || Math.floor(this.baseHealth * this.level);
    this.attackChance = data.attackChance || .25;
    this.currentHealth = data.currentHealth ?? this.maxHealth;
    this.levelReq = data.levelReq || 1;
  }

  spawnNext(player) {
    // Filter monsters that the player can fight
    const available = monsters.filter(m => (m.levelReq || 1) <= player.level);

    // If somehow none are available, fallback to weakest monsters
    const pool = available.length > 0 ? available : monsters;

    // Pick a random one from the filtered list
    const monster = pool[Math.floor(Math.random() * pool.length)];

    // Determine level scaling (±2 levels around player)
    const monsterLevel = Math.max(1, player.level + Math.floor(Math.random() * 3) - 1);

    // Apply monster data
    this.name = monster.name || 'Slime';
    this.level = monsterLevel;
    this.baseHealth = monster.health || 10;
    this.baseGold = monster.gold || 1;
    this.baseXp = monster.xp || 1;
    this.baseDamage = monster.damage || 1;
    this.attackChance = monster.attackChance || 0.25;

    // Scale stats based on monster level
    this.maxHealth = Math.floor(this.baseHealth * this.level);
    this.maxDamage = Math.floor(this.baseDamage * this.level);
    this.currentHealth = this.maxHealth;
  }

  toJSON() {
    return { name:this.name, level:this.level, baseDamage:this.baseDamage, baseHealth:this.baseHealth, baseXP:this.baseXp,
      baseGold:this.baseGold, maxHealth:this.maxHealth, maxDamage:this.maxDamage, currentHealth:this.currentHealth, attackChance: this.attackChance };
  }
}
