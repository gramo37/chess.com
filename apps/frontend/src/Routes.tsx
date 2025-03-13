import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./screens/Landing";
import Game from "./screens/Game";
import { useGetUser } from "./hooks/useGetUser";
import { usePersonStore } from "./contexts/auth";
import { useGlobalStore } from "./contexts/global.context";
import { Modal } from "./components/ui/Modal";

const Routers = () => {
  useGetUser();
  const { user } = usePersonStore(["user"]);
  const { setGlobalModalRef, closeModal, globalModalState } = useGlobalStore([
    "setGlobalModalRef",
    "closeModal",
    "globalModalState"
  ]);

  return (
    <div className="bg-slate-900 h-full w-screen">
      <Modal
        setGlobalModalRef={setGlobalModalRef}
        closeModal={closeModal}
        globalModalState={globalModalState}
      />
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
