import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import AddPlayerModal from "../components/home_components/AddPlayerModal";
import PlayersPanel from "../components/home_components/PlayersPanel";
import CourtsPanel from "../components/home_components/CourtsPanel";

const getTeamPlayerIds = (currentMatch, teamId) =>
  currentMatch?.matchPlayers
    ?.filter((matchPlayer) => matchPlayer.teamId === teamId)
    .map((matchPlayer) => matchPlayer.playerId) ?? [];

const getAssignedPlayerCourtMap = (courts, excludedCourtId = null) => {
  const assignedPlayerCourtMap = new Map();

  courts.forEach((court) => {
    if (court.id === excludedCourtId || !court.currentMatch) return;

    court.currentMatch.matchPlayers?.forEach((matchPlayer) => {
      assignedPlayerCourtMap.set(matchPlayer.playerId, court.name);
    });
  });

  return assignedPlayerCourtMap;
};

const createQueue = (selectedCourtId = null) => ({
  id: `queue-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  matchId: null,
  teamAId: null,
  teamBId: null,
  teamAPlayerIds: [],
  teamBPlayerIds: [],
  queuedAt: null,
  selectedCourtId,
  isSubmitting: false,
  error: "",
});

const mapMatchToQueue = (match, availableCourts) => ({
  id: `match-${match.id}`,
  matchId: match.id,
  teamAId: match.teamAId,
  teamBId: match.teamBId,
  teamAPlayerIds:
    match.matchPlayers
      ?.filter((matchPlayer) => matchPlayer.teamId === match.teamAId)
      .map((matchPlayer) => matchPlayer.playerId) ?? [],
  teamBPlayerIds:
    match.matchPlayers
      ?.filter((matchPlayer) => matchPlayer.teamId === match.teamBId)
      .map((matchPlayer) => matchPlayer.playerId) ?? [],
  queuedAt: match.queuedAt ?? new Date().toISOString(),
  selectedCourtId:
    availableCourts.length > 0 ? String(availableCourts[0].id) : null,
  isSubmitting: false,
  error: "",
});

const Home = () => {
  const { sports, isLoading, error, selectedSport } = useOutletContext();
  const [players, setPlayers] = useState([]);
  const [courts, setCourts] = useState([]);
  const [isPlayersLoading, setIsPlayersLoading] = useState(false);
  const [isCourtsLoading, setIsCourtsLoading] = useState(false);
  const [playersError, setPlayersError] = useState("");
  const [courtsError, setCourtsError] = useState("");
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCourtSubmitting, setIsCourtSubmitting] = useState(false);
  const [isUpdatingCourt, setIsUpdatingCourt] = useState(false);
  const [deletingCourtId, setDeletingCourtId] = useState(null);
  const [startingCourtId, setStartingCourtId] = useState(null);
  const [resettingCourtId, setResettingCourtId] = useState(null);
  const [endingCourtId, setEndingCourtId] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [activePlayerMenuId, setActivePlayerMenuId] = useState(null);
  const [activeCourtMenuId, setActiveCourtMenuId] = useState(null);
  const [editCourtName, setEditCourtName] = useState("");
  const [editCourtTeamAPlayerIds, setEditCourtTeamAPlayerIds] = useState([]);
  const [editCourtTeamBPlayerIds, setEditCourtTeamBPlayerIds] = useState([]);
  const [editPlayerName, setEditPlayerName] = useState("");
  const [editSkillLevel, setEditSkillLevel] = useState("beginner");
  const [editPaymentStatus, setEditPaymentStatus] = useState(false);
  const [isUpdatingPlayer, setIsUpdatingPlayer] = useState(false);
  const [deletingPlayerId, setDeletingPlayerId] = useState(null);
  const [editPlayerError, setEditPlayerError] = useState("");
  const [editCourtError, setEditCourtError] = useState("");
  const [playerMatchCounts, setPlayerMatchCounts] = useState({});
  const [queues, setQueues] = useState([]);
  const unavailablePlayerCourtMap = getAssignedPlayerCourtMap(
    courts,
    activeCourtMenuId,
  );
  const availableCourts = courts.filter(
    (court) => !court.currentMatch || court.currentMatch.endedAt,
  );

  const getPlayersMatchCountAPI = async (sportId) => {
    try {
      const response = await fetch(
        `/api/players/matches-stats/${sportId}`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error("Failed to fetch player match counts");
        return;
      }

      const countMap = {};
      data.playerMatchCounts.forEach((item) => {
        countMap[item.id] = item.matchesPlayed;
      });
      setPlayerMatchCounts(countMap);
    } catch (fetchError) {
      console.error("Player match count API failed", fetchError);
    }
  };

  useEffect(() => {
    if (!selectedSport) {
      setPlayers([]);
      setCourts([]);
      setQueues([]);
      setPlayerMatchCounts({});
      setPlayersError("");
      setCourtsError("");
      return;
    }

    const abortController = new AbortController();

    const getDashboardAPI = async () => {
      try {
        setIsPlayersLoading(true);
        setIsCourtsLoading(true);
        setPlayersError("");
        setCourtsError("");

        const response = await fetch(
          `/api/sports/${selectedSport.id}/dashboard`,
          {
            method: "GET",
            credentials: "include",
            signal: abortController.signal,
          },
        );
        const data = await response.json();

        if (response.status === 404) {
          setPlayers([]);
          setCourts([]);
          setQueues([]);
          setPlayerMatchCounts({});
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(data?.message ?? "Dashboard API failed");
        }

        const nextPlayers = data.players ?? [];
        const nextCourts = data.courts ?? [];
        const nextAvailableCourts = nextCourts.filter(
          (court) => !court.currentMatch || court.currentMatch.endedAt,
        );
        const nextPlayerMatchCounts = {};

        (data.playerMatchCounts ?? []).forEach((item) => {
          nextPlayerMatchCounts[item.id] = item.matchesPlayed;
        });

        setPlayers(nextPlayers);
        setCourts(nextCourts);
        setPlayerMatchCounts(nextPlayerMatchCounts);
        setQueues(
          (data.queuedMatches ?? []).map((match) =>
            mapMatchToQueue(match, nextAvailableCourts),
          ),
        );
      } catch (fetchError) {
        if (fetchError.name === "AbortError") return;

        console.error("Dashboard API failed", fetchError);
        setPlayers([]);
        setCourts([]);
        setQueues([]);
        setPlayerMatchCounts({});
        setPlayersError("Unable to load players.");
        setCourtsError("Unable to load courts.");
      } finally {
        setIsPlayersLoading(false);
        setIsCourtsLoading(false);
      }
    };

    setIsAddPlayerOpen(false);
    setPlayerName("");
    setSubmitError("");
    setActivePlayerMenuId(null);
    setActiveCourtMenuId(null);
    setEditCourtName("");
    setEditCourtTeamAPlayerIds([]);
    setEditCourtTeamBPlayerIds([]);
    setEditPlayerName("");
    setEditSkillLevel("beginner");
    setEditPaymentStatus(false);
    setDeletingPlayerId(null);
    setDeletingCourtId(null);
    setStartingCourtId(null);
    setResettingCourtId(null);
    setEndingCourtId(null);
    setQueues([]);
    setEditPlayerError("");
    setEditCourtError("");
    getDashboardAPI();

    return () => {
      abortController.abort();
    };
  }, [selectedSport]);

  useEffect(() => {
    setQueues((currentQueues) => {
      let hasChanges = false;

      const nextQueues = currentQueues.map((queue) => {
        const nextSelectedCourtId =
          availableCourts.length === 0
            ? null
            : availableCourts.some(
                  (court) => String(court.id) === queue.selectedCourtId,
                )
              ? queue.selectedCourtId
              : String(availableCourts[0].id);

        if (nextSelectedCourtId === queue.selectedCourtId) {
          return queue;
        }

        hasChanges = true;

        return {
          ...queue,
          selectedCourtId: nextSelectedCourtId,
        };
      });

      return hasChanges ? nextQueues : currentQueues;
    });
  }, [courts]);

  const closeAddPlayerModal = () => {
    if (isSubmitting) return;

    setIsAddPlayerOpen(false);
    setPlayerName("");
    setSubmitError("");
  };

  const openPlayerMenu = (player) => {
    setActivePlayerMenuId((currentMenuId) =>
      currentMenuId === player.id ? null : player.id,
    );
    setEditPlayerName(player.name);
    setEditSkillLevel(player.skillLevel);
    setEditPaymentStatus(player.paymentStatus);
    setEditPlayerError("");
  };

  const openCourtMenu = (court) => {
    const currentMatch = court.currentMatch;
    const teamAPlayerIds = getTeamPlayerIds(
      currentMatch,
      currentMatch?.teamAId,
    );
    const teamBPlayerIds = getTeamPlayerIds(
      currentMatch,
      currentMatch?.teamBId,
    );

    setActiveCourtMenuId((currentMenuId) =>
      currentMenuId === court.id ? null : court.id,
    );
    setEditCourtName(court.name);
    setEditCourtTeamAPlayerIds(teamAPlayerIds);
    setEditCourtTeamBPlayerIds(teamBPlayerIds);
    setEditCourtError("");
  };

  const toggleCourtPlayer = (teamKey, playerId) => {
    const assignedCourtName = unavailablePlayerCourtMap.get(playerId);

    if (assignedCourtName) {
      setEditCourtError(
        `This player is already assigned to ${assignedCourtName}.`,
      );
      return;
    }

    setEditCourtError("");

    if (teamKey === "A") {
      setEditCourtTeamAPlayerIds((currentPlayerIds) =>
        currentPlayerIds.includes(playerId)
          ? currentPlayerIds.filter(
              (currentPlayerId) => currentPlayerId !== playerId,
            )
          : [...currentPlayerIds, playerId],
      );
      setEditCourtTeamBPlayerIds((currentPlayerIds) =>
        currentPlayerIds.filter(
          (currentPlayerId) => currentPlayerId !== playerId,
        ),
      );
      return;
    }

    setEditCourtTeamBPlayerIds((currentPlayerIds) =>
      currentPlayerIds.includes(playerId)
        ? currentPlayerIds.filter(
            (currentPlayerId) => currentPlayerId !== playerId,
          )
        : [...currentPlayerIds, playerId],
    );
    setEditCourtTeamAPlayerIds((currentPlayerIds) =>
      currentPlayerIds.filter(
        (currentPlayerId) => currentPlayerId !== playerId,
      ),
    );
  };

  const handleAddPlayer = async (event) => {
    event.preventDefault();

    const playerNames = playerName
      .split(/\r?\n/)
      .map((name) => name.trim())
      .filter(Boolean);

    if (playerNames.length === 0) {
      setSubmitError("At least one player name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const createdPlayers = [];
      const failedPlayerNames = [];
      let latestErrorMessage = "Unable to add players.";

      for (const currentPlayerName of playerNames) {
        try {
          const response = await fetch(
            `/api/players/register/${selectedSport.id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({ name: currentPlayerName }),
            },
          );
          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data?.message ?? "Add player failed");
          }

          createdPlayers.push(data.player);
        } catch (playerError) {
          console.error(
            `Add player failed for ${currentPlayerName}`,
            playerError,
          );
          failedPlayerNames.push(currentPlayerName);
          latestErrorMessage = playerError.message ?? latestErrorMessage;
        }
      }

      if (createdPlayers.length > 0) {
        setPlayers((currentPlayers) => [...currentPlayers, ...createdPlayers]);
      }

      if (failedPlayerNames.length === 0) {
        setPlayerName("");
        setIsAddPlayerOpen(false);
        return;
      }

      setPlayerName(failedPlayerNames.join("\n"));
      setSubmitError(
        createdPlayers.length > 0
          ? `Added ${createdPlayers.length} player(s). Could not add: ${failedPlayerNames.join(", ")}.`
          : latestErrorMessage,
      );
    } catch (submitPlayerError) {
      console.error("Add player failed", submitPlayerError);
      setSubmitError(submitPlayerError.message ?? "Unable to add player.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPlayer = async (event) => {
    event.preventDefault();

    const trimmedPlayerName = editPlayerName.trim();
    if (!trimmedPlayerName) {
      setEditPlayerError("Player name is required.");
      return;
    }

    try {
      setIsUpdatingPlayer(true);
      setEditPlayerError("");

      const response = await fetch(
        `/api/players/${activePlayerMenuId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: trimmedPlayerName,
            skillLevel: editSkillLevel,
            paymentStatus: editPaymentStatus,
          }),
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message ?? "Update player failed");
      }

      setPlayers((currentPlayers) =>
        currentPlayers.map((player) =>
          player.id === activePlayerMenuId ? data.player : player,
        ),
      );
      setActivePlayerMenuId(null);
      setEditPlayerName("");
      setEditSkillLevel("beginner");
      setEditPaymentStatus(false);
    } catch (updatePlayerError) {
      console.error("Update player failed", updatePlayerError);
      setEditPlayerError(
        updatePlayerError.message ?? "Unable to update player.",
      );
    } finally {
      setIsUpdatingPlayer(false);
    }
  };

  const handleDeletePlayer = async (playerId) => {
    try {
      setDeletingPlayerId(playerId);
      setEditPlayerError("");

      const response = await fetch(
        `/api/players/${playerId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok && response.status !== 204) {
        const data = await response.json();
        throw new Error(data?.message ?? "Delete player failed");
      }

      setPlayers((currentPlayers) =>
        currentPlayers.filter((player) => player.id !== playerId),
      );
      setActivePlayerMenuId(null);
      setEditPlayerName("");
      setEditSkillLevel("beginner");
      setEditPaymentStatus(false);
    } catch (deletePlayerError) {
      console.error("Delete player failed", deletePlayerError);
      setEditPlayerError(
        deletePlayerError.message ?? "Unable to delete player.",
      );
    } finally {
      setDeletingPlayerId(null);
    }
  };

  const handleAddCourt = async () => {
    try {
      setIsCourtSubmitting(true);
      setCourtsError("");

      const response = await fetch(
        `/api/courts/sport/${selectedSport.id}/add`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message ?? "Add court failed");
      }

      setCourts((currentCourts) => [
        ...currentCourts,
        { ...data.court, currentMatch: null },
      ]);
    } catch (addCourtError) {
      console.error("Add court failed", addCourtError);
      setCourtsError(addCourtError.message ?? "Unable to add court.");
    } finally {
      setIsCourtSubmitting(false);
    }
  };

  const handleDeleteCourt = async (courtId) => {
    try {
      setDeletingCourtId(courtId);
      setCourtsError("");
      setEditCourtError("");

      const response = await fetch(
        `/api/courts/${courtId}/sport/${selectedSport.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok && response.status !== 204) {
        const data = await response.json();
        throw new Error(data?.message ?? "Delete court failed");
      }

      setCourts((currentCourts) =>
        currentCourts.filter((court) => court.id !== courtId),
      );
      setActiveCourtMenuId(null);
      setEditCourtName("");
      setEditCourtTeamAPlayerIds([]);
      setEditCourtTeamBPlayerIds([]);
    } catch (deleteCourtError) {
      console.error("Delete court failed", deleteCourtError);
      setEditCourtError(deleteCourtError.message ?? "Unable to delete court.");
    } finally {
      setDeletingCourtId(null);
    }
  };

  const handleEditCourt = async (event) => {
    event.preventDefault();

    const trimmedCourtName = editCourtName.trim();
    const requestedPlayerIds = [
      ...editCourtTeamAPlayerIds,
      ...editCourtTeamBPlayerIds,
    ];

    if (!trimmedCourtName) {
      setEditCourtError("Court name is required.");
      return;
    }

    const conflictingPlayerId = requestedPlayerIds.find((playerId) =>
      unavailablePlayerCourtMap.has(playerId),
    );

    if (conflictingPlayerId) {
      const conflictingPlayer = players.find(
        (player) => player.id === conflictingPlayerId,
      );
      const assignedCourtName =
        unavailablePlayerCourtMap.get(conflictingPlayerId);

      setEditCourtError(
        `${conflictingPlayer?.name ?? "This player"} is already assigned to ${assignedCourtName}.`,
      );
      return;
    }

    try {
      setIsUpdatingCourt(true);
      setEditCourtError("");

      const response = await fetch(
        `/api/courts/${activeCourtMenuId}/sport/${selectedSport.id}/teams`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: trimmedCourtName,
            teamAPlayerIds: editCourtTeamAPlayerIds,
            teamBPlayerIds: editCourtTeamBPlayerIds,
          }),
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message ?? "Save court failed");
      }

      setCourts((currentCourts) =>
        currentCourts.map((court) =>
          court.id === activeCourtMenuId
            ? { ...court, ...data.court, currentMatch: data.match }
            : court,
        ),
      );
      setActiveCourtMenuId(null);
      setEditCourtName("");
      setEditCourtTeamAPlayerIds([]);
      setEditCourtTeamBPlayerIds([]);
    } catch (updateCourtError) {
      console.error("Save court failed", updateCourtError);
      setEditCourtError(updateCourtError.message ?? "Unable to save court.");
    } finally {
      setIsUpdatingCourt(false);
    }
  };

  const handleStartCourt = async (courtId) => {
    const optimisticStartedAt = new Date().toISOString();
    let previousCourtSnapshot = null;

    try {
      setStartingCourtId(courtId);
      setCourtsError("");
      setEditCourtError("");
      setCourts((currentCourts) =>
        currentCourts.map((court) => {
          if (court.id !== courtId) return court;

          previousCourtSnapshot = court;

          if (!court.currentMatch || court.currentMatch.startedAt) {
            return court;
          }

          return {
            ...court,
            currentMatch: {
              ...court.currentMatch,
              startedAt: optimisticStartedAt,
            },
          };
        }),
      );

      const response = await fetch(
        `/api/courts/${courtId}/sport/${selectedSport.id}/start`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message ?? "Start court failed");
      }

      setCourts((currentCourts) =>
        currentCourts.map((court) =>
          court.id === courtId
            ? { ...court, ...data.court, currentMatch: data.match }
            : court,
        ),
      );
    } catch (startCourtError) {
      if (previousCourtSnapshot) {
        setCourts((currentCourts) =>
          currentCourts.map((court) =>
            court.id === courtId ? previousCourtSnapshot : court,
          ),
        );
      }

      console.error("Start court failed", startCourtError);
      setCourtsError(startCourtError.message ?? "Unable to start court.");
    } finally {
      setStartingCourtId(null);
    }
  };

  const handleResetCourt = async (courtId) => {
    let previousCourtSnapshot = null;

    try {
      setResettingCourtId(courtId);
      setCourtsError("");
      setEditCourtError("");
      setCourts((currentCourts) =>
        currentCourts.map((currentCourt) => {
          if (currentCourt.id !== courtId) return currentCourt;

          previousCourtSnapshot = currentCourt;

          return {
            ...currentCourt,
            currentMatch: null,
          };
        }),
      );

      const response = await fetch(
        `/api/courts/${courtId}/sport/${selectedSport.id}/reset`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message ?? "Reset court failed");
      }

      setCourts((currentCourts) =>
        currentCourts.map((court) =>
          court.id === courtId
            ? { ...court, ...data.court, currentMatch: null }
            : court,
        ),
      );

      if (activeCourtMenuId === courtId) {
        setActiveCourtMenuId(null);
        setEditCourtName("");
        setEditCourtTeamAPlayerIds([]);
        setEditCourtTeamBPlayerIds([]);
      }
    } catch (resetCourtError) {
      if (previousCourtSnapshot) {
        setCourts((currentCourts) =>
          currentCourts.map((currentCourt) =>
            currentCourt.id === courtId ? previousCourtSnapshot : currentCourt,
          ),
        );
      }

      console.error("Reset court failed", resetCourtError);
      setCourtsError(resetCourtError.message ?? "Unable to reset court.");
    } finally {
      setResettingCourtId(null);
    }
  };

  const handleEndCourt = async (courtId) => {
    let previousCourtSnapshot = null;

    try {
      setEndingCourtId(courtId);
      setCourtsError("");
      setEditCourtError("");

      const court = courts.find((c) => c.id === courtId);
      const scoreA = court?.currentMatch?.scoreA ?? 0;
      const scoreB = court?.currentMatch?.scoreB ?? 0;

      setCourts((currentCourts) =>
        currentCourts.map((currentCourt) => {
          if (currentCourt.id !== courtId) return currentCourt;

          previousCourtSnapshot = currentCourt;

          return {
            ...currentCourt,
            currentMatch: null,
          };
        }),
      );

      const response = await fetch(
        `/api/courts/${courtId}/sport/${selectedSport.id}/end`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scoreA,
            scoreB,
          }),
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message ?? "End court failed");
      }

      setCourts((currentCourts) =>
        currentCourts.map((currentCourt) =>
          currentCourt.id === courtId
            ? { ...currentCourt, ...data.court, currentMatch: null }
            : currentCourt,
        ),
      );

      if (activeCourtMenuId === courtId) {
        setActiveCourtMenuId(null);
        setEditCourtName("");
        setEditCourtTeamAPlayerIds([]);
        setEditCourtTeamBPlayerIds([]);
      }

      // Refetch player match counts to show updated data immediately
      void getPlayersMatchCountAPI(selectedSport.id);
    } catch (endCourtError) {
      if (previousCourtSnapshot) {
        setCourts((currentCourts) =>
          currentCourts.map((currentCourt) =>
            currentCourt.id === courtId ? previousCourtSnapshot : currentCourt,
          ),
        );
      }

      console.error("End court failed", endCourtError);
      setCourtsError(endCourtError.message ?? "Unable to end court.");
    } finally {
      setEndingCourtId(null);
    }
  };

  const handleAddQueue = () => {
    setQueues((currentQueues) => [
      ...currentQueues,
      createQueue(
        availableCourts.length > 0 ? String(availableCourts[0].id) : null,
      ),
    ]);
  };

  const deleteQueueRecord = async (queue, shouldKeepQueueOnError = false) => {
    if (!queue.matchId) {
      if (!shouldKeepQueueOnError) {
        setQueues((currentQueues) =>
          currentQueues.filter((currentQueue) => currentQueue.id !== queue.id),
        );
      }
      return;
    }

    const deleteMatchResponse = await fetch(
      `/api/matches/${queue.matchId}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );

    if (!deleteMatchResponse.ok && deleteMatchResponse.status !== 204) {
      const errorData = await deleteMatchResponse.json();
      throw new Error(errorData?.message ?? "Failed to delete queued match");
    }

    if (queue.teamAId) {
      const teamADeleteResponse = await fetch(
        `/api/teams/sports/${selectedSport.id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ teamId: queue.teamAId }),
        },
      );

      if (!teamADeleteResponse.ok && teamADeleteResponse.status !== 204) {
        const errorData = await teamADeleteResponse.json();
        throw new Error(errorData?.message ?? "Failed to delete Team A");
      }
    }

    if (queue.teamBId) {
      const teamBDeleteResponse = await fetch(
        `/api/teams/sports/${selectedSport.id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ teamId: queue.teamBId }),
        },
      );

      if (!teamBDeleteResponse.ok && teamBDeleteResponse.status !== 204) {
        const errorData = await teamBDeleteResponse.json();
        throw new Error(errorData?.message ?? "Failed to delete Team B");
      }
    }
  };

  const handleDeleteQueue = async (queueId) => {
    const queue = queues.find((currentQueue) => currentQueue.id === queueId);

    if (!queue) return;

    try {
      setQueues((currentQueues) =>
        currentQueues.map((currentQueue) =>
          currentQueue.id === queueId
            ? { ...currentQueue, isSubmitting: true, error: "" }
            : currentQueue,
        ),
      );

      await deleteQueueRecord(queue);

      setQueues((currentQueues) =>
        currentQueues.filter((currentQueue) => currentQueue.id !== queueId),
      );
    } catch (error) {
      console.error("Delete queue failed", error);
      setQueues((currentQueues) =>
        currentQueues.map((currentQueue) =>
          currentQueue.id === queueId
            ? {
                ...currentQueue,
                isSubmitting: false,
                error: error.message ?? "Unable to delete queue",
              }
            : currentQueue,
        ),
      );
    }
  };

  const handleSaveQueue = async (
    queueId,
    { teamAPlayerIds, teamBPlayerIds, selectedCourtId },
  ) => {
    const queue = queues.find((currentQueue) => currentQueue.id === queueId);

    if (!queue) return false;

    if (teamAPlayerIds.length === 0 || teamBPlayerIds.length === 0) {
      setQueues((currentQueues) =>
        currentQueues.map((currentQueue) =>
          currentQueue.id === queueId
            ? { ...currentQueue, error: "Both teams need at least 1 player" }
            : currentQueue,
        ),
      );
      return false;
    }

    try {
      setQueues((currentQueues) =>
        currentQueues.map((currentQueue) =>
          currentQueue.id === queueId
            ? { ...currentQueue, isSubmitting: true, error: "" }
            : currentQueue,
        ),
      );

      const matchResponse = await fetch(
        `/api/matches/sports/${selectedSport.id}/queue`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            matchId: queue.matchId,
            queuedAt: queue.queuedAt ?? new Date().toISOString(),
            teamAPlayerIds,
            teamBPlayerIds,
          }),
        },
      );

      const matchData = await matchResponse.json();

      if (!matchResponse.ok || !matchData.success) {
        throw new Error(matchData?.message ?? "Failed to create queued match");
      }

      setQueues((currentQueues) =>
        currentQueues.map((currentQueue) =>
          currentQueue.id === queueId
            ? {
                ...currentQueue,
                matchId: matchData.match.id,
                teamAId: matchData.match.teamAId,
                teamBId: matchData.match.teamBId,
                teamAPlayerIds,
                teamBPlayerIds,
                selectedCourtId,
                queuedAt: matchData.match.queuedAt ?? queue.queuedAt,
                isSubmitting: false,
                error: "",
              }
            : currentQueue,
        ),
      );
      return true;
    } catch (error) {
      console.error("Save queue failed", error);
      setQueues((currentQueues) =>
        currentQueues.map((currentQueue) =>
          currentQueue.id === queueId
            ? {
                ...currentQueue,
                isSubmitting: false,
                error: error.message ?? "Unable to save queue",
              }
            : currentQueue,
        ),
      );
      return false;
    }
  };

  const handleLaunchQueuedMatch = async (queueId) => {
    const queue = queues.find((currentQueue) => currentQueue.id === queueId);

    if (!queue) return;

    if (!queue.queuedAt || !queue.matchId || !queue.teamAId || !queue.teamBId) {
      setQueues((currentQueues) =>
        currentQueues.map((currentQueue) =>
          currentQueue.id === queueId
            ? { ...currentQueue, error: "Queue the teams first." }
            : currentQueue,
        ),
      );
      return;
    }

    if (queue.teamAPlayerIds.length === 0 || queue.teamBPlayerIds.length === 0) {
      setQueues((currentQueues) =>
        currentQueues.map((currentQueue) =>
          currentQueue.id === queueId
            ? { ...currentQueue, error: "Both teams need at least 1 player" }
            : currentQueue,
        ),
      );
      return;
    }

    if (!queue.selectedCourtId) {
      setQueues((currentQueues) =>
        currentQueues.map((currentQueue) =>
          currentQueue.id === queueId
            ? {
                ...currentQueue,
                error: "Select an available court first.",
              }
            : currentQueue,
        ),
      );
      return;
    }

    const selectedCourt = availableCourts.find(
      (court) => String(court.id) === queue.selectedCourtId,
    );

    if (!selectedCourt) {
      setQueues((currentQueues) =>
        currentQueues.map((currentQueue) =>
          currentQueue.id === queueId
            ? {
                ...currentQueue,
                error: "Selected court is no longer available.",
              }
            : currentQueue,
        ),
      );
      return;
    }

    try {
      setQueues((currentQueues) =>
        currentQueues.map((currentQueue) =>
          currentQueue.id === queueId
            ? { ...currentQueue, isSubmitting: true, error: "" }
            : currentQueue,
        ),
      );

      const assignCourtResponse = await fetch(
        `/api/matches/${queue.matchId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courtId: selectedCourt.id,
          }),
        },
      );

      const assignCourtData = await assignCourtResponse.json();

      if (!assignCourtResponse.ok || !assignCourtData.success) {
        throw new Error(assignCourtData?.message ?? "Failed to assign court");
      }

      const startResponse = await fetch(
        `/api/courts/${selectedCourt.id}/sport/${selectedSport.id}/start`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const startData = await startResponse.json();

      if (!startResponse.ok || !startData.success) {
        throw new Error(startData?.message ?? "Failed to start match");
      }

      setCourts((currentCourts) =>
        currentCourts.map((court) =>
          court.id === selectedCourt.id
            ? { ...court, ...startData.court, currentMatch: startData.match }
            : court,
        ),
      );

      setQueues((currentQueues) =>
        currentQueues.filter((currentQueue) => currentQueue.id !== queueId),
      );
    } catch (error) {
      console.error("Start queue match failed", error);
      setQueues((currentQueues) =>
        currentQueues.map((currentQueue) =>
          currentQueue.id === queueId
            ? {
                ...currentQueue,
                error: error.message ?? "Unable to start match from queue",
              }
            : currentQueue,
        ),
      );
    } finally {
      setQueues((currentQueues) =>
        currentQueues.map((currentQueue) =>
          currentQueue.id === queueId
            ? { ...currentQueue, isSubmitting: false }
            : currentQueue,
        ),
      );
    }
  };

  const statusClassName =
    "flex min-h-0 flex-1 items-center justify-center rounded-[18px] border border-accent bg-surface p-6 text-text";

  if (isLoading) return <section className={statusClassName}>Loading sports...</section>;
  if (error) return <section className={statusClassName}>{error}</section>;
  if (sports.length === 0) {
    return (
      <section className={statusClassName}>No sports available yet.</section>
    );
  }
  if (!selectedSport) {
    return (
      <section className={statusClassName}>Select a sport from the sidebar.</section>
    );
  }

  return (
    <>
      <section className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden lg:flex-row">
        <PlayersPanel
          selectedSport={selectedSport}
          players={players}
          isPlayersLoading={isPlayersLoading}
          playersError={playersError}
          setIsAddPlayerOpen={setIsAddPlayerOpen}
          isUpdatingPlayer={isUpdatingPlayer}
          deletingPlayerId={deletingPlayerId}
          setActivePlayerMenuId={setActivePlayerMenuId}
          setEditPlayerError={setEditPlayerError}
          openPlayerMenu={openPlayerMenu}
          activePlayerMenuId={activePlayerMenuId}
          handleEditPlayer={handleEditPlayer}
          editPlayerName={editPlayerName}
          setEditPlayerName={setEditPlayerName}
          editSkillLevel={editSkillLevel}
          setEditSkillLevel={setEditSkillLevel}
          editPaymentStatus={editPaymentStatus}
          setEditPaymentStatus={setEditPaymentStatus}
          editPlayerError={editPlayerError}
          handleDeletePlayer={handleDeletePlayer}
          playerMatchCounts={playerMatchCounts}
        />
        <CourtsPanel
          courts={courts}
          isCourtsLoading={isCourtsLoading}
          courtsError={courtsError}
          isUpdatingCourt={isUpdatingCourt}
          deletingCourtId={deletingCourtId}
          startingCourtId={startingCourtId}
          resettingCourtId={resettingCourtId}
          endingCourtId={endingCourtId}
          setActiveCourtMenuId={setActiveCourtMenuId}
          setEditCourtName={setEditCourtName}
          setEditCourtTeamAPlayerIds={setEditCourtTeamAPlayerIds}
          setEditCourtTeamBPlayerIds={setEditCourtTeamBPlayerIds}
          setEditCourtError={setEditCourtError}
          isCourtSubmitting={isCourtSubmitting}
          handleAddCourt={handleAddCourt}
          openCourtMenu={openCourtMenu}
          activeCourtMenuId={activeCourtMenuId}
          editCourtName={editCourtName}
          setEditCourtNameProp={setEditCourtName}
          editCourtTeamAPlayerIds={editCourtTeamAPlayerIds}
          editCourtTeamBPlayerIds={editCourtTeamBPlayerIds}
          players={players}
          unavailablePlayerCourtMap={unavailablePlayerCourtMap}
          toggleCourtPlayer={toggleCourtPlayer}
          editCourtError={editCourtError}
          handleDeleteCourt={handleDeleteCourt}
          handleEditCourt={handleEditCourt}
          handleStartCourt={handleStartCourt}
          handleResetCourt={handleResetCourt}
          handleEndCourt={handleEndCourt}
          isPlayersLoading={isPlayersLoading}
          setCourts={setCourts}
          queues={queues}
          handleAddQueue={handleAddQueue}
          handleSaveQueue={handleSaveQueue}
          handleDeleteQueue={handleDeleteQueue}
          handleLaunchQueuedMatch={handleLaunchQueuedMatch}
          availableCourts={availableCourts}
        />
      </section>

      {isAddPlayerOpen ? (
        <AddPlayerModal
          selectedSport={selectedSport}
          playerName={playerName}
          setPlayerName={setPlayerName}
          submitError={submitError}
          isSubmitting={isSubmitting}
          closeAddPlayerModal={closeAddPlayerModal}
          handleAddPlayer={handleAddPlayer}
        />
      ) : null}
    </>
  );
};

export default Home;
