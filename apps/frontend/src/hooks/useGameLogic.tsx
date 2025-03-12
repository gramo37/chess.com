/* eslint-disable @typescript-eslint/no-explicit-any */
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
} from "../constants";
import { useCallback, useEffect } from "react";
import { useGameStore } from "../contexts/game.context";
import { Chess } from "chess.js";

const useGamelogic = () => {
  const {
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
    setPlayer2TimeLeft,
  } = useGameStore([
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
    "setPlayer2TimeLeft",
  ]);

  const acceptDraw = useCallback(() => {
    socket?.send(
      JSON.stringify({
        type: ENDGAME,
        payload: {
          status: ACCEPT_DRAW,
        },
      })
    );
  }, [socket]);

  const rejectDraw = useCallback(() => {
    socket?.send(
      JSON.stringify({
        type: REJECT_DRAW,
      })
    );
  }, [socket]);

  const handleMoveSuccess = useCallback(
    (payload: any) => {
      setBoard(payload.board);
      setMoves(payload.moves);
      setSans(payload.sans);
      setSendingMove(false);
      const chess = new Chess(payload.board);
      if (chess.turn() === "w") {
        startPlayerTimer(1, payload.player1TimeLeft);
        stopPlayerTimer(2);
      } else {
        startPlayerTimer(2, payload.player2TimeLeft);
        stopPlayerTimer(1);
      }
    },
    [
      setBoard,
      setMoves,
      setSans,
      setSendingMove,
      startPlayerTimer,
      stopPlayerTimer,
    ]
  );

  const handleGameStarted = useCallback(
    (payload: any) => {
      setColor(payload.color);
      setBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
      setOpponent(payload.opponent);
      setPlayer(payload.player);
      startPlayerTimer(1, payload.player1TimeLeft);
    },
    [setBoard, setColor, setOpponent, setPlayer, startPlayerTimer]
  );

  const handleGameOver = useCallback(
    (payload: any) => {
      setMoves([]);
      setResult({
        winner: payload.winner?.color,
        loser: payload.loser?.color,
        gameResult: payload?.result,
      });
      setIsGameStarted(false);
      setSendingMove(false);
      stopPlayerTimer(1);
      stopPlayerTimer(2);
      // queryClient.invalidateQueries({ queryKey: ["myGames"] });
    },
    [setIsGameStarted, setMoves, setResult, setSendingMove, stopPlayerTimer]
  );

  const handleGameRestarted = useCallback(
    (payload: any) => {
      setBoard(payload.board);
      setMoves(payload.moves);
      setSans(payload.sans);
      setColor(payload.color);
      setOpponent(payload.opponent);
      setPlayer(payload.player);
      const chess = new Chess(payload.board);
      if (chess.turn() === "w") {
        startPlayerTimer(1, payload.player1TimeLeft);
      } else {
        startPlayerTimer(2, payload.player2TimeLeft);
      }
    },
    [
      setBoard,
      setColor,
      setMoves,
      setOpponent,
      setPlayer,
      setSans,
      startPlayerTimer,
    ]
  );

  const handleOfferDraw = useCallback(() => {
    if (confirm("Opponents was a draw. Do you want to draw ?")) {
      acceptDraw();
    } else {
      rejectDraw();
    }
  }, [acceptDraw, rejectDraw]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (e: MessageEvent) => {
      const message = JSON.parse(e.data);

      switch (message.type) {
        case MOVESUCCESS:
          handleMoveSuccess(message.payload);
          break;
        case GAMESTARTED:
          handleGameStarted(message.payload);
          break;
        case GAMEOVER:
          handleGameOver(message.payload);
          break;
        case GAMERESTARTED:
          handleGameRestarted(message.payload);
          break;
        case OFFER_DRAW:
          handleOfferDraw();
          break;
        case REJECT_DRAW:
          alert("Opponent rejected the draw offer.");
          break;
        case INVALID_MOVE:
          setSendingMove(false);
          break;
        case GAMEABORTED:
          setIsGameStarted(false);
          break;
        case GET_TIME:
          setPlayer1TimeLeft(message.payload.player1TimeLeft);
          setPlayer2TimeLeft(message.payload.player2TimeLeft);
          break;
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setBoard, setColor, setIsGameStarted, setMoves, setResult, socket]);
};

export default useGamelogic;
