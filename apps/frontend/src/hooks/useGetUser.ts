import { useEffect } from "react";
import { usePersonStore } from "../contexts/auth";
import { BACKEND_URL } from "../constants/routes";
import axios from "axios";

export const useGetUser = () => {
  const updateUser = usePersonStore((state) => state.updateUser);

  useEffect(() => {
    (async () => {
      const response = await axios.get(`${BACKEND_URL}/auth/refresh`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      updateUser(response.data.user);
    })();
  }, [updateUser]);
};
