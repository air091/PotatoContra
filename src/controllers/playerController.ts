import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { SkillLevel } from "../../generated/prisma/enums";
import { requireWorkspaceId } from "../lib/workspace";

class PlayerController {
  static getPlayers = async (request: Request, response: Response) => {
    try {
      const workspaceId = requireWorkspaceId(request, response);
      if (!workspaceId) return;

      const { sportId } = request.params;

      const sportExist = await prisma.sport.findFirst({
        where: {
          id: sportId as string,
          workspaceId,
        },
      });

      if (!sportExist)
        return response
          .status(404)
          .json({ success: false, message: "Sport not found" });

      const players = await prisma.player.findMany({
        where: { sportId: sportId as string },
      });
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
      const workspaceId = requireWorkspaceId(request, response);
      if (!workspaceId) return;

      const { sportId } = request.params;
      const { name } = request.body;
      const playerName = name.trim();

      if (playerName.length === 0)
        return response
          .status(400)
          .json({ success: false, message: "Name is required" });

      const sportExist = await prisma.sport.findFirst({
        where: {
          id: sportId as string,
          workspaceId,
        },
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
      const workspaceId = requireWorkspaceId(request, response);
      if (!workspaceId) return;

      const { playerId } = request.params;
      const { name, sportId, skillLevel, paymentStatus } = request.body;

      if (!playerId)
        return response
          .status(400)
          .json({ success: false, message: "playerId is required" });

      const playerExist = await prisma.player.findFirst({
        where: {
          id: playerId as string,
          sport: { workspaceId },
        },
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

        const sportExist = await prisma.sport.findFirst({
          where: {
            id: sportId,
            workspaceId,
          },
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

  static deletePlayer = async (request: Request, response: Response) => {
    try {
      const workspaceId = requireWorkspaceId(request, response);
      if (!workspaceId) return;

      const { playerId } = request.params;

      if (!playerId)
        return response
          .status(400)
          .json({ success: false, message: "playerId is required" });

      const player = await prisma.player.findFirst({
        where: {
          id: playerId as string,
          sport: { workspaceId },
        },
      });

      if (!player)
        return response
          .status(404)
          .json({ success: false, message: "Player not found" });

      await prisma.player.delete({
        where: { id: playerId as string },
      });

      return response.status(204).json({});
    } catch (error: any) {
      console.error(`Delete player failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Delete player failed",
        error_message: error.message,
      });
    }
  };

  static getPlayerHistory = async (request: Request, response: Response) => {
    try {
      const workspaceId = requireWorkspaceId(request, response);
      if (!workspaceId) return;

      const { playerId } = request.params;

      if (!playerId)
        return response
          .status(400)
          .json({ success: false, message: "playerId is required" });

      const player = await prisma.player.findFirst({
        where: {
          id: playerId as string,
          sport: { workspaceId },
        },
        include: { sport: true },
      });

      if (!player)
        return response
          .status(404)
          .json({ success: false, message: "Player not found" });

      const history = await prisma.matchPlayer.findMany({
        where: {
          playerId: playerId as string,
          match: {
            sport: { workspaceId },
          },
        },
        include: {
          team: true,
          match: {
            include: {
              sport: true,
              court: true,
              teamA: true,
              teamB: true,
              matchPlayers: {
                include: {
                  player: true,
                },
              },
            },
          },
        },
        orderBy: [
          { match: { endedAt: "desc" } },
          { match: { startedAt: "desc" } },
        ],
      });

      const matches = history.map((entry) => {
        const isTeamA = entry.teamId === entry.match.teamAId;
        const opponentTeam = isTeamA ? entry.match.teamB : entry.match.teamA;
        const playerScore = isTeamA ? entry.match.scoreA : entry.match.scoreB;
        const opponentScore = isTeamA ? entry.match.scoreB : entry.match.scoreA;
        const result =
          entry.match.winnerTeam === null
            ? "draw"
            : entry.match.winnerTeam === entry.teamId
              ? "win"
              : "loss";

        const teamMembers = entry.match.matchPlayers
          .filter(
            (mp) => mp.teamId === entry.teamId && mp.playerId !== playerId,
          )
          .map((mp) => ({
            id: mp.player.id,
            name: mp.player.name,
          }));

        const opponentMembers = entry.match.matchPlayers
          .filter((mp) => mp.teamId === opponentTeam?.id)
          .map((mp) => ({
            id: mp.player.id,
            name: mp.player.name,
          }));

        return {
          matchId: entry.matchId,
          sport: entry.match.sport,
          team: entry.team,
          teamMembers,
          opponentTeam,
          opponentMembers,
          court: entry.match.court,
          queuedAt: entry.match.queuedAt,
          startedAt: entry.match.startedAt,
          endedAt: entry.match.endedAt,
          score: {
            playerTeam: playerScore,
            opponent: opponentScore,
          },
          result,
        };
      });

      const summary = matches.reduce(
        (accumulator, match) => {
          accumulator.gamesPlayed += 1;
          if (match.result === "win") accumulator.wins += 1;
          if (match.result === "loss") accumulator.losses += 1;
          if (match.result === "draw") accumulator.draws += 1;
          return accumulator;
        },
        { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 },
      );

      return response.status(200).json({
        success: true,
        player: {
          id: player.id,
          name: player.name,
          sport: player.sport,
        },
        summary,
        matches,
      });
    } catch (error: any) {
      console.error(`Get player history failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Get player history failed",
        error_message: error.message,
      });
    }
  };

  static getPlayersMatchCount = async (
    request: Request,
    response: Response,
  ) => {
    try {
      const workspaceId = requireWorkspaceId(request, response);
      if (!workspaceId) return;

      const { sportId } = request.params;

      const sportExist = await prisma.sport.findFirst({
        where: {
          id: sportId as string,
          workspaceId,
        },
      });
      if (!sportExist)
        return response
          .status(404)
          .json({ success: false, message: "Sport not found" });

      const players = await prisma.player.findMany({
        where: { sportId: sportId as string },
        select: {
          id: true,
          name: true,
          matchPlayers: {
            where: {
              match: {
                startedAt: { not: null },
              },
            },
          },
        },
      });

      const playerMatchCounts = players.map((player) => ({
        id: player.id,
        name: player.name,
        matchesPlayed: player.matchPlayers.length,
      }));

      return response.status(200).json({ success: true, playerMatchCounts });
    } catch (error: any) {
      console.error(`Get players match count failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Get players match count failed",
        error_message: error.message,
      });
    }
  };
}

export default PlayerController;
