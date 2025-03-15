import Moves from "./Moves";
import NewGame from "./NewGame";

const GameOptions = () => {
  return (
    <div className="w-full lg:w-1/2 p-4 lg:p-8 flex flex-col items-center">
      <NewGame />
      <Moves />
    </div>
  );
};

export default GameOptions;
