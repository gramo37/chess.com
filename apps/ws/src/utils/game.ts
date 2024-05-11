import { Chess } from "chess.js";
import { broadCastMessage } from ".";
import { Player } from "../Player";
import { BLACK_WINS, COMPLETED, GAMEOVER, WHITE, WHITE_WINS } from "../constants";
import { TGameResult, TMove } from "../types/game.types";

export const sendGameOverMessage = (
    winner: Player,
    loser: Player,
    gameResult: TGameResult
) => {
    broadCastMessage([winner.getPlayer(), loser.getPlayer()], {
        type: GAMEOVER,
        payload: {
            winner: {
                id: winner.getPlayerId(),
                name: winner.getPlayerName(),
                color: winner.getPlayerColor(),
            },
            loser: {
                id: loser.getPlayerId(),
                name: loser.getPlayerName(),
                color: loser.getPlayerColor(),
            },
            status: COMPLETED,
            result: gameResult,
        },
    });
    return winner.getPlayerColor() === WHITE ? WHITE_WINS : BLACK_WINS;
};

export const seedBoard = (moves: TMove[]) => {
    const chess = new Chess();
    moves.forEach((move) => {
        chess.move(move)
    })
    return chess;
}