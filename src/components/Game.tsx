"use client";

import { publishNewWord, publishScore } from "@/services/ably";
import words from "@/words";
import { useAbly, useChannel } from "ably/react";
import { useState } from "react";

// Handle new word
const getNewWord = (): string => {
  const newWord =
    words[Math.floor(Math.random() * words.length)].toLocaleUpperCase();
  return newWord;
};

// Wordle game
const Game = ({ gameId }: { gameId: string }) => {
  // Wordle state
  const ably = useAbly();
  const [word, setWord] = useState();
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [score, setScore] = useState(0);

  useChannel(gameId, (message) => {
    if (message.data.action === "newWord") {
      setGuess("");
      setGuesses([]);
      setWon(false);
      setLost(false);
      setWord(message.data.word);
    }
  });

  // Handle guess
  const handleGuess = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (guess.length === 5) {
      const newGuesses = [...guesses, guess];
      setGuesses(newGuesses);
      setGuess("");
      if (guess === word) {
        const newScore = score + 5 - guesses.length;
        setScore(newScore);

        publishScore(gameId, ably.auth.clientId, newScore);
        setWon(true);
      } else if (newGuesses.length >= 5) {
        setLost(true);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <h1 className="text-4xl font-bold">Multiwordleable</h1>
      {word !== undefined ? (
        <>
          {word}
          <form onSubmit={handleGuess} className="flex gap-2">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value.toUpperCase())}
              maxLength={5}
              className="w-32 h-8 text-center border-2 rounded dark:text-gray-800"
            />
            <button
              type="submit"
              className="w-32 h-8 bg-blue-500 text-white rounded disabled:bg-gray-200 dark:bg-blue-700 dark:text-gray-300 disabled:text-gray-500 disabled:dark:bg-gray-800 hover:bg-blue-600 dark:hover:bg-blue-800 dark:hover:text-gray-200"
              disabled={
                guess.length !== 5 ||
                won ||
                lost ||
                guesses.some((g) => g === guess)
              }
            >
              Guess
            </button>
          </form>
          <div className="flex flex-col gap-2">
            {Array(5)
              .fill(null)
              .map((_, index) => (
                <div
                  key={index}
                  className="w-64 h-8 flex items-center justify-center gap-2"
                >
                  {(guesses[index] ?? "     ")
                    .split("")
                    .map((letter, letterIndex) => (
                      <div
                        key={index + "_" + letterIndex}
                        className={
                          "w-8 h-8 border border-black dark:border-white rounded flex items-center justify-center" +
                          (word.includes(letter)
                            ? word[letterIndex] === guesses[index][letterIndex]
                              ? " text-green-500"
                              : " text-yellow-500"
                            : "")
                        }
                      >
                        {letter}
                      </div>
                    ))}
                </div>
              ))}
          </div>
        </>
      ) : (
        <p>Wait for a new game to start or request new word</p>
      )}
      <button
        onClick={() => publishNewWord(gameId, getNewWord())}
        className="w-32 h-8 bg-red-300 text-gray-700 dark:bg-red-700 dark:text-gray-300 rounded hover:bg-red-400 dark:hover:bg-red-800"
      >
        New word
      </button>
      {word &&
        (won ? (
          <div className="bg-green-300 dark:bg-green-700 p-5 rounded">
            <p>You won!</p>
          </div>
        ) : (
          <div className="p-5 rounded">
            {lost ? (
              <p>You lost!</p>
            ) : (
              <p>You have {5 - guesses.length} guesses left</p>
            )}
          </div>
        ))}
    </div>
  );
};

export default Game;
