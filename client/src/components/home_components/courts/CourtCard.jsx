import { useState } from "react";
import { IoEllipsisVertical } from "react-icons/io5";
import CourtEditMenu from "./CourtEditMenu";
import formatElapsedTime from "./formatElapsedTime";

const CourtCard = ({
  court,
  timerNow,
  openCourtMenu,
  activeCourtMenuId,
  editCourtName,
  setEditCourtNameProp,
  editCourtTeamAPlayerIds,
  editCourtTeamBPlayerIds,
  players,
  unavailablePlayerCourtMap,
  toggleCourtPlayer,
  editCourtError,
  handleDeleteCourt,
  handleEditCourt,
  handleStartCourt,
  handleResetCourt,
  handleEndCourt,
  isUpdatingCourt,
  deletingCourtId,
  startingCourtId,
  resettingCourtId,
  endingCourtId,
  setActiveCourtMenuId,
  setEditCourtName,
  setEditCourtTeamAPlayerIds,
  setEditCourtTeamBPlayerIds,
  setEditCourtError,
  isPlayersLoading,
  setCourts,
}) => {
  const [isUpdatingScore, setIsUpdatingScore] = useState(false);
  const currentMatch = court.currentMatch;
  const teamAPlayers =
    currentMatch?.matchPlayers?.filter(
      (matchPlayer) => matchPlayer.teamId === currentMatch?.teamAId,
    ) ?? [];
  const teamBPlayers =
    currentMatch?.matchPlayers?.filter(
      (matchPlayer) => matchPlayer.teamId === currentMatch?.teamBId,
    ) ?? [];
  const canStart =
    !!currentMatch &&
    !currentMatch.startedAt &&
    teamAPlayers.length > 0 &&
    teamBPlayers.length > 0;
  const canReset = !!currentMatch && !currentMatch.startedAt;
  const canEnd = !!currentMatch && !!currentMatch.startedAt;
  const elapsedTime = formatElapsedTime(currentMatch?.startedAt, timerNow);
  const isBusy =
    isUpdatingCourt ||
    deletingCourtId === court.id ||
    startingCourtId === court.id ||
    resettingCourtId === court.id ||
    endingCourtId === court.id ||
    isUpdatingScore;

  const updateScore = async (team, value) => {
    if (!currentMatch) return;

    const newScore = Math.max(0, value);
    setIsUpdatingScore(true);

    try {
      const scoreData =
        team === "teamA" ? { scoreA: newScore } : { scoreB: newScore };

      const response = await fetch(
        `http://localhost:7007/api/matches/${currentMatch.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(scoreData),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error("Failed to update score:", data?.message);
        return;
      }

      // Update the courts state with the updated match
      setCourts((prevCourts) =>
        prevCourts.map((c) =>
          c.id === court.id ? { ...c, currentMatch: data.match } : c,
        ),
      );
    } catch (error) {
      console.error("Error updating score:", error);
    } finally {
      setIsUpdatingScore(false);
    }
  };

  return (
    <div className="relative rounded border px-3 py-2 h-fit">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold leading-tight">{court.name}</p>
          <p className="text-xs leading-tight">
            {court.isActive ? "Active" : "Inactive"}
          </p>
          {elapsedTime ? (
            <p className="text-xs leading-tight">Timer: {elapsedTime}</p>
          ) : null}
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

      <div className="mt-3 flex gap-x-4 space-y-2">
        <div>
          <p className="text-xs font-semibold">Team A</p>
          {teamAPlayers.length ? (
            <div className="mt-1 grid grid-cols-2 gap-1">
              {teamAPlayers.map((matchPlayer) => (
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
          {teamBPlayers.length ? (
            <div className="mt-1 grid grid-cols-2 gap-1">
              {teamBPlayers.map((matchPlayer) => (
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

      {currentMatch && currentMatch.startedAt ? (
        <div className="mt-3 border-t pt-3">
          <p className="mb-2 text-xs font-semibold">Score</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-xs">Team A</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateScore("teamA", currentMatch.scoreA - 1)}
                  disabled={isBusy}
                  className="border px-2 py-1 text-xs"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm font-semibold">
                  {currentMatch.scoreA}
                </span>
                <button
                  type="button"
                  onClick={() => updateScore("teamA", currentMatch.scoreA + 1)}
                  disabled={isBusy}
                  className="border px-2 py-1 text-xs"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs">Team B</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateScore("teamB", currentMatch.scoreB - 1)}
                  disabled={isBusy}
                  className="border px-2 py-1 text-xs"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm font-semibold">
                  {currentMatch.scoreB}
                </span>
                <button
                  type="button"
                  onClick={() => updateScore("teamB", currentMatch.scoreB + 1)}
                  disabled={isBusy}
                  className="border px-2 py-1 text-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {currentMatch ? (
        <div className="mt-3 flex gap-2">
          {canStart ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleStartCourt(court.id);
              }}
              disabled={isBusy}
              className="border px-2 py-1 text-xs"
            >
              {startingCourtId === court.id ? "Starting..." : "Start"}
            </button>
          ) : null}

          {canReset ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleResetCourt(court.id);
              }}
              disabled={isBusy}
              className="border px-2 py-1 text-xs"
            >
              {resettingCourtId === court.id ? "Resetting..." : "Reset"}
            </button>
          ) : null}

          {canEnd ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleEndCourt(court.id);
              }}
              disabled={isBusy}
              className="border px-2 py-1 text-xs"
            >
              {endingCourtId === court.id ? "Ending..." : "End"}
            </button>
          ) : null}
        </div>
      ) : null}

      {activeCourtMenuId === court.id ? (
        <CourtEditMenu
          court={court}
          handleEditCourt={handleEditCourt}
          editCourtName={editCourtName}
          setEditCourtNameProp={setEditCourtNameProp}
          players={players}
          editCourtTeamAPlayerIds={editCourtTeamAPlayerIds}
          editCourtTeamBPlayerIds={editCourtTeamBPlayerIds}
          unavailablePlayerCourtMap={unavailablePlayerCourtMap}
          toggleCourtPlayer={toggleCourtPlayer}
          editCourtError={editCourtError}
          setActiveCourtMenuId={setActiveCourtMenuId}
          setEditCourtName={setEditCourtName}
          setEditCourtTeamAPlayerIds={setEditCourtTeamAPlayerIds}
          setEditCourtTeamBPlayerIds={setEditCourtTeamBPlayerIds}
          setEditCourtError={setEditCourtError}
          handleDeleteCourt={handleDeleteCourt}
          isUpdatingCourt={isUpdatingCourt}
          deletingCourtId={deletingCourtId}
          startingCourtId={startingCourtId}
          resettingCourtId={resettingCourtId}
          endingCourtId={endingCourtId}
          isPlayersLoading={isPlayersLoading}
        />
      ) : null}
    </div>
  );
};

export default CourtCard;
