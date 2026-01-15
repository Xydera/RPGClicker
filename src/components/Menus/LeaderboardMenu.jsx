import React, { useEffect, useState } from "react";
import Menu from './Menu.jsx';
import * as keybinds from '../../js/data/keybinds.js';
import { getLeaderboardSnapshot } from '../../js/data/firebase.js';


export default function LeaderboardMenu({ visible, onClose, currentPlayer }) {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (!visible) return;
    const unsubscribe = getLeaderboardSnapshot(setLeaderboard);
    return () => unsubscribe && unsubscribe();
  }, [visible]);

  if (!visible) return null;

  return (
    <Menu
      title="Leaderboard"
      isVisible={visible}
      onClose={onClose}
      storageKey="leaderboard-menu"
    >
      <div id="leaderboardMenu">
        <table className="leaderboardTable">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Level</th>
              <th>Gold</th>
              <th>Kills</th>
            </tr>
          </thead>
          <tbody className="leaderboardBody">
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No data yet
                </td>
              </tr>
            ) : (
              leaderboard.map((p, i) => {
                const rank = i + 1;
                const isYou = currentPlayer && p.id === currentPlayer.id;
                return (
                  <tr
                    key={p.id}
                    className={`${isYou ? "you" : ""} ${
                      rank === 1
                        ? "rank-1"
                        : rank === 2
                        ? "rank-2"
                        : rank === 3
                        ? "rank-3"
                        : ""
                    }`}
                  >
                    <td>{rank}</td>
                    <td>
                      {p.name}
                      {isYou ? " (You)" : ""}
                    </td>
                    <td>{p.level}</td>
                    <td>{p.money.toLocaleString()}</td>
                    <td>{p.kills}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Menu>
  );
}
