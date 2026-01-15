// src/components/GameUI.jsx
import './../styles/game.css';
import './../styles/shared.css';
import React, { useEffect, useState, useRef, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import PlayerInfo from "./PlayerInfo";
import CreatureDisplay from "./CreatureDisplay";
import EquippedWeapon from "./EquippedWeapon";
import * as Menus from "./Menus";
import ChangeLog from './ChangeLog.jsx';
import { clickAttack } from "../js/combat.js";
import { useAlerts } from '../contexts/AlertsContext.jsx';
import * as keybinds from './../js/data/keybinds.js';
import {safeCheckAchievements} from './../js/utils/safeGame.js';
import { saveDebouncedWithLeaderboard } from './../js/data/storage.js';

const VERSION = "0.2.0";
const UI_THROTTLE_MS = 40; // 25 fps cap
const LOG_THROTTLE_MS = 200; // logs update max once per 200ms

export default function GameUI({ game }) {
  const alerts = useAlerts();
  const player = game.player;
  const creature = game.creature;
  const sword = player.equipped?.weapon || game.sword;
  const equippedPotion = player.equipped?.potion || null;
  const globalPotionTemplate = game.potion || null;

  const [menuState, setMenuState] = useState({
    main: false, settings: false, inventory: false, equipment: false,
    stats: false, leaderboard: false, shop: false,
  });
  const [isEditingName, setIsEditingName] = useState(false);

  const lastUIUpdateRef = useRef(0);
  const lastLogUpdateRef = useRef(0);
  const [, forceRender] = useState(0); // triggers React render

  const tickUI = useCallback(() => {
    const now = Date.now();
    if (now - lastUIUpdateRef.current < UI_THROTTLE_MS) return;
    lastUIUpdateRef.current = now;
    forceRender(v => v + 1);
  }, []);

  const tickLogs = useCallback(() => {
    const now = Date.now();
    if (now - lastLogUpdateRef.current < LOG_THROTTLE_MS) return;
    lastLogUpdateRef.current = now;
    forceRender(v => v + 1);
  }, []);
  


  useEffect(() => {
    const unsubscribeUI = game.subscribe(tickUI);
    const unsubscribeLogs = game.subscribe(tickLogs);

    const handleKeyDown = (e) => {
      if (isEditingName) return;
      if (keybinds.keyMatches("toggleMenu", e)) setMenuState(s => ({ ...s, main: !s.main }));
      if (keybinds.keyMatches("statMenu", e)) setMenuState(s => ({ ...s, stats: !s.stats }));
      if (keybinds.keyMatches("leaderboard", e)) setMenuState(s => ({ ...s, leaderboard: !s.leaderboard }));
      if (keybinds.keyMatches("inventory", e)) setMenuState(s => ({ ...s, inventory: !s.inventory }));
      if (keybinds.keyMatches("equipment", e)) setMenuState(s => ({ ...s, equipment: !s.equipment }));
      if (keybinds.keyMatches("shop", e)) setMenuState(s => ({ ...s, shop: !s.shop }));
      if (keybinds.keyMatches("usePotion", e)) {
        if (equippedPotion) {
          if (typeof equippedPotion.use === "function") {
            equippedPotion.use(player, game);
          } else {
            // equippedPotion is a plain object/template - try consumeTemplate + decrement in inventory/equipped
            const healed = Potion.consumeTemplate(equippedPotion, player, game);
            if (healed) {
              // if equipped slot stored amount, decrement it
              if (typeof equippedPotion.amount === "number") {
                equippedPotion.amount = Math.max(0, equippedPotion.amount - 1);
                if (equippedPotion.amount <= 0) player.equipped.potion = null;
              } else {
                // fallback: try to find matching inventory stack and decrement
                const invStack = (player.inventory || []).find(it => it.type === 'potion' && (it.name === equippedPotion.name || it.itemId === equippedPotion.itemId));
                if (invStack) {
                  invStack.amount = (invStack.amount || 1) - 1;
                  if (invStack.amount <= 0) {
                    const idx = player.inventory.indexOf(invStack);
                    if (idx !== -1) player.inventory.splice(idx, 1);
                  }
                }
              }
              game.notify?.();
              game.save?.();
            }
          }
        } else {
          // no equipped potion: try to find inventory stack (which may be plain POJO or a Potion instance)
          const invPotion = (player.inventory || []).find(it => it.type === 'potion');
          if (invPotion) {
            if (typeof invPotion.use === "function") {
              invPotion.use(player, game);
            } else {
              // plain object: try to consume and remove one from stack
              const healed = Potion.consumeTemplate(invPotion, player, game);
              if (healed) {
                invPotion.amount = Math.max(0, (invPotion.amount || 1) - 1);
                if (invPotion.amount <= 0) {
                  const idx = player.inventory.indexOf(invPotion);
                  if (idx !== -1) player.inventory.splice(idx, 1);
                }
                game.notify?.();
                game.save?.();
              }
            }
          } else if (globalPotionTemplate) {
            // last-resort: use a global potion template (game.potion) if present
            if (typeof globalPotionTemplate.use === "function") {
              globalPotionTemplate.use(player, game);
            } else {
              const healed = Potion.consumeTemplate(globalPotionTemplate, player, game);
              if (healed) {
                // no inventory to decrement for global template; notify/save
                game.notify?.();
                game.save?.();
              }
            }
          } else {
            // no potion anywhere
            (typeof game.log === "function") ? game.log('No potion available', 'warning') : console.warn('No potion available');
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      unsubscribeUI?.();
      unsubscribeLogs?.();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [game, tickUI, tickLogs, isEditingName]);


  const handleUpgradeStat = (stat) => {
  const player = game.player;
  if (!player || player.statPoints <= 0) return;

  // 1. Increment chosen stat
  player.stats[stat] += 1;
  player.stats.total +=1;
  player.statPoints -= 1;

  // 2. Apply vitality healing if upgraded
  if (stat === "vitality" && typeof player.vitHeal === "function") {
    player.vitHeal();
  }

  // 3. Achievements & UI update
  game.achievements.player = player;
  game?.achievements?.check?.(game);
  saveDebouncedWithLeaderboard(game);
  game.notify();
  tickUI(); // React re-render
};

const handleRespec = () => {
  const player = game.player;
  if (!player) return;

  alerts.respecAlert();

  // 4. Achievements & UI update
  game.achievements.player = player;
  game?.achievements?.check?.(game);
  game.notify();
  saveDebouncedWithLeaderboard(game);
  tickUI(); // React re-render
};
  const handleAttack = useCallback((evt) => {
    clickAttack(game, alerts);
    game.notify?.();
    tickUI();
    tickLogs();
  }, [game, alerts]);

  if (!game?.player || !game?.creature) return <div>Loading game...</div>;

    return (
        <div id="desktopGameRoot" className="game-root">
            <div className="desktop-topBar">
                <div className="topBar-left">
                    <PlayerInfo player={player} onNameEdit={(editing) => setIsEditingName(editing)} game={game} />
                </div>
                <div className="topBar-center">
                    <CreatureDisplay creature={creature} />
                </div>
                <div className="topBar-right">
                    <div className="gold-coin">
                        <img src="/assets/coin.png" alt="Gold" className="coinIcon" />
                        {player.money ?? 0}
                    </div>
                </div>
            </div>
            <DndProvider backend={HTML5Backend}>
                <Menus.InventoryMenu player={player} game={game} isVisible={menuState.inventory} onClose={() => setMenuState(s => ({ ...s, inventory: false }))} />
                <Menus.EquipmentMenu player={player} game={game} isVisible={menuState.equipment} onClose={() => setMenuState(s => ({ ...s, equipment: false }))} />
            </DndProvider>
            <Menus.MainMenu visible={menuState.main} onClose={() => setMenuState(s => ({ ...s, main: false }))} onSave={() => game.notify()} onSettings={() => setMenuState(s => ({ ...s, settings: true }))} onDelete={() => alerts.deleteAlert()} />
            <Menus.SettingsMenu visible={menuState.settings}onClose={() => setMenuState(s => ({ ...s, settings: false }))} />
            <Menus.StatMenu visible={menuState.stats} onUpgradeStat={handleUpgradeStat} onRespec={handleRespec} player={player} game={game} onClose={() => setMenuState(s => ({ ...s, stats: false }))} />
            <Menus.LeaderboardMenu visible={menuState.leaderboard} currentPlayer={player} game={game} onClose={() => setMenuState(s => ({ ...s, leaderboard: false }))} />
            <Menus.ShopMenu visible={menuState.shop} game={game} onClose={() => setMenuState(s => ({ ...s, shop: false }))} />
            
            <div id="bottomSection">
                <div id="versionNumber">V.{game.version}</div>
                <ChangeLog />
            </div>
        </div>
    );
}