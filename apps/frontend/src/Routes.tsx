import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./screens/Landing";
import Game from "./screens/Game";
import { useGetUser } from "./hooks/useGetUser";
import { usePersonStore } from "./contexts/auth";

const Routers = () => {
  useGetUser();
  const user = usePersonStore((state) => state.user);
  return (
    <div className="bg-slate-900 h-full w-screen">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/game" replace />} />
          <Route path="/login" element={!user ? <Landing /> : <Game />} />
          <Route
            path="/game"
            element={user ? <Game /> : <Navigate to="/login" replace />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default Routers;
