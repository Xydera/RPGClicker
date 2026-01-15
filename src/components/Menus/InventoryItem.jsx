import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { getRarityClass } from '../../js/utils/rarity.js';
import ItemTooltip from '../ItemTooltip.jsx'; // adjust path
import './../../styles/rarity.css';

export default function InventoryItem({ item }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "INVENTORY_ITEM",
    item: { ...item, slotType: item.slotType || item.type },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }), [item]);

  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  const rarityClass = getRarityClass(item.rarity);

  const handleMouseMove = (e) => setTooltipPos({ x: e.clientX, y: e.clientY });

  return (
    <>
      <div
        ref={drag}
        className={`inventory-item ${rarityClass}`}
        style={{
          opacity: isDragging ? 0.5 : 1,
          border: "2px solid",
          borderRadius: 6,
          width: 80,
          height: 80,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#111",
          cursor: "grab",
          position: "relative",
          transition: "all 0.15s ease",
          zIndex: 1,
          boxShadow: hover ? `0 0 8px ${getRarityColor(item.rarity)}` : 'none'
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onMouseMove={handleMouseMove}
      >
        {item.image ? (
          <img src={item.image} alt={item.name} style={{ width: 48, height: 48, pointerEvents: "none" }} />
          
        ) : (
          <div style={{ color: "#888", fontSize: 12 }}>{item.name}</div>
        )}
        {item.amount > 1 && (
          <div style={{
            position: "absolute", bottom: 2, right: 2,
            background: "#222", color: "#fff", borderRadius: 4,
            padding: "2px 4px", fontSize: 10, fontWeight: 700,
            border: "1px solid #555", pointerEvents: "none"
          }}>x{item.amount}</div>
        )}
        <div style={{ color: "#ccc", fontSize: 12 }}>{item.name}</div>
      </div>
      {hover && <ItemTooltip item={item} position={tooltipPos} />}
    </>
  );
}

// helper to get color from rarity
function getRarityColor(rarity) {
  switch (rarity) {
    case 1: return '#888';      // common
    case 2: return '#2ecc71';   // uncommon
    case 3: return '#3498db';   // rare
    case 4: return '#9b59b6';   // epic
    case 5: return '#e67e22';   // legendary
    case 6: return '#e91e63';   // mythical
    case 7: return '#f1c40f';   // celestial
    default: return '#888';
  }
}