import { useEffect, useState } from "react";
import { IoEllipsisVertical } from "react-icons/io5";
import formatElapsedTime from "./formatElapsedTime";

const QueueCard = ({
  queue,
  queueIndex,
  players,
  handleSaveQueue,
  handleDeleteQueue,
  handleLaunchQueuedMatch,
  availableCourts,
  unavailablePlayerAssignmentMap,
  isPlayersLoading,
}) => {
  const [isQueueMenuOpen, setIsQueueMenuOpen] = useState(false);
  const [timerNow, setTimerNow] = useState(() => Date.now());
  const [draftTeamAPlayerIds, setDraftTeamAPlayerIds] = useState(
    queue.teamAPlayerIds,
  );
  const [draftTeamBPlayerIds, setDraftTeamBPlayerIds] = useState(
    queue.teamBPlayerIds,
  );
  const [draftSelectedCourtId, setDraftSelectedCourtId] = useState(
    queue.selectedCourtId,
  );
  const totalQueued = queue.teamAPlayerIds.length + queue.teamBPlayerIds.length;
  const teamAPlayers = players.filter((player) =>
    queue.teamAPlayerIds.includes(player.id),
  );
  const teamBPlayers = players.filter((player) =>
    queue.teamBPlayerIds.includes(player.id),
  );
  const elapsedTime = formatElapsedTime(queue.queuedAt, timerNow);
  const canSave =
    draftTeamAPlayerIds.length > 0 &&
    draftTeamBPlayerIds.length > 0 &&
    !queue.isSubmitting;
  const canStart = !!queue.queuedAt && !!queue.selectedCourtId && !queue.isSubmitting;
  const selectedCourt = availableCourts.find(
    (court) => String(court.id) === queue.selectedCourtId,
  );

  useEffect(() => {
    if (!queue.queuedAt) return undefined;

    const intervalId = window.setInterval(() => {
      setTimerNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [queue.queuedAt]);

  useEffect(() => {
    if (isQueueMenuOpen) {
      setDraftTeamAPlayerIds(queue.teamAPlayerIds);
      setDraftTeamBPlayerIds(queue.teamBPlayerIds);
      setDraftSelectedCourtId(queue.selectedCourtId);
    }
  }, [
    isQueueMenuOpen,
    queue.teamAPlayerIds,
    queue.teamBPlayerIds,
    queue.selectedCourtId,
  ]);

  const toggleDraftPlayer = (teamKey, playerId) => {
    if (teamKey === "A") {
      setDraftTeamAPlayerIds((currentPlayerIds) =>
        currentPlayerIds.includes(playerId)
          ? currentPlayerIds.filter(
              (currentPlayerId) => currentPlayerId !== playerId,
            )
          : [...currentPlayerIds, playerId],
      );
      setDraftTeamBPlayerIds((currentPlayerIds) =>
        currentPlayerIds.filter(
          (currentPlayerId) => currentPlayerId !== playerId,
        ),
      );
      return;
    }

    setDraftTeamBPlayerIds((currentPlayerIds) =>
      currentPlayerIds.includes(playerId)
        ? currentPlayerIds.filter(
            (currentPlayerId) => currentPlayerId !== playerId,
          )
        : [...currentPlayerIds, playerId],
    );
    setDraftTeamAPlayerIds((currentPlayerIds) =>
      currentPlayerIds.filter(
        (currentPlayerId) => currentPlayerId !== playerId,
      ),
    );
  };

  return (
    <div className="relative border border-accent bg-border px-3 py-2 w-61.5 rounded-[10px]">
      <div className="flex items-start justify-between gap-3">
        <div className="text-text flex items-center gap-x-2.5">
          <p className="text-[18px] font-md leading-tight text-text">
            Queue {queueIndex + 1}
          </p>
          {/* <p className="text-xs leading-tight">
            {queue.queuedAt ? "Queued" : `${totalQueued} players queued`}
          </p> */}
          {elapsedTime ? (
            <p className="text-[12px] text-stone-400 leading-tight">{elapsedTime}</p>
          ) : null}
        </div>

        <div>
          {queue.queuedAt ? (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-semibold">
                Court: {selectedCourt?.name ?? "Unavailable"}
              </span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleLaunchQueuedMatch(queue.id);
                }}
                disabled={!canStart}
                className="border px-2 py-1 text-xs"
              >
                {queue.isSubmitting ? "Starting..." : "Start"}
              </button>
            </div>
          ) : null}

          <button
          type="button"
          className="cursor-pointer text-text"
          onClick={(event) => {
            event.stopPropagation();
            setIsQueueMenuOpen(!isQueueMenuOpen);
          }}
          >
            <IoEllipsisVertical />
          </button>
        </div>
      </div>

      <div className="flex p-1 w-full">
        <div className="w-full grid justify-start gap-y-1">
          <p className="text-[14px] font-semibold text-text">Team A</p>
          {teamAPlayers.length ? (
            <div className="w-full flex flex-wrap flex-2 gap-1 justify-start">
              {teamAPlayers.map((player) => (
                <span
                  key={`queue-preview-team-a-${player.id}`}
                  className="px-2 w-fit py-0.5 text-[14px] bg-primary text-accent font-md rounded-xs"
                >
                  {player.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-text">No players yet.</p>
          )}
        </div>

        <div className="w-full grid justify-end gap-y-1">
          <p className="text-[14px] font-semibold text-text text-end">Team B</p>
          {teamBPlayers.length ? (
            <div className="flex flex-wrap flex-2 gap-1 justify-end">
              {teamBPlayers.map((player) => (
                <span
                  key={`queue-preview-team-b-${player.id}`}
                  className="px-2 w-fit py-0.5 text-[14px] bg-primary text-accent font-md rounded-xs"
                >
                  {player.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-text">No players yet.</p>
          )}
        </div>
      </div>

      

      {isQueueMenuOpen && (
        <div
          className="absolute right-0 top-12 z-10 w-md max-w-sm border bg-white p-3"
          onClick={(event) => event.stopPropagation()}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const didSave = await handleSaveQueue(queue.id, {
                teamAPlayerIds: draftTeamAPlayerIds,
                teamBPlayerIds: draftTeamBPlayerIds,
                selectedCourtId: draftSelectedCourtId,
              });

              if (didSave) {
                setIsQueueMenuOpen(false);
              }
            }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-2 text-xs font-semibold">Team A</p>
                <div className="max-h-40 space-y-2 overflow-y-auto border p-2">
                  {players.map((player) => {
                    const isOnTeamA = draftTeamAPlayerIds.includes(player.id);
                    const isOnTeamB = draftTeamBPlayerIds.includes(player.id);
                    const assignedLabel = unavailablePlayerAssignmentMap.get(
                      player.id,
                    );
                    const isUnavailable = !!assignedLabel;

                    return (
                      <label
                        key={`queue-team-a-${player.id}`}
                        className={`flex items-center justify-between gap-2 rounded px-1 py-0.5 text-xs cursor-pointer ${
                          isOnTeamA
                            ? "border bg-stone-100"
                            : isOnTeamB
                              ? "border border-stone-300"
                              : isUnavailable
                                ? "border border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed"
                                : ""
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isOnTeamA}
                            onChange={() => toggleDraftPlayer("A", player.id)}
                            disabled={
                              queue.isSubmitting || isPlayersLoading || isUnavailable
                            }
                          />
                          <span>{player.name}</span>
                        </span>
                        {isOnTeamA ? (
                          <span className="border px-1 py-0.5 text-[10px]">
                            A
                          </span>
                        ) : null}
                        {!isOnTeamA && isOnTeamB ? (
                          <span className="border px-1 py-0.5 text-[10px]">
                            B
                          </span>
                        ) : null}
                        {!isOnTeamA && !isOnTeamB && isUnavailable ? (
                          <span className="border px-1 py-0.5 text-[10px]">
                            {assignedLabel}
                          </span>
                        ) : null}
                      </label>
                    );
                  })}
                </div>
                {draftTeamAPlayerIds.length > 0 && (
                  <div className="mt-2 text-xs font-semibold text-center">
                    {draftTeamAPlayerIds.length} player
                    {draftTeamAPlayerIds.length !== 1 ? "s" : ""}
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold">Team B</p>
                <div className="max-h-40 space-y-2 overflow-y-auto border p-2">
                  {players.map((player) => {
                    const isOnTeamA = draftTeamAPlayerIds.includes(player.id);
                    const isOnTeamB = draftTeamBPlayerIds.includes(player.id);
                    const assignedLabel = unavailablePlayerAssignmentMap.get(
                      player.id,
                    );
                    const isUnavailable = !!assignedLabel;

                    return (
                      <label
                        key={`queue-team-b-${player.id}`}
                        className={`flex items-center justify-between gap-2 rounded px-1 py-0.5 text-xs cursor-pointer ${
                          isOnTeamB
                            ? "border bg-stone-100"
                            : isOnTeamA
                              ? "border border-stone-300"
                              : isUnavailable
                                ? "border border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed"
                                : ""
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isOnTeamB}
                            onChange={() => toggleDraftPlayer("B", player.id)}
                            disabled={
                              queue.isSubmitting || isPlayersLoading || isUnavailable
                            }
                          />
                          <span>{player.name}</span>
                        </span>
                        {isOnTeamB ? (
                          <span className="border px-1 py-0.5 text-[10px]">
                            B
                          </span>
                        ) : null}
                        {!isOnTeamB && isOnTeamA ? (
                          <span className="border px-1 py-0.5 text-[10px]">
                            A
                          </span>
                        ) : null}
                        {!isOnTeamA && !isOnTeamB && isUnavailable ? (
                          <span className="border px-1 py-0.5 text-[10px]">
                            {assignedLabel}
                          </span>
                        ) : null}
                      </label>
                    );
                  })}
                </div>
                {draftTeamBPlayerIds.length > 0 && (
                  <div className="mt-2 text-xs font-semibold text-center">
                    {draftTeamBPlayerIds.length} player
                    {draftTeamBPlayerIds.length !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label
                className="mb-2 block text-xs font-semibold"
                htmlFor={`queue-court-select-${queue.id}`}
              >
                Court
              </label>
              <select
                id={`queue-court-select-${queue.id}`}
                value={draftSelectedCourtId ?? ""}
                onChange={(event) =>
                  setDraftSelectedCourtId(event.target.value || null)
                }
                disabled={availableCourts.length === 0 || queue.isSubmitting}
                className="w-full border px-2 py-2 text-xs"
              >
                {availableCourts.length === 0 ? (
                  <option value="">No available courts</option>
                ) : null}
                {availableCourts.map((court) => (
                  <option key={court.id} value={String(court.id)}>
                    {court.name}
                  </option>
                ))}
              </select>
            </div>

            {queue.error ? (
              <p className="text-xs text-red-600">{queue.error}</p>
            ) : null}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraftTeamAPlayerIds(queue.teamAPlayerIds);
                  setDraftTeamBPlayerIds(queue.teamBPlayerIds);
                  setDraftSelectedCourtId(queue.selectedCourtId);
                  setIsQueueMenuOpen(false);
                }}
                disabled={queue.isSubmitting}
                className="border px-3 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteQueue(queue.id)}
                disabled={queue.isSubmitting}
                className="border px-3 py-2 text-xs"
              >
                Delete
              </button>
              <button
                type="submit"
                disabled={!canSave}
                className="border px-3 py-2 text-xs"
              >
                {queue.isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {queue.error ? (
        <p className="mt-3 text-xs text-red-600">{queue.error}</p>
      ) : null}
    </div>
  );
};

export default QueueCard;
