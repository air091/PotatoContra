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
        }),
        prisma.team.findFirst({
          where: { id: teamBId as string, sportId: sportId as string },
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
        },
        include: {
          teamA: true,
          teamB: true,
          court: true,
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
      } = request.body;

      const matchExist = await prisma.match.findUnique({
        where: { id: matchId as string },
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
          }),
          prisma.team.findFirst({
            where: { id: nextTeamBId, sportId: matchExist.sportId },
          }),
        ]);

        if (!teamAExist || !teamBExist)
          return response.status(404).json({
            success: false,
            message: "One or both teams were not found for this sport",
          });
      }

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
        },
      });

      return response.status(200).json({ success: true, match });
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
