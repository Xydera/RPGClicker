// src/js/equipment.js

function cloneForEquip(invEntry) {
  // create a shallow clone for the equipped instance so runtime state (_appliedStrength etc)
  // won't be shared with the inventory object
  return { ...invEntry, amount: 1, id: invEntry.id + `-eq-${Date.now()}` };
}

function _clearSpecialRef(player, slotType) {
  // clear special player.* references depending on slotType
  if (slotType === "weapon") {
    player.sword = null;
  } else if (slotType === "potion") {
    player.potion = null;
  } else if (slotType === "armour") {
    player.armour = null;
  } else if (slotType === "accessory") {
    player.accessory = null;
  }
}

function _setSpecialRef(player, slotType, instance) {
  if (slotType === "weapon") {
    player.sword = instance;
  } else if (slotType === "potion") {
    player.potion = instance;
  } else if (slotType === "armour") {
    player.armour = instance;
  } else if (slotType === "accessory") {
    player.accessory = instance;
  }
}

export function equipItem(player, item, slotType) {
  if (!player || !item || !slotType) return false;

  // ===== LEVEL REQUIREMENT CHECK =====
  if (item.levelReq && player.level < item.levelReq) {
    console.warn(`Player level ${player.level} too low to equip ${item.name} (requires ${item.levelReq})`);
    return false;
  }

  player.equipped = player.equipped || {};
  player.inventory = player.inventory || [];

  // 1) Dragged from same slot -> no-op
  if (item.fromSlot && item.fromSlot === slotType) return false;

  // 2) Dragged from another equipped slot -> MOVE the actual instance
  if (item.fromSlot && item.fromSlot !== slotType) {
    const sourceSlot = item.fromSlot;
    const movingInstance = player.equipped?.[sourceSlot] || item;
    if (!movingInstance) return false;

    const currentDest = player.equipped[slotType];
    if (currentDest) unequipItem(player, slotType);

    player.equipped[sourceSlot] = null;
    _clearSpecialRef(player, sourceSlot);

    player.equipped[slotType] = movingInstance;
    _setSpecialRef(player, slotType, movingInstance);

    if (typeof movingInstance.onEquip === "function") {
      try { movingInstance.onEquip(player); } catch (e) { console.warn("Equip error", e); }
    }

    return true;
  }

  // 3) Inventory-origin equip
  const current = player.equipped[slotType];
  if (current) unequipItem(player, slotType);

  let equipInstance = item;

  // Try exact reference in inventory first
  const invIdx = player.inventory.indexOf(item);
  if (invIdx !== -1) {
    const invEntry = player.inventory[invIdx];
    if (invEntry.amount && invEntry.amount > 1) {
      invEntry.amount -= 1;
      equipInstance = cloneForEquip(invEntry);
    } else {
      // Remove actual object from inventory
      equipInstance = player.inventory.splice(invIdx, 1)[0];
    }
  } else {
    // fallback: match by name/type (handles merged stacks)
    const byNameIdx = player.inventory.findIndex(it => it.name === item.name && it.type === item.type);
    if (byNameIdx !== -1) {
      const invEntry = player.inventory[byNameIdx];
      if (invEntry.amount && invEntry.amount > 1) {
        invEntry.amount -= 1;
        equipInstance = cloneForEquip(invEntry);
      } else {
        equipInstance = player.inventory.splice(byNameIdx, 1)[0];
      }
    } else {
      // item not in inventory, equip a shallow clone
      equipInstance = { ...item, amount: item.amount || 1 };
    }
  }

  // Accessory safeguard
  if (slotType === "accessory" && player.accessory && player.accessory !== player.equipped[slotType]) {
    unequipItem(player, "accessory");
  }

  // Equip & apply stats
  player.equipped[slotType] = equipInstance;
  _setSpecialRef(player, slotType, equipInstance);

  // If we just equipped armour, recalc player's maxHealth
  if (slotType === "armour" && typeof player.recalcMaxHealth === "function") {
    try { player.recalcMaxHealth(); } catch (e) { console.warn("recalcMaxHealth error on equip", e); }
  }

  if (typeof equipInstance.onEquip === "function") {
    try { equipInstance.onEquip(player); } catch (e) { console.warn("Equip error", e); }
  }

  return true;
}


export function unequipItem(player, slotType) {
  if (!player || !slotType) return false;
  player.equipped = player.equipped || {};
  player.inventory = player.inventory || [];

  const inst = player.equipped[slotType];
  if (!inst) return false;

  // call onUnequip hook first (so it removes stats)
  if (typeof inst.onUnequip === "function") {
    try { inst.onUnequip(player); } catch (e) { console.warn("Unequip error", e); }
  }

  // Determine if the item is stackable
  const stackableTypes = ["potion", "consumable"]; // add more if needed
  const isStackable = stackableTypes.includes(inst.type);

  if (isStackable) {
    // merge with existing inventory entry if stackable
    const existing = player.inventory.find(it => it.name === inst.name && it.type === inst.type);
    if (existing) {
      existing.amount = (existing.amount || 1) + (inst.amount || 1);
    } else {
      player.inventory.push({ ...inst, amount: inst.amount || 1, id: inst.id ?? `${(inst.name||'item').replace(/\s+/g,'_')}-${Date.now()}` });
    }
  } else {
    // unique items always get their own entry
    player.inventory.push({ ...inst, amount: 1, id: inst.id ?? `${(inst.name||'item').replace(/\s+/g,'_')}-${Date.now()}` });
  }

  // clear equip slot and special refs
  player.equipped[slotType] = null;
  _clearSpecialRef(player, slotType);

  // If we just unequipped armour, recalc player's maxHealth
  if (slotType === "armour" && typeof player.recalcMaxHealth === "function") {
    try { player.recalcMaxHealth(); } catch (e) { console.warn("recalcMaxHealth error on unequip", e); }
  }

  return true;
}
