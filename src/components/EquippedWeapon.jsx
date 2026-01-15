import React from "react";

export default function EquippedWeapon({ sword, player }) {
  const equippedWeapon = player?.equipped?.weapon || null;
  const equippedPotion = player?.equipped?.potion || null;
  const equippedAccessory = player?.equipped?.accessory || null;
  const equippedArmour = player?.equipped?.armour || null;

  // Safe stats for calculations
  const playerStrength = player?.stats?.strength || 0;
  const weaponStrength = equippedWeapon?.strength || 0;
  const weaponDamage = equippedWeapon?.damage || 0;
  const armourDefence = equippedArmour?.defence || 0;

  // Player attack
  const baseDamage = 1;

  // Step 1: Initial damage (raw power before modifiers)
  const initialDamage = (baseDamage + weaponDamage) * (1 + (playerStrength + weaponStrength) / 100);

  // Step 2: Damage multiplier (level scaling, enchantments, weapon bonuses)
  const combatLevelBonus = player?.level ? player.level * 0.04 : 0;
  const damageMultiplier = 1 + combatLevelBonus;
  const finalDamage = Math.floor(initialDamage * damageMultiplier);

  return (
    <div id="equippedDisplay" style={{ marginTop: 8, minHeight: 140 }}>
      {equippedWeapon ? (
        <div id="equippedWeaponDisplay" style={{ marginBottom: 12 }}>
          <h3>Equipped Weapon:</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {equippedWeapon.image && (
              <img
                src={equippedWeapon.image}
                style={{ width: 100, height: 100 }}
                alt={equippedWeapon.name}
              />
            )}
            <span>
              {equippedWeapon.name} (DPC: {finalDamage || 1})
            </span>
          </div>
        </div>
      ) : (
        <div id="equippedWeaponDisplay" style={{ marginBottom: 12 }}>
          <h3>Equipped Weapon:</h3>
            <span>
              No Weapon Equipped (DPC: {player.damage|| 1})
            </span>
          </div>
      )}

      {equippedArmour ? (
        <div id="equippedArmourDisplay" style={{ marginBottom: 12 }}>
          <h3>Equipped Armour:</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {equippedWeapon.image && (
              <img
                src={equippedArmour.image}
                style={{ width: 100, height: 100 }}
                alt={equippedArmour.name}
              />
            )}
            <span>
              {equippedArmour.name} (Defence: {armourDefence} )
            </span>
          </div>
        </div>
      ) : (
        <div id="equippedWeaponDisplay" style={{ marginBottom: 12 }}>
          <h3>Equipped Armour:</h3>
            <span>
              No Armour Equipped (Defence: {player.defence || 0})
            </span>
          </div>
      )}
      
      {equippedAccessory ? (
        <div id="equippedAccessoryDisplay" style={{ marginBottom: 12 }}>
          <h3>Equipped Accessory:</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {equippedAccessory.image && (
              <img
                src={equippedAccessory.image}
                style={{ width: 100, height: 100 }}
                alt={equippedAccessory.name}
              />
            )}
            <span>
              {equippedAccessory.name}
            </span>
          </div>
        </div>
      ) : (
        <div id="equippedWeaponDisplay" style={{ marginBottom: 12 }}>
          <h3>Equipped Accessory:</h3>
            <span>
              No Accessory Equipped
            </span>
          </div>
      )}

      {equippedPotion && (
        <div id="equippedPotionDisplay">
          <h3>Equipped Potion:</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {equippedPotion.image && (
              <img
                src={equippedPotion.image}
                style={{ width: 100, height: 100 }}
                alt={equippedPotion.name}
              />
            )}
            <span>
              {equippedPotion.name} (Heal: {equippedPotion.heal})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
