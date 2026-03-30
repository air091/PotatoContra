import { IoEllipsisVertical } from "react-icons/io5";

const CourtsPanel = ({
  courts,
  isCourtsLoading,
  courtsError,
  isUpdatingCourt,
  deletingCourtId,
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
  toggleCourtPlayer,
  editCourtError,
  handleDeleteCourt,
  handleEditCourt,
  isPlayersLoading,
}) => {
  return (
    <div
      className="w-full border p-4"
      onClick={() => {
        if (isUpdatingCourt || deletingCourtId) return;

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
            <div key={court.id} className="relative rounded border px-3 py-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold leading-tight">
                    {court.name}
                  </p>
                  <p className="text-xs leading-tight">
                    {court.isActive ? "Active" : "Inactive"}
                  </p>
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

              <div className="mt-3 space-y-2 flex gap-x-4">
                <div>
                  <p className="text-xs font-semibold">Team A</p>
                  {court.currentMatch?.matchPlayers?.filter(
                    (matchPlayer) =>
                      matchPlayer.teamId === court.currentMatch?.teamAId,
                  ).length ? (
                    <div className="mt-1 grid grid-cols-2 gap-1">
                      {court.currentMatch.matchPlayers
                        .filter(
                          (matchPlayer) =>
                            matchPlayer.teamId === court.currentMatch?.teamAId,
                        )
                        .map((matchPlayer) => (
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
                  {court.currentMatch?.matchPlayers?.filter(
                    (matchPlayer) =>
                      matchPlayer.teamId === court.currentMatch?.teamBId,
                  ).length ? (
                    <div className="mt-1 grid grid-cols-2 gap-1">
                      {court.currentMatch.matchPlayers
                        .filter(
                          (matchPlayer) =>
                            matchPlayer.teamId === court.currentMatch?.teamBId,
                        )
                        .map((matchPlayer) => (
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

              {activeCourtMenuId === court.id ? (
                <div
                  className="absolute right-0 top-8 z-10 w-72 border bg-white p-3"
                  onClick={(event) => event.stopPropagation()}
                >
                  <form onSubmit={handleEditCourt} className="space-y-3">
                    <label className="block">
                      <span className="mb-1 block text-xs">Name</span>
                      <input
                        type="text"
                        value={editCourtName}
                        onChange={(event) =>
                          setEditCourtNameProp(event.target.value)
                        }
                        className="w-full border px-2 py-1 text-sm"
                        disabled={deletingCourtId === court.id || isUpdatingCourt}
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
                              className="flex items-center gap-2 text-xs"
                            >
                              <input
                                type="checkbox"
                                checked={editCourtTeamAPlayerIds.includes(player.id)}
                                onChange={() => toggleCourtPlayer("A", player.id)}
                                disabled={
                                  isUpdatingCourt ||
                                  deletingCourtId === court.id ||
                                  isPlayersLoading
                                }
                              />
                              <span>{player.name}</span>
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
                              className="flex items-center gap-2 text-xs"
                            >
                              <input
                                type="checkbox"
                                checked={editCourtTeamBPlayerIds.includes(player.id)}
                                onChange={() => toggleCourtPlayer("B", player.id)}
                                disabled={
                                  isUpdatingCourt ||
                                  deletingCourtId === court.id ||
                                  isPlayersLoading
                                }
                              />
                              <span>{player.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {editCourtError ? (
                      <p className="text-xs">{editCourtError}</p>
                    ) : null}

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
                        disabled={
                          isUpdatingCourt ||
                          deletingCourtId === court.id
                        }
                        className="border px-2 py-1 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCourt(court.id)}
                        disabled={
                          isUpdatingCourt ||
                          deletingCourtId === court.id
                        }
                        className="border px-2 py-1 text-xs"
                      >
                        {deletingCourtId === court.id ? "Deleting..." : "Delete"}
                      </button>
                      <button
                        type="submit"
                        disabled={
                          isUpdatingCourt ||
                          deletingCourtId === court.id ||
                          isPlayersLoading ||
                          players.length === 0
                        }
                        className="border px-2 py-1 text-xs"
                      >
                        {isUpdatingCourt ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}
            </div>
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
