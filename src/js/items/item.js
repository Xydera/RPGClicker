// src/items/itemFactory.js
// Registry + factory. Import subclasses here to avoid circular imports.

import { Sword } from "./sword.js";
import { Armour } from "./armour.js";
import { Accessory } from "./accessory.js";
import { Potion } from "./potion.js";
import { Item } from "./itemBase.js";

const ItemRegistry = new Map();

export function registerItemTemplate(template) {
  if (!template || typeof template.itemId === "undefined") {
    throw new Error("template must include itemId");
  }
  ItemRegistry.set(template.itemId, template);
}

export function createItemFromId(itemId, instanceData = {}) {
  const template = ItemRegistry.get(itemId);
  if (!template) return null;

  switch ((template.type || "").toLowerCase()) {
    case "weapon":
      return new Sword(template, instanceData);
    case "armour":
      return new Armour(template, instanceData);
    case "accessory":
      return new Accessory(template, instanceData);
    case "potion":
      return new Potion(template, instanceData);
    default:
      return new Item(template, instanceData);
  }
}

// expose registry for iteration (loot pool build, etc)
export function getAllTemplates() {
  return Array.from(ItemRegistry.values());
}

export function templateEffectiveDropChance(template, luck = 0, rareThreshold = 3) {
  const base = template.dropChance || 0;
  if ((template.rarity || 0) >= rareThreshold) {
    return Math.min(base * (1 + (luck / 100)), 1);
  }
  return base;
}
