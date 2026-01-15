// src/components/PlayerNameEditor.jsx
import React, { useState, useEffect } from "react";
import { saveNowWithLeaderboard } from "../js/data/storage";
import { safeCheckAchievements } from './../js/utils/safeGame.js'; // adjust path if needed
import "./../styles/playerNameEditor.css";

export default function PlayerNameEditor({ game, player, setPlayer, onEditStateChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(player?.name || "");

  // Keep tempName synced with player prop
  useEffect(() => {
    setTempName(player?.name || "");
  }, [player?.name]);

  // Notify parent when editing starts/stops
  useEffect(() => {
    if (typeof onEditStateChange === "function") {
      onEditStateChange(isEditing);
    }
  }, [isEditing, onEditStateChange]);

  const finishNameEdit = () => {
    const newName = tempName.trim();
    if (!newName) {
      cancelEdit();
      return;
    }

    // Only update if name changed
    if (newName !== player?.name) {
      const updatedPlayer = { ...player, name: newName };

      // Update React state
      setPlayer(updatedPlayer);

      // Update game object
      if (game?.player) {
        game.player.name = newName;
      }

      // Save and check achievements
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
    setTempName(player?.name || "");
    setIsEditing(false);
  };

  return (
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
          {player?.name || "Unnamed Hero"}
        </h1>
      )}
    </div>
  );
}
