import { useEffect, useRef, useState } from "react";
import { INITIAL_TIME } from "../constants";

const useTimer = () => {
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIME);
  const [isActive, setIsActive] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = (initialStartTime?: number) => {
    if (!isActive) {
      if (initialStartTime) setTimeLeft(initialStartTime);
      setIsActive(true);
    }
  };

  const stop = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const reset = (newTime: number) => {
    stop();
    setTimeLeft(newTime);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, timeLeft]);

  return { timeLeft, isActive, start, stop, reset, setTimeLeft };
};

export default useTimer;
