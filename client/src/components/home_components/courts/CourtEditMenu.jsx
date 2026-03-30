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
              {players.map((player) => {
                const isOnTeamA = editCourtTeamAPlayerIds.includes(player.id);
                const isOnTeamB = editCourtTeamBPlayerIds.includes(player.id);
                const assignedCourtName = unavailablePlayerCourtMap.get(player.id);
                const isUnavailable = !!assignedCourtName;

                return (
                  <label
                    key={`${court.id}-team-a-option-${player.id}`}
                    className={`flex items-center justify-between gap-2 rounded px-1 py-0.5 text-xs ${
                      isOnTeamA
                        ? "border bg-stone-100"
                        : isOnTeamB
                          ? "border border-stone-300"
                          : isUnavailable
                            ? "border border-stone-200 bg-stone-50 text-stone-400"
                            : ""
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isOnTeamA}
                        onChange={() => toggleCourtPlayer("A", player.id)}
                        disabled={isBusy || isPlayersLoading || isUnavailable}
                      />
                      <span>{player.name}</span>
                    </span>
                    {isOnTeamA ? (
                      <span className="border px-1 py-0.5 text-[10px]">Team A</span>
                    ) : null}
                    {!isOnTeamA && isOnTeamB ? (
                      <span className="border px-1 py-0.5 text-[10px]">Team B</span>
                    ) : null}
                    {!isOnTeamA && !isOnTeamB && isUnavailable ? (
                      <span className="border px-1 py-0.5 text-[10px]">
                        On {assignedCourtName}
                      </span>
                    ) : null}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold">Team B</p>
            <div className="max-h-40 space-y-2 overflow-y-auto border p-2">
              {players.map((player) => {
                const isOnTeamA = editCourtTeamAPlayerIds.includes(player.id);
                const isOnTeamB = editCourtTeamBPlayerIds.includes(player.id);
                const assignedCourtName = unavailablePlayerCourtMap.get(player.id);
                const isUnavailable = !!assignedCourtName;

                return (
                  <label
                    key={`${court.id}-team-b-option-${player.id}`}
                    className={`flex items-center justify-between gap-2 rounded px-1 py-0.5 text-xs ${
                      isOnTeamB
                        ? "border bg-stone-100"
                        : isOnTeamA
                          ? "border border-stone-300"
                          : isUnavailable
                            ? "border border-stone-200 bg-stone-50 text-stone-400"
                            : ""
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isOnTeamB}
                        onChange={() => toggleCourtPlayer("B", player.id)}
                        disabled={isBusy || isPlayersLoading || isUnavailable}
                      />
                      <span>{player.name}</span>
                    </span>
                    {isOnTeamB ? (
                      <span className="border px-1 py-0.5 text-[10px]">Team B</span>
                    ) : null}
                    {!isOnTeamB && isOnTeamA ? (
                      <span className="border px-1 py-0.5 text-[10px]">Team A</span>
                    ) : null}
                    {!isOnTeamA && !isOnTeamB && isUnavailable ? (
                      <span className="border px-1 py-0.5 text-[10px]">
                        On {assignedCourtName}
                      </span>
                    ) : null}
                  </label>
                );
              })}
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
