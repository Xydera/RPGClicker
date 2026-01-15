// src/components/MobileGameUI.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import './../styles/mobile.css';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import * as TouchBackendModule from "react-dnd-touch-backend"; 

import PlayerInfo from "./PlayerInfo";
import CreatureDisplay from "./CreatureDisplay";
import EquippedDisplay from "./EquippedDisplay";
import * as Menus from "./Menus";
import ChangeLog from './ChangeLog.jsx';
import { clickAttack } from "../js/combat.js";
import { useAlerts } from '../contexts/AlertsContext.jsx';
import { saveDebouncedWithLeaderboard } from './../js/data/storage.js';

const UI_THROTTLE_MS = 40; // 25 fps cap

// Mobile-optimized UI for touch devices.
// Props: { game }
export default function MobileGameUI({ game }) {
    const alerts = useAlerts();
    const player = game.player;
    const creature = game.creature;
    const sword = player.equipped?.weapon || game.sword;

    const [menuState, setMenuState] = useState({
    main: false, settings: false, inventory: false, equipment: false,
    stats: false, leaderboard: false, shop: false,
    });
    const [isEditingName, setIsEditingName] = useState(false);

    const lastUIUpdateRef = useRef(0);
    const [, forceRender] = useState(0); // triggers React render

    const tickUI = useCallback(() => {
      const now = Date.now();
      if (now - lastUIUpdateRef.current < UI_THROTTLE_MS) return;
      lastUIUpdateRef.current = now;
      forceRender(v => v + 1);
    }, []);

    // Subscribe simple game tick to update UI (best-effort)
    useEffect(() => {
      const unsubscribe = game.subscribe(() => tickUI());
      return () => unsubscribe?.();
    }, [game, tickUI]);

    const xpPercent = Math.min(100, Math.floor((player.xp / player.maxXp) * 100));
    // normalise to whatever shape is exported:
    const TouchBackend =
    TouchBackendModule?.default ?? TouchBackendModule?.TouchBackend ?? TouchBackendModule;

    // detect touch device
   const isTouchDevice = () =>
    typeof window !== "undefined" &&
    ("ontouchstart" in window ||
    (navigator && navigator.maxTouchPoints && navigator.maxTouchPoints > 0));

    // choose backend factory
    const backendFactory = isTouchDevice() ? TouchBackend : HTML5Backend;

    // sanity check
    if (typeof backendFactory !== "function") {
    console.error("Dnd backend is not a function — got:", backendFactory);
    // fallback to HTML5Backend so app doesn't crash
    }
    const backend = backendFactory;

    // Floating damage numbers management
    const dmgContainerRef = useRef(null);
    const nextIdRef = useRef(1);



    // Show a floating number at (x,y) relative to container
    const showFloatingNumber = (text, x = 0.5, y = 0.5, extraClass = "") => {
    const container = dmgContainerRef.current;
    if (!container) return;
    const id = nextIdRef.current++;
    const el = document.createElement("div");
    el.className = `float-dmg ${extraClass}`;
    el.textContent = text;
    // position using percentage so it scales with container
    el.style.left = `${x * 100}%`;
    el.style.top = `${y * 100}%`;
    el.dataset.id = id;
    container.appendChild(el);

    // animate & remove
    requestAnimationFrame(() => el.classList.add("animate"));
    setTimeout(() => {
        el.classList.remove("animate");
        el.classList.add("fade");
    }, 700);
    setTimeout(() => {
        el.remove();
    }, 1400);
    };

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


    // central attack action
    const handleAttack = useCallback((evt) => {
    // play the same logic you have in desktop: use clickAttack(game, alerts)
    clickAttack(game, alerts);

    // compute approximate click position inside creature area to display float
    const container = dmgContainerRef.current;
    if (container && evt && evt.nativeEvent) {
        const rect = container.getBoundingClientRect();
        const ex = evt.nativeEvent.clientX ?? (rect.left + rect.width / 2);
        const ey = evt.nativeEvent.clientY ?? (rect.top + rect.height / 2);
        const x = (ex - rect.left) / rect.width;
        const y = (ey - rect.top) / rect.height;
    }

    // notify + save similar to desktop code flow
    game.notify?.();
    saveDebouncedWithLeaderboard(game);
    }, [game, alerts]);

    // quick-use potion button handler (re-uses desktop keybind behavior)
    const handleUsePotion = () => {
    const invPotion = (player.inventory || []).find(it => it.type === 'potion');
        if (invPotion){
            // no equipped potion: try to find inventory stack (which may be plain POJO or a Potion instance)
            
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
        };

  if (!game?.player || !game?.creature) return <div className="mobile-loading">Loading game...</div>;

  return (
    <div id="mobileGameRoot" className="mobile-root">
      {/* Top status bar */}
      <div className="mobile-topbar">
        <div className="top-left">
          <div className="mini-player">
            <div className="player-name">{player.name || "You"} </div>
            <div className="player-level">Level: {player.level}</div>
            <div className="player-hp">❤ {Math.floor(player.health ?? 0)}/{Math.floor(player.maxHealth ?? 0)}</div>
          </div>
        </div>

        <div className="top-center">
            <div className="xp-bar-wrap">
              <div className="xp-bar" style={{ width: `${xpPercent}%` }} />
              <span id="xpBarText">{`XP: ${Math.floor(player.xp || 0)} / ${player.maxXp}`}</span>
            </div>
        </div>

        <div className="top-right">
          <div className="gold-coin">
            <img src="/assets/coin.png" alt="Gold" className="coinIcon" />
             {player.money ?? 0}
             </div>
        </div>
      </div>

      {/* Creature + big attack target */}
      <div className="mobile-creature-area" ref={dmgContainerRef} onClick={handleAttack}>
        {/* reuse your CreatureDisplay so animations/effects stay consistent */}
        <CreatureDisplay player={player} creature={creature} onClickAttack={() => {}} />
        {/* big translucent attack hint */}
        <div className="attack-hint">Tap to attack</div>
        <div className="equipDisplay">
          <EquippedDisplay player={player} />
        </div>
        {/* floating damage numbers will be appended into the container via DOM */}
        <div className="float-dmg-layer" aria-hidden="true" />
      </div>
      {/* Bottom panel: equipped weapon + quick action */}
      <div className="mobile-bottom-panel">
        <div className="quick-actions">
          <button className="qa-btn" onClick={() => setMenuState(s => ({ ...s, inventory: !s.inventory  }))} aria-label="Inventory">Inv</button>
          <button className="qa-btn" onClick={() => setMenuState(s => ({ ...s, equipment: !s.equipment }))} aria-label="Equipment">Eq</button>
          <button className="qa-btn" onClick={handleUsePotion} aria-label="Use Potion">Potion</button>
          <button className="qa-btn" onClick={() => setMenuState(s => ({ ...s, shop: !s.shop }))} aria-label="Shop">Shop</button>
          
        </div>
      </div>

      {/* bottom nav collapsed for quick access */}
      <nav className="mobile-nav">
        <button onClick={() => setMenuState(s => ({ ...s, main: !s.main }))}>Menu</button>
        <button onClick={() => setMenuState(s => ({ ...s, stats: !s.stats }))}>Stats</button>
        <button onClick={() => setMenuState(s => ({ ...s, leaderboard: !s.leaderboard }))}>Leaderboard</button>
      </nav>

      {/* reuse your existing Menus — they will render as overlays/modal */}
      <DndProvider backend={backend}>
            <Menus.InventoryMenu player={player} game={game} isVisible={menuState.inventory} onClose={() => setMenuState(s => ({ ...s, inventory: false }))} />
            <Menus.EquipmentMenu player={player} game={game} isVisible={menuState.equipment} onClose={() => setMenuState(s => ({ ...s, equipment: false }))} />
      </DndProvider>
      <Menus.MainMenu visible={menuState.main} onClose={() => setMenuState(s => ({ ...s, main: false }))} onSave={() => game.notify()} onSettings={() => setMenuState(s => ({ ...s, settings: true }))} onDelete={() => alerts.deleteAlert()} />
      <Menus.SettingsMenu visible={menuState.settings} onClose={() => setMenuState(s => ({ ...s, settings: false }))} />
      <Menus.StatMenu visible={menuState.stats} onUpgradeStat={handleUpgradeStat} onRespec={() => { alerts.respecAlert(); game.notify?.(); saveDebouncedWithLeaderboard(game); }} player={player} game={game} onClose={() => setMenuState(s => ({ ...s, stats: false }))} />
      <Menus.LeaderboardMenu visible={menuState.leaderboard} currentPlayer={player} game={game} onClose={() => setMenuState(s => ({ ...s, leaderboard: false }))} />
      <Menus.ShopMenu visible={menuState.shop} game={game} onClose={() => setMenuState(s => ({ ...s, shop: false }))} />

      <div className="mobile-bottom-meta">
        <div className="version">V.{game.version}</div>
      </div>
    </div>
  );
}
