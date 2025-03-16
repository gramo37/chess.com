import { useGameStore } from "../../contexts/game.context";

const game_types = [
  {
    title: "Random Select",
    gameType: "random",
  },
  {
    title: "Create Game Id",
    gameType: "friendly",
  },
];

const GameTypes = () => {
  const { isGameStarted } = useGameStore(["isGameStarted"]);

  if (isGameStarted) return null;

  return (
    <div className="flex w-full">
      {game_types.map((item) => {
        return (
          <GameType
            title={item.title}
            gameType={item.gameType as "random" | "friendly"}
          />
        );
      })}
    </div>
  );
};

export default GameTypes;

function GameType({
  title,
  gameType,
}: {
  title: string;
  gameType: "random" | "friendly";
}) {
  const { gameType: storeGameType, setGameType } = useGameStore([
    "gameType",
    "setGameType",
  ]);
  const active = gameType === storeGameType;
  return (
    <div
      onClick={() => setGameType(gameType)}
      className={`${active && "border border-red-400"} cursor-pointer transition-all flex justify-center items-center flex-1 h-24 text-white m-2 border rounded-lg`}
    >
      <p>{title}</p>
    </div>
  );
}
