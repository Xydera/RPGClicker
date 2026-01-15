import React, { useState } from "react";
import './../styles/ChangeLog.css';

const defaultHistory = [
  { version: "v0.2.1", date: "2025-10-18", notes: "- Created a mobile view so mobile players can run the game more easily."},
  { version: "v0.2.0", date: "2025-10-18", notes: "- Local storage and leaderboard reset due to object data changes.<br>- Added Inventory (Press I) and Equipment (Press E).<br>- Added Mob drops.<br>- Added damage numbers for players and monsters.<br> - Added Armour and Accessories.<br> - Removed ability to increase item rarity.<br> - Items now can reach level 100."},
  { version: "v0.1.4", date: "2025-10-09", notes: "- Added more swords.<br>- Added Leaderboards (Press L).<br>- Fixed bug with kills not tracking correctly." },
  { version: "v0.1.3", date: "2025-10-09", notes: "- Created Potions.<br>- Added death and Respawn mechanic.<br>- Cleaned up program structure.<br>- Cleaned up UI." },
  { version: "v0.1.2", date: "2025-10-08", notes: "- Added player health.<br>- Fixed menus.<br>- Van now change keybinds for menus." },
  { version: "v0.1.1", date: "2025-10-07", notes: "- Added respec and tooltip system.<br>- Improved menu layout.<br>- Added Version History.<br>- Added Menu (Escape) and Stat Menu (S) keybinds." },
  { version: "v0.1.0", date: "2025-10-05", notes: "Initial public release." },
];

export default function ChangeLog({ history = defaultHistory }) {
  const [collapsed, setCollapsed] = useState(false);

  const sorted = [...history].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div
      id="changeLog"
      className={`change-log ${collapsed ? "collapsed" : ""}`}
      aria-expanded={!collapsed}
    >
      <div className="cl-header">
        <div className="cl-title">Version History</div>
        <div className="cl-controls">
          <button
            id="clCollapseBtn"
            title="Collapse / Expand"
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed(!collapsed);
            }}
          >
            {collapsed ? "+" : "−"}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="cl-entries" role="log" aria-live="polite">
          {sorted.map((item) => (
            <div key={item.version} className={`cl-entry ${item.level || "info"}`}>
              <span className="ver">{item.version}</span>
              {item.date && <span className="date">{new Date(item.date).toLocaleDateString()}</span>}
              <div
                className="notes"
                dangerouslySetInnerHTML={{ __html: item.notes }}
              />
            </div>
          ))}
        </div>
      )}

      {collapsed && (
        <div className="cl-handle" aria-hidden="true" onClick={() => setCollapsed(false)}>

        </div>
      )}
    </div>
  );
}
