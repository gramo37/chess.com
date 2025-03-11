import {
  ACCEPT_DRAW,
  ENDGAME,
  GAMEABORTED,
  GAMEOVER,
  GAMERESTARTED,
  GAMESTARTED,
  GET_TIME,
  INVALID_MOVE,
  MOVESUCCESS,
  OFFER_DRAW,
  REJECT_DRAW,
  RESIGN,
} from "../constants";
import { useEffect, useRef } from "react";
import { useGameStore } from "../contexts/game.context";
import { Chess } from "chess.js";
import useTimer from "./useTimer";

const useGamelogic = () => {
  const {
    isGameStarted,
    color,
    result,
    setBoard,
    setMoves,
    setSans,
    setColor,
    setResult,
    setIsGameStarted,
    socket,
    setOpponent,
    setPlayer,
    setSendingMove
  } = useGameStore([
    "setBoard",
    "isGameStarted",
    "setIsGameStarted",
    "setMoves",
    "setSans",
    "color",
    "setColor",
    "result",
    "setResult",
    "socket",
    "opponent",
    "setOpponent",
    "player",
    "setPlayer",
    "setSendingMove"
  ]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const {
    timeLeft: player1timeLeft,
    start: startPlayer1Timer,
    stop: stopPlayer1Timer,
    setTimeLeft: setPlayer1TimeLeft,
  } = useTimer();
  const {
    timeLeft: player2timeLeft,
    start: startPlayer2Timer,
    stop: stopPlayer2Timer,
    setTimeLeft: setPlayer2TimeLeft,
  } = useTimer();

  const acceptDraw = () => {
    socket?.send(
      JSON.stringify({
        type: ENDGAME,
        payload: {
          status: ACCEPT_DRAW,
        },
      })
    );
  };

  const rejectDraw = () => {
    socket?.send(
      JSON.stringify({
        type: REJECT_DRAW,
      })
    );
  };

  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === MOVESUCCESS) {
        setBoard(message.payload.board);
        setMoves(message.payload.moves);
        setSans(message.payload.sans);
        setSendingMove(false);
        const chess = new Chess(message.payload.board);
        if (chess.turn() === "w") {
          startPlayer1Timer(message.payload.player1TimeLeft);
          stopPlayer2Timer();
        } else {
          startPlayer2Timer(message.payload.player2TimeLeft);
          stopPlayer1Timer();
        }
      } else if (message.type === GAMESTARTED) {
        setColor(message.payload.color);
        setBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
        setOpponent(message.payload.opponent);
        setPlayer(message.payload.player);
        startPlayer1Timer(message.payload.player1TimeLeft);
      } else if (message.type === GAMEOVER) {
        setMoves([]);
        setResult({
          winner: message.payload.winner?.color,
          loser: message.payload.loser?.color,
          gameResult: message.payload?.result,
        });
        setIsGameStarted(false);
        setSendingMove(false);
        stopPlayer1Timer();
        stopPlayer2Timer();
        // queryClient.invalidateQueries({ queryKey: ["myGames"] });
      } else if (message.type === GAMERESTARTED) {
        setBoard(message.payload.board);
        setMoves(message.payload.moves);
        setSans(message.payload.sans);
        setColor(message.payload.color);
        setOpponent(message.payload.opponent);
        setPlayer(message.payload.player);
        const chess = new Chess(message.payload.board);
        if (chess.turn() === "w") {
          startPlayer1Timer(message.payload.player1TimeLeft);
        } else {
          startPlayer2Timer(message.payload.player2TimeLeft);
        }
      } else if (message.type === OFFER_DRAW) {
        if (confirm("Opponents was a draw. Do you want to draw ?")) {
          acceptDraw();
        } else {
          rejectDraw();
        }
      } else if (message.type === REJECT_DRAW) {
        alert("Opponent rejected the offer of draw");
      } else if (message.type === INVALID_MOVE) {
        setSendingMove(false);
      } else if (message.type === GAMEABORTED) {
        setIsGameStarted(false);
      } else if (message.type === GET_TIME) {
        setPlayer1TimeLeft(message.payload.player1TimeLeft);
        setPlayer2TimeLeft(message.payload.player2TimeLeft);
      }
    };
    return () => {
      socket.onmessage = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setBoard, setColor, setIsGameStarted, setMoves, setResult, socket]);

  useEffect(() => {
    if (result?.gameResult === RESIGN && result.winner === color) {
      alert("Congrats. You Won. Opponent has resigned");
    } else if (["DRAW", "ACCEPT_DRAW"].includes(result?.gameResult ?? "")) {
      alert("Game is Drawn!");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameStarted, result]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!socket) return;
      socket.send(
        JSON.stringify({
          type: GET_TIME,
        })
      );
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [socket]);

  return {
    player1timeLeft,
    player2timeLeft
  }
};

export default useGamelogic;
