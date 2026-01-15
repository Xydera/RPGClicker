import React, { useRef, useEffect } from "react";
import './../../styles/menu.css';

/**
 * Menu
 * Props:
 * - title: string (used for header and localStorage key)
 * - isVisible: boolean
 * - onClose: function
 * - children: React nodes
 * - storageKey: optional override for localStorage key
 */
export default function Menu({
  title = "menu",
  isVisible = false,
  onClose = () => {},
  children,
  storageKey,
}) {
  const containerRef = useRef(null);
  const headerRef = useRef(null);

  // refs for drag state (no state to avoid re-renders while dragging)
  const draggingRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const lastRectRef = useRef(null);

  const key = storageKey || `menu-pos-${title.replace(/\s+/g, "-").toLowerCase()}`;

  // apply transform from posRef
  const applyPos = (x, y) => {
    const el = containerRef.current;
    if (!el) return;
    el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  };

  // clamp so the menu stays within viewport
  const clampPosToViewport = (x, y) => {
    const el = containerRef.current;
    if (!el) return { x, y };
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const minX = 8;
    const minY = 8;
    const maxX = Math.max(8, window.innerWidth - width - 8);
    const maxY = Math.max(8, window.innerHeight - height - 8);
    return { x: Math.min(Math.max(x, minX), maxX), y: Math.min(Math.max(y, minY), maxY) };
  };

  // pointer handlers
  useEffect(() => {
    if (!isVisible) return;

    const el = containerRef.current;
    const header = headerRef.current;
    if (!el || !header) return;

    // restore saved pos or center it
    const saved = (() => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();

    // wait a frame to ensure DOM measurement is available
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      lastRectRef.current = rect;
      let startX = 80, startY = 80;
      if (saved && typeof saved.x === "number" && typeof saved.y === "number") {
        startX = saved.x;
        startY = saved.y;
      } else {
        startX = Math.round((window.innerWidth - rect.width) / 2);
        startY = Math.round((window.innerHeight - rect.height) / 3);
      }
      const clamped = clampPosToViewport(startX, startY);
      posRef.current = clamped;
      applyPos(clamped.x, clamped.y);
      // also persist
      try { localStorage.setItem(key, JSON.stringify(clamped)); } catch (e) {}
    });

    const onPointerDown = (ev) => {
      // only start drag when clicking on header area
      if (!header.contains(ev.target)) return;
      // left button for mouse, but pointer events unify this (touch works too)
      draggingRef.current = true;
      offsetRef.current = {
        x: ev.clientX - posRef.current.x,
        y: ev.clientY - posRef.current.y,
      };
      // capture pointer so we still get moves if pointer leaves the header
      if (ev.pointerId != null && ev.target.setPointerCapture) {
        try { ev.target.setPointerCapture(ev.pointerId); } catch {}
      }
      // add move/up to window so dragging doesn't break
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
      ev.preventDefault();
    };

    const onPointerMove = (ev) => {
      if (!draggingRef.current) return;
      const newX = ev.clientX - offsetRef.current.x;
      const newY = ev.clientY - offsetRef.current.y;
      const clamped = clampPosToViewport(newX, newY);
      posRef.current = clamped;
      applyPos(clamped.x, clamped.y);
    };

    const onPointerUp = (ev) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      // save pos
      try { localStorage.setItem(key, JSON.stringify(posRef.current)); } catch (e) {}
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      // release pointer capture if applicable
      if (ev.pointerId != null && ev.target.releasePointerCapture) {
        try { ev.target.releasePointerCapture(ev.pointerId); } catch {}
      }
    };

    // attach pointerdown on header only
    header.addEventListener("pointerdown", onPointerDown);

    // ensure it stays visible on window resize (re-clamp)
    const onResize = () => {
      const clamped = clampPosToViewport(posRef.current.x, posRef.current.y);
      posRef.current = clamped;
      applyPos(clamped.x, clamped.y);
      try { localStorage.setItem(key, JSON.stringify(clamped)); } catch (e) {}
    };
    window.addEventListener("resize", onResize);

    return () => {
      header.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("resize", onResize);
    };
  }, [isVisible, key]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="menu-container"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        transform: "translate(0px, 0px)",
        zIndex: 1000,
        userSelect: "none",
      }}
      aria-hidden={!isVisible}
    >
      <div
        ref={headerRef}
        className="menu-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "grab",
          padding: "8px 10px",
          background: "#333",
          color: "#fff",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <div style={{ fontWeight: 700 }}>{title}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            aria-label="close"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      </div>

      <div
        className="menu-body"
        style={{
          background: "#222",
          color: "#fff",
          padding: 12,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          minWidth: 240,
        }}
      >
        {children}
      </div>
    </div>
  );
}
