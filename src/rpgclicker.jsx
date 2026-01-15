// src/rpgclicker.jsx
import React, { useEffect, useState } from 'react';
import { AlertsProvider, useAlerts } from './contexts/AlertsContext.jsx';
import LoggerProvider, { useLogger } from './contexts/Logger.jsx';
import { initPlayer } from './js/data/auth.js';
import { GameInstance } from './js/gameInstance.js';
import useIsMobile from './hooks/useIsMobile';
import MobileGameUI from './components/MobileGameUI.jsx';
import GameUI from './components/GameUI.jsx';
import { SaveAdapter } from './js/data/saveAdapter.js';
import { isDiscord } from './js/utils/isDiscord.js';
import { discordSdk } from './js/discordSdk.js';

function RPGClickerInner({ initialState = null, instanceId = null }) {
  const [game, setGame] = useState(null);
  const { setGameRef } = useAlerts();
  const { log } = useLogger();
  const isMobile = useIsMobile();

  useEffect(() => {
    let mounted = true;
    let createdGame = null;

    async function start() {
      try {
        let resolvedInstanceId = instanceId;

        // Discord detection
        if (isDiscord && !resolvedInstanceId) {
          await discordSdk.ready();
          const ctx = await discordSdk.getContext();
          resolvedInstanceId = ctx.instanceId;
        }

        // Load previous save
        let savedState = initialState;
        if (!savedState && resolvedInstanceId) {
          savedState = await SaveAdapter.load(resolvedInstanceId);
        }

        // Init player (from saved state or fresh)
        const player = savedState?.player || await initPlayer();

        if (!mounted) return;

        // Create GameInstance
        createdGame = new GameInstance({ player, logger: log });

        // Apply saved state manually
        if (savedState) {
          if (savedState.player) createdGame.player = { ...createdGame.player, ...savedState.player };
          if (savedState.creature) createdGame.creature = { ...createdGame.creature, ...savedState.creature };
          if (savedState.sword) createdGame.sword = { ...createdGame.sword, ...savedState.sword };
          if (savedState.potion) createdGame.potion = { ...createdGame.potion, ...savedState.potion };
          if (savedState.armour) createdGame.armour = { ...createdGame.armour, ...savedState.armour };
        }

        setGame(createdGame);
        setGameRef?.(createdGame);

        // Start auto-save (localStorage + Discord cloud if instanceId exists)
        SaveAdapter.startAutoSave(createdGame, resolvedInstanceId);

      } catch (err) {
        console.error('Failed to start RPGClickerInner', err);
      }
    }

    start();

    return () => {
      mounted = false;
      createdGame?.stop?.();
      SaveAdapter.stopAutoSave();
    };
  }, [instanceId, initialState, setGameRef, log]);

  if (!game) return <div>Loading Game...</div>;

  return isMobile ? <MobileGameUI game={game} /> : <GameUI game={game} />;
}

export default function RPGClickerApp(props) {
  return (
    <AlertsProvider>
      <LoggerProvider>
        <RPGClickerInner {...props} />
      </LoggerProvider>
    </AlertsProvider>
  );
}
