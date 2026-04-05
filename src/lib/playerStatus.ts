import prisma from "./prisma";

export const PLAYER_STATUS = {
  waiting: "waiting",
  queued: "queued",
  playing: "playing",
} as const;

type PlayerStatusValue = (typeof PLAYER_STATUS)[keyof typeof PLAYER_STATUS];

type PlayerWithId = {
  id: string;
};

export const getPlayerStatusMap = async (sportId: string) => {
  const activeMatchPlayers = await prisma.matchPlayer.findMany({
    where: {
      player: { sportId },
      match: {
        sportId,
        endedAt: null,
      },
    },
    select: {
      playerId: true,
      match: {
        select: {
          startedAt: true,
        },
      },
    },
  });

  const playerStatusMap = new Map<string, PlayerStatusValue>();

  activeMatchPlayers.forEach(({ playerId, match }) => {
    if (match.startedAt) {
      playerStatusMap.set(playerId, PLAYER_STATUS.playing);
      return;
    }

    if (!playerStatusMap.has(playerId)) {
      playerStatusMap.set(playerId, PLAYER_STATUS.queued);
    }
  });

  return playerStatusMap;
};

export const attachPlayerStatuses = async <T extends PlayerWithId>(
  sportId: string,
  players: T[],
) => {
  const playerStatusMap = await getPlayerStatusMap(sportId);

  return players.map((player) => ({
    ...player,
    playerStatus: playerStatusMap.get(player.id) ?? PLAYER_STATUS.waiting,
  }));
};
