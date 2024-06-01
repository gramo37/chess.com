// import { useNavigate } from "react-router-dom";
import { INIT_GAME } from "../../constants";
import { BACKEND_URL } from "../../constants/routes";
import { useGameStore } from "../../contexts/game.context";
// import { usePersonStore } from "../../contexts/auth";
// import axios from "axios";

const NewGame = () => {
  const { setIsGameStarted, setResult, socket, setColor } = useGameStore([
    "setIsGameStarted",
    "setResult",
    "socket",
    "setColor",
  ]);
  // const updateUser = usePersonStore((state) => state.updateUser);
  // const navigate = useNavigate();

  // Make a API call and get the game inprogress for the user
  // const { data } = useQuery({
  //   queryKey: ["myGames"],
  //   queryFn: async () => {
  //     const res = await axios.get(`${BACKEND_URL}/me/games`, {
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       withCredentials: true,
  //     });
  //     return res.data;
  //   },
  // });
  // useEffect(() => {
  //   if (data?.games) {
  //     startGame();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [data]);

  const startGame = () => {
    if(!socket) return;
    setIsGameStarted(true);
    setResult(null);
    setColor(null);
    socket?.send(
      JSON.stringify({
        type: INIT_GAME,
      })
    );
  };

  // async function logout() {
  //   await axios.post(`${BACKEND_URL}/auth/logout`, {
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     withCredentials: true,
  //   });
  //   updateUser(null);
  //   navigate("/");
  // }
  return (
    <div className="flex justify-center items-center flex-col w-full lg:h-[465px]">
      <button
        disabled={socket === null}
        onClick={startGame}
        className={`w-full bg-blue-700 text-gray-300 py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600 ${socket === null && "bg-gray-500"}`}
      >
        Play
      </button>
      <a
        href={`${BACKEND_URL}/auth/logout`}
        className="w-full bg-gray-700 text-gray-300 py-2 px-4 rounded mt-4 hover:bg-gray-600 focus:outline-none focus:bg-gray-600 text-center"
      >
        Logout
      </a>
    </div>
  );
};

export default NewGame;
