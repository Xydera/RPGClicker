// src/objects/player.js
export class Player {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.name = data.name || "Adventurer";
    this.level = data.level || 1;
    this.xp = data.xp || 0;
    this.maxXp = data.maxXp || 10;
    this.health = data.health || 100;
    this.maxHealth = data.maxHealth || 100;
    this.money = data.money || 0;
    this.pityState = data.pityState || { counter: 0 }  ;
    this.kills = data.kills || {
      total: 0,
      slime: 0,
      goblin: 0,
      skeleton: 0,
      zombie: 0,
      wraith: 0,
      orc: 0,
      troll: 0,
      specter: 0,
      demon: 0,
      dragon: 0,
    };
    this.statPoints =
      data.statPoints !== undefined ? data.statPoints : 3;
    this.stats =
      data.stats || {
        defence: 0,
        critChance: 0.1,
        critDamage: 50,
        attackSpeed: 50,
        healthRegen: 100,
        total: 0,
        strength: 0,
        greed: 0,
        luck: 0,
        intelligence: 0,
        vitality: 0,
      };
    this.achievements = data.achievements || [];

    // ✅ Always ensure inventory is an array
    this.inventory = Array.isArray(data.inventory)
      ? data.inventory
      : [];

    // ✅ Always ensure equipped slots exist
    this.equipped = {
      weapon: data.equipped?.weapon || null,
      armour: data.equipped?.armour || null,
      accessory: data.equipped?.accessory || null,
      potion: data.equipped?.potion || null,
    };

    // ✅ Compatibility — some older game logic expects `player.sword`
    this.sword = data.sword || this.equipped.weapon;
    this.potion = data.potion || this.equipped.potion;
    this.armour = data.armour || this.equipped.armour;
    this.accessory = data.accessory || this.equipped.accessory;
  }

  /** ---------------------
   *     CORE LOGIC
   * --------------------- */

  addXp(n) {
    this.xp += n;
    while (this.xp >= this.maxXp) {
      this.xp -= this.maxXp;
      this.level += 1;
      this.stats.critChance += 0.05;
      this.maxXp = Math.floor(10 * Math.pow(1.5, this.level));
      this.statPoints += 3;
      this.recalcMaxHealth();;
      this.maxHeal();
    }
  }

  addGold(n) {
    this.money += n;
  }

  maxHeal() {
    this.health = this.maxHealth;
  }

  recalcMaxHealth() {
    // ensure equipped exists
    this.equipped = this.equipped || {};
    const baseVitality = (this.stats?.vitality) || 0;
    const armourVitality = (this.equipped?.armour?.vitality) || 0;

    // original formula you had: Math.floor(100 * (stats.vitality + armour.vitality)) + 100
    const oldMax = this.maxHealth || 100;
    const newMax = Math.floor(100 * (baseVitality + armourVitality)) + 100;

    // If oldMax is 0 (shouldn't be), set health to full
    const healthRatio = oldMax > 0 ? (this.health / oldMax) : 1;

    this.maxHealth = Math.max(1, newMax);
    // keep the same % of health after recalculation, cap to new max
    this.health = Math.min(this.maxHealth, Math.round(healthRatio * this.maxHealth));
  }

  /**
   * Apply a vitality heal (keeps formula consistent).
   * This recalculates maxHealth then heals a small chunk and caps to max.
   */
  vitHeal() {
    // Recompute maxHealth first (in case equipped armour changed)
    this.recalcMaxHealth();

    // The previous logic added +100 to health — preserve that but cap
    this.health = Math.min(this.maxHealth, (this.health || 0) + 100);
    return { health: this.health, maxHealth: this.maxHealth };
  }


  respawn() {
    this.xp = 0;
    this.health = this.maxHealth;
  }

  /** ---------------------
   *  EQUIPMENT HELPERS
   * --------------------- */

  getAttackDamage() {
    const weapon = this.equipped.weapon;
    const weaponDamage = weapon ? weapon.damage : 1;
    const strengthBonus = this.stats.strength || 0;
    return weaponDamage + strengthBonus;
  }

  equipItem(item) {
    if (!item || !item.type) return;
    this.equipped[item.type] = item;
    if (item.type === "weapon") {
      this.sword = item; // keep combat compatibility
    }
    if (item.type === "potion") {
      this.potion = item; // keep combat compatibility
    }
    if (slotType === "accessory") {
      this.accessory = item;
    }
    if (slotType === "armour") {
    this.armour = item;
  } 

  }

  unequipItem(type) {
    if (this.equipped[type]) {
      const item = this.equipped[type];
      this.inventory.push(item);
      this.equipped[type] = null;
      if (type === "weapon") this.sword = null;
      if (type === "potion") this.potion = null;
      if (slotType === "accessory") this.accessory = null;
      if (slotType === "armour") this.armour = null;
    }
  }

  /** ---------------------
   *     SAVE CLEANUP
   * --------------------- */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      level: this.level,
      xp: this.xp,
      maxXp: this.maxXp,
      health: this.health,
      maxHealth: this.maxHealth,
      money: this.money,
      pityState: this.pityState || { counter: 0 } ,
      kills: this.kills,
      stats: this.stats,
      secondaryStats: this.secondaryStats,
      statPoints: this.statPoints,
      achievements: this.achievements,
      inventory: this.inventory,
      equipped: this.equipped,
    };
  }
}
