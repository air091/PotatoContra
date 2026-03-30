import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { IoEllipsisVertical } from "react-icons/io5";
import AddPlayerModal from "../components/home_components/AddPlayerModal";

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
  const [isSavingCourtTeams, setIsSavingCourtTeams] = useState(false);
  const [deletingCourtId, setDeletingCourtId] = useState(null);
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
        `http://localhost:7007/api/courts/${activeCourtMenuId}/sport/${selectedSport.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ name: trimmedCourtName }),
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message ?? "Update court failed");
      }

      setCourts((currentCourts) =>
        currentCourts.map((court) =>
          court.id === activeCourtMenuId
            ? { ...court, ...data.court }
            : court,
        ),
      );
      setActiveCourtMenuId(null);
      setEditCourtName("");
      setEditCourtTeamAPlayerIds([]);
      setEditCourtTeamBPlayerIds([]);
    } catch (updateCourtError) {
      console.error("Update court failed", updateCourtError);
      setEditCourtError(updateCourtError.message ?? "Unable to update court.");
    } finally {
      setIsUpdatingCourt(false);
    }
  };

  const handleSaveCourtTeams = async () => {
    try {
      setIsSavingCourtTeams(true);
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
            teamAPlayerIds: editCourtTeamAPlayerIds,
            teamBPlayerIds: editCourtTeamBPlayerIds,
          }),
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message ?? "Save court teams failed");
      }

      setCourts((currentCourts) =>
        currentCourts.map((court) =>
          court.id === activeCourtMenuId
            ? { ...court, currentMatch: data.match }
            : court,
        ),
      );
      setActiveCourtMenuId(null);
      setEditCourtName("");
      setEditCourtTeamAPlayerIds([]);
      setEditCourtTeamBPlayerIds([]);
    } catch (saveCourtTeamsError) {
      console.error("Save court teams failed", saveCourtTeamsError);
      setEditCourtError(
        saveCourtTeamsError.message ?? "Unable to save court teams.",
      );
    } finally {
      setIsSavingCourtTeams(false);
    }
  };

  if (isLoading) return <div>Loading sports...</div>;
  if (error) return <div>{error}</div>;
  if (sports.length === 0) return <div>No sports available yet.</div>;
  if (!selectedSport) return <div>Select a sport from the sidebar.</div>;

  return (
    <>
      <section className="p-4 border">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-start">
          <div
            className="min-w-0 flex-1 border p-4"
            onClick={() => {
              if (isUpdatingPlayer || deletingPlayerId) return;

              setActivePlayerMenuId(null);
              setEditPlayerError("");
            }}
          >
            <div className="w-full border px-4 py-2">
              <div className="flex items-center justify-between gap-4">
                <h1 className="text-xl font-semibold">{selectedSport.name}</h1>

                <div className="flex gap-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddPlayerOpen(true)}
                    className="cursor-pointer border px-2 py-1 text-xs"
                  >
                    Add player
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer border px-2 py-1 text-xs"
                  >
                    Payment
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-2 w-full border p-3">
              {isPlayersLoading ? <p>Loading players...</p> : null}
              {!isPlayersLoading && playersError ? <p>{playersError}</p> : null}
              {!isPlayersLoading && !playersError && players.length === 0 ? (
                <p>No players yet.</p>
              ) : null}

              {!isPlayersLoading && !playersError && players.length > 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="relative flex w-fit items-center justify-between gap-x-4 rounded border px-2 py-1"
                    >
                      <div>
                        <p className="text-sm font-semibold leading-tight">
                          {player.name}
                        </p>
                        <p className="text-xs leading-tight">{player.skillLevel}</p>
                      </div>
                      <div>
                        <button
                          type="button"
                          className="cursor-pointer"
                          onClick={(event) => {
                            event.stopPropagation();
                            openPlayerMenu(player);
                          }}
                        >
                          <IoEllipsisVertical />
                        </button>
                      </div>

                      {activePlayerMenuId === player.id ? (
                        <div
                          className="absolute right-0 top-8 z-10 w-56 border bg-white p-3"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <form onSubmit={handleEditPlayer} className="space-y-3">
                            <label className="block">
                              <span className="mb-1 block text-xs">Name</span>
                              <input
                                type="text"
                                value={editPlayerName}
                                onChange={(event) =>
                                  setEditPlayerName(event.target.value)
                                }
                                className="w-full border px-2 py-1 text-sm"
                                disabled={deletingPlayerId === player.id}
                                autoFocus
                              />
                            </label>

                            <label className="block">
                              <span className="mb-1 block text-xs">Skill</span>
                              <select
                                value={editSkillLevel}
                                onChange={(event) =>
                                  setEditSkillLevel(event.target.value)
                                }
                                className="w-full border px-2 py-1 text-sm"
                                disabled={deletingPlayerId === player.id}
                              >
                                <option value="beginner">beginner</option>
                                <option value="intermediate">intermediate</option>
                                <option value="expert">expert</option>
                              </select>
                            </label>

                            <label className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={editPaymentStatus}
                                onChange={(event) =>
                                  setEditPaymentStatus(event.target.checked)
                                }
                                disabled={deletingPlayerId === player.id}
                              />
                              <span>Payment received</span>
                            </label>

                            {editPlayerError ? (
                              <p className="text-xs">{editPlayerError}</p>
                            ) : null}

                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setActivePlayerMenuId(null);
                                  setEditPlayerError("");
                                }}
                                disabled={
                                  isUpdatingPlayer || deletingPlayerId === player.id
                                }
                                className="border px-2 py-1 text-xs"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePlayer(player.id)}
                                disabled={
                                  isUpdatingPlayer || deletingPlayerId === player.id
                                }
                                className="border px-2 py-1 text-xs"
                              >
                                {deletingPlayerId === player.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                              <button
                                type="submit"
                                disabled={
                                  isUpdatingPlayer || deletingPlayerId === player.id
                                }
                                className="border px-2 py-1 text-xs"
                              >
                                {isUpdatingPlayer ? "Saving..." : "Save"}
                              </button>
                            </div>
                          </form>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <aside
            className="w-full border p-4 lg:w-80"
            onClick={() => {
              if (isUpdatingCourt || deletingCourtId || isSavingCourtTeams) return;

              setActiveCourtMenuId(null);
              setEditCourtName("");
              setEditCourtTeamAPlayerIds([]);
              setEditCourtTeamBPlayerIds([]);
              setEditCourtError("");
            }}
          >
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold">Courts</h2>
            </div>

            <p className="mb-3 text-xs">{courts.length} total</p>

            {isCourtsLoading ? <p>Loading courts...</p> : null}
            {!isCourtsLoading && courtsError ? <p>{courtsError}</p> : null}

            {!isCourtsLoading && !courtsError ? (
              <div className="flex flex-wrap gap-2">
                {courts.length === 0 ? (
                  <button
                    type="button"
                    onClick={handleAddCourt}
                    disabled={isCourtSubmitting}
                    className="cursor-pointer rounded border border-dashed px-3 py-2 text-sm"
                  >
                    {isCourtSubmitting ? "Adding..." : "Add court"}
                  </button>
                ) : null}

                {courts.map((court) => (
                  <div
                    key={court.id}
                    className="relative rounded border px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold leading-tight">
                          {court.name}
                        </p>
                        <p className="text-xs leading-tight">
                          {court.isActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation();
                          openCourtMenu(court);
                        }}
                      >
                        <IoEllipsisVertical />
                      </button>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div>
                        <p className="text-xs font-semibold">Team A</p>
                        {court.currentMatch?.matchPlayers?.filter(
                          (matchPlayer) =>
                            matchPlayer.teamId === court.currentMatch?.teamAId,
                        ).length ? (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {court.currentMatch.matchPlayers
                              .filter(
                                (matchPlayer) =>
                                  matchPlayer.teamId === court.currentMatch?.teamAId,
                              )
                              .map((matchPlayer) => (
                                <span
                                  key={`${court.id}-team-a-${matchPlayer.playerId}`}
                                  className="rounded border px-2 py-0.5 text-xs"
                                >
                                  {matchPlayer.player.name}
                                </span>
                              ))}
                          </div>
                        ) : (
                          <p className="text-xs">No players yet.</p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-semibold">Team B</p>
                        {court.currentMatch?.matchPlayers?.filter(
                          (matchPlayer) =>
                            matchPlayer.teamId === court.currentMatch?.teamBId,
                        ).length ? (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {court.currentMatch.matchPlayers
                              .filter(
                                (matchPlayer) =>
                                  matchPlayer.teamId === court.currentMatch?.teamBId,
                              )
                              .map((matchPlayer) => (
                                <span
                                  key={`${court.id}-team-b-${matchPlayer.playerId}`}
                                  className="rounded border px-2 py-0.5 text-xs"
                                >
                                  {matchPlayer.player.name}
                                </span>
                              ))}
                          </div>
                        ) : (
                          <p className="text-xs">No players yet.</p>
                        )}
                      </div>
                    </div>

                    {activeCourtMenuId === court.id ? (
                      <div
                        className="absolute right-0 top-8 z-10 w-72 border bg-white p-3"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <form onSubmit={handleEditCourt} className="space-y-3">
                          <label className="block">
                            <span className="mb-1 block text-xs">Name</span>
                            <input
                              type="text"
                              value={editCourtName}
                              onChange={(event) =>
                                setEditCourtName(event.target.value)
                              }
                              className="w-full border px-2 py-1 text-sm"
                              disabled={
                                deletingCourtId === court.id || isSavingCourtTeams
                              }
                              autoFocus
                            />
                          </label>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="mb-2 text-xs font-semibold">Team A</p>
                              <div className="max-h-40 space-y-2 overflow-y-auto border p-2">
                                {players.map((player) => (
                                  <label
                                    key={`${court.id}-team-a-option-${player.id}`}
                                    className="flex items-center gap-2 text-xs"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={editCourtTeamAPlayerIds.includes(player.id)}
                                      onChange={() => toggleCourtPlayer("A", player.id)}
                                      disabled={
                                        isSavingCourtTeams ||
                                        deletingCourtId === court.id ||
                                        isUpdatingCourt
                                      }
                                    />
                                    <span>{player.name}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="mb-2 text-xs font-semibold">Team B</p>
                              <div className="max-h-40 space-y-2 overflow-y-auto border p-2">
                                {players.map((player) => (
                                  <label
                                    key={`${court.id}-team-b-option-${player.id}`}
                                    className="flex items-center gap-2 text-xs"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={editCourtTeamBPlayerIds.includes(player.id)}
                                      onChange={() => toggleCourtPlayer("B", player.id)}
                                      disabled={
                                        isSavingCourtTeams ||
                                        deletingCourtId === court.id ||
                                        isUpdatingCourt
                                      }
                                    />
                                    <span>{player.name}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>

                          {editCourtError ? (
                            <p className="text-xs">{editCourtError}</p>
                          ) : null}

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={handleSaveCourtTeams}
                              disabled={
                                isSavingCourtTeams ||
                                isUpdatingCourt ||
                                deletingCourtId === court.id ||
                                isPlayersLoading ||
                                players.length === 0
                              }
                              className="border px-2 py-1 text-xs"
                            >
                              {isSavingCourtTeams ? "Saving teams..." : "Save teams"}
                            </button>
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveCourtMenuId(null);
                                setEditCourtName("");
                                setEditCourtTeamAPlayerIds([]);
                                setEditCourtTeamBPlayerIds([]);
                                setEditCourtError("");
                              }}
                              disabled={
                                isUpdatingCourt ||
                                deletingCourtId === court.id ||
                                isSavingCourtTeams
                              }
                              className="border px-2 py-1 text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCourt(court.id)}
                              disabled={
                                isUpdatingCourt ||
                                deletingCourtId === court.id ||
                                isSavingCourtTeams
                              }
                              className="border px-2 py-1 text-xs"
                            >
                              {deletingCourtId === court.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                            <button
                              type="submit"
                              disabled={
                                isUpdatingCourt ||
                                deletingCourtId === court.id ||
                                isSavingCourtTeams
                              }
                              className="border px-2 py-1 text-xs"
                            >
                              {isUpdatingCourt ? "Saving..." : "Save"}
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : null}
                  </div>
                ))}

                {courts.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleAddCourt}
                    disabled={isCourtSubmitting}
                    className="cursor-pointer rounded border border-dashed px-3 py-2 text-sm"
                  >
                    {isCourtSubmitting ? "Adding..." : "Add court"}
                  </button>
                ) : null}
              </div>
            ) : null}

            {!isCourtsLoading && !courtsError && courts.length === 0 ? (
              <p className="mt-3 text-sm">No courts yet.</p>
            ) : null}
          </aside>
        </div>
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
