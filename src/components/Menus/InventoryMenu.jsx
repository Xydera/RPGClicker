import React from "react";
import Menu from './Menu.jsx';
import "./inventory.css";
import InventoryItem from "./InventoryItem.jsx";
import { useDrop } from "react-dnd";
// Use the central unequip helper so hooks / stats run consistently
import { unequipItem } from "../../js/equipment.js";

export default function InventoryMenu({ player, game, isVisible, onClose }) {
  const items = Array.isArray(player?.inventory) ? player.inventory : [];

  const [, drop] = useDrop(() => ({
    accept: ["EQUIPPED_ITEM"],
    drop: (item, monitor) => {
      if (!player) return;

      if (!Array.isArray(player.inventory)) player.inventory = [];

      const fromSlot = item.fromSlot || item.slotType || null;

      // If the item came from an equipped slot, use the central unequip flow.
      // That ensures inst.onUnequip runs, slot is cleared, and the helper will merge the item into inventory.
      if (fromSlot) {
        // unequipItem returns true if it successfully moved the equipped instance into inventory
        try {
          const did = unequipItem(player, fromSlot);
          if (did) {
            if (game?.notify) game.notify();
            if (game?.save) game.save();
          }
        } catch (e) {
          console.warn("Error unequipping into inventory:", e);
        }
        return;
      }

      // otherwise, it was an inventory item being dropped into the inventory area (noop) or
      // an external item — we still want to handle merging by name/type
      const existing = player.inventory.find(
        (it) => it.name === item.name && it.type === item.type
      );

      if (existing) {
        // Merge stack amounts
        existing.amount = (existing.amount || 1) + (item.amount || 1);
      } else {
        // Create a new entry
        const invEntry = {
          ...item,
          id: item.id || `${(item.name||'item').replace(/\s+/g,'_')}-${Date.now()}`,
          amount: item.amount || 1,
        };
        player.inventory.push(invEntry);
      }

      // notify UI & save if required
      if (game?.notify) game.notify();
      if (game?.save) game.save();
    },
  }), [player, game]);

  return (
    <Menu title="Inventory" isVisible={isVisible} onClose={onClose}>
      <div
        ref={drop}
        className="inventory-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
          gap: 8,
        }}
      >
        {items.length > 0 ? (
          items.map((item, idx) => <InventoryItem key={item.id ?? idx} item={item} />)
        ) : (
          <div className="empty-inventory">No items in inventory.</div>
        )}
      </div>
    </Menu>
  );
}
