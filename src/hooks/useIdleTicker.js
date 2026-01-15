import { useEffect, useRef, useCallback } from 'react';

export default function useIdleTicker(game, { tickMs = 1000 } = {}) {
  const latestRef = useRef({
    player: { ...game.player },
    creature: { ...game.creature },
    sword: { ...game.player?.equipped?.weapon || game.sword },
  });

  const subscribersRef = useRef(new Set());

  // notify all subscribers
  const notify = useCallback(() => {
    subscribersRef.current.forEach(cb => cb());
  }, []);

  // subscribe function for useSyncExternalStore
  const subscribe = useCallback((callback) => {
    subscribersRef.current.add(callback);
    return () => subscribersRef.current.delete(callback);
  }, []);

  useEffect(() => {
    const tickInterval = setInterval(() => {
      game.tick?.();

      // clone objects to force new references
      latestRef.current.player = { ...game.player };
      latestRef.current.creature = { ...game.creature };
      latestRef.current.sword = { ...game.player?.equipped?.weapon || game.sword };

      notify();
    }, tickMs);

    return () => clearInterval(tickInterval);
  }, [game, tickMs, notify]);

  return {
    latestRef,
    subscribe,
    getSnapshot: () => latestRef.current,
    notify // expose notify so clicks can trigger UI updates
  };
}
