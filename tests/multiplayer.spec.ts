import { test, expect, Page } from "@playwright/test";
import { randomUUID } from "crypto";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Multiwordleable/);
});

const AMOUNT_OF_PLAYERS = 10;
const GAMES_TO_PLAY = 3;

const joinGame = async (page: Page, gameCode: string) => {
  await page.goto("/");
  (await page.waitForSelector("input")).fill(gameCode);
  (await page.waitForSelector(`button`)).click();
};

const playGame = async (players: Page[]) => {
  await Promise.all(
    players.map(async (player) => {
      (
        await player.waitForSelector("button:has-text('English 4-letter')")
      ).click({ force: true });
    })
  );

  await new Promise((resolve) => setTimeout(resolve, 1000));

  await Promise.all(
    players.map(async (player) => {
      await expect(player.getByText("Time left: 0 seconds")).not.toBeVisible();

      await expect(player.getByText("Time left: 0 seconds")).toBeVisible();
    })
  );
};

test("multiplayer works", async ({ page }) => {
  const gameCode = randomUUID();
  const players = await Promise.all(
    new Array(AMOUNT_OF_PLAYERS).fill(null).map(async () => {
      const player = await page.context().newPage();
      await joinGame(player, gameCode);
      return player;
    })
  );

  // Check that all players joined the game.
  await Promise.all(
    players.map(async (player) => {
      await expect(player).toHaveURL(`${gameCode}`);
      await expect(player.locator("ul > li")).toHaveCount(AMOUNT_OF_PLAYERS);
    })
  );

  await new Promise((resolve) => setTimeout(resolve, 1000));

  for (let i = 0; i < GAMES_TO_PLAY; i++) {
    await playGame(players);
    await new Promise((resolve) =>
      setTimeout(
        resolve,
        parseInt(process.env.NEXT_PUBLIC_ROUND_TIME ?? "10000", 10)
      )
    );
  }

  // Close all players.
  await Promise.all(players.map((player) => player.close()));
});
