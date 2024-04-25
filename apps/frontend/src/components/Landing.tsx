import { useNavigate } from "react-router-dom";

const BACKEND_URL = "http://localhost:3000"

export default function Landing() {
  const navigate = useNavigate();

  const startGame = () => {
    navigate("/game");
  };

  const signup = () => {
    window.open(`${BACKEND_URL}/auth/register`)
  }

  const login = () => {
    window.open(`${BACKEND_URL}/auth/login`)
  }
  
  return (
    <div className="flex justify-center items-center w-screen flex-col md:flex-row pt-8 md:pt-0">
      <div className="md:p-10 p-4">
        <img className="max-w-80 sm:max-w-96" src="/chess.jpg" />
      </div>
      <div className="flex justify-center items-center flex-col">
        <div className="py-10 px-20">
          <h1 className="text-white font-serif font-bold text-4xl text-center italic">
            Worlds 3rd best Online Chess Platform
          </h1>
        </div>
        <button
          onClick={startGame}
          className="text-white border border-white py-5 px-14 hover:bg-white hover:text-black transition-all"
        >
          Play Online Chess
        </button>
        <button onClick={signup}>
          Sign Up
        </button>
        <button onClick={login}>
          Log In
        </button>
      </div>
    </div>
  );
}
