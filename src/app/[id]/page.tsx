import Game from "@/components/Game";
import PlayerList from "@/components/PlayerList";

const GamePage = ({ params }: { params: { id: string } }) => {
  return (
    <div className="grid grid-rows-1 items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-1 items-center sm:items-start">
        <div className="flex flex-row gap-8 row-start-1 items-center sm:items-start">
          <Game gameId={params.id} />
          <PlayerList gameId={params.id} />
        </div>
        <div
          id="footer"
          className="flex flex-col gap-8 row-start-1 items-center sm:items-start"
        >
          <p>Join code: {params.id}</p>
        </div>
      </main>
    </div>
  );
};

export default GamePage;
