"use client";

import { publishNewWord, publishScore } from "@/services/ably";
import { words_en_4 } from "@/words_en_4";
import { words_en_5 } from "@/words_en_5";
import { words_fi_4, words_fi_5 } from "@/words_fi";
import { useAbly, useChannel } from "ably/react";
import { useState } from "react";

const MAX_GUESSES = 5;
const ROUND_TIME = 90000;
const POINTS_PER_X_SECOND = 10;

// Handle new word
const getNewWord = (dictionary: string[]): string => {
  const newWord =
    dictionary[
      Math.floor(Math.random() * dictionary.length)
    ].toLocaleUpperCase();
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
  const [wordLength, setWordLength] = useState(0);
  const [roundStartedStamp, setRoundStartedStamp] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(0);
  const [lastRoundPoints, setLastRoundPoints] = useState(0);

  const startTimer = () => {
    const interval = setInterval(() => {
      setTimeLeft(
        Math.max(
          0,
          Math.floor((roundStartedStamp - Date.now() + ROUND_TIME) / 1000)
        )
      );
      if (
        Math.floor((roundStartedStamp - Date.now() + ROUND_TIME) / 1000) < 1
      ) {
        setLost(true);
        clearInterval(interval);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  };

  useChannel(gameId, (message) => {
    if (message.data.action === "newWord") {
      setGuess("");
      setGuesses([]);
      setWon(false);
      setLost(false);
      setWord(message.data.word);
      setWordLength(message.data.word.length);
      setRoundStartedStamp(message.data.roundStartedStamp);
      setTimeLeft(ROUND_TIME / 1000);
      startTimer();
    }
  });

  // Handle guess
  const handleGuess = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      (!lost &&
        !won &&
        guess.length === 4 &&
        (words_en_4.some((w) => w === guess) ||
          words_fi_4.some((w) => w === guess))) ||
      (guess.length === 5 &&
        (words_en_5.some((w) => w === guess) ||
          words_fi_5.some((w) => w === guess)))
    ) {
      const newGuesses = [...guesses, guess];
      setGuesses(newGuesses);
      setGuess("");
      if (guess === word) {
        const roundPoints =
          MAX_GUESSES -
          guesses.length +
          Math.floor(timeLeft / POINTS_PER_X_SECOND);
        const newScore = score + roundPoints;
        setLastRoundPoints(roundPoints);
        setScore(newScore);

        publishScore(gameId, ably.auth.clientId, newScore);
        setWon(true);
      } else if (newGuesses.length >= MAX_GUESSES) {
        setLost(true);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <h1 className="text-4xl font-bold">Multiwordleable</h1>
      {word !== undefined ? (
        <>
          {<p>Time left: {timeLeft} seconds</p>}
          {timeLeft < 1 ? <p className="text-green-500">{word}</p> : null}
          <form onSubmit={handleGuess} className="flex gap-2">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value.toUpperCase())}
              maxLength={wordLength}
              className="w-32 h-8 text-center border-2 rounded dark:text-gray-800"
              pattern={`[A-ZÄÖÅ]{${wordLength}}`}
            />
            <button
              type="submit"
              className="w-32 h-8 bg-blue-500 text-white rounded disabled:bg-gray-200 dark:bg-blue-700 dark:text-gray-300 disabled:text-gray-500 disabled:dark:bg-gray-800 hover:bg-blue-600 dark:hover:bg-blue-800 dark:hover:text-gray-200"
              disabled={
                guess.length !== wordLength ||
                won ||
                lost ||
                guesses.some((g) => g === guess)
              }
            >
              Guess
            </button>
          </form>
          <div className="flex flex-col gap-2">
            {Array(MAX_GUESSES)
              .fill(null)
              .map((_, index) => (
                <div
                  key={index}
                  className="w-64 h-8 flex items-center justify-center gap-2"
                >
                  {(guesses[index] ?? Array(wordLength).fill(" ").join(""))
                    .split("")
                    .map((letter, letterIndex) => (
                      <div
                        key={index + "_" + letterIndex}
                        className={
                          "w-8 h-8 border border-black dark:border-white rounded flex items-center justify-center" +
                          (word[letterIndex] === letter
                            ? " text-green-500"
                            : String(word)
                                  .split("")
                                  .filter(
                                    (filterLetter, filterLetterIndex) =>
                                      filterLetter !==
                                      (guesses[index] ?? "     ")[
                                        filterLetterIndex
                                      ]
                                  )
                                  .includes(letter)
                              ? " text-yellow-500"
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
      <div className="border rounded p-2">
        New Word
        <div className="flex flex-row gap-2">
          <button
            onClick={() => publishNewWord(gameId, getNewWord(words_en_4))}
            className="w-32 h-8 bg-red-300 text-gray-700 dark:bg-red-700 dark:text-gray-300 rounded hover:bg-red-400 dark:hover:bg-red-800 disabled:bg-gray-200 dark:disabled:bg-gray-800"
            disabled={timeLeft > 0}
          >
            English 4-letter
          </button>
          <button
            onClick={() => publishNewWord(gameId, getNewWord(words_en_5))}
            className="w-32 h-8 bg-red-300 text-gray-700 dark:bg-red-700 dark:text-gray-300 rounded hover:bg-red-400 dark:hover:bg-red-800 disabled:bg-gray-200 dark:disabled:bg-gray-800"
            disabled={timeLeft > 0}
          >
            English 5-letter
          </button>
          <button
            onClick={() => publishNewWord(gameId, getNewWord(words_fi_4))}
            className="w-32 h-8 bg-red-300 text-gray-700 dark:bg-red-700 dark:text-gray-300 rounded hover:bg-red-400 dark:hover:bg-red-800 disabled:bg-gray-200 dark:disabled:bg-gray-800"
            disabled={timeLeft > 0}
          >
            Finnish 4-letter
          </button>
          <button
            onClick={() => publishNewWord(gameId, getNewWord(words_fi_5))}
            className="w-32 h-8 bg-red-300 text-gray-700 dark:bg-red-700 dark:text-gray-300 rounded hover:bg-red-400 dark:hover:bg-red-800 disabled:bg-gray-200 dark:disabled:bg-gray-800"
            disabled={timeLeft > 0}
          >
            Finnish 5-letter
          </button>
        </div>
      </div>
      {word &&
        (won ? (
          <div className="bg-green-300 dark:bg-green-700 p-5 rounded">
            <p>You won!</p>
            <p>
              You scored {lastRoundPoints} points. Your total score is now{" "}
              {score}.
            </p>
          </div>
        ) : (
          <div className="p-5 rounded">
            {lost ? (
              <div className="bg-red-300 dark:bg-red-700 p-5 rounded">
                <p>You lost!</p>
              </div>
            ) : (
              <p>You have {MAX_GUESSES - guesses.length} guesses left</p>
            )}
          </div>
        ))}
    </div>
  );
};

export default Game;
