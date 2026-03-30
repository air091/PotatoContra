import PlayerHistoryModal from "./PlayerHistoryModal";

const PlayerEditMenu = ({
  player,
  selectedSport,
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
}) => {
  return (
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
            onChange={(event) => setEditPlayerName(event.target.value)}
            className="w-full border px-2 py-1 text-sm"
            disabled={deletingPlayerId === player.id}
            autoFocus
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs">Skill</span>
          <select
            value={editSkillLevel}
            onChange={(event) => setEditSkillLevel(event.target.value)}
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
            onChange={(event) => setEditPaymentStatus(event.target.checked)}
            disabled={deletingPlayerId === player.id}
          />
          <span>Payment received</span>
        </label>

        <div className="rounded bg-gray-50 p-2">
          <p className="text-xs font-semibold">
            Matches played: <span className="font-normal">{matchesPlayed}</span>
          </p>
        </div>

        {editPlayerError ? <p className="text-xs">{editPlayerError}</p> : null}

        <button
          type="button"
          onClick={() => {
            setIsHistoryOpen(true);
          }}
          disabled={isUpdatingPlayer || deletingPlayerId === player.id}
          className="w-full border px-2 py-1 text-xs hover:bg-blue-50"
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
            onClick={() => {
              setActivePlayerMenuId(null);
              setEditPlayerError("");
            }}
            disabled={isUpdatingPlayer || deletingPlayerId === player.id}
            className="border px-2 py-1 text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleDeletePlayer(player.id)}
            disabled={isUpdatingPlayer || deletingPlayerId === player.id}
            className="border px-2 py-1 text-xs"
          >
            {deletingPlayerId === player.id ? "Deleting..." : "Delete"}
          </button>
          <button
            type="submit"
            disabled={isUpdatingPlayer || deletingPlayerId === player.id}
            className="border px-2 py-1 text-xs"
          >
            {isUpdatingPlayer ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlayerEditMenu;
