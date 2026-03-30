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
}) => {
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
    endingCourtId === court.id;

  return (
    <div className="relative rounded border px-3 py-2">
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
