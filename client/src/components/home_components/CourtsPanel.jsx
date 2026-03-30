import { useEffect, useState } from "react";
import CourtCard from "./courts/CourtCard";

const CourtsPanel = ({
  courts,
  isCourtsLoading,
  courtsError,
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
  isCourtSubmitting,
  handleAddCourt,
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
  isPlayersLoading,
}) => {
  const [timerNow, setTimerNow] = useState(() => Date.now());

  useEffect(() => {
    const hasStartedMatch = courts.some((court) => !!court.currentMatch?.startedAt);

    if (!hasStartedMatch) return undefined;

    const intervalId = window.setInterval(() => {
      setTimerNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [courts]);

  return (
    <div
      className="w-full border p-4"
      onClick={() => {
        if (
          isUpdatingCourt ||
          deletingCourtId ||
          startingCourtId ||
          resettingCourtId ||
          endingCourtId
        )
          return;

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
            <CourtCard
              key={court.id}
              court={court}
              timerNow={timerNow}
              openCourtMenu={openCourtMenu}
              activeCourtMenuId={activeCourtMenuId}
              editCourtName={editCourtName}
              setEditCourtNameProp={setEditCourtNameProp}
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
              isPlayersLoading={isPlayersLoading}
            />
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
    </div>
  );
};

export default CourtsPanel;
