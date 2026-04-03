import { Request, Response } from "express";
import prisma from "../lib/prisma";

const parseOptionalDate = (value: unknown) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value !== "string") return "invalid";

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? "invalid" : parsedDate;
};

const deriveWinnerTeam = (
  scoreA: number,
  scoreB: number,
  teamAId: string,
  teamBId: string,
  endedAt?: Date | null,
) => {
  if (!endedAt) return null;
  if (scoreA === scoreB) return null;
  return scoreA > scoreB ? teamAId : teamBId;
};

const normalizePlayerIds = (value: unknown) => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return "invalid";

  const normalizedIds = value
    .filter((playerId): playerId is string => typeof playerId === "string")
    .map((playerId) => playerId.trim())
    .filter((playerId) => playerId.length > 0);

  if (normalizedIds.length !== value.length) return "invalid";

  return [...new Set(normalizedIds)];
};

class MatchController {
  static getMatches = async (request: Request, response: Response) => {
    try {
      const { sportId } = request.params;

      const sportExist = await prisma.sport.findUnique({
        where: { id: sportId as string },
      });

      if (!sportExist)
        return response
          .status(404)
          .json({ success: false, message: "Sport not found" });

      const matches = await prisma.match.findMany({
        where: { sportId: sportId as string },
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
      });

      return response.status(200).json({ success: true, matches });
    } catch (error: any) {
      console.error(`Get matches failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Get matches failed",
        error_message: error.message,
      });
    }
  };

  static postMatch = async (request: Request, response: Response) => {
    try {
      const { sportId } = request.params;
      const {
        teamAId,
        teamBId,
        courtId,
        queuedAt,
        startedAt,
        endedAt,
        scoreA,
        scoreB,
        winnerTeam,
        teamAPlayerIds,
        teamBPlayerIds,
      } = request.body;

      const sportExist = await prisma.sport.findUnique({
        where: { id: sportId as string },
      });

      if (!sportExist)
        return response
          .status(404)
          .json({ success: false, message: "Sport not found" });

      if (!teamAId || !teamBId)
        return response.status(400).json({
          success: false,
          message: "teamAId and teamBId are required",
        });

      if (teamAId === teamBId)
        return response.status(400).json({
          success: false,
          message: "teamAId and teamBId must be different",
        });

      const [teamAExist, teamBExist] = await Promise.all([
        prisma.team.findFirst({
          where: { id: teamAId as string, sportId: sportId as string },
          include: { teamPlayers: true },
        }),
        prisma.team.findFirst({
          where: { id: teamBId as string, sportId: sportId as string },
          include: { teamPlayers: true },
        }),
      ]);

      if (!teamAExist || !teamBExist)
        return response.status(404).json({
          success: false,
          message: "One or both teams were not found for this sport",
        });

      if (courtId !== undefined && courtId !== null && courtId !== "") {
        const courtExist = await prisma.court.findFirst({
          where: {
            id: courtId as string,
            sportId: sportId as string,
            isActive: true,
          },
        });

        if (!courtExist)
          return response.status(404).json({
            success: false,
            message: "Court not found or inactive",
          });
      }

      const parsedQueuedAt = parseOptionalDate(queuedAt);
      const parsedStartedAt = parseOptionalDate(startedAt);
      const parsedEndedAt = parseOptionalDate(endedAt);
      const normalizedTeamAPlayerIds = normalizePlayerIds(teamAPlayerIds);
      const normalizedTeamBPlayerIds = normalizePlayerIds(teamBPlayerIds);

      if (
        parsedQueuedAt === "invalid" ||
        parsedStartedAt === "invalid" ||
        parsedEndedAt === "invalid"
      )
        return response.status(400).json({
          success: false,
          message: "queuedAt, startedAt and endedAt must be valid ISO dates",
        });

      if (
        normalizedTeamAPlayerIds === "invalid" ||
        normalizedTeamBPlayerIds === "invalid"
      )
        return response.status(400).json({
          success: false,
          message: "teamAPlayerIds and teamBPlayerIds must be arrays of player ids",
        });

      if (
        scoreA !== undefined &&
        (!Number.isInteger(scoreA) || Number(scoreA) < 0)
      )
        return response.status(400).json({
          success: false,
          message: "scoreA must be a non-negative integer",
        });

      if (
        scoreB !== undefined &&
        (!Number.isInteger(scoreB) || Number(scoreB) < 0)
      )
        return response.status(400).json({
          success: false,
          message: "scoreB must be a non-negative integer",
        });

      if (
        winnerTeam !== undefined &&
        winnerTeam !== null &&
        winnerTeam !== "" &&
        winnerTeam !== teamAId &&
        winnerTeam !== teamBId
      )
        return response.status(400).json({
          success: false,
          message: "winnerTeam must match teamAId or teamBId",
        });

      const nextScoreA = scoreA ?? 0;
      const nextScoreB = scoreB ?? 0;
      const computedWinnerTeam = deriveWinnerTeam(
        nextScoreA,
        nextScoreB,
        teamAId as string,
        teamBId as string,
        (parsedEndedAt ?? null) as Date | null,
      );

      if (
        winnerTeam !== undefined &&
        (winnerTeam || null) !== computedWinnerTeam
      )
        return response.status(400).json({
          success: false,
          message: "winnerTeam must match the computed result from scoreA and scoreB",
        });

      const teamAPlayerIdsToUse =
        normalizedTeamAPlayerIds ??
        teamAExist.teamPlayers.map((teamPlayer) => teamPlayer.playerId);
      const teamBPlayerIdsToUse =
        normalizedTeamBPlayerIds ??
        teamBExist.teamPlayers.map((teamPlayer) => teamPlayer.playerId);

      const teamAPlayerSet = new Set(
        teamAExist.teamPlayers.map((teamPlayer) => teamPlayer.playerId),
      );
      const teamBPlayerSet = new Set(
        teamBExist.teamPlayers.map((teamPlayer) => teamPlayer.playerId),
      );

      const invalidTeamAPlayer = teamAPlayerIdsToUse.find(
        (playerId) => !teamAPlayerSet.has(playerId),
      );
      if (invalidTeamAPlayer)
        return response.status(400).json({
          success: false,
          message: "All teamAPlayerIds must belong to teamA",
        });

      const invalidTeamBPlayer = teamBPlayerIdsToUse.find(
        (playerId) => !teamBPlayerSet.has(playerId),
      );
      if (invalidTeamBPlayer)
        return response.status(400).json({
          success: false,
          message: "All teamBPlayerIds must belong to teamB",
        });

      const duplicateParticipant = teamAPlayerIdsToUse.find((playerId) =>
        teamBPlayerIdsToUse.includes(playerId),
      );
      if (duplicateParticipant)
        return response.status(400).json({
          success: false,
          message: "A player cannot appear on both sides of the same match",
        });

      const match = await prisma.match.create({
        data: {
          sportId: sportId as string,
          teamAId: teamAId as string,
          teamBId: teamBId as string,
          courtId: courtId ? (courtId as string) : null,
          queuedAt: parsedQueuedAt as Date | null | undefined,
          startedAt: parsedStartedAt as Date | null | undefined,
          endedAt: parsedEndedAt as Date | null | undefined,
          scoreA: nextScoreA,
          scoreB: nextScoreB,
          winnerTeam: computedWinnerTeam,
          matchPlayers: {
            create: [
              ...teamAPlayerIdsToUse.map((playerId) => ({
                playerId,
                teamId: teamAId as string,
              })),
              ...teamBPlayerIdsToUse.map((playerId) => ({
                playerId,
                teamId: teamBId as string,
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

      return response.status(201).json({ success: true, match });
    } catch (error: any) {
      console.error(`Post match failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Post match failed",
        error_message: error.message,
      });
    }
  };

  static saveQueue = async (request: Request, response: Response) => {
    try {
      const { sportId } = request.params;
      const { matchId, queuedAt, teamAPlayerIds, teamBPlayerIds } =
        request.body ?? {};

      const normalizedTeamAPlayerIds = normalizePlayerIds(teamAPlayerIds);
      const normalizedTeamBPlayerIds = normalizePlayerIds(teamBPlayerIds);

      if (
        normalizedTeamAPlayerIds === "invalid" ||
        normalizedTeamBPlayerIds === "invalid"
      )
        return response.status(400).json({
          success: false,
          message:
            "teamAPlayerIds and teamBPlayerIds must be arrays of player ids",
        });

      if (
        normalizedTeamAPlayerIds.length === 0 ||
        normalizedTeamBPlayerIds.length === 0
      )
        return response.status(400).json({
          success: false,
          message: "Both teams need at least 1 player",
        });

      const duplicateParticipant = normalizedTeamAPlayerIds.find((playerId) =>
        normalizedTeamBPlayerIds.includes(playerId),
      );

      if (duplicateParticipant)
        return response.status(400).json({
          success: false,
          message: "A player cannot appear on both sides of the same queue",
        });

      const requestedPlayerIds = [
        ...normalizedTeamAPlayerIds,
        ...normalizedTeamBPlayerIds,
      ];
      const parsedQueuedAt = parseOptionalDate(queuedAt);

      if (parsedQueuedAt === "invalid")
        return response.status(400).json({
          success: false,
          message: "queuedAt must be a valid ISO date",
        });

      const [players, existingQueueMatch, conflictingMatchPlayer] =
        await Promise.all([
          prisma.player.findMany({
            where: {
              sportId: sportId as string,
              id: { in: requestedPlayerIds },
            },
            select: {
              id: true,
              name: true,
            },
          }),
          typeof matchId === "string" && matchId.trim().length > 0
            ? prisma.match.findFirst({
                where: {
                  id: matchId,
                  sportId: sportId as string,
                },
                select: {
                  id: true,
                  teamAId: true,
                  teamBId: true,
                  queuedAt: true,
                },
              })
            : Promise.resolve(null),
          prisma.matchPlayer.findFirst({
            where: {
              playerId: { in: requestedPlayerIds },
              match: {
                sportId: sportId as string,
                endedAt: null,
                courtId: { not: null },
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
          }),
        ]);

      if (players.length !== requestedPlayerIds.length)
        return response.status(404).json({
          success: false,
          message: "One or more players were not found for this sport",
        });

      if (matchId && !existingQueueMatch)
        return response.status(404).json({
          success: false,
          message: "Queue match not found",
        });

      if (conflictingMatchPlayer)
        return response.status(409).json({
          success: false,
          message: `${conflictingMatchPlayer.player.name} is already assigned to ${conflictingMatchPlayer.match.court?.name ?? "another court"}`,
        });

      const nextQueuedAt = (parsedQueuedAt ?? new Date()) as Date;

      const match = await prisma.$transaction(async (transaction) => {
        if (existingQueueMatch) {
          const nextTeamAId =
            existingQueueMatch.teamAId ??
            (
              await transaction.team.create({
                data: {
                  sportId: sportId as string,
                  name: "Team A",
                },
              })
            ).id;
          const nextTeamBId =
            existingQueueMatch.teamBId ??
            (
              await transaction.team.create({
                data: {
                  sportId: sportId as string,
                  name: "Team B",
                },
              })
            ).id;

          await Promise.all([
            transaction.matchPlayer.deleteMany({
              where: { matchId: existingQueueMatch.id },
            }),
            transaction.teamPlayer.deleteMany({
              where: { teamId: nextTeamAId },
            }),
            transaction.teamPlayer.deleteMany({
              where: { teamId: nextTeamBId },
            }),
          ]);

          await Promise.all([
            transaction.teamPlayer.createMany({
              data: normalizedTeamAPlayerIds.map((playerId) => ({
                teamId: nextTeamAId,
                playerId,
              })),
            }),
            transaction.teamPlayer.createMany({
              data: normalizedTeamBPlayerIds.map((playerId) => ({
                teamId: nextTeamBId,
                playerId,
              })),
            }),
            transaction.matchPlayer.createMany({
              data: [
                ...normalizedTeamAPlayerIds.map((playerId) => ({
                  matchId: existingQueueMatch.id,
                  playerId,
                  teamId: nextTeamAId,
                })),
                ...normalizedTeamBPlayerIds.map((playerId) => ({
                  matchId: existingQueueMatch.id,
                  playerId,
                  teamId: nextTeamBId,
                })),
              ],
            }),
          ]);

          return transaction.match.update({
            where: { id: existingQueueMatch.id },
            data: {
              teamAId: nextTeamAId,
              teamBId: nextTeamBId,
              queuedAt: nextQueuedAt,
            },
            select: {
              id: true,
              teamAId: true,
              teamBId: true,
              queuedAt: true,
            },
          });
        }

        const [teamA, teamB] = await Promise.all([
          transaction.team.create({
            data: {
              sportId: sportId as string,
              name: "Team A",
            },
          }),
          transaction.team.create({
            data: {
              sportId: sportId as string,
              name: "Team B",
            },
          }),
        ]);

        await Promise.all([
          transaction.teamPlayer.createMany({
            data: normalizedTeamAPlayerIds.map((playerId) => ({
              teamId: teamA.id,
              playerId,
            })),
          }),
          transaction.teamPlayer.createMany({
            data: normalizedTeamBPlayerIds.map((playerId) => ({
              teamId: teamB.id,
              playerId,
            })),
          }),
        ]);

        return transaction.match.create({
          data: {
            sportId: sportId as string,
            teamAId: teamA.id,
            teamBId: teamB.id,
            queuedAt: nextQueuedAt,
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
          select: {
            id: true,
            teamAId: true,
            teamBId: true,
            queuedAt: true,
          },
        });
      });

      return response.status(existingQueueMatch ? 200 : 201).json({
        success: true,
        match,
      });
    } catch (error: any) {
      console.error(`Save queue failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Save queue failed",
        error_message: error.message,
      });
    }
  };

  static patchMatch = async (request: Request, response: Response) => {
    try {
      const { matchId } = request.params;
      const {
        teamAId,
        teamBId,
        courtId,
        queuedAt,
        startedAt,
        endedAt,
        scoreA,
        scoreB,
        winnerTeam,
        teamAPlayerIds,
        teamBPlayerIds,
      } = request.body;

      const isScoreOnlyUpdate =
        scoreA !== undefined &&
        teamAId === undefined &&
        teamBId === undefined &&
        courtId === undefined &&
        queuedAt === undefined &&
        startedAt === undefined &&
        endedAt === undefined &&
        winnerTeam === undefined &&
        teamAPlayerIds === undefined &&
        teamBPlayerIds === undefined;
      const isScoreBOnlyUpdate =
        scoreB !== undefined &&
        teamAId === undefined &&
        teamBId === undefined &&
        courtId === undefined &&
        queuedAt === undefined &&
        startedAt === undefined &&
        endedAt === undefined &&
        winnerTeam === undefined &&
        teamAPlayerIds === undefined &&
        teamBPlayerIds === undefined;

      if (isScoreOnlyUpdate || isScoreBOnlyUpdate) {
        if (
          scoreA !== undefined &&
          (!Number.isInteger(scoreA) || Number(scoreA) < 0)
        )
          return response.status(400).json({
            success: false,
            message: "scoreA must be a non-negative integer",
          });

        if (
          scoreB !== undefined &&
          (!Number.isInteger(scoreB) || Number(scoreB) < 0)
        )
          return response.status(400).json({
            success: false,
            message: "scoreB must be a non-negative integer",
          });

        const matchExist = await prisma.match.findUnique({
          where: { id: matchId as string },
          select: {
            id: true,
            scoreA: true,
            scoreB: true,
            endedAt: true,
            teamAId: true,
            teamBId: true,
          },
        });

        if (!matchExist)
          return response
            .status(404)
            .json({ success: false, message: "Match not found" });

        const nextScoreA = scoreA ?? matchExist.scoreA;
        const nextScoreB = scoreB ?? matchExist.scoreB;
        const nextWinnerTeam =
          matchExist.teamAId && matchExist.teamBId
            ? deriveWinnerTeam(
                nextScoreA,
                nextScoreB,
                matchExist.teamAId,
                matchExist.teamBId,
                matchExist.endedAt,
              )
            : null;

        const match = await prisma.match.update({
          where: { id: matchId as string },
          data: {
            ...(scoreA !== undefined ? { scoreA } : {}),
            ...(scoreB !== undefined ? { scoreB } : {}),
            winnerTeam: nextWinnerTeam,
          },
          select: {
            id: true,
            scoreA: true,
            scoreB: true,
            winnerTeam: true,
          },
        });

        return response.status(200).json({ success: true, match });
      }

      const matchExist = await prisma.match.findUnique({
        where: { id: matchId as string },
        include: {
          teamA: { include: { teamPlayers: true } },
          teamB: { include: { teamPlayers: true } },
          matchPlayers: true,
        },
      });

      if (!matchExist)
        return response
          .status(404)
          .json({ success: false, message: "Match not found" });

      const nextTeamAId = (teamAId ?? matchExist.teamAId) as string;
      const nextTeamBId = (teamBId ?? matchExist.teamBId) as string;

      if (nextTeamAId === nextTeamBId)
        return response.status(400).json({
          success: false,
          message: "teamAId and teamBId must be different",
        });

      if (teamAId !== undefined || teamBId !== undefined) {
        const [teamAExist, teamBExist] = await Promise.all([
          prisma.team.findFirst({
            where: { id: nextTeamAId, sportId: matchExist.sportId },
            include: { teamPlayers: true },
          }),
          prisma.team.findFirst({
            where: { id: nextTeamBId, sportId: matchExist.sportId },
            include: { teamPlayers: true },
          }),
        ]);

        if (!teamAExist || !teamBExist)
          return response.status(404).json({
            success: false,
            message: "One or both teams were not found for this sport",
          });
      }

      const nextTeamA =
        teamAId !== undefined
          ? await prisma.team.findFirst({
              where: { id: nextTeamAId, sportId: matchExist.sportId },
              include: { teamPlayers: true },
            })
          : matchExist.teamA;
      const nextTeamB =
        teamBId !== undefined
          ? await prisma.team.findFirst({
              where: { id: nextTeamBId, sportId: matchExist.sportId },
              include: { teamPlayers: true },
            })
          : matchExist.teamB;

      if (courtId !== undefined && courtId !== null && courtId !== "") {
        const courtExist = await prisma.court.findFirst({
          where: {
            id: courtId as string,
            sportId: matchExist.sportId,
            isActive: true,
          },
        });

        if (!courtExist)
          return response.status(404).json({
            success: false,
            message: "Court not found or inactive",
          });
      }

      const parsedQueuedAt = parseOptionalDate(queuedAt);
      const parsedStartedAt = parseOptionalDate(startedAt);
      const parsedEndedAt = parseOptionalDate(endedAt);
      const normalizedTeamAPlayerIds = normalizePlayerIds(teamAPlayerIds);
      const normalizedTeamBPlayerIds = normalizePlayerIds(teamBPlayerIds);

      if (
        parsedQueuedAt === "invalid" ||
        parsedStartedAt === "invalid" ||
        parsedEndedAt === "invalid"
      )
        return response.status(400).json({
          success: false,
          message: "queuedAt, startedAt and endedAt must be valid ISO dates",
        });

      if (
        normalizedTeamAPlayerIds === "invalid" ||
        normalizedTeamBPlayerIds === "invalid"
      )
        return response.status(400).json({
          success: false,
          message: "teamAPlayerIds and teamBPlayerIds must be arrays of player ids",
        });

      if (
        scoreA !== undefined &&
        (!Number.isInteger(scoreA) || Number(scoreA) < 0)
      )
        return response.status(400).json({
          success: false,
          message: "scoreA must be a non-negative integer",
        });

      if (
        scoreB !== undefined &&
        (!Number.isInteger(scoreB) || Number(scoreB) < 0)
      )
        return response.status(400).json({
          success: false,
          message: "scoreB must be a non-negative integer",
        });

      const nextScoreA = scoreA ?? matchExist.scoreA;
      const nextScoreB = scoreB ?? matchExist.scoreB;
      const computedWinnerTeam = deriveWinnerTeam(
        nextScoreA,
        nextScoreB,
        nextTeamAId,
        nextTeamBId,
        endedAt === undefined
          ? matchExist.endedAt
          : ((parsedEndedAt ?? null) as Date | null),
      );
      const nextWinnerTeam =
        winnerTeam === undefined ? computedWinnerTeam : winnerTeam;

      if (
        winnerTeam !== undefined &&
        (winnerTeam || null) !== computedWinnerTeam
      )
        return response.status(400).json({
          success: false,
          message: "winnerTeam must match the computed result from scoreA and scoreB",
        });

      if (
        nextWinnerTeam !== null &&
        nextWinnerTeam !== "" &&
        nextWinnerTeam !== nextTeamAId &&
        nextWinnerTeam !== nextTeamBId
      )
        return response.status(400).json({
          success: false,
          message: "winnerTeam must match teamAId or teamBId",
        });

      const currentTeamAPlayerIds = matchExist.matchPlayers
        .filter((matchPlayer) => matchPlayer.teamId === nextTeamAId)
        .map((matchPlayer) => matchPlayer.playerId);
      const currentTeamBPlayerIds = matchExist.matchPlayers
        .filter((matchPlayer) => matchPlayer.teamId === nextTeamBId)
        .map((matchPlayer) => matchPlayer.playerId);

      const teamAPlayerIdsToUse =
        normalizedTeamAPlayerIds ??
        (teamAId !== undefined
          ? nextTeamA?.teamPlayers.map((teamPlayer) => teamPlayer.playerId) ?? []
          : currentTeamAPlayerIds);
      const teamBPlayerIdsToUse =
        normalizedTeamBPlayerIds ??
        (teamBId !== undefined
          ? nextTeamB?.teamPlayers.map((teamPlayer) => teamPlayer.playerId) ?? []
          : currentTeamBPlayerIds);

      const nextTeamAPlayerSet = new Set(
        (nextTeamA?.teamPlayers ?? []).map((teamPlayer) => teamPlayer.playerId),
      );
      const nextTeamBPlayerSet = new Set(
        (nextTeamB?.teamPlayers ?? []).map((teamPlayer) => teamPlayer.playerId),
      );

      const invalidTeamAPlayer = teamAPlayerIdsToUse.find(
        (playerId) => !nextTeamAPlayerSet.has(playerId),
      );
      if (invalidTeamAPlayer)
        return response.status(400).json({
          success: false,
          message: "All teamAPlayerIds must belong to teamA",
        });

      const invalidTeamBPlayer = teamBPlayerIdsToUse.find(
        (playerId) => !nextTeamBPlayerSet.has(playerId),
      );
      if (invalidTeamBPlayer)
        return response.status(400).json({
          success: false,
          message: "All teamBPlayerIds must belong to teamB",
        });

      const duplicateParticipant = teamAPlayerIdsToUse.find((playerId) =>
        teamBPlayerIdsToUse.includes(playerId),
      );
      if (duplicateParticipant)
        return response.status(400).json({
          success: false,
          message: "A player cannot appear on both sides of the same match",
        });

      const updatedData: {
        teamAId?: string;
        teamBId?: string;
        courtId?: string | null;
        queuedAt?: Date | null;
        startedAt?: Date | null;
        endedAt?: Date | null;
        scoreA?: number;
        scoreB?: number;
        winnerTeam?: string | null;
      } = {};

      if (teamAId !== undefined) updatedData.teamAId = teamAId as string;
      if (teamBId !== undefined) updatedData.teamBId = teamBId as string;
      if (courtId !== undefined)
        updatedData.courtId = courtId ? (courtId as string) : null;
      if (queuedAt !== undefined) updatedData.queuedAt = parsedQueuedAt as Date | null;
      if (startedAt !== undefined)
        updatedData.startedAt = parsedStartedAt as Date | null;
      if (endedAt !== undefined) updatedData.endedAt = parsedEndedAt as Date | null;
      if (scoreA !== undefined) updatedData.scoreA = scoreA;
      if (scoreB !== undefined) updatedData.scoreB = scoreB;

      if (
        scoreA !== undefined ||
        scoreB !== undefined ||
        teamAId !== undefined ||
        teamBId !== undefined ||
        winnerTeam !== undefined ||
        endedAt !== undefined
      ) {
        updatedData.winnerTeam = computedWinnerTeam;
      }

      if (Object.keys(updatedData).length === 0)
        return response.status(400).json({
          success: false,
          message: "No valid fields to update",
        });

      const match = await prisma.match.update({
        where: { id: matchId as string },
        data: updatedData,
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

      const shouldReplaceParticipants =
        teamAPlayerIds !== undefined ||
        teamBPlayerIds !== undefined ||
        teamAId !== undefined ||
        teamBId !== undefined;

      if (shouldReplaceParticipants) {
        await prisma.matchPlayer.deleteMany({
          where: { matchId: matchId as string },
        });

        await prisma.matchPlayer.createMany({
          data: [
            ...teamAPlayerIdsToUse.map((playerId) => ({
              matchId: matchId as string,
              playerId,
              teamId: nextTeamAId,
            })),
            ...teamBPlayerIdsToUse.map((playerId) => ({
              matchId: matchId as string,
              playerId,
              teamId: nextTeamBId,
            })),
          ],
        });
      }

      const updatedMatch = await prisma.match.findUnique({
        where: { id: matchId as string },
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

      return response.status(200).json({ success: true, match: updatedMatch ?? match });
    } catch (error: any) {
      console.error(`Patch match failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Patch match failed",
        error_message: error.message,
      });
    }
  };

  static deleteMatch = async (request: Request, response: Response) => {
    try {
      const { matchId } = request.params;

      const matchExist = await prisma.match.findUnique({
        where: { id: matchId as string },
      });

      if (!matchExist)
        return response
          .status(404)
          .json({ success: false, message: "Match not found" });

      await prisma.match.delete({
        where: { id: matchId as string },
      });

      return response.status(204).json({});
    } catch (error: any) {
      console.error(`Delete match failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Delete match failed",
        error_message: error.message,
      });
    }
  };
}

export default MatchController;
