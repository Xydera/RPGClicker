import React, { useEffect, useState } from "react";
import Menu from './Menu.jsx';
import potionImage from "/assets/potion.png";
import { saveDebouncedWithLeaderboard } from './../../js/data/storage.js';
import './../../styles/shop.css';


export default function ShopMenu({ game, visible, onClose }) {
  const [, forceRender] = useState(0);

  // Subscribe to game changes for reactive UI
  useEffect(() => {
    if (!game?.subscribe) return;
    const unsubscribe = game.subscribe(() => forceRender(v => v + 1));
    return () => unsubscribe?.();
  }, [game]);

  if (!visible) return null;
  if (!game || !game.player) return <div>Loading Shop...</div>;

const player = game.player;
const weapon = player?.equipped?.weapon;
const potion = player?.equipped?.potion || game.potion;

// find potion stack inside inventory
const invPotion = Array.isArray(player?.inventory)
  ? player.inventory.find(it => it.type === "potion")
  : null;

// safely sum equipped + inventory potion counts
const totalPotions = (invPotion?.amount || 0);

  return (
    <Menu title="Shop" isVisible={visible} onClose={onClose}>
      <div className="space-y-6 p-4 text-white">

        {/* --- Sword Section --- */}
        <div className="infoBox flex items-center gap-4 p-3 rounded-xl bg-gray-800">
          <img
            src={weapon?.image || "/assets/sword1.png"}
            alt={weapon?.name || "Sword"}
            className="itemImage w-16 h-16 rounded-lg border border-gray-600"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">
              {weapon?.name || "No Weapon Equipped"}<br/>
              Level: {weapon?.level || 1}<br/>
              Damage: {weapon ? weapon.damage : 0}
            </h3>
            <button
              className="shopBtn"
              onClick={() => {
                weapon?.upgrade?.(player);
                game.notify();
                saveDebouncedWithLeaderboard(game);
              }}
            >
              {weapon?.level < 10 ? "Upgrade Sword" : "New Sword"}:{" "}
              <img src={"/assets/coin.png"} alt="coin" className="coinIconShop" /> {weapon?.upgradeCost || 0}
            </button>
          </div>
        </div>

        {/* --- Potion Section --- */}
        <div className="infoBox flex items-center gap-4 p-3 rounded-xl bg-gray-800">
          <img
            src={potionImage}
            alt="Potion"
            className="itemImage w-16 h-16 rounded-lg border border-gray-600 cursor-pointer"
            onClick={() => {
              game.usePotion?.();
              game.notify();
              saveDebouncedWithLeaderboard(game);
            }}
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">
              {potion?.name || "Potion"}<br/>
              Level: {potion?.level || 1}<br/>
              Amount: {totalPotions || 0}
            </h3>

            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <button
                className="shopBtn"
                onClick={() => {
                  potion?.upgrade?.(player);
                  game.notify();
                  saveDebouncedWithLeaderboard(game);
                }}
              >
                {potion?.level === 10 ? "Increase Potion Rarity" : "Upgrade"}:{" "}
                <img src={"/assets/coin.png"} alt="coin" className="coinIconShop"/> {potion?.upgradeCost || 0}
              </button>
            </div>
          </div>
        </div>

      </div>
    </Menu>
  );
}
