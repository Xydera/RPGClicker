// achievements.js

export class AchievementManager {
  constructor(player, log = () => {}) {
    this.log = log;
    this.player = player;
    this.defs = [
      { id: 'nameChange', name: 'Identity Crisis', desc: 'Change your name for the first time' },
      { id: 'xydera', name: 'Xydera', desc: 'Set your name to Xydera' },
      { id: 'Luke', name: 'Who?', desc: 'Set your name to Luke' },
      { id: 'Angelique', name: 'The First', desc: 'Set your name to Angelique' },
      { id: 'firstKill', name: 'First Blood', desc: 'Defeat your first creature' },
      { id: 'slayer', name: 'Slayer', desc: 'Defeat 100 creatures' },
      { id: 'bigSlayer', name: 'Big Slayer', desc: 'Defeat 1000 creatures' },
      { id: 'firstLevel', name: 'Getting Started', desc: 'Reach level 2' },
      { id: 'level10', name: 'Getting Strong', desc: 'Reach level 10' },
      { id: 'level50', name: 'Champion', desc: 'Reach level 50' },
      { id: 'legend', name: 'Legend', desc: 'Reach level 100' },
      { id: 'rich', name: 'Treasure Hunter', desc: 'Accumulate 100 gold' },
      { id: 'wealthy', name: 'Wealthy', desc: 'Accumulate 1000 gold' },
      { id: 'millionaire', name: 'Millionaire', desc: 'Accumulate 1,000,000 gold' },
      { id: 'upgradeSword', name: 'Armed and Ready', desc: 'Upgrade your sword for the first time' },
      { id: 'masterSword', name: 'Sword Master', desc: 'Upgrade your sword to max level' },
      { id: 'newSword', name: 'New Blade', desc: 'Purchase a new sword' },
      { id: 'maxSword', name: 'Ultimate Sword', desc: 'Reach max rarity sword' },
      { id: 'strengthNovice', name: 'Strong Start', desc: 'Allocate 1 point to Strength' },
      { id: 'strengthAdept', name: 'Strong Adept', desc: 'Allocate 5 points to Strength' },
      { id: 'strengthMaster', name: 'Strength Master', desc: 'Allocate 10 points to Strength' },
      { id: 'strengthLegend', name: 'Strength Legend', desc: 'Allocate 50 points to Strength' },
      { id: 'greedNovice', name: 'Greedy Start', desc: 'Allocate 1 point to Greed' },
      { id: 'greedAdept', name: 'Greedy Adept', desc: 'Allocate 5 points to Greed' },
      { id: 'greedMaster', name: 'Greed Master', desc: 'Allocate 10 points to Greed' },
      { id: 'greedLegend', name: 'Greed Legend', desc: 'Allocate 50 points to Greed' },
      { id: 'luckNovice', name: 'Lucky Start', desc: 'Allocate 1 point to Luck' },
      { id: 'luckAdept', name: 'Lucky Adept', desc: 'Allocate 5 points to Luck' },
      { id: 'luckMaster', name: 'Luck Master', desc: 'Allocate 10 points to Luck' },
      { id: 'luckLegend', name: 'Luck Legend', desc: 'Allocate 50 points to Luck' },
      { id: 'intelligenceNovice', name: 'Smart Start', desc: 'Allocate 1 point to Intelligence' },
      { id: 'intelligenceAdept', name: 'Smart Adept', desc: 'Allocate 5 points to Intelligence' },
      { id: 'intelligenceMaster', name: 'Intelligence Master', desc: 'Allocate 10 points to Intelligence' },
      { id: 'intelligenceLegend', name: 'Intelligence Legend', desc: 'Allocate 50 points to Intelligence' },
      { id: 'vitalityNovice', name: 'Hearty Start', desc: 'Allocate 1 point to Vitality'},
      { id: 'vitalityAdept', name: 'Hearty Adept', desc: 'Allocate 5 points to Vitality' },
      { id: 'vitalityMaster', name: 'Vitality Master', desc: 'Allocate 10 points to Vitality' },
      { id: 'vitalityLegend', name: 'Vitality Legend', desc: 'Allocate 50 points to Vitality' },
      { id: 'statNovice', name: 'Jack of Some Trades', desc: 'Allocate 5 stat points' },
      { id: 'statAdept', name: 'Jack of All Trades', desc: 'Allocate 10 stat points' },
      { id: 'statMaster', name: 'Stat Guru', desc: 'Allocate 50 stat points' },
      { id: 'statLegend', name: 'Stat Legend', desc: 'Allocate 100 stat points' },
      { id: 'allStatsNovice', name: 'Well Rounded', desc: 'Allocate all stats to 10' },
      { id: 'allStatsAdept', name: 'Versatile', desc: 'Allocate all stats to 25' },
      { id: 'allStatsMaster', name: 'Polymath', desc: 'Allocate all stats to 50' },
      { id: 'allStatsLegend', name: 'Omniscient', desc: 'Allocate all stats to 100' }
    ];
  }

