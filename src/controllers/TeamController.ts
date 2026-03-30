import { Request, Response } from "express";
import prisma from "../lib/prisma";

class TeamController {
  static postTeam = async (request: Request, response: Response) => {
    try {
      const { sportId } = request.params;
      const sportExist = await prisma.sport.findFirst({
        where: { id: sportId as string },
      });

      if (!sportExist)
        return response
          .status(404)
          .json({ success: false, message: "Sport not found" });

      const team = await prisma.team.create({
        data: { sportId: sportId as string },
      });

      return response.status(201).json({ success: true, team });
    } catch (error: any) {
      console.error(`Post team failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Post team failed",
        error_message: error.message,
      });
    }
  };

  static getTeams = async (request: Request, response: Response) => {
    try {
      const { sportId } = request.params;
      const sportExist = await prisma.sport.findFirst({
        where: { id: sportId as string },
      });

      if (!sportExist)
        return response
          .status(404)
          .json({ success: false, message: "Sport not found" });

      const teams = await prisma.team.findMany({
        include: { teamPlayers: true, teamAMatches: true, teamBMatches: true },
      });
      if (teams.length === 0)
        return response
          .status(404)
          .json({ success: false, message: "No teams" });

      return response.status(200).json({ success: true, teams });
    } catch (error: any) {
      console.error(`Get teams failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Get teams failed",
        error_message: error.message,
      });
    }
  };

  static deleteTeam = async (request: Request, response: Response) => {
    try {
      const { sportId } = request.params;
      const { teamId } = request.body;

      const sportExist = await prisma.sport.findFirst({
        where: { id: sportId as string },
      });

      if (!sportExist)
        return response
          .status(404)
          .json({ success: false, message: "Sport not found" });

      const teamExist = await prisma.team.findFirst({ where: { id: teamId } });
      if (!teamExist)
        return response
          .status(404)
          .json({ success: false, message: "No team" });

      await prisma.team.delete({ where: { id: teamId } });

      return response.status(204).json({});
    } catch (error: any) {
      console.error(`Delete team failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Delete team failed",
        error_message: error.message,
      });
    }
  };

  static postTeamPlayer = async (request: Request, response: Response) => {
    try {
      const { sportId } = request.params;
      const { teamId, playerId } = request.body;

      const sportExist = await prisma.sport.findFirst({
        where: { id: sportId as string },
      });

      if (!sportExist)
        return response
          .status(404)
          .json({ success: false, message: "Sport not found" });

      const teamExist = await prisma.team.findFirst({
        where: { id: teamId as string, sportId: sportId as string },
      });

      if (!teamExist)
        return response
          .status(404)
          .json({ success: false, message: "Team not found" });

      const playerExist = await prisma.player.findFirst({
        where: { id: playerId as string, sportId: sportId as string },
      });

      if (!playerExist)
        return response
          .status(404)
          .json({ success: false, message: "Player not found" });

      const playerInTeam = await prisma.teamPlayer.findFirst({
        where: { playerId: playerId as string },
      });

      if (playerInTeam?.teamId === teamId)
        return response.status(409).json({
          success: false,
          message: "Player is already in this team",
        });

      if (playerInTeam)
        return response.status(409).json({
          success: false,
          message: "Player is already in another team",
        });

      const players = await prisma.teamPlayer.create({
        data: { teamId, playerId },
      });

      return response.status(201).json({ success: true, players });
    } catch (error: any) {
      console.error(`Post team player failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Post team player failed",
        error_message: error.message,
      });
    }
  };

  static deleteTeamPlayer = async (request: Request, response: Response) => {
    try {
      const { sportId } = request.params;
      const { teamId, playerId } = request.body;

      const sportExist = await prisma.sport.findFirst({
        where: { id: sportId as string },
      });

      if (!sportExist)
        return response
          .status(404)
          .json({ success: false, message: "Sport not found" });

      const teamExist = await prisma.team.findFirst({
        where: { id: teamId as string, sportId: sportId as string },
      });

      if (!teamExist)
        return response
          .status(404)
          .json({ success: false, message: "Team not found" });

      const playerExist = await prisma.player.findFirst({
        where: { id: playerId as string, sportId: sportId as string },
      });

      if (!playerExist)
        return response
          .status(404)
          .json({ success: false, message: "Player not found" });

      const teamPlayerExist = await prisma.teamPlayer.findFirst({
        where: {
          teamId: teamId as string,
          playerId: playerId as string,
        },
      });

      if (!teamPlayerExist)
        return response.status(404).json({
          success: false,
          message: "Player is not in this team",
        });

      await prisma.teamPlayer.delete({
        where: {
          teamId_playerId: {
            teamId: teamId as string,
            playerId: playerId as string,
          },
        },
      });

      return response.status(204).json({});
    } catch (error: any) {
      console.error(`Delete team player failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Delete team player failed",
        error_message: error.message,
      });
    }
  };
}

export default TeamController;
