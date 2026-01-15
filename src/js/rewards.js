// rewards.js
import { templateEffectiveDropChance, createItemFromId } from './items/item';
import { items } from "./data/items.js";

export function rollWeightedNoDropPity(itemsPool, options = {}) {
  const {
    luck = 0,
    noDropWeight = 1,
    pityState = { counter: 0 },
    pityThreshold = 50,
    pityBoostMultiplier = 3,
    pityAppliesToRarity = 3,
    rareThreshold = 3
  } = options;

  const pool = itemsPool.slice();
  if (pool.length === 0) return { drops: [], pityState };

  // compute base weights per template
  const weights = pool.map(t => templateEffectiveDropChance(t, luck, rareThreshold));

  // apply pity boost to rare items if triggered
  if ((pityState?.counter || 0) >= pityThreshold) {
    for (let i = 0; i < pool.length; i++) {
      if ((pool[i].rarity || 0) >= pityAppliesToRarity) {
        weights[i] *= pityBoostMultiplier;
      }
    }
  }

  // add a no-drop virtual weight
  const combined = weights.concat([noDropWeight]);
  const total = combined.reduce((s, w) => s + w, 0);
  if (total <= 0) {
    pityState.counter = (pityState.counter || 0) + 1;
    return { drops: [], pityState };
  }

  // single pick
  let r = Math.random() * total;
  let idx = 0;
  while (idx < combined.length && r > 0) {
    r -= combined[idx];
    if (r <= 0) break;
    idx++;
  }
  if (idx >= combined.length) idx = combined.length - 1;

  if (idx === combined.length - 1) {
    // no-drop chosen
    pityState.counter = (pityState.counter || 0) + 1;
    return { drops: [], pityState };
  } else {
    // item chosen
    const chosenTemplate = pool[idx];
    pityState.counter = 0;
    const instance = createItemFromId(chosenTemplate.itemId, { level: chosenTemplate.level || 1 });
    return { drops: instance ? [instance] : [], pityState };
  }
}

/**
 * rollMultiDrop
 * - Attempt `count` extra drops (useful for gold, consumables, low tier gear).
 * - By default it biases later picks to lower rarities to avoid giving a second legendary.
 * - options:
 *    { count = 3, luck, noDropWeight, pityState, pityThreshold, pityBoostMultiplier, pityAppliesToRarity,
 *      rareThreshold, maxRarityPerPick } 
 *
 * Behavior implemented:
 * - First pick uses full pool (allows rare/epic), subsequent picks filter to maxRarity=2 (uncommon) by default.
 * - Each pick uses rollWeightedNoDropPity logic but without resetting pity (pity only applies to picks where rarity allowed).
 *
 * Returns { drops: [instances], pityState } - pityState is mutated in-place.
 */
export function rollMultiDrop(itemsPool, options = {}) {
  const {
    count = 3,
    luck = 0,
    noDropWeight = 1,
    pityState = { counter: 0 },
    pityThreshold = 50,
    pityBoostMultiplier = 3,
    pityAppliesToRarity = 3,
    rareThreshold = 3,
    // per-pick max rarities: allow the function caller to override; default bias: first pick full, rest <=2
    maxRarityPerPick = null
  } = options;

  const results = [];
  // helper to perform one pick from a filtered pool but without resetting the provided pityState if needed
  const onePick = (pool, pickOptions) => {
    // Use the same weighted picker but ensure we only pick one
    return rollWeightedNoDropPity(pool, pickOptions);
  };

  for (let pickIndex = 0; pickIndex < count; pickIndex++) {
    // determine allowed pool for this pick
    let pickPool = itemsPool.slice();

    // if maxRarityPerPick is an array, use element, otherwise if number use that, else default: allow only commons/uncommons after first
    let allowedMaxRarity = null;
    if (Array.isArray(maxRarityPerPick)) {
      allowedMaxRarity = maxRarityPerPick[pickIndex] ?? maxRarityPerPick[maxRarityPerPick.length - 1];
    } else if (typeof maxRarityPerPick === 'number') {
      allowedMaxRarity = maxRarityPerPick;
    } else {
      allowedMaxRarity = (pickIndex === 0) ? Infinity : 2; // first pick any rarity, subsequent picks <= uncommon (2)
    }

    if (Number.isFinite(allowedMaxRarity)) {
      pickPool = pickPool.filter(t => (t.rarity || 0) <= allowedMaxRarity);
    }

    if (pickPool.length === 0) continue;

    const { drops, pityState: newPity } = onePick(pickPool, {
      luck,
      noDropWeight,
      pityState,
      pityThreshold,
      pityBoostMultiplier,
      pityAppliesToRarity,
      rareThreshold
    });

    // merge pity from the pick (picker mutates pityState anyway, this is just explicit)
    // (we pass the same pityState object each pick, so it's automatically updated)

    if (drops && drops.length > 0) {
      // we only expect at most one element per pick
      results.push(...drops);
    }
    // continue to next pick (pityState persists)
  }

  return { drops: results, pityState };
}

// utility: returns numeric stat value (or 0)
export function getAccessoryStats(item, statName) {
  if (!item || !statName) return 0;
  const assigned = item.assignedStats;
  if (assigned && typeof assigned === 'object') {
    const v = assigned[statName];
    return (typeof v === 'number') ? v : 0;
  }
  return 0;
}

export function computeXpGain(player, item, creature) {
  const intBonus = player?.stats?.intelligence || 0;
  const itemInt = getAccessoryStats(item, 'intelligence');
  const totalInt = intBonus + itemInt;

  const baseXp = (creature?.baseXp || 1) * (creature?.level || 1);
  const xpFromCreature = Math.floor(Math.random() * 4 + baseXp + totalInt);
  return xpFromCreature;
}

export function computeGoldGain(player, item, creature) {
  const greedBonus = player?.stats?.greed || 0;
  const itemGreed = getAccessoryStats(item, 'greed');
  const totalGreed = greedBonus + itemGreed;

  const baseGold = (creature?.baseGold || 1) * (creature?.level || 1);
  const goldFromCreature = Math.floor(Math.random() * 3 + baseGold + totalGreed);
  return goldFromCreature;
}


export function buildLootPoolForCreature(creature, { types = null, includeRarities = null } = {}) {
  const lvl = creature?.level || 1;
  return items.filter(t => {
    // ignore templates with explicit levelReq > creature.level
    if (typeof t.levelReq === 'number' && t.levelReq > lvl) return false;
    if (Array.isArray(types) && types.length > 0) {
      if (!types.includes(t.type)) return false;
    }
    if (Array.isArray(includeRarities) && includeRarities.length > 0) {
      if (!includeRarities.includes(t.rarity)) return false;
    }
    return true;
  });
}
