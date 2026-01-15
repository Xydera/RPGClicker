export function getRarityClass(rarity) {
  if (rarity <= 1) return "rarity-common";
  if (rarity === 2) return "rarity-uncommon";
  if (rarity === 3) return "rarity-rare";
  if (rarity === 4) return "rarity-epic";
  if (rarity === 5) return "rarity-legendary";
  if (rarity === 6) return "rarity-mythical";
  if (rarity >= 7) return "rarity-celestial";
  return "rarity-common";
}

export function getItemRarity(rarity){
  const rarites = {
    1: "Common ",
    2: "Uncommon ",
    3: "Rare ",
    4: "Epic ",
    5: "Legendary ",
    6: "Mythical ",
    7: "Celestial "
  };
  return rarites[rarity] || "Unknown Quality"
}

export function getPotionName(rarity) {
    const names = {
      1: "Lesser Potion of Restoration",
      2: "Minor Potion of Restoration",
      3: "Major Potion of Restoration",
      4: "Lesser Healing Elixir",
      5: "Minor Healing Elixir",
      6: "Major Healing Elixir",
      7: "Elixir of Life"
    };
    return names[rarity] || "Unknown Potion";
}
