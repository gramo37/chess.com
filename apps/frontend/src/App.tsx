import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./components/Landing";
import Game from "./components/Game";
import { useGetUser } from "./hooks/useGetUser";
import { usePersonStore } from "./contexts/auth";

function App() {
  useGetUser();
  const user = usePersonStore((state) => state.user);

  return (
    <div className="bg-slate-900 h-full w-screen">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={user ? <Game /> : <Landing />} />
          <Route path="/game" element={user ? <Game /> : <Landing />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
