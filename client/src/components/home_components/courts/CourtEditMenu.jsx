const CourtEditMenu = ({
  court,
  handleEditCourt,
  editCourtName,
  setEditCourtNameProp,
  players,
  editCourtTeamAPlayerIds,
  editCourtTeamBPlayerIds,
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
}) => {
  const isBusy =
    isUpdatingCourt ||
    deletingCourtId === court.id ||
    startingCourtId === court.id ||
    resettingCourtId === court.id ||
    endingCourtId === court.id;

  return (
    <div
      className="absolute right-0 top-8 z-10 w-md border bg-white p-3"
      onClick={(event) => event.stopPropagation()}
    >
      <form onSubmit={handleEditCourt} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs">Name</span>
          <input
            type="text"
            value={editCourtName}
            onChange={(event) => setEditCourtNameProp(event.target.value)}
            className="w-full border px-2 py-1 text-sm"
            disabled={isBusy}
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
                  className={`flex items-center justify-between gap-2 rounded px-1 py-0.5 text-xs ${
                    editCourtTeamAPlayerIds.includes(player.id)
                      ? "border bg-stone-100"
                      : editCourtTeamBPlayerIds.includes(player.id)
                        ? "border border-stone-300"
                        : ""
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editCourtTeamAPlayerIds.includes(player.id)}
                      onChange={() => toggleCourtPlayer("A", player.id)}
                      disabled={isBusy || isPlayersLoading}
                    />
                    <span>{player.name}</span>
                  </span>
                  {editCourtTeamAPlayerIds.includes(player.id) ? (
                    <span className="border px-1 py-0.5 text-[10px]">Team A</span>
                  ) : null}
                  {!editCourtTeamAPlayerIds.includes(player.id) &&
                  editCourtTeamBPlayerIds.includes(player.id) ? (
                    <span className="border px-1 py-0.5 text-[10px]">Team B</span>
                  ) : null}
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
                  className={`flex items-center justify-between gap-2 rounded px-1 py-0.5 text-xs ${
                    editCourtTeamBPlayerIds.includes(player.id)
                      ? "border bg-stone-100"
                      : editCourtTeamAPlayerIds.includes(player.id)
                        ? "border border-stone-300"
                        : ""
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editCourtTeamBPlayerIds.includes(player.id)}
                      onChange={() => toggleCourtPlayer("B", player.id)}
                      disabled={isBusy || isPlayersLoading}
                    />
                    <span>{player.name}</span>
                  </span>
                  {editCourtTeamBPlayerIds.includes(player.id) ? (
                    <span className="border px-1 py-0.5 text-[10px]">Team B</span>
                  ) : null}
                  {!editCourtTeamBPlayerIds.includes(player.id) &&
                  editCourtTeamAPlayerIds.includes(player.id) ? (
                    <span className="border px-1 py-0.5 text-[10px]">Team A</span>
                  ) : null}
                </label>
              ))}
            </div>
          </div>
        </div>

        {editCourtError ? <p className="text-xs">{editCourtError}</p> : null}

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
            disabled={isBusy}
            className="border px-2 py-1 text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleDeleteCourt(court.id)}
            disabled={isBusy}
            className="border px-2 py-1 text-xs"
          >
            {deletingCourtId === court.id ? "Deleting..." : "Delete"}
          </button>
          <button
            type="submit"
            disabled={isBusy || isPlayersLoading || players.length === 0}
            className="border px-2 py-1 text-xs"
          >
            {isUpdatingCourt ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourtEditMenu;
