import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
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
  const menuButtonRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [draftTeamAPlayerIds, setDraftTeamAPlayerIds] = useState(
    queue.teamAPlayerIds,
  );
  const [draftTeamBPlayerIds, setDraftTeamBPlayerIds] = useState(
    queue.teamBPlayerIds,
  );
  const [draftSelectedCourtId, setDraftSelectedCourtId] = useState(
    queue.selectedCourtId,
  );
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
  const canStart =
    !!queue.queuedAt && !!queue.selectedCourtId && !queue.isSubmitting;
  const selectedCourt = availableCourts.find(
    (court) => String(court.id) === queue.selectedCourtId,
  );
  const closeQueueMenu = useCallback(() => {
    setDraftTeamAPlayerIds(queue.teamAPlayerIds);
    setDraftTeamBPlayerIds(queue.teamBPlayerIds);
    setDraftSelectedCourtId(queue.selectedCourtId);
    setIsQueueMenuOpen(false);
  }, [queue.selectedCourtId, queue.teamAPlayerIds, queue.teamBPlayerIds]);

  useEffect(() => {
    if (!queue.queuedAt) return undefined;

    const intervalId = window.setInterval(() => {
      setTimerNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [queue.queuedAt]);

  useLayoutEffect(() => {
    if (!isQueueMenuOpen) return undefined;

    const updateMenuPosition = () => {
      if (!menuButtonRef.current || !menuRef.current) return;

      const anchorRect = menuButtonRef.current.getBoundingClientRect();
      const currentMenuRect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const gap = 8;

      let left = anchorRect.right - currentMenuRect.width;
      left = Math.min(
        Math.max(gap, left),
        Math.max(gap, viewportWidth - currentMenuRect.width - gap),
      );

      let top = anchorRect.bottom + gap;
      const maxTop = viewportHeight - currentMenuRect.height - gap;

      if (top > maxTop) {
        top = Math.max(gap, anchorRect.top - currentMenuRect.height - gap);
      }

      setMenuPosition({ top, left });
    };

    updateMenuPosition();

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isQueueMenuOpen]);

  useEffect(() => {
    if (!isQueueMenuOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeQueueMenu();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [closeQueueMenu, isQueueMenuOpen]);

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
    <div className="relative border border-accent bg-border p-2 w-67 rounded-[10px]">
      <div className="flex items-center justify-between p-1.5">
        <div className="text-text">
          <p className="text-[18px] font-md leading-tight text-text">
            Queue {queueIndex + 1}
          </p>
          {/* <p className="text-xs leading-tight">
            {queue.queuedAt ? "Queued" : `${totalQueued} players queued`}
          </p> */}
          {elapsedTime ? (
            <p className="text-[12px] text-stone-400 leading-tight">
              {elapsedTime} | {selectedCourt?.name ?? "Unavailable"}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-x-1.5">
          {queue.queuedAt ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleLaunchQueuedMatch(queue.id);
              }}
              disabled={!canStart}
              className="px-2 py-1 text-xs block bg-success rounded-xs"
            >
              {queue.isSubmitting ? "Transferring..." : "Transfer"}
            </button>
          ) : null}

          <button
            ref={menuButtonRef}
            type="button"
            className="cursor-pointer text-text"
            onClick={(event) => {
              event.stopPropagation();
              if (isQueueMenuOpen) {
                closeQueueMenu();
                return;
              }

              setDraftTeamAPlayerIds(queue.teamAPlayerIds);
              setDraftTeamBPlayerIds(queue.teamBPlayerIds);
              setDraftSelectedCourtId(queue.selectedCourtId);
              setIsQueueMenuOpen(true);
            }}
          >
            <IoEllipsisVertical />
          </button>
        </div>
      </div>

      <div className="flex p-1.5 w-full">
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

      {isQueueMenuOpen &&
        createPortal(
          <div className="fixed inset-0 z-999" onClick={closeQueueMenu}>
            <div
              ref={menuRef}
              style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
              className="absolute w-[min(32rem,calc(100vw-1rem))] rounded-2xl border border-border bg-surface p-3 text-text shadow-2xl"
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
                    <p className="mb-2 text-xs font-semibold text-stone-400">
                      Team A
                    </p>
                    <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-border bg-border p-2">
                      {players.map((player) => {
                        const isOnTeamA = draftTeamAPlayerIds.includes(
                          player.id,
                        );
                        const isOnTeamB = draftTeamBPlayerIds.includes(
                          player.id,
                        );
                        const assignedLabel =
                          unavailablePlayerAssignmentMap.get(player.id);
                        const isUnavailable = !!assignedLabel;

                        return (
                          <label
                            key={`queue-team-a-${player.id}`}
                            className={`flex items-center justify-between gap-2 rounded px-1 py-0.5 text-xs cursor-pointer ${
                              isOnTeamA
                                ? "border border-primary/50 bg-primary/15 text-text"
                                : isOnTeamB
                                  ? "border border-border bg-accent text-stone-300"
                                  : isUnavailable
                                    ? "border border-border bg-secondary text-stone-500 cursor-not-allowed"
                                    : "border border-transparent text-text"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isOnTeamA}
                                onChange={() =>
                                  toggleDraftPlayer("A", player.id)
                                }
                                disabled={
                                  queue.isSubmitting ||
                                  isPlayersLoading ||
                                  isUnavailable
                                }
                                className="accent-primary"
                              />
                              <span>{player.name}</span>
                            </span>
                            {isOnTeamA ? (
                              <span className="rounded border border-primary/50 bg-primary/15 px-1 py-0.5 text-[10px] text-primary">
                                A
                              </span>
                            ) : null}
                            {!isOnTeamA && isOnTeamB ? (
                              <span className="rounded border border-border px-1 py-0.5 text-[10px] text-stone-300">
                                B
                              </span>
                            ) : null}
                            {!isOnTeamA && !isOnTeamB && isUnavailable ? (
                              <span className="rounded border border-border px-1 py-0.5 text-[10px] text-stone-400">
                                {assignedLabel}
                              </span>
                            ) : null}
                          </label>
                        );
                      })}
                    </div>
                    {draftTeamAPlayerIds.length > 0 && (
                      <div className="mt-2 text-center text-xs font-semibold text-stone-300">
                        {draftTeamAPlayerIds.length} player
                        {draftTeamAPlayerIds.length !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold text-stone-400">
                      Team B
                    </p>
                    <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-border bg-border p-2">
                      {players.map((player) => {
                        const isOnTeamA = draftTeamAPlayerIds.includes(
                          player.id,
                        );
                        const isOnTeamB = draftTeamBPlayerIds.includes(
                          player.id,
                        );
                        const assignedLabel =
                          unavailablePlayerAssignmentMap.get(player.id);
                        const isUnavailable = !!assignedLabel;

                        return (
                          <label
                            key={`queue-team-b-${player.id}`}
                            className={`flex items-center justify-between gap-2 rounded px-1 py-0.5 text-xs cursor-pointer ${
                              isOnTeamB
                                ? "border border-primary/50 bg-primary/15 text-text"
                                : isOnTeamA
                                  ? "border border-border bg-accent text-stone-300"
                                  : isUnavailable
                                    ? "border border-border bg-secondary text-stone-500 cursor-not-allowed"
                                    : "border border-transparent text-text"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isOnTeamB}
                                onChange={() =>
                                  toggleDraftPlayer("B", player.id)
                                }
                                disabled={
                                  queue.isSubmitting ||
                                  isPlayersLoading ||
                                  isUnavailable
                                }
                                className="accent-primary"
                              />
                              <span>{player.name}</span>
                            </span>
                            {isOnTeamB ? (
                              <span className="rounded border border-primary/50 bg-primary/15 px-1 py-0.5 text-[10px] text-primary">
                                B
                              </span>
                            ) : null}
                            {!isOnTeamB && isOnTeamA ? (
                              <span className="rounded border border-border px-1 py-0.5 text-[10px] text-stone-300">
                                A
                              </span>
                            ) : null}
                            {!isOnTeamA && !isOnTeamB && isUnavailable ? (
                              <span className="rounded border border-border px-1 py-0.5 text-[10px] text-stone-400">
                                {assignedLabel}
                              </span>
                            ) : null}
                          </label>
                        );
                      })}
                    </div>
                    {draftTeamBPlayerIds.length > 0 && (
                      <div className="mt-2 text-center text-xs font-semibold text-stone-300">
                        {draftTeamBPlayerIds.length} player
                        {draftTeamBPlayerIds.length !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    className="mb-2 block text-xs font-semibold text-stone-400"
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
                    disabled={
                      availableCourts.length === 0 || queue.isSubmitting
                    }
                    className="w-full rounded-[10px] border border-border bg-border px-2 py-2 text-xs text-text outline-none transition-colors focus:border-primary"
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
                  <p className="text-xs text-error">{queue.error}</p>
                ) : null}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeQueueMenu}
                    disabled={queue.isSubmitting}
                    className="rounded-[10px] border border-border bg-border px-3 py-2 text-xs text-text transition-colors hover:bg-accent"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQueue(queue.id)}
                    disabled={queue.isSubmitting}
                    className="rounded-[10px] border border-error bg-error/15 px-3 py-2 text-xs text-error transition-colors hover:bg-error/25"
                  >
                    Delete
                  </button>
                  <button
                    type="submit"
                    disabled={!canSave}
                    className="rounded-[10px] border border-primary bg-primary px-3 py-2 text-xs font-medium text-accent transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {queue.isSubmitting ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {queue.error ? (
        <p className="mt-1.5 text-xs text-error">{queue.error}</p>
      ) : null}
    </div>
  );
};

export default QueueCard;
