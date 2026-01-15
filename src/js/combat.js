// js/combat.js
import { computeXpGain, computeGoldGain, rollWeightedNoDropPity, rollMultiDrop, buildLootPoolForCreature, getAccessoryStats }  from '../js/rewards.js';
import { saveDebouncedWithLeaderboard } from './data/storage.js';
import { safeCheckAchievements } from './utils/safeGame';

let lastClick = 0;
const CLICK_THROTTLE_MS = 45;

// Log throttling: store timestamps for last log per type to avoid spam
const lastLogTimestamps = new Map();
const LOG_THROTTLE_MS = 200; // don't log same type more than once every 200ms

export function clickAttack(game, alerts, clickEvent = null) {
  if (!game) return null;
  const player = game.player;
  const creature = game.creature;
  const sword = player?.equipped?.weapon || game.sword;
  const ring = player?.equipped?.accessory || game.accessory;
  const armour = player?.equipped?.armour || game.armour;
  if (!player || !creature || !sword || creature.currentHealth <= 0) return null;

  const now = Date.now();
  if (now - lastClick < player.stats.attackSpeed) return null;
  lastClick = now;

  const log = (msg, type = 'combat') => {
    const last = lastLogTimestamps.get(type) || 0;
    lastLogTimestamps.set(type, now);
    try { game?.log?.(msg, type); } catch {}
  };

  // Player attack
  const baseDamage = 1;
  const initialDamage = (baseDamage + (sword.damage || 0)) * (1 + (player.stats.strength + (sword.strength || 0)) / 100);

  // Level scaling
  const combatLevelBonus = player.level * 0.04;
  const damageMultiplier = 1 + combatLevelBonus;

  // Crit check (boolean)
  const isCrit = Math.random() < (player.stats.critChance || 0);
  const critMultiplier = isCrit ? (1 + (player.stats.critDamage / 100)) : 1;

  // Final damage
  const armourBonus = player.bonuses?.armourPen || 0;
  const finalDamage = Math.floor(initialDamage * damageMultiplier * (1 + armourBonus) * critMultiplier);

  // Apply to creature
  creature.currentHealth = Math.max(0, creature.currentHealth - finalDamage);

  // Get click coords (viewport) if available
  const clickX = clickEvent?.clientX ?? null;
  const clickY = clickEvent?.clientY ?? null;

  // Emit floating damage number (player damage) with coords + crit
  try {
    window.dispatchEvent(new CustomEvent('damageNumber', {
      detail: {
        value: finalDamage,
        source: 'player',
        target: 'creature',
        timestamp: Date.now(),
        crit: !!isCrit,
        x: clickX,
        y: clickY
      }
    }));
  } catch (e) { /* ignore */ }

  // Enemy counter-attack (unchanged, but also emit event with coords == null)
  if (creature.currentHealth > 0 && Math.random() < (creature.attackChance ?? 0.25)) {
    const maxD = Math.max(1, creature.maxDamage ?? creature.baseDamage ?? 1);
    const levelBias = Math.floor(Math.max(1, creature.level) / 2);

    const defence = (player.stats.defence || 0) + (armour?.defence || 0);
    const rawDamage = Math.max(1, Math.floor(Math.random() * maxD) + 1 + levelBias);

    const defenceFactor = 100 / (defence + 100);
    const damageTaken = Math.max(1, Math.floor(rawDamage * defenceFactor));

    player.health = Math.max(0, player.health - damageTaken);

    // Emit floating damage number (enemy -> player) - no coords
    try {
      window.dispatchEvent(new CustomEvent('damageNumber', {
        detail: {
          value: damageTaken,
          source: 'enemy',
          target: 'player',
          timestamp: Date.now(),
          crit: false,
          x: null,
          y: null
        }
      }));
    } catch (e) { /* ignore */ }

    if (player.health === 0) {
      alerts?.deathAlert?.();
      player.respawn();
    }
  }


  // Creature killed
  if (creature.currentHealth === 0 && !creature._rewardGranted) {
    creature._rewardGranted = true;

   

    const xp = computeXpGain(player, ring, creature);
    const gold = computeGoldGain(player, ring, creature);
    const pLuck = player.stats.luck || 0;
    const rLuck = getAccessoryStats(ring, 'luck') || 0;
    const luck = pLuck + rLuck;

    player.addXp(xp);
    player.addGold(gold);

    // after player.addXp(xp); player.addGold(gold);
    try {
      // small pop in HUD for +xp/+gold
      window.dispatchEvent(new CustomEvent('rewardPopup', {
        detail: { xp, gold, timestamp: Date.now() }
      }));

      // Big gold pop near creature (visual)
      window.dispatchEvent(new CustomEvent('damageNumber', {
        detail: {
          value: `+${gold}`,
          source: 'system',
          target: 'creature', // show near creature
          timestamp: Date.now(),
          crit: false,
          x: null,
          y: null,
          meta: { kind: 'gold' }
        }
      }));
    } catch (e) { /* ignore */ }

    // build a pool appropriate for this creature (limit by levelReq, maybe types)
    const lootPoolAll = buildLootPoolForCreature(creature, { types: ["weapon", "accessory", "armour", "potion"]});

    // major drop: single weighted pick (max 1)
    const majorOptions = {
      luck: luck || 0,
      noDropWeight: 3,               // tweak: larger => more likely no-drop
      pityState: player.pityState,
      pityThreshold: 500,
      pityBoostMultiplier: 3,
      pityAppliesToRarity: 3,
      rareThreshold: 3
    };
    const { drops: majorDrops } = rollWeightedNoDropPity(lootPoolAll, majorOptions);
    // combine drops
    const allDrops = [...(majorDrops || [])];

    // give items to player inventory (instances returned by factory are ready)
    if (allDrops.length > 0) {
      for (const it of allDrops) {
        if (!it) continue;
        // If you want stackable behaviour (like potions), detect and merge:
        if (it.quantity && it.quantity > 1) {
          // try to merge into existing inventory stack by itemId
          const existing = player.inventory.find(inv => inv.itemId === it.itemId);
          if (existing) {
            existing.quantity = (existing.quantity || 1) + it.quantity;
          } else {
            player.inventory.push(it);
          }
        } else {
          player.inventory.push(it);
        }
        log(`You found: ${it.name || it.itemId}!`, 'loot');
      }
    } else {
      // optional: log no major drops
      log(`No item dropped.`, 'loot');
    }



    player.kills ??= {};
    player.kills.total = (player.kills.total ?? 0) + 1;
    player.kills[creature.name.toLowerCase()] =
    (player.kills[creature.name.toLowerCase()] ?? 0) + 1;

    // Spawn next creature after a tiny delay to allow animations / UI
    setTimeout(() => {
      try {
        creature._rewardGranted = false;
        if (typeof creature.spawnNext === 'function') {
          creature.spawnNext(player);
          game.notify();
        }
      } catch (e) {
        console.error('Error spawning next creature:', e);
      }
    }, 50);
  }

  // Achievements and save
  game.achievements.player = player;
  game?.achievements?.check?.(game);
  saveDebouncedWithLeaderboard(game);

  // Notify UI
  game.notify();

  return {
    player: { ...player },
    creature: { ...creature },
  };
}
