import { Item } from "./itemBase.js";

const STAT_POOL = ["luck", "greed", "intelligence"];

export class Accessory extends Item {
  constructor(template = {}, instanceData = {}) {
    super(template, instanceData);

    this.level = instanceData.level || template.level || 1;
    this.itemImg = template.itemImg;
    this.firstValue = instanceData.firstValue ?? template.firstValue;
    this.secondValue = instanceData.secondValue ?? template.secondValue;
    this.thirdValue = instanceData.thirdValue ?? template.thirdValue;

    // if loading a saved item with assigned stats, keep them
    if (instanceData.assignedStats) {
      this.assignedStats = instanceData.assignedStats;
    } else {
      // otherwise, generate new stat assignments
      this.assignedStats = this.generateAssignedStats();
    }

    this.image = `/assets/ring${this.itemImg}.png`;
    this.maxLevel = template.maxLevel || 100;

    // apply level multiplier
    this.applyLevelScaling();

    this.upgradeCost = template.upgradePrice || Math.floor(
        (this.typeId * 150) * (Math.log(this.level + 2) + this.level / 15)
    );
  }

  generateAssignedStats() {
    const availableStats = [...STAT_POOL];
    const values = [this.firstValue, this.secondValue, this.thirdValue].filter(
      (v) => v !== undefined
    );

    const assigned = {};
    for (const val of values) {
      if (availableStats.length === 0) break;
      const statIndex = Math.floor(Math.random() * availableStats.length);
      const stat = availableStats.splice(statIndex, 1)[0];
      assigned[stat] = val;
    }
    return assigned;
  }

  applyLevelScaling() {
    // Scale each stat by item level
    for (const stat in this.assignedStats) {
      const baseValue = this.assignedStats[stat];
      this.assignedStats[stat] = baseValue * this.level;
    }
  }

  upgrade() {
    if (!player || player.money < this.upgradeCost) return false;
    if (this.level >= this.maxLevel) return false;

    player.money -= this.upgradeCost;
    this.level += 1;
    this.applyLevelScaling(); // Reapply scaling to match new level
    this.upgradeCost = Math.floor(
        (this.typeId * 150) * (Math.log(this.level + 2) + this.level / 15));
    return true;
  }

  toJSON() {
    const data = super.toJSON();
    data.assignedStats = this.assignedStats;
    data.level = this.level;
    return data;
  }
}
