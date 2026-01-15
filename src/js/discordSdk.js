// src/discord/discordSdk.js
import { DiscordSDK } from "@discord/embedded-app-sdk";
import { isDiscord } from './utils/isDiscord';

let sdkInstance = null;

// Initialize only if inside Discord
if (isDiscord) {
  sdkInstance = new DiscordSDK({
    clientId: import.meta.env.VITE_DISCORD_CLIENT_ID
  });
} else {
  // Mock for local testing
  sdkInstance = {
    ready: async () => {},
    getContext: async () => ({ instanceId: "local-test", user: { id: "local-user" } })
  };
}

export const discordSdk = sdkInstance;
