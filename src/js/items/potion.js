// src/items/potion.js
import { getPotionName } from "./../utils/rarity";
import { Item } from "./itemBase.js";

export class Potion extends Item {
  constructor(template = {}, instanceData = {}) {
    super(template, instanceData);

    this.baseHeal = template.heal || 0;
    this.itemImg = template.itemImg;
    this.level = instanceData.level || template.level || 1;

    this.type = "potion";
    this.slotType = template.slotType || "potion";
    this.typeId = template.potionId || template.typeId || 1;
    this.maxLevel = template.maxLevel || 100;
    this.upgradeCost = template.upgradePrice || Math.floor(
      (this.typeId * 150) * (Math.log(this.level + 2) + this.level / 15)
    );

    this.heal = this.computeHeal();
    this.image = template.image || `/assets/potion.png`;
    this.amount = instanceData.amount ?? template.amount ?? this.amount ?? 1;
    this.name = instanceData.name || template.name || getPotionName(this.typeId);
  }

  computeHeal() {
    return (this.baseHeal || 0) * (this.level || 1);
  }

  // fix: accept a player parameter and use it
  upgrade(player) {
    if (!player || player.money < this.upgradeCost) return false;
    if (this.level >= this.maxLevel) return false;

    player.money -= this.upgradeCost;
    this.level++;
    this.heal = this.computeHeal();
    this.upgradeCost = Math.floor(
      (this.typeId * 150) * (Math.log(this.level + 2) + this.level / 15)
    );
    return true;
  }

  // Use this potion instance (equipped or instance in inventory)
  use(player, game) {
    const log = (msg, type = 'info') => {
      try {
        if (game && typeof game.log === 'function') game.log(msg, type);
        else if (typeof window !== 'undefined' && window.__appLogger__?.log) window.__appLogger__.log(msg, type);
        else console.log(`[${type}] ${msg}`);
      } catch (e) { /* ignore */ }
    };

    if (!player) return false;

    const applyHeal = (healAmount) => {
      const before = player.health || 0;
      const max = player.maxHealth || 0;
      const amountHealed = Math.min(healAmount, Math.max(0, max - before));
      player.health = Math.min(max, before + amountHealed);
      return amountHealed;
    };

    // If this is an equipped potion instance
    if (player.equipped?.potion === this) {
      if ((this.amount || 0) <= 0) {
        log('No potions available', 'warning');
        return false;
      }

      const healed = applyHeal(this.heal || 0);
      if (healed > 0) log(`You healed ${healed} health.`, 'potion');
      else log('You are already at full health.', 'info');

      this.amount = (this.amount || 0) - 1;

      if ((this.amount || 0) <= 0) {
        player.equipped.potion = null;
      }

      if (game) { game.notify?.(); game.save?.(); }
      return healed > 0;
    }

    // Case B: consume from inventory stack that matches type/name
    if (Array.isArray(player.inventory)) {
      // Accept either an instance or plain objects in inventory
      const stack = player.inventory.find(it => (it.type === 'potion') && (it.name === this.name || it.itemId === this.itemId));
      if (stack && (stack.amount || 0) > 0) {
        // Determine heal amount from stack: prefer explicit heal, else compute from base/level fields
        const healVal = stack.heal ?? (stack.baseHeal ? (stack.baseHeal * (stack.level || 1)) : 0);
        const healed = applyHeal(healVal || this.heal || 0);
        if (healed > 0) log(`You healed ${healed} health.`, 'potion');
        else log('You are already at full health.', 'info');

        stack.amount = (stack.amount || 0) - 1;
        if (stack.amount <= 0) {
          const idx = player.inventory.indexOf(stack);
          if (idx !== -1) player.inventory.splice(idx, 1);
        }

        if (game) { game.notify?.(); game.save?.(); }
        return healed > 0;
      }
    }

    // Case C: fallback when this.amount property used directly on instance but not equipped
    if ((this.amount || 0) > 0) {
      const healed = applyHeal(this.heal || 0);
      if (healed > 0) log(`You healed ${healed} health.`, 'potion');
      else log('You are already at full health.', 'info');

      this.amount -= 1;
      if (game) { game.notify?.(); game.save?.(); }
      return healed > 0;
    }

    log('No potions available', 'warning');
    return false;
  }

  // Helper: consume a plain template or POJO that represents a potion
  // template: { baseHeal, heal, level, amount, name, ... }
  static consumeTemplate(template = {}, player, game) {
    if (!player) return false;
    const baseHeal = template.heal ?? template.baseHeal ?? 0;
    const level = template.level ?? 1;
    const amount = template.amount ?? 1;
    if (amount <= 0) {
      try { if (game && typeof game.log === 'function') game.log('No potions available', 'warning'); } catch {}
      return false;
    }

    const healAmount = (template.heal ?? (baseHeal * level)) || 0;

    const before = player.health || 0;
    const max = player.maxHealth || 0;
    const amountHealed = Math.min(healAmount, Math.max(0, max - before));
    player.health = Math.min(max, before + amountHealed);

    try {
      if (game && typeof game.log === 'function') {
        if (amountHealed > 0) game.log(`You healed ${amountHealed} health.`, 'potion');
        else game.log('You are already at full health.', 'info');
      }
    } catch (e) {}

    // If the template corresponds to a stack in inventory, caller should reduce the stack; this helper only computes heal.
    // Return healed amount (>0 if something changed), so caller can remove one from stack.
    return amountHealed > 0 ? amountHealed : 0;
  }

  toJSON() {
    const data = super.toJSON();
    data.level = this.level;
    data.amount = this.amount;
    return data;
  }
}
