// src/items/sword.js
import { Item } from "./itemBase.js";

export class Sword extends Item {
constructor(template = {}, instanceData = {}) {
    super(template, instanceData);

    this.baseDamage = template.damage || 0;
    this.itemImg = template.itemImg;
    this.level = instanceData.level || template.level || 1;

    // Fix: derive instance strength correctly
    this.templateStrength = template.strength || 0;
    this.strength = this.templateStrength + (instanceData.custom?.strength || 0);

    this.slotType = template.slotType || "weapon";
    this.typeId = template.swordId || template.typeId || 1;
    this.maxLevel = template.maxLevel || 100;
    this.upgradeCost = template.upgradePrice || Math.floor(
    (this.typeId * 150) * (Math.log(this.level + 2) + this.level / 15)
);

    this.damage = this.computeDamage();
    this.image = `/assets/sword${this.itemImg}.png`;
}

  computeDamage() {
    return this.baseDamage * this.level;
  }

  upgrade(player) {
    if (!player || player.money < this.upgradeCost) return false;
    if (this.level >= this.maxLevel) return false;

    player.money -= this.upgradeCost;
    this.level++;
    this.damage = this.computeDamage();
    console.log(
      this.level,
      this.damage
    );
    this.upgradeCost = Math.floor(
    (this.typeId * 150) * (Math.log(this.level + 2) + this.level / 15));
    return true;
  }

  toJSON() {
    const data = super.toJSON();
    data.level = this.level;
    return data;
  }
}
