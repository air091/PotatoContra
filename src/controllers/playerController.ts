import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

class PlayerController {
  static getPlayers = async (request: Request, response: Response) => {
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

  static postPlayer = async (request: Request, response: Response) => {
    try {
      const { sportId } = request.params;
      const { name } = request.body;
      const playerName = name.trim();

      if (playerName.length === 0)
        return response
          .status(400)
          .json({ success: false, message: "Name is required" });

      const sportExist = await prisma.sport.findFirst({
        where: { id: sportId as string },
      });

      if (!sportExist)
        return response
          .status(404)
          .json({ success: false, message: "Sport not found" });

      const player = await prisma.player.create({
        data: { name: playerName, sportId: sportId as string },
      });
      return response.status(201).json({ success: true, player });
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
