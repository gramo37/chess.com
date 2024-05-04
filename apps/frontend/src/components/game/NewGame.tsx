import { useNavigate } from "react-router-dom";
import { INIT_GAME } from "../../constants";
import { LOGOUT_URL } from "../../constants/routes";
import { useGameStore } from "../../contexts/game.context";
import { usePersonStore } from "../../contexts/auth";

const NewGame = () => {
  const { setIsGameStarted, setResult, socket, setColor } = useGameStore([
    "setIsGameStarted",
    "setResult",
    "socket",
    "setColor"
  ]);
  const updateUser = usePersonStore((state) => state.updateUser);
  const navigate = useNavigate();

  const startGame = () => {
    setIsGameStarted(true);
    setResult(null);
    setColor(null)
    socket?.send(
      JSON.stringify({
        type: INIT_GAME,
      })
    );
  };

  async function logout() {
    await fetch(`${LOGOUT_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    updateUser(null);
    navigate("/");
  }
  return (
    <>
      <button
        className="text-white border border-white py-5 px-14 hover:bg-white hover:text-black transition-all"
        onClick={startGame}
      >
        Play
      </button>
      <button
        className="text-white border border-white py-5 px-14 hover:bg-white hover:text-black transition-all"
        onClick={logout}
      >
        Logout
      </button>
    </>
  );
};

export default NewGame;
