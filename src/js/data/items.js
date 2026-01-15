import { registerItemTemplate } from './../items/item';

// Item Template
export const items = [
  // ===== Commons (rarity 1) ===== (player levelReq: 5–10)
  { name: "Copper Sword",     itemId: 1,  swordId: 1,  level: 1, levelReq: 1,  rarity: 1, type: "weapon", itemImg: 1,  damage: 1,  strength: 1},
  { name: "Hero's Sword",     itemId: 2,  swordId: 2,  level: 1, levelReq: 5,  rarity: 1, type: "weapon", itemImg: 2,  damage: 3,  strength: 3,   dropChance: 0.10 },
  { name: "Apprentice Blade", itemId: 3,  swordId: 3,  level: 1, levelReq: 7,  rarity: 1, type: "weapon", itemImg: 1,  damage: 5,  strength: 5,   dropChance: 0.08 },
  { name: "Tempered Blade",   itemId: 4,  swordId: 4,  level: 1, levelReq: 9,  rarity: 1, type: "weapon", itemImg: 4,  damage: 6,  strength: 7,   dropChance: 0.06 },
  { name: "Riversteel Edge",  itemId: 5,  swordId: 5,  level: 1, levelReq: 10, rarity: 1, type: "weapon", itemImg: 7,  damage: 7,  strength: 9,   dropChance: 0.05 },

  // ===== Uncommons (rarity 2) ===== (player levelReq: 12–18)
  { name: "Iron Sword",       itemId: 6,  swordId: 6,  level: 1, levelReq: 12, rarity: 2, type: "weapon", itemImg: 2,  damage: 9,  strength: 14,  dropChance: 0.06 },
  { name: "Golden Sword",     itemId: 7,  swordId: 7,  level: 1, levelReq: 13, rarity: 2, type: "weapon", itemImg: 3,  damage: 11, strength: 16,  dropChance: 0.05 },
  { name: "Embersteel Sword", itemId: 8,  swordId: 8,  level: 1, levelReq: 15, rarity: 2, type: "weapon", itemImg: 12, damage: 13, strength: 18,  dropChance: 0.04 },
  { name: "Frostbite Saber",  itemId: 9,  swordId: 9,  level: 1, levelReq: 17, rarity: 2, type: "weapon", itemImg: 6,  damage: 15, strength: 20,  dropChance: 0.03 },
  { name: "Windcarver",      itemId: 10, swordId: 10, level: 1, levelReq: 18, rarity: 2, type: "weapon", itemImg: 2, damage: 16, strength: 22,  dropChance: 0.025 },

  // ===== Rares (rarity 3) ===== (player levelReq: 20–30)
  { name: "Titanium Sword",   itemId: 11, swordId: 11, level: 1, levelReq: 20, rarity: 3, type: "weapon", itemImg: 4, damage: 20, strength: 30,  dropChance: 0.012 },
  { name: "Bronze Sword",     itemId: 12, swordId: 12, level: 1, levelReq: 22, rarity: 3, type: "weapon", itemImg: 5, damage: 24, strength: 35,  dropChance: 0.01 },
  { name: "Platinum Sword",   itemId: 13, swordId: 13, level: 1, levelReq: 25, rarity: 3, type: "weapon", itemImg: 6, damage: 28, strength: 40,  dropChance: 0.008 },
  { name: "Dragonscale Saber",itemId: 14, swordId: 14, level: 1, levelReq: 28, rarity: 3, type: "weapon", itemImg: 9, damage: 32, strength: 45,  dropChance: 0.006 },
  { name: "Heartpiercer",     itemId: 15, swordId: 15, level: 1, levelReq: 30, rarity: 3, type: "weapon", itemImg: 2, damage: 36, strength: 50,  dropChance: 0.005 },

  // ===== Epics (rarity 4) ===== (player levelReq: 32–42)
  { name: "Mithril Sword",    itemId: 16, swordId: 16, level: 1, levelReq: 32, rarity: 4, type: "weapon", itemImg: 7, damage: 45, strength: 70,  dropChance: 0.0025 },
  { name: "Damascus Steel",   itemId: 17, swordId: 17, level: 1, levelReq: 34, rarity: 4, type: "weapon", itemImg: 8, damage: 50, strength: 80,  dropChance: 0.0018 },
  { name: "Hepatizon Sword",  itemId: 18, swordId: 18, level: 1, levelReq: 36, rarity: 4, type: "weapon", itemImg: 9, damage: 56, strength: 90,  dropChance: 0.0015 },
  { name: "Shadowfang",       itemId: 19, swordId: 19, level: 1, levelReq: 38, rarity: 4, type: "weapon", itemImg: 9, damage: 58, strength: 95,  dropChance: 0.0012 },
  { name: "Dawnreaver",       itemId: 20, swordId: 20, level: 1, levelReq: 42, rarity: 4, type: "weapon", itemImg: 14, damage: 60, strength: 105, dropChance: 0.0010 },

  // ===== Legendaries (rarity 5) ===== (player levelReq: 45–55)
  { name: "Sapphire Blade",   itemId: 21, swordId: 21, level: 1, levelReq: 45, rarity: 5, type: "weapon", itemImg: 10, damage: 75, strength: 140, dropChance: 0.0006 },
  { name: "Topaz Blade",      itemId: 22, swordId: 22, level: 1, levelReq: 46, rarity: 5, type: "weapon", itemImg: 15, damage: 76, strength: 150, dropChance: 0.0005 },
  { name: "Ruby Blade",       itemId: 23, swordId: 23, level: 1, levelReq: 48, rarity: 5, type: "weapon", itemImg: 12, damage: 80, strength: 160, dropChance: 0.00045 },
  { name: "Emerald Blade",    itemId: 24, swordId: 24, level: 1, levelReq: 50, rarity: 5, type: "weapon", itemImg: 11, damage: 88, strength: 170, dropChance: 0.0004 },
  { name: "Diamond Blade",    itemId: 25, swordId: 25, level: 1, levelReq: 52, rarity: 5, type: "weapon", itemImg: 13, damage: 92, strength: 185, dropChance: 0.00035 },
  { name: "Worldrend",        itemId: 26, swordId: 26, level: 1, levelReq: 55, rarity: 5, type: "weapon", itemImg: 6, damage: 98, strength: 200, dropChance: 0.0003 },

  // ===== Mythicals (rarity 6) ===== (player levelReq: 60–70)
  { name: "Eternity’s Tear",  itemId: 27, swordId: 27, level: 1, levelReq: 60, rarity: 6, type: "weapon", itemImg: 6, damage: 120, strength: 280, dropChance: 0.00012 },
  { name: "Chronoblade",      itemId: 28, swordId: 28, level: 1, levelReq: 62, rarity: 6, type: "weapon", itemImg: 15, damage: 125, strength: 300, dropChance: 0.00010 },
  { name: "Starforged Sword", itemId: 29, swordId: 29, level: 1, levelReq: 65, rarity: 6, type: "weapon", itemImg: 10, damage: 130, strength: 320, dropChance: 0.00008 },
  { name: "Astral Fang",      itemId: 30, swordId: 30, level: 1, levelReq: 70, rarity: 6, type: "weapon", itemImg: 13, damage: 135, strength: 340, dropChance: 0.00007 },

  // ===== Celestials (rarity 7) ===== (player levelReq: 80–90)
  { name: "Void Blade",       itemId: 31, swordId: 31, level: 1, levelReq: 80, rarity: 7, type: "weapon", itemImg: 14, damage: 180, strength: 420, dropChance: 0.00002 },
  { name: "Heaven’s Divide",  itemId: 32, swordId: 32, level: 1, levelReq: 85, rarity: 7, type: "weapon", itemImg: 13, damage: 185, strength: 460, dropChance: 0.000018 },
  { name: "The Worldbreaker", itemId: 33, swordId: 33, level: 1, levelReq: 90, rarity: 7, type: "weapon", itemImg: 11, damage: 190, strength: 500, dropChance: 0.000015 },

  // ===== X Weapons (rarity 8) ===== (player levelReq: 120)
  { name: "X Blade",          itemId: 34, swordId: 34, level: 1, levelReq: 120, rarity: 8, type: "weapon", itemImg: 16, damage: 250, strength: 700, dropChance: 0.00001 },
  
  // ===== Armours =====
  { name: "Copper Armour",          itemId: 35, armourId: 1,  level: 1, levelReq: 5,  rarity: 1, type: "armour", itemImg: 1,  defence: 2,   vitality: 2,   dropChance: 0.10 },
  { name: "Iron Armour",            itemId: 36, armourId: 2,  level: 1, levelReq: 12, rarity: 2, type: "armour", itemImg: 2,  defence: 8,   vitality: 4,   dropChance: 0.06 },
  { name: "Golden Armour",          itemId: 37, armourId: 3,  level: 1, levelReq: 15, rarity: 2, type: "armour", itemImg: 3,  defence: 12,  vitality: 6,   dropChance: 0.05 },
  { name: "Titanium Armour",        itemId: 38, armourId: 4,  level: 1, levelReq: 20, rarity: 3, type: "armour", itemImg: 4,  defence: 22,  vitality: 10,  dropChance: 0.012 },
  { name: "Bronze Armour",          itemId: 39, armourId: 5,  level: 1, levelReq: 25, rarity: 3, type: "armour", itemImg: 5,  defence: 26,  vitality: 14,  dropChance: 0.010 },
  { name: "Platinum Armour",        itemId: 40, armourId: 6,  level: 1, levelReq: 32, rarity: 4, type: "armour", itemImg: 6,  defence: 40,  vitality: 20,  dropChance: 0.0025 },
  { name: "Mithril Armour",         itemId: 41, armourId: 7,  level: 1, levelReq: 34, rarity: 4, type: "armour", itemImg: 7,  defence: 55,  vitality: 30,  dropChance: 0.0018 },
  { name: "Damascus Steel Armour",  itemId: 42, armourId: 8,  level: 1, levelReq: 45, rarity: 5, type: "armour", itemImg: 8,  defence: 80,  vitality: 45,  dropChance: 0.0006 },
  { name: "Hepatizon Armour",       itemId: 43, armourId: 9,  level: 1, levelReq: 60, rarity: 6, type: "armour", itemImg: 9,  defence: 120, vitality: 80,  dropChance: 0.00012 },
  { name: "Void Armour",            itemId: 44, armourId: 10, level: 1, levelReq: 80, rarity: 7, type: "armour", itemImg: 10, defence: 180, vitality: 120, dropChance: 0.00002 },
  { name: "X Plated Armour",        itemId: 45, armourId: 11, level: 1, levelReq: 120, rarity: 8, type: "armour", itemImg: 11, defence: 300, vitality: 250, dropChance: 0.00001 },

  // ===== Accessories (Rings) =====
  { name: "Copper Ring",            itemId: 46, accId: 1,  level: 1, levelReq: 5,  rarity: 1, type: "accessory", itemImg: 1,  firstValue: 1,  dropChance: 0.10 },
  { name: "Iron Ring",              itemId: 47, accId: 2,  level: 1, levelReq: 12, rarity: 2, type: "accessory", itemImg: 2,  firstValue: 3,  secondValue: 3,  dropChance: 0.06 },
  { name: "Gold Ring",              itemId: 48, accId: 3,  level: 1, levelReq: 15, rarity: 2, type: "accessory", itemImg: 3,  firstValue: 4,  secondValue: 4,  dropChance: 0.05 },
  { name: "Titanium Ring",          itemId: 49, accId: 4,  level: 1, levelReq: 20, rarity: 3, type: "accessory", itemImg: 4,  firstValue: 8,  secondValue: 8,  dropChance: 0.012 },
  { name: "Bronze Ring",            itemId: 50, accId: 5,  level: 1, levelReq: 25, rarity: 3, type: "accessory", itemImg: 5,  firstValue: 10, secondValue: 10,  dropChance: 0.010 },
  { name: "Platinum Ring",          itemId: 51, accId: 6,  level: 1, levelReq: 28, rarity: 3, type: "accessory", itemImg: 6,  firstValue: 12, secondValue: 12, dropChance: 0.008 },
  { name: "Mithril Ring",           itemId: 52, accId: 7,  level: 1, levelReq: 32, rarity: 4, type: "accessory", itemImg: 7,  firstValue: 20, secondValue: 20, thirdValue: 15, dropChance: 0.0025 },
  { name: "Damascus Steel Ring",    itemId: 53, accId: 8,  level: 1, levelReq: 34, rarity: 4, type: "accessory", itemImg: 8,  firstValue: 25, secondValue: 25, thirdValue: 20, dropChance: 0.0018 },
  { name: "Hepatizon Ring",         itemId: 54, accId: 9,  level: 1, levelReq: 36, rarity: 4, type: "accessory", itemImg: 9,  firstValue: 30, secondValue: 30, thirdValue: 25, dropChance: 0.0015 },

  { name: "Sapphire Ring",          itemId: 55, accId: 10, level: 1, levelReq: 45, rarity: 5, type: "accessory", itemImg: 10,  firstValue: 45, secondValue: 45, thirdValue: 40,  dropChance: 0.0006 },
  { name: "Topaz Ring",             itemId: 56, accId: 11, level: 1, levelReq: 45, rarity: 5, type: "accessory", itemImg: 15,  firstValue: 48, secondValue: 48, thirdValue: 43, dropChance: 0.0005 },
  { name: "Ruby Ring",              itemId: 57, accId: 12, level: 1, levelReq: 50, rarity: 5, type: "accessory", itemImg: 12,  firstValue: 52, secondValue: 52, thirdValue: 47, dropChance: 0.00045 },
  { name: "Emerald Ring",           itemId: 58, accId: 13, level: 1, levelReq: 55, rarity: 5, type: "accessory", itemImg: 11,  firstValue: 56, secondValue: 56, thirdValue: 51, dropChance: 0.0004 },
  { name: "Diamond Ring",           itemId: 59, accId: 14, level: 1, levelReq: 55, rarity: 5, type: "accessory", itemImg: 13,  firstValue: 60, secondValue: 60, thirdValue: 55, dropChance: 0.00035 },

  { name: "Void Ring",              itemId: 60, accId: 15, level: 1, levelReq: 80, rarity: 7, type: "accessory", itemImg: 14,  firstValue: 150, secondValue: 150, thirdValue: 100, dropChance: 0.00002 },
  { name: "X Ring",                 itemId: 61, accId: 16, level: 1, levelReq: 120, rarity: 8, type: "accessory", itemImg: 16,  firstValue: 300, secondValue: 300, thirdValue: 250, dropChance: 0.00001 },

  // ===== Potions =====
  { name: "Lesser Potion of Restoration",  itemId: 62, potionId: 1, level: 1, levelReq: 1,  rarity: 1, type: "potion", itemImg: 1,  heal: 100,   dropChance: 0.50 },
  { name: "Minor Potion of Restoration",   itemId: 63, potionId: 2, level: 1, levelReq: 10,  rarity: 2, type: "potion", itemImg: 1,  heal: 200,   dropChance: 0.40 },
  { name: "Major Potion of Restoration",   itemId: 64, potionId: 3, level: 1, levelReq: 25,  rarity: 3, type: "potion", itemImg: 1,  heal: 400,   dropChance: 0.25 },
  { name: "Lesser Healing Elixir",        itemId: 65, potionId: 4, level: 1, levelReq: 35, rarity: 4, type: "potion", itemImg: 1,  heal: 800,   dropChance: 0.12 },
  { name: "Minor Healing Elixir",         itemId: 66, potionId: 5, level: 1, levelReq: 45, rarity: 5, type: "potion", itemImg: 1,  heal: 1600,  dropChance: 0.06 },
  { name: "Major Healing Elixir",         itemId: 67, potionId: 6, level: 1, levelReq: 60, rarity: 6, type: "potion", itemImg: 1,  heal: 3200,  dropChance: 0.02 },
  { name: "Elixir of Life",               itemId: 68, potionId: 7, level: 1, levelReq: 80, rarity: 7, type: "potion", itemImg: 1,  heal: 6400,  dropChance: 0.005 },
]

export function registerAllItems() {
  for (const t of items) registerItemTemplate(t);
}