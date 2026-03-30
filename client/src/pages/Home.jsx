import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import AddPlayerModal from "../components/home_components/AddPlayerModal";
import PlayersPanel from "../components/home_components/PlayersPanel";
import CourtsPanel from "../components/home_components/CourtsPanel";

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

  useEffect(() => {
    if (!selectedSport) {
      setPlayers([]);
      setCourts([]);
      setPlayersError("");
      setCourtsError("");
      return;
    }

    const abortController = new AbortController();

    const getPlayersAPI = async () => {
      try {
        setIsPlayersLoading(true);
        setPlayersError("");

        const response = await fetch(
          `http://localhost:7007/api/players/${selectedSport.id}`,
          {
            method: "GET",
            credentials: "include",
            signal: abortController.signal,
          },
        );
        const data = await response.json();

        if (response.status === 404) {
          setPlayers([]);
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(data?.message ?? "Players API failed");
        }

        setPlayers(
          data.players.filter((player) => player.sportId === selectedSport.id),
        );
      } catch (fetchError) {
        if (fetchError.name === "AbortError") return;

        console.error("Players API failed", fetchError);
        setPlayersError("Unable to load players.");
      } finally {
        setIsPlayersLoading(false);
      }
    };

    const getCourtsAPI = async () => {
      try {
        setIsCourtsLoading(true);
        setCourtsError("");

        const response = await fetch(
          `http://localhost:7007/api/courts/sport/${selectedSport.id}`,
          {
            method: "GET",
            credentials: "include",
            signal: abortController.signal,
          },
        );
        const data = await response.json();

        if (response.status === 404) {
          setCourts([]);
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(data?.message ?? "Courts API failed");
        }

        setCourts(
          data.courts.filter((court) => court.sportId === selectedSport.id),
        );
      } catch (fetchError) {
        if (fetchError.name === "AbortError") return;

        console.error("Courts API failed", fetchError);
        setCourtsError("Unable to load courts.");
      } finally {
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
    setEditPlayerError("");
    setEditCourtError("");
    getPlayersAPI();
    getCourtsAPI();

    return () => {
      abortController.abort();
    };
  }, [selectedSport]);

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
    const teamAPlayerIds =
      currentMatch?.matchPlayers
        ?.filter((matchPlayer) => matchPlayer.teamId === currentMatch.teamAId)
        .map((matchPlayer) => matchPlayer.playerId) ?? [];
    const teamBPlayerIds =
      currentMatch?.matchPlayers
        ?.filter((matchPlayer) => matchPlayer.teamId === currentMatch.teamBId)
        .map((matchPlayer) => matchPlayer.playerId) ?? [];

    setActiveCourtMenuId((currentMenuId) =>
      currentMenuId === court.id ? null : court.id,
    );
    setEditCourtName(court.name);
    setEditCourtTeamAPlayerIds(teamAPlayerIds);
    setEditCourtTeamBPlayerIds(teamBPlayerIds);
    setEditCourtError("");
  };

  const toggleCourtPlayer = (teamKey, playerId) => {
    setEditCourtError("");

    if (teamKey === "A") {
      setEditCourtTeamAPlayerIds((currentPlayerIds) =>
        currentPlayerIds.includes(playerId)
          ? currentPlayerIds.filter((currentPlayerId) => currentPlayerId !== playerId)
          : [...currentPlayerIds, playerId],
      );
      setEditCourtTeamBPlayerIds((currentPlayerIds) =>
        currentPlayerIds.filter((currentPlayerId) => currentPlayerId !== playerId),
      );
      return;
    }

    setEditCourtTeamBPlayerIds((currentPlayerIds) =>
      currentPlayerIds.includes(playerId)
        ? currentPlayerIds.filter((currentPlayerId) => currentPlayerId !== playerId)
        : [...currentPlayerIds, playerId],
    );
    setEditCourtTeamAPlayerIds((currentPlayerIds) =>
      currentPlayerIds.filter((currentPlayerId) => currentPlayerId !== playerId),
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
            `http://localhost:7007/api/players/register/${selectedSport.id}`,
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
        `http://localhost:7007/api/players/${activePlayerMenuId}`,
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
        `http://localhost:7007/api/players/${playerId}`,
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
        `http://localhost:7007/api/courts/sport/${selectedSport.id}/add`,
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
        `http://localhost:7007/api/courts/${courtId}/sport/${selectedSport.id}`,
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
    if (!trimmedCourtName) {
      setEditCourtError("Court name is required.");
      return;
    }

    try {
      setIsUpdatingCourt(true);
      setEditCourtError("");

      const response = await fetch(
        `http://localhost:7007/api/courts/${activeCourtMenuId}/sport/${selectedSport.id}/teams`,
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
    try {
      setStartingCourtId(courtId);
      setCourtsError("");
      setEditCourtError("");

      const response = await fetch(
        `http://localhost:7007/api/courts/${courtId}/sport/${selectedSport.id}/start`,
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
      console.error("Start court failed", startCourtError);
      setCourtsError(startCourtError.message ?? "Unable to start court.");
    } finally {
      setStartingCourtId(null);
    }
  };

  const handleResetCourt = async (courtId) => {
    try {
      setResettingCourtId(courtId);
      setCourtsError("");
      setEditCourtError("");

      const response = await fetch(
        `http://localhost:7007/api/courts/${courtId}/sport/${selectedSport.id}/reset`,
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
      console.error("Reset court failed", resetCourtError);
      setCourtsError(resetCourtError.message ?? "Unable to reset court.");
    } finally {
      setResettingCourtId(null);
    }
  };

  if (isLoading) return <div>Loading sports...</div>;
  if (error) return <div>{error}</div>;
  if (sports.length === 0) return <div>No sports available yet.</div>;
  if (!selectedSport) return <div>Select a sport from the sidebar.</div>;

  return (
    <>
      <section className="border p-4 flex">
        
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
          />
          <CourtsPanel
            courts={courts}
            isCourtsLoading={isCourtsLoading}
            courtsError={courtsError}
            isUpdatingCourt={isUpdatingCourt}
            deletingCourtId={deletingCourtId}
            startingCourtId={startingCourtId}
            resettingCourtId={resettingCourtId}
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
            toggleCourtPlayer={toggleCourtPlayer}
            editCourtError={editCourtError}
            handleDeleteCourt={handleDeleteCourt}
            handleEditCourt={handleEditCourt}
            handleStartCourt={handleStartCourt}
            handleResetCourt={handleResetCourt}
            isPlayersLoading={isPlayersLoading}
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
