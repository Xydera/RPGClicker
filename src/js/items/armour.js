import { Item } from "./itemBase.js";

export class Armour extends Item {
  constructor(template = {}, instanceData = {}) {
    super(template, instanceData);

    this.baseDefence = template.defence || 0;
    this.itemImg = template.itemImg;
    this.level = instanceData.level || template.level || 1;

    this.templateVitality = template.vitality || 0;
    this.vitality = instanceData.vitality ?? this.templateVitality + (instanceData.custom?.vitality || 0);

    this.slotType = template.slotType || "armour";
    this.typeId = template.armourId || template.typeId || 1;
    this.maxLevel = template.maxLevel || 100;
    this.upgradeCost = template.upgradePrice || Math.floor(
      (this.typeId * 150) * (Math.log(this.level + 2) + this.level / 15)
    );

    this.defence = this.computeDefence();
    this.image = `/assets/chestplate${this.itemImg}.png`;
  }

  computeDefence() {
    return this.baseDefence * this.level;
  }

  upgrade(player) {
    if (!player || player.money < this.upgradeCost) return false;
    if (this.level >= this.maxLevel) return false;

    player.money -= this.upgradeCost;
    this.level++;
    this.defence = this.computeDefence();
    this.upgradeCost = Math.floor(
      (this.typeId * 150) * (Math.log(this.level + 2) + this.level / 15)
    );
    return true;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      level: this.level,
      defence: this.defence,
      vitality: this.vitality,
      slotType: this.slotType,
      typeId: this.typeId,
      itemImg: this.itemImg,
    };
  }
}
