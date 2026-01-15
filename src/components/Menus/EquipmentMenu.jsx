import React from "react";
import EquipmentSlot from "./EquipmentSlot.jsx";
import Menu from './Menu.jsx';
import { equipItem, unequipItem } from "../../js/equipment.js";
import { saveDebouncedWithLeaderboard } from "../../js/data/storage.js";

/**
 * EquipmentMenu - displays equipped slots and forwards equip/unequip actions
 */
export default function EquipmentMenu({ player, game, isVisible, onClose }) {

  const handleEquip = (item, slotType) => {
    const did = equipItem(player, item, slotType);
    if (did && game && typeof game.notify === "function") game.notify();
    if (did && game && typeof game.save === "function") game.save();
  };

  function handleUnequip(item, slotType) {
    // EquipmentSlot passes (item, slotType) but the unequipItem helper expects (player, slotType)
    const did = unequipItem(player, slotType);
    if (did && game && typeof game.notify === "function") game.notify();
    if (did && game && typeof game.save === "function") game.save();
  }


  if (!player) return null;

  return (
    <Menu title="Equipment" isVisible={isVisible} onClose={onClose}>
      <div
        className="equipment-menu"
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          alignItems: "center",
          minWidth: 260,
          paddingTop: 4,
        }}
      >
        <EquipmentSlot
          type="weapon"
          equippedItem={player.equipped?.weapon}
          onEquip={handleEquip}
          onUnequip={handleUnequip}
        />
        <EquipmentSlot
          type="armour"
          equippedItem={player.equipped?.armour}
          onEquip={handleEquip}
          onUnequip={handleUnequip}
        />
        <EquipmentSlot
          type="accessory"
          equippedItem={player.equipped?.accessory}
          onEquip={handleEquip}
          onUnequip={handleUnequip}
        />
      </div>
    </Menu>
  );
}
