import { useRef, useEffect } from "react";

export function useDraggable() {
  const ref = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMouseDown = (e) => {
      if (e.button !== 0) return; // left click only
      dragging.current = true;
      offset.current = {
        x: e.clientX - pos.current.x,
        y: e.clientY - pos.current.y,
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e) => {
      if (!dragging.current) return;
      pos.current = {
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      };
      el.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
    };

    const onMouseUp = () => {
      dragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    const header = el.querySelector(".menu-header");
    if (header) header.addEventListener("mousedown", onMouseDown);

    return () => {
      if (header) header.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return ref;
}
