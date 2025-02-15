"use server";

import { Rest } from "ably";

const ablyApiKey = process.env.ABLY_API_KEY;
if (!ablyApiKey) {
  throw new Error("ABLY_API_KEY is not defined in the environment variables.");
}

const ably = new Rest(ablyApiKey);

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

export const publishNewWord = async (
  gameId: string,
  word: string,
  language: "fi" | "en"
) => {
  const channel = ably.channels.get(gameId);
  await channel.publish(gameId, {
    action: "newWord",
    roundStartedStamp: Date.now(),
    word: word,
    language: language,
  });
};
