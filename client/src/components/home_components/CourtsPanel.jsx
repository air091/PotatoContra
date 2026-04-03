import { useEffect, useState } from "react";
import CourtCard from "./courts/CourtCard";
import QueueCard from "./courts/QueueCard";

const getAssignedPlayerQueueMap = (queues, excludedQueueId = null) => {
  const assignedPlayerQueueMap = new Map();

  queues.forEach((queue, index) => {
    if (queue.id === excludedQueueId) return;

    [...queue.teamAPlayerIds, ...queue.teamBPlayerIds].forEach((playerId) => {
      assignedPlayerQueueMap.set(playerId, `Queue ${index + 1}`);
    });
  });

  return assignedPlayerQueueMap;
};

const CourtsPanel = ({
  courts,
  setCourts,
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
  queues,
  handleAddQueue,
  handleSaveQueue,
  handleDeleteQueue,
  handleLaunchQueuedMatch,
  availableCourts,
}) => {
  const [timerNow, setTimerNow] = useState(() => Date.now());

  useEffect(() => {
    const hasStartedMatch = courts.some(
      (court) => !!court.currentMatch?.startedAt,
    );

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
      className="w-full border"
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

      {!isCourtsLoading && !courtsError ? (
        <div className="space-y-4">
          <div className="court-cards grid gap-2 bg-surface p-2.5 rounded-[14px] border border-accent">
            <header>
              <h3 className="text-text">Courts</h3>
              <p className="text-stone-400 text-xs">{courts.length} total</p>

              {isCourtsLoading ? <p>Loading courts...</p> : null}
              {!isCourtsLoading && courtsError ? <p>{courtsError}</p> : null}
            </header>

            <div className="flex flex-wrap gap-2.5">
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
                  setCourts={setCourts}
                />
              ))}
                {courts.length >= 0 ? (
                <button
                  type="button"
                  onClick={handleAddCourt}
                  disabled={isCourtSubmitting}
                  className="cursor-pointer rounded border border-dashed px-3 py-2 text-sm text-stone-500 w-61.5 min-h-30"
                >
                  {isCourtSubmitting ? "Adding..." : "Add court"}
                </button>
              ) : null}
            </div>
          </div>

          <div className="queue-cards grid gap-2 bg-surface p-2.5 rounded-[14px] border border-accent">
            {queues.length === 0 ? (
              <button
                type="button"
                onClick={handleAddQueue}
                className="cursor-pointer rounded border border-dashed px-3 py-2 text-sm"
              >
                Add queue
              </button>
            ) : null}

            {queues.map((queue, index) => (
              <QueueCard
                key={queue.id}
                queue={queue}
                queueIndex={index}
                players={players}
                handleSaveQueue={handleSaveQueue}
                handleDeleteQueue={handleDeleteQueue}
                handleLaunchQueuedMatch={handleLaunchQueuedMatch}
                availableCourts={availableCourts}
                unavailablePlayerAssignmentMap={new Map([
                  ...getAssignedPlayerQueueMap(queues, queue.id),
                  ...unavailablePlayerCourtMap,
                ])}
                isPlayersLoading={isPlayersLoading}
              />
            ))}

            {queues.length > 0 ? (
              <button
                type="button"
                onClick={handleAddQueue}
                className="cursor-pointer rounded border border-dashed px-3 py-2 text-sm"
              >
                Add queue
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {!isCourtsLoading && !courtsError && courts.length === 0 ? (
        <p className="mt-3 text-sm">No courts yet.</p>
      ) : null}
    </div>
  );
};

export default CourtsPanel;
