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
      const { playerId } = request.body;

      const sportExist = await prisma.sport.findFirst({
        where: { id: sportId as string },
      });

      if (!sportExist)
        return response
          .status(404)
          .json({ success: false, message: "Sport not found" });

      const team = await prisma.team.create({
        data: { sportId: sportId as string },
        select: { id: true },
      });

      const players = await prisma.teamPlayer.create({
        data: { teamId: team.id, playerId },
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
}

export default TeamController;
