import { useGameStore } from "../../contexts/game.context";

const Moves = () => {
  const { color, moves } = useGameStore(["color", "moves"]);
  
  return (
    <div className="flex-1">
      <div>
        <h1 className="text-center text-white text-2xl font-sans">
          {color ? `You are playing ${color}` : "Finding an Opponent..."}
        </h1>
        {color && (
          <h1 className="text-center text-white text-4xl">Moves Played</h1>
        )}
      </div>
      <div className="overflow-y-auto h-[390px]">
        {moves.map((move, i) => {
          return (
            <p
              key={i}
              className="text-center text-white text-2xl border border-white my-2 mx-6 font-semibold font-sans"
            >
              {i % 2 === 0 ? "white" : "black"}: {move.from} &rarr; {move.to}
            </p>
          );
        })}
      </div>
    </div>
  );
};

export default Moves;
