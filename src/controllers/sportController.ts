import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { attachPlayerStatuses } from "../lib/playerStatus";
import { requireWorkspaceId } from "../lib/workspace";

const DEFAULT_SPORT_NAME = "Badminton";

class SportController {
  static postSport = async (request: Request, response: Response) => {
    try {
      return response.status(403).json({
        success: false,
        message: "Custom sports are not supported yet. Badminton is the only available sport.",
      });
    } catch (error: any) {
      console.error(`Post sport failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Post sport failed",
        error_message: error.message,
      });
    }
  };

  static getSports = async (request: Request, response: Response) => {
    try {
      const workspaceId = requireWorkspaceId(request, response);
      if (!workspaceId) return;

      let sport = await prisma.sport.findFirst({
        where: {
          workspaceId,
          name: DEFAULT_SPORT_NAME,
        },
      });

      if (!sport) {
        sport = await prisma.sport.create({
          data: {
            workspaceId,
            name: DEFAULT_SPORT_NAME,
          },
        });
      }

      return response.status(200).json({ success: true, sports: [sport] });
    } catch (error: any) {
      console.error(`Get sports failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Get sports failed",
        error_message: error.message,
      });
    }
  };

  static getSportDashboard = async (request: Request, response: Response) => {
    try {
      const workspaceId = requireWorkspaceId(request, response);
      if (!workspaceId) return;

      const { sportId } = request.params;

      const sport = await prisma.sport.findFirst({
        where: {
          id: sportId as string,
          workspaceId,
        },
      });

      if (!sport)
        return response
          .status(404)
          .json({ success: false, message: "Sport not found" });

      const [players, playerCountRows, courts, queuedMatches] = await Promise.all([
        prisma.player.findMany({
          where: { sportId: sportId as string },
        }),
        prisma.player.findMany({
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
              select: {
                matchId: true,
              },
            },
          },
        }),
        prisma.court.findMany({
          where: { sportId: sportId as string },
          include: {
            matches: {
              where: { endedAt: null },
              include: {
                teamA: true,
                teamB: true,
                matchPlayers: {
                  include: {
                    player: true,
                    team: true,
                  },
                },
              },
              orderBy: [
                { startedAt: "desc" },
                { queuedAt: "desc" },
                { id: "desc" },
              ],
              take: 1,
            },
          },
        }),
        prisma.match.findMany({
          where: {
            sportId: sportId as string,
            startedAt: null,
            endedAt: null,
            courtId: null,
          },
          include: {
            teamA: { include: { teamPlayers: true } },
            teamB: { include: { teamPlayers: true } },
            court: true,
            matchPlayers: {
              include: {
                player: true,
                team: true,
              },
            },
          },
          orderBy: [{ queuedAt: "asc" }, { startedAt: "asc" }, { id: "asc" }],
        }),
      ]);
      const playersWithStatuses = await attachPlayerStatuses(
        sportId as string,
        players,
      );

      return response.status(200).json({
        success: true,
        sport,
        players: playersWithStatuses,
        playerMatchCounts: playerCountRows.map((player) => ({
          id: player.id,
          name: player.name,
          matchesPlayed: player.matchPlayers.length,
        })),
        courts: courts.map(({ matches, ...court }) => ({
          ...court,
          currentMatch: matches[0] ?? null,
        })),
        queuedMatches,
      });
    } catch (error: any) {
      console.error(`Get sport dashboard failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Get sport dashboard failed",
        error_message: error.message,
      });
    }
  };

  static deleteSport = async (request: Request, response: Response) => {
    try {
      return response.status(403).json({
        success: false,
        message: "Deleting the default sport is not supported.",
      });
    } catch (error: any) {
      console.error(`Delete sport failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Delete sport failed",
        error_message: error.message,
      });
    }
  };
}

export default SportController;
