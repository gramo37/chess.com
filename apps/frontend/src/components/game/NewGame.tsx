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
    <>
      <button
        className="text-white border border-white py-5 px-14 hover:bg-white hover:text-black transition-all"
        onClick={startGame}
      >
        Play
      </button>
      <button
        className="text-white border border-white py-5 px-14 hover:bg-white hover:text-black transition-all"
        // onClick={logout}
      >
        <a href={`${BACKEND_URL}/auth/logout`}>Logout</a>
      </button>
    </>
  );
};

export default NewGame;
