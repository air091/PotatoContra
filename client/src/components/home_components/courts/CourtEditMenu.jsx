import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const CourtEditMenu = ({
  court,
  handleEditCourt,
  editCourtName,
  setEditCourtNameProp,
  players,
  editCourtTeamAPlayerIds,
  editCourtTeamBPlayerIds,
  unavailablePlayerCourtMap,
  toggleCourtPlayer,
  editCourtError,
  setActiveCourtMenuId,
  setEditCourtName,
  setEditCourtTeamAPlayerIds,
  setEditCourtTeamBPlayerIds,
  setEditCourtError,
  handleDeleteCourt,
  isUpdatingCourt,
  deletingCourtId,
  startingCourtId,
  resettingCourtId,
  endingCourtId,
  isPlayersLoading,
  anchorRef,
}) => {
  const menuRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const isBusy =
    isUpdatingCourt ||
    deletingCourtId === court.id ||
    startingCourtId === court.id ||
    resettingCourtId === court.id ||
    endingCourtId === court.id;

  const closeMenu = useCallback(() => {
    setActiveCourtMenuId(null);
    setEditCourtName("");
    setEditCourtTeamAPlayerIds([]);
    setEditCourtTeamBPlayerIds([]);
    setEditCourtError("");
  }, [
    setActiveCourtMenuId,
    setEditCourtName,
    setEditCourtTeamAPlayerIds,
    setEditCourtTeamBPlayerIds,
    setEditCourtError,
  ]);

  useLayoutEffect(() => {
    const updateMenuPosition = () => {
      if (!anchorRef?.current || !menuRef.current) return;

      const anchorRect = anchorRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const gap = 8;

      let left = anchorRect.right - menuRect.width;
      left = Math.min(
        Math.max(gap, left),
        Math.max(gap, viewportWidth - menuRect.width - gap),
      );

      let top = anchorRect.bottom + gap;
      const maxTop = viewportHeight - menuRect.height - gap;

      if (top > maxTop) {
        top = Math.max(gap, anchorRect.top - menuRect.height - gap);
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
  }, [anchorRef]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [closeMenu]);

  return createPortal(
    <div className="fixed inset-0 z-999" onClick={closeMenu}>
      <div
        ref={menuRef}
        style={{
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`,
        }}
        className="absolute w-[min(32rem,calc(100vw-1rem))] rounded-2xl border border-border bg-surface p-3 text-text shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <form onSubmit={handleEditCourt} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs text-stone-400">Name</span>
            <input
              type="text"
              value={editCourtName}
              onChange={(event) => setEditCourtNameProp(event.target.value)}
              className="w-full rounded-[10px] border border-border bg-border px-2 py-1.5 text-sm text-text outline-none transition-colors focus:border-primary"
              disabled={isBusy}
              autoFocus
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-2 text-xs font-semibold text-stone-400">
                Team A
              </p>
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-border bg-border p-2">
                {players.map((player) => {
                  const isOnTeamA = editCourtTeamAPlayerIds.includes(player.id);
                  const isOnTeamB = editCourtTeamBPlayerIds.includes(player.id);
                  const assignedCourtName = unavailablePlayerCourtMap.get(
                    player.id,
                  );
                  const isUnavailable = !!assignedCourtName;

                  return (
                    <label
                      key={`${court.id}-team-a-option-${player.id}`}
                      className={`flex items-center justify-between gap-2 rounded px-1 py-0.5 text-xs ${
                        isOnTeamA
                          ? "border border-primary/50 bg-primary/15 text-text"
                          : isOnTeamB
                            ? "border border-border bg-accent text-stone-300"
                            : isUnavailable
                              ? "border border-border bg-secondary text-stone-500"
                              : "border border-transparent text-text"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isOnTeamA}
                          onChange={() => toggleCourtPlayer("A", player.id)}
                          disabled={isBusy || isPlayersLoading || isUnavailable}
                          className="accent-primary"
                        />
                        <span>{player.name}</span>
                      </span>
                      {isOnTeamA ? (
                        <span className="rounded border border-primary/50 bg-primary/15 px-1 py-0.5 text-[10px] text-primary">
                          Team A
                        </span>
                      ) : null}
                      {!isOnTeamA && isOnTeamB ? (
                        <span className="rounded border border-border px-1 py-0.5 text-[10px] text-stone-300">
                          Team B
                        </span>
                      ) : null}
                      {!isOnTeamA && !isOnTeamB && isUnavailable ? (
                        <span className="rounded border border-border px-1 py-0.5 text-[10px] text-stone-400">
                          On {assignedCourtName}
                        </span>
                      ) : null}
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-stone-400">
                Team B
              </p>
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-border bg-border p-2">
                {players.map((player) => {
                  const isOnTeamA = editCourtTeamAPlayerIds.includes(player.id);
                  const isOnTeamB = editCourtTeamBPlayerIds.includes(player.id);
                  const assignedCourtName = unavailablePlayerCourtMap.get(
                    player.id,
                  );
                  const isUnavailable = !!assignedCourtName;

                  return (
                    <label
                      key={`${court.id}-team-b-option-${player.id}`}
                      className={`flex items-center justify-between gap-2 rounded px-1 py-0.5 text-xs ${
                        isOnTeamB
                          ? "border border-primary/50 bg-primary/15 text-text"
                          : isOnTeamA
                            ? "border border-border bg-accent text-stone-300"
                            : isUnavailable
                              ? "border border-border bg-secondary text-stone-500"
                              : "border border-transparent text-text"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isOnTeamB}
                          onChange={() => toggleCourtPlayer("B", player.id)}
                          disabled={isBusy || isPlayersLoading || isUnavailable}
                          className="accent-primary"
                        />
                        <span>{player.name}</span>
                      </span>
                      {isOnTeamB ? (
                        <span className="rounded border border-primary/50 bg-primary/15 px-1 py-0.5 text-[10px] text-primary">
                          Team B
                        </span>
                      ) : null}
                      {!isOnTeamB && isOnTeamA ? (
                        <span className="rounded border border-border px-1 py-0.5 text-[10px] text-stone-300">
                          Team A
                        </span>
                      ) : null}
                      {!isOnTeamA && !isOnTeamB && isUnavailable ? (
                        <span className="rounded border border-border px-1 py-0.5 text-[10px] text-stone-400">
                          On {assignedCourtName}
                        </span>
                      ) : null}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {editCourtError ? (
            <p className="text-xs text-error">{editCourtError}</p>
          ) : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeMenu}
              disabled={isBusy}
              className="rounded-[10px] border border-border bg-border px-2 py-1 text-xs text-text transition-colors hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleDeleteCourt(court.id)}
              disabled={isBusy}
              className="rounded-[10px] border border-error bg-error/15 px-2 py-1 text-xs text-error transition-colors hover:bg-error/25"
            >
              {deletingCourtId === court.id ? "Deleting..." : "Delete"}
            </button>
            <button
              type="submit"
              disabled={isBusy || isPlayersLoading || players.length === 0}
              className="rounded-[10px] border border-primary bg-primary px-2 py-1 text-xs font-medium text-accent transition-opacity hover:opacity-90"
            >
              {isUpdatingCourt ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default CourtEditMenu;
