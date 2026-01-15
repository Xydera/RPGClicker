// src/components/CreatureDisplay.jsx
import React, { useEffect, useRef, useState } from "react";
import './../styles/game-fx.css';

/**
 * CreatureDisplay
 * Props:
 *  - creature
 *  - player
 *  - onClickAttack  // note: should accept the click event (see usage below)
 */
export default function CreatureDisplay({ creature, player, onClickAttack }) {
  const containerRef = useRef(null);
  const swordRef = useRef(null);

  // floating numbers: { id, value, x, y, crit, source }
  const [floats, setFloats] = useState([]);

  useEffect(() => {
    let mounted = true;

    function handleDamageNumber(e) {
      const d = e.detail || {};
      // We're only interested in numbers targeted at the creature for this component,
      // but you could show enemy -> player numbers here too if desired.
      if (d.target !== "creature") return;

      // coords are viewport coordinates (clientX/clientY) or null
      const vx = d.x ?? null;
      const vy = d.y ?? null;

      // Compute local position inside our container
      const container = containerRef.current;
      const monster = swordRef.current;
      if (!container || !monster) return;

      const rect = container.getBoundingClientRect();

      let localX, localY;
      if (vx != null && vy != null) {
        // position relative to container
        localX = vx - rect.left;
        localY = vy - rect.top;
      } else {
        // fallback: center of monster image
        const mRect = monster.getBoundingClientRect();
        localX = (mRect.left + mRect.right) / 2 - rect.left;
        localY = (mRect.top + mRect.bottom) / 2 - rect.top;
      }

      // small random jitter so stacked numbers don't completely overlap
      const jitterX = (Math.random() - 0.5) * 20;
      const jitterY = (Math.random() - 0.5) * 6;

      const id = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const floatItem = {
        id,
        value: d.value,
        x: localX + jitterX,
        y: localY + jitterY,
        crit: !!d.crit,
        source: d.source || "player",
      };

      // Add to floats
      if (!mounted) return;
      setFloats((prev) => [...prev, floatItem]);

      // Remove after animation duration
      const DURATION = 900; // ms — matches CSS animation below
      setTimeout(() => {
        setFloats((prev) => prev.filter((f) => f.id !== id));
      }, DURATION + 50);
    }

    window.addEventListener("damageNumber", handleDamageNumber);
    return () => {
      mounted = false;
      window.removeEventListener("damageNumber", handleDamageNumber);
    };
  }, []);

  if (!creature) return null;

  return (
    <div id="gameCenter" ref={containerRef} style={{ position: "relative", overflow: "visible" }}>
      <div id="monster" style={{ position: "relative" }}>
        <h1>{creature.name}</h1>
        <h3>Level: {creature.level}</h3>
        <h3>
          Health: {creature.currentHealth} / {creature.maxHealth}
        </h3>
        {/* Monster image container (used for center fallback) */}
        <div id="gameScreen">
            <img
              ref={swordRef}
              className="sword"
              src={player.equipped?.weapon?.image || "/assets/sword1.png"}
              onClick={(e) => onClickAttack?.(e)} // pass DOM event through
              alt="Weapon"
              style={{ 
                cursor: "pointer",
              }}
            />
        </div>
      </div>

      {/* Floating damage numbers */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
        }}
      >
        {floats.map((f) => (
          <div
            key={f.id}
            className={`float-number ${f.crit ? "crit" : ""}`}
            style={{
              position: "absolute",
              transform: "translate(-50%, -50%)",
              left: Math.round(f.x),
              top: Math.round(f.y),
              whiteSpace: "nowrap",
              fontWeight: f.crit ? 800 : 600,
              textShadow: "0 1px 0 rgba(0,0,0,0.6)",
              // animation defined in CSS below
              animation: "floatUp 900ms ease-out forwards",
            }}
          >
            {f.value}
          </div>
        ))}
      </div>

      {/* Inline styles for animation & crit color (you can move this into your CSS file) */}
      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) translateY(0) scale(1);
          }
          70% {
            opacity: 0.9;
            transform: translate(-50%, -50%) translateY(-36px) scale(1.06);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) translateY(-56px) scale(1.06);
          }
        }

        .float-number {
          font-size: 18px;
          line-height: 1;
          padding: 2px 6px;
          border-radius: 6px;
          background: rgba(0,0,0,0.35);
          color: #fff;
          display: inline-block;
          transform-origin: center;
          will-change: transform, opacity;
          transition: transform 120ms ease;
        }
        .float-number.crit {
          background: linear-gradient(180deg, rgba(255,215,100,0.12), rgba(0,0,0,0.18));
          color: #ffd86b;
          font-size: 20px;
          text-shadow: 0 1px 0 rgba(0,0,0,0.7), 0 0 8px rgba(255,200,80,0.35);
        }
      `}</style>
    </div>
  );
}
