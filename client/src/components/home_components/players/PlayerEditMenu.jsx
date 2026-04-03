import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import PlayerHistoryModal from "./PlayerHistoryModal";

const PlayerEditMenu = ({
  player,
  handleEditPlayer,
  editPlayerName,
  setEditPlayerName,
  editSkillLevel,
  setEditSkillLevel,
  editPaymentStatus,
  setEditPaymentStatus,
  editPlayerError,
  setActivePlayerMenuId,
  setEditPlayerError,
  handleDeletePlayer,
  isUpdatingPlayer,
  deletingPlayerId,
  matchesPlayed,
  isHistoryOpen,
  setIsHistoryOpen,
  anchorRef,
}) => {
  const menuRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const closeMenu = useCallback(() => {
    setActivePlayerMenuId(null);
    setEditPlayerError("");
  }, [setActivePlayerMenuId, setEditPlayerError]);

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
        if (isHistoryOpen) {
          setIsHistoryOpen(false);
          return;
        }

        closeMenu();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [closeMenu, isHistoryOpen, setIsHistoryOpen]);

  return createPortal(
    <div className="fixed inset-0 z-[999]" onClick={closeMenu}>
      <div
        ref={menuRef}
        style={{
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`,
        }}
        className="absolute w-64 rounded-[16px] border border-border bg-surface p-3 text-text shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
      <form onSubmit={handleEditPlayer} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs text-stone-400">Name</span>
          <input
            type="text"
            value={editPlayerName}
            onChange={(event) => setEditPlayerName(event.target.value)}
            className="w-full rounded-[10px] border border-border bg-border px-2 py-1.5 text-sm text-text outline-none transition-colors focus:border-primary"
            disabled={deletingPlayerId === player.id}
            autoFocus
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs text-stone-400">Skill</span>
          <select
            value={editSkillLevel}
            onChange={(event) => setEditSkillLevel(event.target.value)}
            className="w-full rounded-[10px] border border-border bg-border px-2 py-1.5 text-sm text-text outline-none transition-colors focus:border-primary"
            disabled={deletingPlayerId === player.id}
          >
            <option value="beginner">beginner</option>
            <option value="intermediate">intermediate</option>
            <option value="expert">expert</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs text-text">
          <input
            type="checkbox"
            checked={editPaymentStatus}
            onChange={(event) => setEditPaymentStatus(event.target.checked)}
            disabled={deletingPlayerId === player.id}
            className="accent-primary"
          />
          <span>Payment received</span>
        </label>

        <div className="rounded-[10px] border border-border bg-border p-2">
          <p className="text-xs font-semibold">
            Matches played: <span className="font-normal">{matchesPlayed}</span>
          </p>
        </div>

        {editPlayerError ? (
          <p className="text-xs text-error">{editPlayerError}</p>
        ) : null}

        <button
          type="button"
          onClick={() => {
            setIsHistoryOpen(true);
          }}
          disabled={isUpdatingPlayer || deletingPlayerId === player.id}
          className="w-full rounded-[10px] border border-border bg-border px-2 py-1.5 text-xs text-text transition-colors hover:bg-accent"
        >
          View History
        </button>

        <PlayerHistoryModal
          playerId={player.id}
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={closeMenu}
            disabled={isUpdatingPlayer || deletingPlayerId === player.id}
            className="rounded-[10px] border border-border bg-border px-2 py-1 text-xs text-text transition-colors hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleDeletePlayer(player.id)}
            disabled={isUpdatingPlayer || deletingPlayerId === player.id}
            className="rounded-[10px] border border-error bg-error/15 px-2 py-1 text-xs text-error transition-colors hover:bg-error/25"
          >
            {deletingPlayerId === player.id ? "Deleting..." : "Delete"}
          </button>
          <button
            type="submit"
            disabled={isUpdatingPlayer || deletingPlayerId === player.id}
            className="rounded-[10px] border border-primary bg-primary px-2 py-1 text-xs font-medium text-accent transition-opacity hover:opacity-90"
          >
            {isUpdatingPlayer ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
      </div>
    </div>,
    document.body,
  );
};

export default PlayerEditMenu;
