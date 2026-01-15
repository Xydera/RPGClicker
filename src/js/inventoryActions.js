// inventoryActions.js
export function equipItem(player, item) {
  if (!player || !item) return;
  if (item.type !== "weapon") return;

  player.equipped = player.equipped || {};
  player.equipped.weapon = item;
  player.sword = item; // compatibility with your existing combat code
  console.log(`Equipped ${item.name}`);
}

export function useItem(player, item) {
  if (!player || !item) return;
  if (item.type !== "consumable") return;

  if (item.effect === "heal") {
    const healAmount = item.heal || 10;
    player.currentHealth = Math.min(
      player.maxHealth,
      player.currentHealth + healAmount
    );
    console.log(`Used ${item.name}, healed for ${healAmount}`);
  }

  // reduce quantity or remove
  item.qty -= 1;
  if (item.qty <= 0) {
    const idx = player.inventory.indexOf(item);
    if (idx > -1) player.inventory.splice(idx, 1);
  }
}

export function dropItem(player, item) {
  if (!player || !item) return;
  const idx = player.inventory.indexOf(item);
  if (idx > -1) player.inventory.splice(idx, 1);
  console.log(`Dropped ${item.name}`);
}
