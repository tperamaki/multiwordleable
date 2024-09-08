"use server";

import Ably from "ably";

const ably = new Ably.Rest(process.env.ABLY_API_KEY ?? "");

export const publishScore = async (
  gameId: string,
  playerName: string,
  score: number
) => {
  const channel = ably.channels.get(gameId);
  await channel.publish(gameId, {
    action: "scored",
    playerName: playerName,
    score: score,
  });
};

export const publishNewWord = async (gameId: string, word: string) => {
  const channel = ably.channels.get(gameId);
  await channel.publish(gameId, {
    action: "newWord",
    roundStartedStamp: Date.now(),
    word: word,
  });
};