  check(game) {
     if (!game || !game.sword) return; // Prevent error if game or sword is missing
    const p = this.player;
    const totalStats = p.stats.total;
    const s = game.sword;

    const achievementsToCheck = [
      'nameChange', 'xydera', 'Luke', 'Angelique',
      'firstKill', 'slayer', 'bigSlayer',
      'firstLevel', 'level10', 'level50', 'legend',
      'rich', 'wealthy', 'millionaire',
      'upgradeSword', 'masterSword', 'newSword', 'maxSword',
      'strengthNovice', 'strengthAdept', 'strengthMaster', 'strengthLegend',
      'greedNovice', 'greedAdept', 'greedMaster', 'greedLegend',
      'luckNovice', 'luckAdept', 'luckMaster', 'luckLegend',
      'intelligenceNovice', 'intelligenceAdept', 'intelligenceMaster', 'intelligenceLegend',
      'vitalityNovice', 'vitalityAdept', 'vitalityMaster', 'vitalityLegend',
      'statNovice', 'statAdept', 'statMaster', 'statLegend',
      'allStatsNovice', 'allStatsAdept', 'allStatsMaster', 'allStatsLegend'
    ];

    for (const id of achievementsToCheck) {
      if (this.has(id)) continue;
      // Check conditions for each achievement
      switch (id) {
        //Name achievements
        case 'nameChange':
          if (p.name && p.name !== 'Hero') this.unlock(id);
          break;
        case 'xydera':
          if (p.name && p.name.toLowerCase() === 'xydera') this.unlock(id);
          break;
        case 'Luke':
          if (p.name && p.name.toLowerCase() === 'luke') this.unlock(id);
          break;
        case 'Angelique':
          if (p.name && p.name.toLowerCase() === 'angelique') this.unlock(id);
          break;
        // Combat achievements
        case 'firstKill':
          if (p.kills >= 1) this.unlock(id);
          break;
        case 'slayer':
          if (p.kills >= 100) this.unlock(id);
          break;
        case 'bigSlayer':
          if (p.kills >= 1000) this.unlock(id);
          break;
        // Level achievements
        case 'firstLevel':
          if (p.level >= 2) this.unlock(id);
          break;
        case 'level10':
          if (p.level >= 10) this.unlock(id);
          break;
        case 'level50':
          if (p.level >= 50) this.unlock(id);
          break;
        case 'legend':
          if (p.level >= 100) this.unlock(id);
          break;
        // Wealth achievements
        case 'rich':
          if (p.money >= 100) this.unlock(id);
          break;
        case 'wealthy':
          if (p.money >= 1000) this.unlock(id);
          break;
        // Sword achievements
        case 'millionaire':
          if (p.money >= 1000000) this.unlock(id);
          break;
        case 'upgradeSword':
          if (s.level >= 2) this.unlock(id);
          break;
        case 'masterSword':
          if (s.level === 'Max') this.unlock(id);
          break;
        case 'newSword':
          if (s.rarity >= 2) this.unlock(id);
          break;
        case 'maxSword':
          if (s.rarity >= 7 && s.level === 'Max') this.unlock(id);
          break;
        // Strength achievements
        case 'strengthNovice':
          if ((p.stats.strength || 0) >= 1) this.unlock(id);
          break;
        case 'strengthAdept':
          if ((p.stats.strength || 0) >= 5) this.unlock(id);
          break;
        case 'strengthMaster':
          if ((p.stats.strength || 0) >= 10) this.unlock(id);
          break;
        case 'strengthLegend':
          if ((p.stats.strength || 0) >= 50) this.unlock(id);
          break;
        // Greed achievements
        case 'greedNovice':
          if ((p.stats.greed || 0) >= 1) this.unlock(id);
          break;
        case 'greedAdept':
          if ((p.stats.greed || 0) >= 5) this.unlock(id);
          break;
        case 'greedMaster':
          if ((p.stats.greed || 0) >= 10) this.unlock(id);
          break;
        case 'greedLegend':
          if ((p.stats.greed || 0) >= 50) this.unlock(id);
          break;
        // Luck achievements
        case 'luckNovice':
          if ((p.stats.luck || 0) >= 1) this.unlock(id);
          break;
        case 'luckAdept':
          if ((p.stats.luck || 0) >= 5) this.unlock(id);
          break;
        case 'luckMaster':
          if ((p.stats.luck || 0) >= 10) this.unlock(id);
          break;
        case 'luckLegend':
          if ((p.stats.luck || 0) >= 50) this.unlock(id);
          break;
        // Intelligence achievements
        case 'intelligenceNovice':
          if ((p.stats.intelligence || 0) >= 1) this.unlock(id);
          break;
        case 'intelligenceAdept':
          if ((p.stats.intelligence || 0) >= 5) this.unlock(id);
          break;
        case 'intelligenceMaster':
          if ((p.stats.intelligence || 0) >= 10) this.unlock(id);
          break;
        case 'intelligenceLegend':
          if ((p.stats.intelligence || 0) >= 50) this.unlock(id);
          break;
        // Vitality achievements
        case 'vitalityNovice':
          if ((p.stats.vitality || 0) >= 1) this.unlock(id);
          break;
        case 'vitalityAdept':
          if ((p.stats.vitality || 0) >= 5) this.unlock(id);
          break;
        case 'vitalityMaster':
          if ((p.stats.vitality || 0) >= 10) this.unlock(id);
          break;
        case 'vitalityLegend':
          if ((p.stats.vitality || 0) >= 50) this.unlock(id);
          break;
        // Total Stat achievements
        case 'statNovice':
          if (totalStats >= 5) this.unlock(id);
          break;
        case 'statAdept':
          if (totalStats >= 10) this.unlock(id);
          break;
        case 'statMaster':
          if (totalStats >= 50) this.unlock(id);
          break;
        case 'statLegend':
          if (totalStats >= 100) this.unlock(id);
          break;
        // All Stats achievements
        case 'allStatsNovice':
          if (Object.values(p.stats).every(v => (v || 0) >= 10)) this.unlock(id);
          break;
        case 'allStatsAdept':
          if (Object.values(p.stats).every(v => (v || 0) >= 25)) this.unlock(id);
          break;
        case 'allStatsMaster':
          if (Object.values(p.stats).every(v => (v || 0) >= 50)) this.unlock(id);
          break;
        case 'allStatsLegend':
          if (Object.values(p.stats).every(v => (v || 0) >= 100)) this.unlock(id);
          break;
      }
    }  
  }

  has(id) {
    return this.player.achievements.includes(id);
  }

  unlock(id) {
    if (!this.has(id)) {
      this.player.achievements.push(id);
      const a = this.defs.find(d => d.id === id);
      this.log?.(`🏆 Achievement unlocked: ${a.name} — ${a.desc}`, 'achievement');
    }
  }
}
