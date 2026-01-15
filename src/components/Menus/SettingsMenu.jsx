import React, { useState } from "react";
import Menu from './Menu.jsx';
import { useAlerts } from "../../contexts/AlertsContext.jsx";
import * as keybinds from '../../js/data/keybinds.js';


export default function SettingsMenu({ visible, onClose }) {
  const alerts = useAlerts(); // 👈 use the alerts system
  const [volume, setVolume] = useState(0.8);
  const [binds, setBinds] = useState(keybinds.getAllKeybinds());

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (typeof window.setGlobalVolume === "function") {
      window.setGlobalVolume(newVolume);
    }
  };

  // Generic function for rebinding keys with alert modal
  const handleRebind = (actionName, label) => {
    alerts.rebindAlert(
      `Press a key to bind for ${label}`,
      `Change ${label} Keybind`,
      (newKey) => {
        if (newKey) {
          keybinds.setKeybind(actionName, newKey);
          alerts.btnAlert(`${label} keybind set to ${newKey.toUpperCase()}`, "Success");
          setBinds(keybinds.getAllKeybinds()); // refresh display
        } else {
          alerts.btnAlert(`Keybind for ${label} was cancelled.`, "Cancelled");
        }
      }
    );
  };

  const handleResetKeybinds = () => {
    alerts.yesNoAlert(
      "Are you sure you want to reset all keybinds to default?",
      "Reset Keybinds",
      "Yes, Reset",
      "Cancel",
      () => {
        keybinds.resetKeybinds();
        setBinds(keybinds.getAllKeybinds());
        alerts.btnAlert("All keybinds reset to default.", "Success");
      }
    );
  };

  if (!visible) return null;

  return (
    <Menu title="Settings" isVisible={visible} onClose={onClose}>
      <div>

        {/* Volume Control */}
        <div className="setting-group">
          <label htmlFor="volumeSlider">Volume: {Math.round(volume * 100)}%</label>
          <input
            id="volumeSlider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
          />
        </div>

        {/* Keybinds Section */}
        <div id="menuKeybindDiv" className="keybindDiv">
          <p className="keybind">Menu / Exit Menu: </p>
          <button
            className="settings menuBtn"
            onClick={() => handleRebind("toggleMenu", "Menu / Exit Menu")}
            id="changeMenuKeybindBtn"
          >
            {binds.toggleMenu.toUpperCase()}
          </button>
        </div>

        <div id="statKeybindDiv" className="keybindDiv">
          <p className="keybind">Stats Menu: </p>
          <button
            className="settings menuBtn"
            onClick={() => handleRebind("statMenu", "Stat Menu")}
            id="changeStatKeybindBtn"
          >
            {binds.statMenu.toUpperCase()}
          </button>
        </div>

        <div id="leaderboardKeybindDiv" className="keybindDiv">
          <p className="keybind">Leaderboard: </p>
          <button
            className="settings menuBtn"
            onClick={() => handleRebind("leaderboard", "Leaderboard")}
            id="changeLeaderboardKeybindBtn"
          >
            {binds.leaderboard.toUpperCase()}
          </button>
        </div>

        {/* Reset & Close */}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button
            className="settings menuBtn"
            onClick={handleResetKeybinds}
            id="resetKeybindBtn"
          >
            Reset Keybinds
          </button>
          <button
            className="settings menuBtn"
            onClick={onClose}
            id="closeSettingsBtn"
          >
            Close Settings
          </button>
        </div>
      </div>
    </Menu>
  );
}
