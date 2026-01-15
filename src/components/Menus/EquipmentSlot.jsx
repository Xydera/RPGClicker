import React, { useState } from "react";
import { useDrop, useDrag } from "react-dnd";
import { getRarityClass } from '../../js/utils/rarity.js';
import ItemTooltip from '../ItemTooltip.jsx'; // adjust path if needed

export default function EquipmentSlot({ type, equippedItem, onEquip, onUnequip }) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ["INVENTORY_ITEM", "EQUIPPED_ITEM"],
    drop: (item, monitor) => {
      // No-op if dropping an item back onto its own slot
      if (item && item.fromSlot === type) return;
      if (onEquip) onEquip(item, type);
    },
    canDrop: (item) => {
      // allow if explicit slotType matches OR item's type matches OR it literally came from this slot
      return (item && (
        item.slotType === type ||
        item.type === type ||
        item.fromSlot === type
      ));
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver(), canDrop: !!monitor.canDrop() })
  }), [type, onEquip]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "EQUIPPED_ITEM",
    item: { ...(equippedItem || {}), fromSlot: type, slotType: type },
    canDrag: !!equippedItem,
    end: (item, monitor) => {
      // If the drag ended without a drop (dropped outside valid target) notify parent to unequip
      if (!monitor.didDrop() && item && onUnequip) {
        try { onUnequip(item, type); } catch (e) { console.warn("onUnequip error from EquipmentSlot", e); }
      }
    },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }), [equippedItem, type, onUnequip]);

  const [hover, setHover] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const rarityClass = equippedItem ? getRarityClass(equippedItem.rarity) : "";

  const handleMouseMove = (e) => setTooltipPos({ x: e.clientX, y: e.clientY });

  return (
    <>
      <div
        ref={(node) => { if (!node) return; drag(drop(node)); }}
        className={`equip-slot ${rarityClass}`}
        style={{
          border: canDrop ? "2px solid lime" : undefined,
          background: isOver ? "#222" : "#111",
          opacity: isDragging ? 0.4 : 1,
          borderRadius: 8,
          width: 100,
          height: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s ease",
          boxShadow: hover && equippedItem ? `0 0 8px ${getRarityColor(equippedItem.rarity)}` : 'none'
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onMouseMove={handleMouseMove}
      >
        {equippedItem ? (
          <>
            <img src={equippedItem.image} alt={equippedItem.name} width={48} height={48} />
            <div style={{ fontSize: 12, color: "#ccc", marginTop: 4 }}>{equippedItem.name}</div>
          </>
        ) : <span style={{ color: "#666" }}>{type.toUpperCase()}</span>}
      </div>
      {hover && equippedItem && <ItemTooltip item={equippedItem} position={tooltipPos} />}
    </>
  );
}

// helper same as inventory
function getRarityColor(rarity) {
  switch (rarity) {
    case 1: return '#888'; case 2: return '#2ecc71'; case 3: return '#3498db';
    case 4: return '#9b59b6'; case 5: return '#e67e22'; case 6: return '#e91e63';
    case 7: return '#f1c40f'; default: return '#888';
  }
}
