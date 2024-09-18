"use client";

export default function HomePage() {
  return (
    <div className="grid grid-rows-1 items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-1 items-center sm:items-start">
        <h1 className="text-4xl">Multiwordleable</h1>
        <p>Play Wordle with friends</p>
        <div>
          <form
            className="flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/${(document.getElementById("gameId") as HTMLInputElement).value?.toLocaleUpperCase()}`;
            }}
          >
            <label htmlFor="gameId">
              Join game with a code or create a new game
            </label>
            <input
              id="gameId"
              type="text"
              placeholder="Code"
              className="w-32 h-8 p-2 border-2 rounded dark:text-gray-800"
              required
            />
            <button
              type="submit"
              className="w-64 h-8 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-700 dark:text-gray-300 dark:hover:bg-blue-800 dark:hover:text-gray-200"
            >
              Join Game or Create New
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
