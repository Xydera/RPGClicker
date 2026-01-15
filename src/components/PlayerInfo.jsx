// src/components/PlayerInfoWithNameEditor.jsx
import React, { useState, useEffect } from "react";
import { saveNowWithLeaderboard } from "../js/data/storage";
import { safeCheckAchievements } from './../js/utils/safeGame.js'; // adjust path if needed
import './../styles/playerInfo.css';
import "../styles/game-fx.css"; // FX styles (floats, hud hits, reward pops)

export default function PlayerInfo({ player, game, onToggleStats }) {
  if (!player) return null;

  // --- Local state for name editing ---
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(player.name || "");

  useEffect(() => {
    setTempName(player.name || "");
  }, [player.name]);

  const finishNameEdit = () => {
    const newName = tempName.trim();
    if (!newName) {
      cancelEdit();
      return;
    }
    if (newName !== player.name) {
      // Update game player
      if (game?.player) {
        game.player.name = newName;
      }

      try {
        saveNowWithLeaderboard(game);
        safeCheckAchievements(game);
        game?.notify?.();
      } catch (err) {
        console.error("Name save error:", err);
      }
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setTempName(player.name || "");
    setIsEditing(false);
  };

  // --- Health & XP ---
  const healthPercent = Math.min(100, Math.floor((player.health / player.maxHealth) * 100));
  const xpPercent = Math.min(100, Math.floor((player.xp / player.maxXp) * 100));

  const getHealthGradient = (percent) => {
    if (percent > 60) return "linear-gradient(90deg, #7be76a 0%, #57b846 60%, #3fa33a 100%)";
    if (percent > 30) return "linear-gradient(90deg, #ffe97a 0%, #ffb347 60%, #ff9933 100%)";
    return "linear-gradient(90deg, #ff6a6a 0%, #e64545 60%, #c92a2a 100%)";
  };

  // --- HUD FX: enemy -> player hit numbers and small reward pops ---
  const [hits, setHits] = useState([]);       // enemy -> player hits
  const [rewards, setRewards] = useState([]); // small +xp / +gold pops

  useEffect(() => {
    let mounted = true;

    function handleDamageNumber(e) {
      const d = e.detail || {};
      if (d.target !== "player") return;

      const id = `${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
      const hit = { id, value: d.value, crit: !!d.crit };

      if (!mounted) return;
      setHits(prev => [...prev, hit]);

      // remove after animation (match CSS durations)
      setTimeout(() => {
        setHits(prev => prev.filter(h => h.id !== id));
      }, 950);
    }

    function handleRewardPop(e) {
      const d = e.detail || {};
      const uid = `${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
      const items = [];
      if (d.xp && d.xp > 0) items.push({ id: uid + "_xp", type: "xp", value: "+" + d.xp });
      if (d.gold && d.gold > 0) items.push({ id: uid + "_g", type: "gold", value: "+" + d.gold });

      if (!mounted) return;
      setRewards(prev => [...prev, ...items]);

      setTimeout(() => {
        setRewards(prev => prev.filter(r => !r.id.startsWith(uid)));
      }, 900);
    }

    window.addEventListener("damageNumber", handleDamageNumber);
    window.addEventListener("rewardPopup", handleRewardPop);

    return () => {
      mounted = false;
      window.removeEventListener("damageNumber", handleDamageNumber);
      window.removeEventListener("rewardPopup", handleRewardPop);
    };
  }, []);

  return (
    <div id="playerInfo" style={{ position: "relative" }}>
      {/* HUD FX layer (hits appear top-right, rewards bottom-left) */}
      <div className="hud-fx-layer" aria-hidden="true" style={{ pointerEvents: "none" }}>
        {/* hits near top-right */}
        <div style={{ position: "absolute", right: 8, top: 6 }}>
          {hits.map(h => (
            <div key={h.id} className="hud-damage" style={{ color: h.crit ? "#ffd86b" : "#ffb3b3" }}>
              {h.value}
            </div>
          ))}
        </div>

        {/* small reward pops (left-bottom of this component) */}
       {/* small reward pops (left-bottom of this component) */}
      <div
        style={{
          position: "absolute",
          left: 8,
          bottom: 6,
          display: "flex",
          flexDirection: "column-reverse", // newest appear on top
          gap: 6,
          alignItems: "flex-start",
          pointerEvents: "none",
        }}
      >
        {rewards.map((r) => (
          <div
            key={r.id}
            className={`reward-pop ${r.type === "gold" ? "gold" : "xp"}`}
            // override absolute from global css; let flex handle spacing
            style={{ position: "relative", margin: 0 }}
          >
            {r.value} {r.type === "gold" ? "G" : "XP"}
          </div>
        ))}
</div>

      </div>

      {/* --- Player Name --- */}
      <div id="nameSection">
        {isEditing ? (
          <input
            id="nameInput"
            type="text"
            value={tempName}
            autoFocus
            onChange={(e) => setTempName(e.target.value)}
            onBlur={finishNameEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") finishNameEdit();
              if (e.key === "Escape") cancelEdit();
            }}
            className="player-name-input"
          />
        ) : (
          <h1
            id="playerName"
            className="nameSectionTooltip"
            data-tooltip="Click to change your name!"
            onClick={() => setIsEditing(true)}
            style={{ cursor: "pointer" }}
          >
            {player.name || "Unnamed Hero"}
          </h1>
        )}
      </div>

      {/* --- Health --- */}
      <div id="healthContainer">
        <h2 id="health">Health:</h2>
        <div id="healthBarContainer">
          <div
            id="healthBarFill"
            style={{ width: `${healthPercent}%`, background: getHealthGradient(healthPercent) }}
          />
          <span id="healthBarText">{player.health}/{player.maxHealth}</span>
        </div>
      </div>

      {/* --- Level & XP --- */}
      <div id="levelInfo">
        <h2 id="playerLevel">Level: {player.level}</h2>
        {player.statPoints > 0 && (
          <div
            id="levelTooltip"
            className="tooltip"
            data-tooltip="You have unallocated stat points! Click to allocate them."
          >
            <img
              id="levelIcon"
              src="/assets/Exclaim.png"
              alt="Level Up!"
              onClick={onToggleStats}
              style={{ cursor: "pointer", width: 20, height: 20, marginLeft: 4 }}
            />
          </div>
        )}
        <h3 id="playerXP">XP: {player.xp} / {player.maxXp}</h3>
      </div>

      <div id="xpBarContainer">
        <div
          id="xpBarFill"
          style={{ width: `${xpPercent}%`, background: "linear-gradient(90deg, #78c0ff, #3b82f6)" }}
        />
        <span id="xpBarText">({xpPercent}%)</span>
      </div>

      {/* --- Money --- */}
      <div id="moneyDiv">
        <img id="coinIcon" src={"/assets/coin.png"} alt="coin" />
        <p id="money">{player.money}</p>
      </div>
    </div>
  );
}
