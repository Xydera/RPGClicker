import { createItemFromId } from "./items/item.js";
import { Sword } from "./items/sword.js";
import { Potion } from "./items/potion.js";

function rehydrateItem(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (obj instanceof Sword || obj instanceof Potion) return obj;

  if ("itemId" in obj && typeof obj.itemId === "number") {
    const inst = createItemFromId(obj.itemId, obj);
    if (inst) return inst;
  }

  if ("upgradeCost" in obj && "damage" in obj) return new Sword(obj);
  if ("heal" in obj && "purchaseCost" in obj) return new Potion(obj);

  return obj;
}

export function rehydrateAll(savedGame) {
  if (!savedGame) return savedGame;

  const game = { ...savedGame };
  const playerData = game.player || game;
  const player = { ...playerData };

  player.inventory = Array.isArray(player.inventory) ? player.inventory.map(rehydrateItem).filter(Boolean) : [];

  const eq = player.equipped || {};
  player.equipped = {
    weapon: rehydrateItem(eq.weapon),
    armour: rehydrateItem(eq.armour),
    accessory: rehydrateItem(eq.accessory),
    potion: rehydrateItem(eq.potion),
  };

  // Apply onEquip to restore secondary stats
  Object.values(player.equipped).forEach(inst => {
    if (inst && typeof inst.onEquip === "function") {
      try { inst.onEquip(player); } catch (e) { console.warn("onEquip failed", e); }
    }
  });

  player.sword = player.equipped.weapon || player.sword || null;
  player.potion = player.equipped.potion || player.potion || null;

  if (Array.isArray(game.shopItems)) game.shopItems = game.shopItems.map(rehydrateItem).filter(Boolean);
  if (Array.isArray(game.lootDrops)) game.lootDrops = game.lootDrops.map(rehydrateItem).filter(Boolean);

  player.stats = player.stats || { strength: 0, luck: 0, vitality: 0, greed: 0, intelligence: 0 };
  player.pityState = player.pityState || { counter: 0 };

  game.player = player;
  return game;
}
