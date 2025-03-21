import { BACKEND_URL } from "../constants/routes";
import { useGetActiveUsersQuery, useGetAllUsersQuery } from "../queries/games";

export default function Landing() {
  const signup = () => {
    window.open(`${BACKEND_URL}/auth/register`, "_self");
  };

  const login = () => {
    window.open(`${BACKEND_URL}/auth/login`, "_self");
  };

  const playasguest = () => {
    window.open(`${BACKEND_URL}/auth/guest-login`, "_self");
  };

  const { data: users } = useGetAllUsersQuery({});
  const { data } = useGetActiveUsersQuery({});

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="flex bg-gray-800 rounded-lg shadow-lg overflow-hidden w-auto lg:w-[50vw]">
        <div
          className="hidden lg:block lg:w-1/2 bg-cover"
          style={{ backgroundImage: "url('/chess.jpg')" }}
        ></div>
        <div className="w-full p-8 lg:w-1/2">
          <h2 className="text-2xl font-bold text-gray-300">
            Welcome to Chess!
          </h2>
          <p className="mt-4 text-gray-400">
            Join the exciting world of online chess.
          </p>
          <div className="mt-8">
            <button
              onClick={signup}
              className="w-full bg-green-700 text-gray-300 py-2 px-4 rounded mt-4 hover:bg-green-600 focus:outline-none focus:bg-green-600"
            >
              Signup
            </button>
            <button
              onClick={login}
              className="w-full bg-gray-700 text-gray-300 py-2 px-4 rounded mt-4 hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
            >
              Login
            </button>
            <button
              onClick={playasguest}
              className="w-full bg-gray-700 text-gray-300 py-2 px-4 rounded mt-4 hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
            >
              Play as Guest
            </button>
          </div>
          <div className="mt-8">
            <h3 className="text-sm font-light italic text-gray-300">
              Active Users: {(data?.games ?? 0) * 2}
            </h3>
            <h3 className="text-sm font-light italic text-gray-300">
              Users: {users?.users ?? 0}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
