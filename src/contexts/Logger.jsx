// src/contexts/Logger.jsx
import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import './../styles/logger.css';

const LogContext = createContext();

export function useLogger() {
  const ctx = useContext(LogContext);
  if (!ctx) throw new Error('useLogger must be used within LoggerProvider');
  return ctx;
}

export default function LoggerProvider({ children, maxEntries = 10, fadeTime = 2000, displayTime = 30000 }) {
  const [_, forceRender] = useState(0);
  const logsRef = useRef([]);
  const timersRef = useRef(new Map());
  const [isMobile, setIsMobile] = useState(false);

  const pushLog = useCallback((msg, type='info') => {
    const id = Date.now() + Math.random();
    const entry = { id, msg: String(msg), type, opacity: 1 };
    logsRef.current = [...logsRef.current.slice(-(maxEntries-1)), entry];

    // Fade out
    const fadeT = setTimeout(() => {
      logsRef.current = logsRef.current.map(l => l.id===id ? { ...l, opacity:0 } : l);
      forceRender(v=>v+1);

      const removeT = setTimeout(() => {
        logsRef.current = logsRef.current.filter(l=>l.id!==id);
        forceRender(v=>v+1);
        timersRef.current.delete(id);
      }, fadeTime);

      timersRef.current.set(id, removeT);
    }, displayTime);

    timersRef.current.set(id, fadeT);
    forceRender(v=>v+1);
    return id;
  }, [maxEntries, fadeTime, displayTime]);

  const logOnce = useCallback((msg, type='info') => {
    const last = logsRef.current[logsRef.current.length-1];
    if (last && last.msg===String(msg) && last.type===type) return null;
    return pushLog(msg, type);
  }, [pushLog]);

  useEffect(() => {
    window.__appLogger__ = { log: pushLog, logOnce };
    return () => {
      timersRef.current.forEach(t=>clearTimeout(t));
      timersRef.current.clear?.();
      try { delete window.__appLogger__; } catch {}
    };
  }, [pushLog, logOnce]);

  // detect small screens to limit number of entries shown on mobile
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e) => setIsMobile(!!e.matches);
    // set initial
    setIsMobile(mq.matches);
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, []);

  return (
    <LogContext.Provider value={{ log: pushLog, logOnce }}>
      {children}
      <div id="log" aria-live="polite" style={{ pointerEvents: 'none' }}>
        {(() => {
          const list = logsRef.current;
          const visibleCount = isMobile ? Math.min(1, list.length) : Math.min(maxEntries, list.length);
          const sliceStart = Math.max(0, list.length - visibleCount);
          return list.slice(sliceStart).map(l => (
            <div key={l.id} className={`log-entry ${l.type}`} style={{ opacity: l.opacity, transition: `opacity ${fadeTime}ms linear` }}>
              {l.msg}
            </div>
          ));
        })()}
      </div>
    </LogContext.Provider>
  );
}
