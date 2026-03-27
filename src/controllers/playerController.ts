import { Request, Response } from "express";
import { SkillLevel } from "../../generated/prisma/client";
import prisma from "../lib/prisma.js";

class PlayerController {
  static getAllPlayers = async (request: Request, response: Response) => {
    try {
      const players = await prisma.player.findMany();
      if (players.length === 0)
        return response
          .status(404)
          .json({ success: false, message: "No players" });
      return response.status(200).json({ success: true, players });
    } catch (error: any) {
      console.error(`Get all players failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Get all players failed",
        error_message: error.message,
      });
    }
  };
}

export default PlayerController;
