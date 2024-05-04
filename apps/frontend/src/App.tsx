import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./screens/Landing";
import Game from "./screens/Game";
import { useGetUser } from "./hooks/useGetUser";
import { usePersonStore } from "./contexts/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function App() {
  useGetUser();
  const user = usePersonStore((state) => state.user);

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-slate-900 h-full w-screen">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={user ? <Game /> : <Landing />} />
            <Route path="/game" element={user ? <Game /> : <Landing />} />
          </Routes>
        </BrowserRouter>
      </div>
    </QueryClientProvider>
  );
}

export default App;
