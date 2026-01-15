// src/items/itemBase.js
export class Item {
  constructor(template = {}, instanceData = {}) {
    this.itemId = template.itemId;
    this.name = template.name;
    this.type = template.type || "misc";
    this.rarity = template.rarity || 1;
    this.levelReq = template.levelReq || 1;

    // template-level value (kept for reference; instance has its own level)
    this.templateLevel = template.level || 1;

    // instance fields (what we save)
    this.uid = instanceData.uid || `inst_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    this.quantity = instanceData.quantity || instanceData.amount || 1;
    this.level = instanceData.level || this.templateLevel || 1;
    this.custom = instanceData.custom || {};

    this.dropChance = (typeof template.dropChance === "number") ? template.dropChance : 0;
    this.itemImg = template.itemImg || null;

    this.typeId = template.typeId || template.swordId || 1;
    this.upgradeCost = template.upgradePrice || Math.floor((this.typeId * 2.5 + 7.5) * Math.pow(10, this.typeId));

    this._template = template;
  }

  // Minimal JSON saved form — JSON.stringify will use this
  toJSON() {
    return {
      uid: this.uid,
      itemId: this.itemId,
      quantity: this.quantity,
      level: this.level,
      custom: this.custom
    };
  }

  // override in subclasses as needed
  onEquip(player) {}
  onUnequip(player) {}

  // convenience: effective drop chance for this instance (calls template base)
  effectiveDropChance(luck = 0, rareThreshold = 3) {
    const base = this.dropChance || 0;
    if ((this.rarity || 0) >= rareThreshold) {
      return Math.min(base * (1 + (luck / 100)), 1);
    }
    return base;
  }
}
