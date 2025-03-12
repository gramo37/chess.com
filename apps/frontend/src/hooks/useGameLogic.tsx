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
    setSendingMove,
    startPlayerTimer,
    stopPlayerTimer,
    setPlayer1TimeLeft,
    setPlayer2TimeLeft
  } = useGameStore([
    "isGameStarted",
    "color",
    "result",
    "setBoard",
    "setMoves",
    "setSans",
    "setColor",
    "setResult",
    "setIsGameStarted",
    "socket",
    "setOpponent",
    "setPlayer",
    "setSendingMove",
    "startPlayerTimer",
    "stopPlayerTimer",
    "setPlayer1TimeLeft",
    "setPlayer2TimeLeft"
  ]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
          startPlayerTimer(1, message.payload.player1TimeLeft);
          stopPlayerTimer(2);
        } else {
          startPlayerTimer(2, message.payload.player2TimeLeft);
          stopPlayerTimer(1);
        }
      } else if (message.type === GAMESTARTED) {
        setColor(message.payload.color);
        setBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
        setOpponent(message.payload.opponent);
        setPlayer(message.payload.player);
        startPlayerTimer(1, message.payload.player1TimeLeft);
      } else if (message.type === GAMEOVER) {
        setMoves([]);
        setResult({
          winner: message.payload.winner?.color,
          loser: message.payload.loser?.color,
          gameResult: message.payload?.result,
        });
        setIsGameStarted(false);
        setSendingMove(false);
        stopPlayerTimer(1);
        stopPlayerTimer(2);
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
          startPlayerTimer(1, message.payload.player1TimeLeft);
        } else {
          startPlayerTimer(2, message.payload.player2TimeLeft);
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
};

export default useGamelogic;
