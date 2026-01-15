import React from 'react';
import { getRarityClass, getItemRarity } from './../js/utils/rarity.js'; // adjust path

export default function ItemTooltip({ item }) {
  if (!item) return null;

  const rarityClass = getRarityClass(item.rarity);
  const itemRarity = getItemRarity(item.rarity);
  const capitalize = (str) => (typeof str === 'string' && str.length > 0) ? str.charAt(0).toUpperCase() + str.slice(1) : str;

  // Build stat lines safely
  const statLines = [];

  // Weapon
  if (item.type === 'weapon') {
    if (item.damage !== undefined) statLines.push(`Damage: ${item.damage}`);
    if (item.strength !== undefined) statLines.push(`Strength: ${item.strength}`);
    if (item.levelReq !== undefined) statLines.push(`\nLevel Requirement: ${item.levelReq}`);
  }

  // Armour (your items use `defence` spelling)
  if (item.type === 'armour') {
    if (item.defence !== undefined) statLines.push(`Defence: ${item.defence}`);
    if (item.vitality !== undefined) statLines.push(`Vitality: ${item.vitality}`);
    if (item.levelReq !== undefined) statLines.push(`\nLevel Requirement: ${item.levelReq}`);
  }

  // Potion
  if (item.type === 'potion') {
    if (item.heal !== undefined) statLines.push(`Heal: ${item.heal}`);
    if (item.amount !== undefined) statLines.push(`Amount: ${item.amount}`);
    if (item.levelReq !== undefined) statLines.push(`\nLevel Requirement: ${item.levelReq}`);
  }

  // Accessory
  if (item.type === 'accessory') {
    // Prefer assignedStats (created at item instantiation). It's an object like { luck: 4, greed: 8 }
    if (item.assignedStats && typeof item.assignedStats === 'object') {
      // keep order predictable: luck, greed, intelligence
      ['luck', 'greed', 'intelligence'].forEach(key => {
        if (item.assignedStats[key] !== undefined) {
          statLines.push(`${capitalize(key)}: ${item.assignedStats[key]}`);
        }
      });
    } else {
      // fallback to the preset values (firstValue/secondValue/thirdValue), show them as generic stats
      if (item.firstValue !== undefined)  statLines.push(`Stat 1: ${item.firstValue}`);
      if (item.secondValue !== undefined) statLines.push(`Stat 2: ${item.secondValue}`);
      if (item.thirdValue !== undefined)  statLines.push(`Stat 3: ${item.thirdValue}`);
    }
    if (item.levelReq !== undefined) statLines.push(`\nLevel Requirement: ${item.levelReq}`);
  }

  // Generic stats / meta
  const genericLines = [
    
    (item.level !== undefined && itemRarity) ? `${itemRarity} ${capitalize(item.type)}` : null,
  ].filter(Boolean);

  return (
    <div className={`item-tooltip ${rarityClass}`} style={{
      background: '#111',
      color: '#fff',
      borderRadius: 6,
      border: '2px solid transparent',
      padding: '6px 10px',
      minWidth: 160,
      pointerEvents: 'none',
      whiteSpace: 'pre-line',
      fontSize: 12,
      lineHeight: 1.4,
      zIndex: 999999999,
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>
        {item.name}{item.level !== undefined ? ` — Lvl ${item.level}` : null}
      </div>

      {statLines.length > 0 ? statLines.map((line, i) => <div key={`stat-${i}`}>{line}</div>) : <div style={{ opacity: 0.8 }}>No stats</div>}

      {genericLines.map((line, i) => <div id="rarityLine" key={`gen-${i}`} style={{ marginTop: 6, opacity: 0.9 }}>{line}</div>)}
    </div>
  );
}
