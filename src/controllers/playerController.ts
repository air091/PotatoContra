import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { SkillLevel } from "../../generated/prisma/enums";

class PlayerController {
  static getPlayers = async (request: Request, response: Response) => {
    try {
      const { sportId } = request.params;

      const sportExist = await prisma.sport.findFirst({
        where: { id: sportId as string },
      });

      if (!sportExist)
        return response
          .status(404)
          .json({ success: false, message: "Sport not found" });

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
      console.error(`Post player failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Post player failed",
        error_message: error.message,
      });
    }
  };

  static patchPlayer = async (request: Request, response: Response) => {
    try {
      const { playerId } = request.params;
      const { name, sportId, skillLevel, paymentStatus } = request.body;

      if (!playerId)
        return response
          .status(400)
          .json({ success: false, message: "playerId is required" });

      const playerExist = await prisma.player.findUnique({
        where: { id: playerId as string },
      });

      if (!playerExist)
        return response
          .status(404)
          .json({ success: false, message: "Player not found" });

      const updatedData: {
        name?: string;
        sportId?: string;
        skillLevel?: SkillLevel;
        paymentStatus?: boolean;
      } = {};

      if (name !== undefined) {
        if (typeof name !== "string" || name.trim().length === 0)
          return response.status(400).json({
            success: false,
            message: "Name must be a non-empty string",
          });

        updatedData.name = name.trim();
      }

      if (sportId !== undefined) {
        if (typeof sportId !== "string" || sportId.trim().length === 0)
          return response.status(400).json({
            success: false,
            message: "sportId must be a non-empty string",
          });

        const sportExist = await prisma.sport.findUnique({
          where: { id: sportId },
        });

        if (!sportExist)
          return response
            .status(404)
            .json({ success: false, message: "Sport not found" });

        updatedData.sportId = sportId;
      }

      if (skillLevel !== undefined) {
        if (typeof skillLevel !== "string")
          return response.status(400).json({
            success: false,
            message: "skillLevel must be a string",
          });

        const normalizedSkillLevel = skillLevel.toLowerCase();

        if (
          !Object.values(SkillLevel).includes(
            normalizedSkillLevel as SkillLevel,
          )
        )
          return response.status(400).json({
            success: false,
            message:
              "Invalid skillLevel. Use one of: beginner, intermediate, expert",
          });

        updatedData.skillLevel = normalizedSkillLevel as SkillLevel;
      }

      if (paymentStatus !== undefined) {
        if (typeof paymentStatus !== "boolean")
          return response.status(400).json({
            success: false,
            message: "paymentStatus must be a boolean",
          });

        updatedData.paymentStatus = paymentStatus;
      }

      if (Object.keys(updatedData).length === 0)
        return response.status(400).json({
          success: false,
          message: "No valid fields to update",
        });

      const updatedPlayer = await prisma.player.update({
        where: { id: playerId as string },
        data: updatedData,
      });

      return response.status(200).json({
        success: true,
        player: updatedPlayer,
      });
    } catch (error: any) {
      console.error(`Update player failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Update player failed",
        error_message: error.message,
      });
    }
  };
}

export default PlayerController;
