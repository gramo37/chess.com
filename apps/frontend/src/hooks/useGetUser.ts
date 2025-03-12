import { useEffect } from "react";
import { usePersonStore } from "../contexts/auth";
import { useRefreshTokenQuery } from "../queries/games";

export const useGetUser = () => {
  const { updateUser } = usePersonStore(["updateUser"]);
  const { data, isSuccess, isError } = useRefreshTokenQuery({});

  useEffect(() => {
    if (isSuccess && data) {
      updateUser(data.user);
    }
  }, [isSuccess, isError, data, updateUser]);
};
