import React from "react";

export default function EquippedDisplay({ player }) {
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
  const finalDamage = Math.max(1, Math.floor(initialDamage * damageMultiplier));

  // compact item card renderer — responsive and small-screen friendly
  const ItemCard = ({ title, image, label, value }) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      padding: 6,
      flex: '0 1 30%',        // allow wrap on small screens
      minWidth: 72,
      maxWidth: 140,
      height: 'auto',
      background: 'transparent',
      color: 'inherit',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: 11, fontWeight: 700 }}>{title}</div>
      {image && <img src={image} alt={label || title} style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 6 }} />}
      <div style={{ fontSize: 11, lineHeight: 1.1 }}>{label}</div>
      {value && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>{value}</div>}
    </div>
  );

  return (
    <div id="equippedDisplay" style={{
      position: 'absolute',
      left: '50%',
      bottom: 'calc(0px + env(safe-area-inset-bottom, 0px))', // sits above bottom controls / safe area
      transform: 'translateX(-50%)',
      minHeight: 48,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      pointerEvents: 'auto',
      width: 'min(96%, 420px)',
      gap: 8,
      padding: '6px 8px',
      background: 'rgba(0,0,0,0.22)',
      borderRadius: 10,
      boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
      flexWrap: 'nowrap'
    }}>
      {/* Weapon */}
      {equippedWeapon ? (
        <ItemCard
          title="Weapon"
          image={equippedWeapon.image}
          label={equippedWeapon.name}
          value={`DPC: ${finalDamage}`}
        />
      ) : (
        <ItemCard title="Weapon" label={`No Weapon (DPC: ${player?.damage || 1})`} />
      )}

      {/* Armour */}
      {equippedArmour ? (
        <ItemCard
          title="Armour"
          image={equippedArmour.image}
          label={equippedArmour.name}
          value={`Def: ${armourDefence}`}
        />
      ) : (
        <ItemCard title="Armour" label={`No Armour (Def: ${player?.defence || 0})`} />
      )}

      {/* Accessory */}
      {equippedAccessory ? (
        <ItemCard
          title="Accessory"
          image={equippedAccessory.image}
          label={equippedAccessory.name}
        />
      ) : (
        <ItemCard title="Accessory" label="No Accessory" />
      )}
    </div>
  );
}
