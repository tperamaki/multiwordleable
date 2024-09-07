"use client";

import {
  useAbly,
  useChannel,
  usePresence,
  usePresenceListener,
} from "ably/react";
import { useState } from "react";

const PlayerList = ({ gameId }: { gameId: string }) => {
  const ably = useAbly();
  usePresence(gameId);
  const { presenceData } = usePresenceListener(gameId);
  const [playerScore, setPlayerScore] = useState<Record<string, number>>({});
  useChannel(gameId, (message) => {
    if (message.data.action === "scored") {
      setPlayerScore((prev) => ({
        ...prev,
        [message.data.playerName]: message.data.score,
      }));
    }
  });

  const combinedPlayerList = Object.entries(playerScore)
    .concat(
      presenceData
        .filter(
          (p) => !Object.keys(playerScore).some((ps) => ps === p.clientId)
        )
        .map((p) => {
          return [p.clientId, 0];
        })
    )
    .map(([key, value], index) => {
      const isItMe = key === ably.auth.clientId;

      return (
        <li key={index} className="flex items-center gap-2">
          <span className="text-sm">{key}</span>
          {isItMe && <span className="text-xs text-gray-400"> (You)</span>}
          <span className="text-sm">{value}</span>
          {presenceData.some((p) => p.clientId === key) && (
            <span className="text-xs text-green-400">Online</span>
          )}
        </li>
      );
    });

  return (
    <div className="flex flex-col gap-2">
      <h2>Players</h2>
      <ul>{combinedPlayerList}</ul>
    </div>
  );
};

export default PlayerList;
