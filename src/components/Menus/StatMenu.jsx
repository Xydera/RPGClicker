import React from "react";
import Menu from "./Menu.jsx";

export default function StatMenu({ visible, onClose, player, onUpgradeStat, onRespec }) {
  if (!visible) return null;

  const baseStats = player?.stats ?? {};
  const sword = player?.equipped?.weapon ?? null;
  const ring = player?.equipped?.accessory ?? null;
  const armour = player?.equipped?.armour ?? null;

  const baseStrength = baseStats.strength ?? 0;
  const swordStrength = sword?.strength ?? 0;

  // use optional chaining for safety — accessory or assignedStats may be missing
  const greedBase = baseStats.greed ?? 0;
  const greedBonus = ring?.assignedStats?.greed ?? 0;

  const luckBase = baseStats.luck ?? 0;
  const luckBonus = ring?.assignedStats?.luck ?? 0;

  const intBase = baseStats.intelligence ?? 0;
  const intBonus = ring?.assignedStats?.intelligence ?? 0;

  const vitBase = baseStats.vitality ?? 0;
  const vitBonus = armour?.vitality ?? 0;

  return (
    <Menu
      title="Stats"
      isVisible={visible}
      onClose={onClose}
      storageKey="stat-menu"
    >
      <div id="playerStats">
        {player ? (
          <>
            <h3 id="statPoints">Stat Points: {player.statPoints ?? 0}</h3>

            <div className="stat tooltip" data-tooltip="Increases your attack and critical hit damage.">
              <p id="strength">
                Strength: {baseStrength} {swordStrength ? `(+${swordStrength})` : ""}
              </p>
              <button id="strengthUpgradeBtn" onClick={() => onUpgradeStat("strength")}>+</button>
            </div>

            <div className="stat tooltip" data-tooltip="Boosts the amount of gold you earn per kill.">
              <p id="greed">Greed: {greedBase} {greedBonus ? `(+${greedBonus})` : ""}</p>
              <button id="greedUpgradeBtn" onClick={() => onUpgradeStat("greed")}>+</button>
            </div>

            <div className="stat tooltip" data-tooltip="Improves your critical hit chance and rare drops.">
              <p id="luck">Luck: {luckBase} {luckBonus ? `(+${luckBonus})` : ""}</p>
              <button id="luckUpgradeBtn" onClick={() => onUpgradeStat("luck")}>+</button>
            </div>

            <div className="stat tooltip" data-tooltip="Enhances player and skill XP gain.">
              <p id="intelligence">Intelligence: {intBase} {intBonus ? `(+${intBonus})` : ""}</p>
              <button id="intelligenceUpgradeBtn" onClick={() => onUpgradeStat("intelligence")}>+</button>
            </div>

            <div className="stat tooltip" data-tooltip="Player health correlates to your vitality stat.">
              <p id="vitality">Vitality: {vitBase} {vitBonus ? `(+${vitBonus})` : ""}</p>
              <button id="vitalityUpgradeBtn" onClick={() => onUpgradeStat("vitality")}>+</button>
            </div>

            <div className="respec tooltip" data-tooltip="Reset all your stat points to reallocate them. Costs 50% of your current gold.">
              <button id="respecBtn" onClick={onRespec}>Respec</button>
            </div>
          </>
        ) : (
          <p>No player data</p>
        )}
      </div>
    </Menu>
  );
}
