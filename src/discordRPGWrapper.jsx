// src/components/DiscordRPGWrapper.jsx
import React, { useEffect, useState } from "react";
import RPGClickerApp from "./rpgclicker.jsx";
import { SaveAdapter } from './js/data/saveAdapter.js';
import { discordSdk } from './js/discordSdk.js';
import { isDiscord } from './js/utils/isDiscord.js';

export default function DiscordRPGWrapper() {
  const [loading, setLoading] = useState(true);
  const [instanceId, setInstanceId] = useState("local");
  const [userId, setUserId] = useState("local");
  const [initialState, setInitialState] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (isDiscord) {
        await discordSdk.ready();
        const ctx = await discordSdk.getContext();

        if (!mounted) return;

        setInstanceId(ctx.instanceId);
        setUserId(ctx.user?.id ?? "discord-user");
      }

      const save = await SaveAdapter.load(instanceId, userId);
      if (mounted) setInitialState(save);

      setLoading(false);
    }

    init();
    return () => (mounted = false);
  }, []);

  if (loading) {
    return <div style={{ color: "#fff", textAlign: "center" }}>Loading…</div>;
  }

  return (
    <RPGClickerApp
      instanceId={instanceId}
      userId={userId}
      initialState={initialState}
      isDiscord={isDiscord}
    />
  );
}
