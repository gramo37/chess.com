import { useEffect, useState } from "react";
import { usePersonStore } from "../contexts/auth"
import axios from "axios";
import { AUTH_URL } from "../constants/routes";

export const useGetUser = () => {
  const updateUser = usePersonStore((state) => state.updateUser);

  useEffect(() => {
    (async () => {
        // const response = await axios.get(AUTH_URL);
        const response = await fetch(`${AUTH_URL}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          updateUser(data.user)
        }
    })()
  }, [updateUser]);
};
