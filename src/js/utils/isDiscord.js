export const isDiscord =
  window.parent !== window &&
  navigator.userAgent.includes("Discord");
