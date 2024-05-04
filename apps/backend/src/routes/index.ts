import { Router } from "express";
import { db } from "../db";

const router = Router();

router.get("/games", async (req, res) => {
  try {
    if (req.user) {
      const user: any = req.user;
      // DB search for the inprogress game
      const games = await db.game.findFirst({
        where: {
          OR: [{ whitePlayerId: user?.id }, { blackPlayerId: user?.id }],
          status: "IN_PROGRESS",
        },
      });
      // return it
      res.status(200).json({
        games,
      });
    } else
      res.status(404).json({
        user: null,
        message: "Unauthorized",
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
});

export default router;
