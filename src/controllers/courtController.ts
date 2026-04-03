import { Request, Response } from "express";
import prisma from "../lib/prisma";

const normalizePlayerIds = (value: unknown) => {
  if (!Array.isArray(value)) return "invalid";

  const normalizedIds = value
    .filter((playerId): playerId is string => typeof playerId === "string")
    .map((playerId) => playerId.trim())
    .filter((playerId) => playerId.length > 0);

  if (normalizedIds.length !== value.length) return "invalid";

  return [...new Set(normalizedIds)];
};

const getIdsDifference = (nextIds: string[], currentIds: string[]) => {
  const currentIdsSet = new Set(currentIds);
  return nextIds.filter((id) => !currentIdsSet.has(id));
};

const getTeamPlayerIds = (
  matchPlayers: { playerId: string; teamId: string }[],
  teamId: string | null | undefined,
) => {
  if (!teamId) return [];

  return matchPlayers
    .filter((matchPlayer) => matchPlayer.teamId === teamId)
    .map((matchPlayer) => matchPlayer.playerId);
};

class CourtController {
  static postCourt = async (request: Request, response: Response) => {
    try {
      const { sportId } = request.params;
      const { name } = request.body ?? {};

      const sportExist = await prisma.sport.findFirst({
        where: { id: sportId as string },
      });
      if (!sportExist)
        return response
          .status(404)
          .json({ success: false, message: "Sport not found" });

      let courtName = "";

      if (name !== undefined) {
        if (typeof name !== "string" || name.trim().length === 0)
          return response.status(400).json({
            success: false,
            message: "Name must be a non-empty string",
          });

        courtName = name.trim();
      } else {
        const courtCount = await prisma.court.count({
          where: { sportId: sportId as string },
        });

        courtName = `court ${courtCount + 1}`;
      }

      const court = await prisma.court.create({
        data: { name: courtName, sportId: sportId as string },
      });
      return response.status(201).json({ success: true, court });
    } catch (error: any) {
      console.error(`Post court failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Post court failed",
        error_message: error.message,
      });
    }
  };

  static getCourts = async (request: Request, response: Response) => {
    try {
      const { sportId } = request.params;
      const sportExist = await prisma.sport.findFirst({
        where: { id: sportId as string },
      });
      if (!sportExist)
        return response
          .status(404)
          .json({ success: false, message: "Sport not found" });

      const courts = await prisma.court.findMany({
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
      });

      return response.status(200).json({
        success: true,
        courts: courts.map(({ matches, ...court }) => ({
          ...court,
          currentMatch: matches[0] ?? null,
        })),
      });
    } catch (error: any) {
      console.error(`Get courts failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Get courts failed",
        error_message: error.message,
      });
    }
  };

  static deleteCourt = async (request: Request, response: Response) => {
    try {
      const { sportId, courtId } = request.params;
      const sportExist = await prisma.sport.findFirst({
        where: { id: sportId as string },
      });
      if (!sportExist)
        return response
          .status(404)
          .json({ success: false, message: "Sport not found" });

      const courtExist = await prisma.court.findFirst({
        where: { id: courtId as string, sportId: sportId as string },
      });
      if (!courtExist)
        return response
          .status(404)
          .json({ success: false, message: "Court not found" });

      await prisma.court.delete({
        where: { id: courtId as string },
      });

      return response.status(204).json({});
    } catch (error: any) {
      if (error?.code === "P2003")
        return response.status(409).json({
          success: false,
          message: "Court is being used by a match and cannot be deleted",
        });

      console.error(`Delete court failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Delete court failed",
        error_message: error.message,
      });
    }
  };

  static resetCourt = async (request: Request, response: Response) => {
    try {
      const { sportId, courtId } = request.params;

      const [sportExist, courtExist] = await Promise.all([
        prisma.sport.findFirst({
          where: { id: sportId as string },
        }),
        prisma.court.findFirst({
          where: { id: courtId as string, sportId: sportId as string },
        }),
      ]);

      if (!sportExist)
        return response
          .status(404)
          .json({ success: false, message: "Sport not found" });

      if (!courtExist)
        return response
          .status(404)
          .json({ success: false, message: "Court not found" });

      const activeMatch = await prisma.match.findFirst({
        where: {
          sportId: sportId as string,
          courtId: courtId as string,
          endedAt: null,
        },
        include: {
          teamA: true,
          teamB: true,
          court: true,
          matchPlayers: {
            include: {
              player: true,
              team: true,
            },
          },
        },
        orderBy: [{ startedAt: "desc" }, { queuedAt: "desc" }, { id: "desc" }],
      });

      if (!activeMatch)
        return response.status(404).json({
          success: false,
          message: "No active match found for this court",
        });

      if (activeMatch.startedAt)
        return response.status(409).json({
          success: false,
          message: "This court session has already started and must be ended",
        });

      const match = await prisma.$transaction(async (transaction) => {
        const updatedMatch = await transaction.match.update({
          where: { id: activeMatch.id },
          data: {
            endedAt: new Date(),
            winnerTeam: null,
          },
          include: {
            teamA: true,
            teamB: true,
            court: true,
            matchPlayers: {
              include: {
                player: true,
                team: true,
              },
            },
          },
        });

        await Promise.all([
          activeMatch.teamAId
            ? transaction.teamPlayer.deleteMany({
                where: { teamId: activeMatch.teamAId },
              })
            : Promise.resolve(),
          activeMatch.teamBId
            ? transaction.teamPlayer.deleteMany({
                where: { teamId: activeMatch.teamBId },
              })
            : Promise.resolve(),
        ]);

        return updatedMatch;
      });

      return response.status(200).json({
        success: true,
        court: courtExist,
        match,
      });
    } catch (error: any) {
      console.error(`Reset court failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Reset court failed",
        error_message: error.message,
      });
    }
  };

  static endCourt = async (request: Request, response: Response) => {
    try {
      const { sportId, courtId } = request.params;
      const { scoreA, scoreB } = request.body ?? {};

      const courtExist = await prisma.court.findFirst({
        where: { id: courtId as string, sportId: sportId as string },
      });

      if (!courtExist)
        return response
          .status(404)
          .json({ success: false, message: "Court not found" });

      const activeMatch = await prisma.match.findFirst({
        where: {
          sportId: sportId as string,
          courtId: courtId as string,
          endedAt: null,
        },
        select: {
          id: true,
          startedAt: true,
          teamAId: true,
          teamBId: true,
        },
        orderBy: [{ startedAt: "desc" }, { queuedAt: "desc" }, { id: "desc" }],
      });

      if (!activeMatch)
        return response.status(404).json({
          success: false,
          message: "No active match found for this court",
        });

      if (!activeMatch.startedAt)
        return response.status(409).json({
          success: false,
          message: "This court session has not started yet",
        });

      // Determine winner based on scores
      let winnerTeamId: string | null = null;
      if (typeof scoreA === "number" && typeof scoreB === "number") {
        if (scoreA > scoreB) {
          winnerTeamId = activeMatch.teamAId ?? null;
        } else if (scoreB > scoreA) {
          winnerTeamId = activeMatch.teamBId ?? null;
        }
        // else it's a draw, winnerTeamId stays null
      }

      const match = await prisma.$transaction(async (transaction) => {
        const updatedMatch = await transaction.match.update({
          where: { id: activeMatch.id },
          data: {
            endedAt: new Date(),
            scoreA: typeof scoreA === "number" ? scoreA : 0,
            scoreB: typeof scoreB === "number" ? scoreB : 0,
            winnerTeam: winnerTeamId,
          },
          select: {
            id: true,
            endedAt: true,
            scoreA: true,
            scoreB: true,
            winnerTeam: true,
          },
        });

        await Promise.all([
          activeMatch.teamAId
            ? transaction.teamPlayer.deleteMany({
                where: { teamId: activeMatch.teamAId },
              })
            : Promise.resolve(),
          activeMatch.teamBId
            ? transaction.teamPlayer.deleteMany({
                where: { teamId: activeMatch.teamBId },
              })
            : Promise.resolve(),
        ]);

        return updatedMatch;
      });

      return response.status(200).json({
        success: true,
        court: courtExist,
        match,
      });
    } catch (error: any) {
      console.error(`End court failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "End court failed",
        error_message: error.message,
      });
    }
  };

  static startCourt = async (request: Request, response: Response) => {
    try {
      const { sportId, courtId } = request.params;

      const courtExist = await prisma.court.findFirst({
        where: { id: courtId as string, sportId: sportId as string },
      });

      if (!courtExist)
        return response
          .status(404)
          .json({ success: false, message: "Court not found" });

      const activeMatch = await prisma.match.findFirst({
        where: {
          sportId: sportId as string,
          courtId: courtId as string,
          endedAt: null,
        },
        select: {
          id: true,
          startedAt: true,
          teamAId: true,
          teamBId: true,
          matchPlayers: {
            select: {
              teamId: true,
            },
          },
        },
        orderBy: [{ startedAt: "desc" }, { queuedAt: "desc" }, { id: "desc" }],
      });

      if (!activeMatch)
        return response.status(404).json({
          success: false,
          message: "No active match found for this court",
        });

      if (activeMatch.startedAt)
        return response.status(409).json({
          success: false,
          message: "This court session has already started",
        });

      let teamAPlayerCount = 0;
      let teamBPlayerCount = 0;

      activeMatch.matchPlayers.forEach((matchPlayer) => {
        if (matchPlayer.teamId === activeMatch.teamAId) {
          teamAPlayerCount += 1;
        }

        if (matchPlayer.teamId === activeMatch.teamBId) {
          teamBPlayerCount += 1;
        }
      });

      if (teamAPlayerCount === 0 || teamBPlayerCount === 0)
        return response.status(400).json({
          success: false,
          message:
            "Start requires at least 1 player on Team A and 1 player on Team B",
        });

      const match = await prisma.match.update({
        where: { id: activeMatch.id },
        data: {
          startedAt: new Date(),
        },
        include: {
          teamA: true,
          teamB: true,
          court: true,
          matchPlayers: {
            include: {
              player: true,
              team: true,
            },
          },
        },
      });

      return response.status(200).json({
        success: true,
        court: courtExist,
        match,
      });
    } catch (error: any) {
      console.error(`Start court failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Start court failed",
        error_message: error.message,
      });
    }
  };

  static patchCourt = async (request: Request, response: Response) => {
    try {
      const { sportId, courtId } = request.params;
      const { name } = request.body ?? {};

      if (typeof name !== "string" || name.trim().length === 0)
        return response.status(400).json({
          success: false,
          message: "Name must be a non-empty string",
        });

      const sportExist = await prisma.sport.findFirst({
        where: { id: sportId as string },
      });
      if (!sportExist)
        return response
          .status(404)
          .json({ success: false, message: "Sport not found" });

      const courtExist = await prisma.court.findFirst({
        where: { id: courtId as string, sportId: sportId as string },
      });
      if (!courtExist)
        return response
          .status(404)
          .json({ success: false, message: "Court not found" });

      const court = await prisma.court.update({
        where: { id: courtId as string },
        data: { name: name.trim() },
      });

      return response.status(200).json({ success: true, court });
    } catch (error: any) {
      console.error(`Patch court failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Patch court failed",
        error_message: error.message,
      });
    }
  };

  static patchCourtTeams = async (request: Request, response: Response) => {
    try {
      const { sportId, courtId } = request.params;
      const { name, teamAPlayerIds, teamBPlayerIds } = request.body ?? {};

      const normalizedTeamAPlayerIds = normalizePlayerIds(teamAPlayerIds);
      const normalizedTeamBPlayerIds = normalizePlayerIds(teamBPlayerIds);

      if (
        name !== undefined &&
        (typeof name !== "string" || name.trim().length === 0)
      )
        return response.status(400).json({
          success: false,
          message: "Name must be a non-empty string",
        });

      if (
        normalizedTeamAPlayerIds === "invalid" ||
        normalizedTeamBPlayerIds === "invalid"
      )
        return response.status(400).json({
          success: false,
          message:
            "teamAPlayerIds and teamBPlayerIds must be arrays of player ids",
        });

      const duplicatePlayerId = normalizedTeamAPlayerIds.find((playerId) =>
        normalizedTeamBPlayerIds.includes(playerId),
      );

      if (duplicatePlayerId)
        return response.status(400).json({
          success: false,
          message: "A player cannot appear on both Team A and Team B",
        });

      const [sportExist, courtExist] = await Promise.all([
        prisma.sport.findFirst({
          where: { id: sportId as string },
        }),
        prisma.court.findFirst({
          where: { id: courtId as string, sportId: sportId as string },
        }),
      ]);

      if (!sportExist)
        return response
          .status(404)
          .json({ success: false, message: "Sport not found" });

      if (!courtExist)
        return response
          .status(404)
          .json({ success: false, message: "Court not found" });

      const nextCourtName =
        typeof name === "string" ? name.trim() : courtExist.name;

      const requestedPlayerIds = [
        ...normalizedTeamAPlayerIds,
        ...normalizedTeamBPlayerIds,
      ];

      const players = await prisma.player.findMany({
        where: {
          sportId: sportId as string,
          id: { in: requestedPlayerIds },
        },
        select: {
          id: true,
        },
      });

      if (players.length !== requestedPlayerIds.length)
        return response.status(404).json({
          success: false,
          message: "One or more players were not found for this sport",
        });

      const conflictingMatchPlayer = await prisma.matchPlayer.findFirst({
        where: {
          playerId: { in: requestedPlayerIds },
          match: {
            sportId: sportId as string,
            endedAt: null,
            courtId: { not: courtId as string },
          },
        },
        select: {
          player: {
            select: {
              name: true,
            },
          },
          match: {
            select: {
              court: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (conflictingMatchPlayer)
        return response.status(409).json({
          success: false,
          message: `${conflictingMatchPlayer.player.name} is already assigned to ${conflictingMatchPlayer.match.court?.name ?? "another court"}`,
        });

      const existingMatch = await prisma.match.findFirst({
        where: {
          sportId: sportId as string,
          courtId: courtId as string,
          endedAt: null,
        },
        select: {
          id: true,
          teamAId: true,
          teamBId: true,
          matchPlayers: {
            select: {
              playerId: true,
              teamId: true,
            },
          },
        },
        orderBy: [{ startedAt: "desc" }, { queuedAt: "desc" }, { id: "desc" }],
      });

      const result = await prisma.$transaction(async (transaction) => {
        const updatedCourt =
          nextCourtName !== courtExist.name
            ? await transaction.court.update({
                where: { id: courtId as string },
                data: { name: nextCourtName },
              })
            : courtExist;

        if (!existingMatch) {
          const [teamA, teamB] = await Promise.all([
            transaction.team.create({
              data: { sportId: sportId as string, name: "Team A" },
            }),
            transaction.team.create({
              data: { sportId: sportId as string, name: "Team B" },
            }),
          ]);

          if (normalizedTeamAPlayerIds.length > 0)
            await transaction.teamPlayer.createMany({
              data: normalizedTeamAPlayerIds.map((playerId) => ({
                teamId: teamA.id,
                playerId,
              })),
            });

          if (normalizedTeamBPlayerIds.length > 0)
            await transaction.teamPlayer.createMany({
              data: normalizedTeamBPlayerIds.map((playerId) => ({
                teamId: teamB.id,
                playerId,
              })),
            });

          const match = await transaction.match.create({
            data: {
              sportId: sportId as string,
              courtId: courtId as string,
              teamAId: teamA.id,
              teamBId: teamB.id,
              queuedAt: new Date(),
              matchPlayers: {
                create: [
                  ...normalizedTeamAPlayerIds.map((playerId) => ({
                    playerId,
                    teamId: teamA.id,
                  })),
                  ...normalizedTeamBPlayerIds.map((playerId) => ({
                    playerId,
                    teamId: teamB.id,
                  })),
                ],
              },
            },
            include: {
              teamA: true,
              teamB: true,
              court: true,
              matchPlayers: {
                include: {
                  player: true,
                  team: true,
                },
              },
            },
          });

          return { court: updatedCourt, match };
        }

        const nextTeamAId =
          existingMatch.teamAId ??
          (
            await transaction.team.create({
              data: { sportId: sportId as string, name: "Team A" },
            })
          ).id;
        const nextTeamBId =
          existingMatch.teamBId ??
          (
            await transaction.team.create({
              data: { sportId: sportId as string, name: "Team B" },
            })
          ).id;

        const currentTeamAPlayerIds = getTeamPlayerIds(
          existingMatch.matchPlayers,
          existingMatch.teamAId,
        );
        const currentTeamBPlayerIds = getTeamPlayerIds(
          existingMatch.matchPlayers,
          existingMatch.teamBId,
        );

        const teamAPlayerIdsToAdd = getIdsDifference(
          normalizedTeamAPlayerIds,
          currentTeamAPlayerIds,
        );
        const teamAPlayerIdsToRemove = getIdsDifference(
          currentTeamAPlayerIds,
          normalizedTeamAPlayerIds,
        );
        const teamBPlayerIdsToAdd = getIdsDifference(
          normalizedTeamBPlayerIds,
          currentTeamBPlayerIds,
        );
        const teamBPlayerIdsToRemove = getIdsDifference(
          currentTeamBPlayerIds,
          normalizedTeamBPlayerIds,
        );

        const nextPlayerTeamMap = new Map<string, string>();
        normalizedTeamAPlayerIds.forEach((playerId) => {
          nextPlayerTeamMap.set(playerId, nextTeamAId);
        });
        normalizedTeamBPlayerIds.forEach((playerId) => {
          nextPlayerTeamMap.set(playerId, nextTeamBId);
        });

        const currentMatchPlayerIds = existingMatch.matchPlayers.map(
          (matchPlayer) => matchPlayer.playerId,
        );
        const nextMatchPlayerIds = Array.from(nextPlayerTeamMap.keys());
        const matchPlayerIdsToAdd = getIdsDifference(
          nextMatchPlayerIds,
          currentMatchPlayerIds,
        );
        const matchPlayerIdsToRemove = getIdsDifference(
          currentMatchPlayerIds,
          nextMatchPlayerIds,
        );
        const matchPlayersToMove = existingMatch.matchPlayers.filter(
          (matchPlayer) => {
            const nextTeamId = nextPlayerTeamMap.get(matchPlayer.playerId);
            return !!nextTeamId && nextTeamId !== matchPlayer.teamId;
          },
        );

        await Promise.all([
          teamAPlayerIdsToRemove.length > 0
            ? transaction.teamPlayer.deleteMany({
                where: {
                  teamId: nextTeamAId,
                  playerId: { in: teamAPlayerIdsToRemove },
                },
              })
            : Promise.resolve(),
          teamBPlayerIdsToRemove.length > 0
            ? transaction.teamPlayer.deleteMany({
                where: {
                  teamId: nextTeamBId,
                  playerId: { in: teamBPlayerIdsToRemove },
                },
              })
            : Promise.resolve(),
          matchPlayerIdsToRemove.length > 0
            ? transaction.matchPlayer.deleteMany({
                where: {
                  matchId: existingMatch.id,
                  playerId: { in: matchPlayerIdsToRemove },
                },
              })
            : Promise.resolve(),
        ]);

        await Promise.all([
          teamAPlayerIdsToAdd.length > 0
            ? transaction.teamPlayer.createMany({
                data: teamAPlayerIdsToAdd.map((playerId) => ({
                  teamId: nextTeamAId,
                  playerId,
                })),
              })
            : Promise.resolve(),
          teamBPlayerIdsToAdd.length > 0
            ? transaction.teamPlayer.createMany({
                data: teamBPlayerIdsToAdd.map((playerId) => ({
                  teamId: nextTeamBId,
                  playerId,
                })),
              })
            : Promise.resolve(),
          matchPlayerIdsToAdd.length > 0
            ? transaction.matchPlayer.createMany({
                data: matchPlayerIdsToAdd.map((playerId) => ({
                  matchId: existingMatch.id,
                  playerId,
                  teamId: nextPlayerTeamMap.get(playerId) as string,
                })),
              })
            : Promise.resolve(),
          ...matchPlayersToMove.map((matchPlayer) =>
            transaction.matchPlayer.update({
              where: {
                matchId_playerId: {
                  matchId: existingMatch.id,
                  playerId: matchPlayer.playerId,
                },
              },
              data: {
                teamId: nextPlayerTeamMap.get(matchPlayer.playerId) as string,
              },
            }),
          ),
        ]);

        const match = await transaction.match.update({
          where: { id: existingMatch.id },
          data: {
            teamAId: nextTeamAId,
            teamBId: nextTeamBId,
          },
          include: {
            teamA: true,
            teamB: true,
            court: true,
            matchPlayers: {
              include: {
                player: true,
                team: true,
              },
            },
          },
        });

        return { court: updatedCourt, match };
      });

      return response
        .status(200)
        .json({ success: true, court: result.court, match: result.match });
    } catch (error: any) {
      console.error(`Patch court teams failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Patch court teams failed",
        error_message: error.message,
      });
    }
  };
}

export default CourtController;
