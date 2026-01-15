import React from "react";
import Menu from './Menu.jsx';

export default function MainMenu({ title, visible, onSave, onSettings, onDelete, onClose }) {
  return (
    <Menu title="Main Menu" isVisible={visible} onClose={onClose}>
    <div>
        <div className="main-menu-content">

        <div className="menu-buttons">
          <button
            className="menuBtn tooltip"
            id="saveGameBtn"
            data-tooltip="Game auto saves every 60 seconds."
            onClick={onSave}
          >
            Save Game
          </button>

          <button
            className="menuBtn tooltip"
            id="settingsBtn"
            data-tooltip="Change things about the game (within reason)"
            onClick={onSettings}
          >
            Settings
          </button>

          <button
            className="menuBtn tooltip"
            id="deleteSaveBtn"
            data-tooltip="Deletes EVERYTHING (don't cry if it does what it's meant to)"
            onClick={onDelete}
          >
            Delete Save Data
          </button>

          <button
            className="menuBtn tooltip"
            id="closeMenuBtn"
            data-tooltip="Closes the menu... duh"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
    </Menu>
  );
}
