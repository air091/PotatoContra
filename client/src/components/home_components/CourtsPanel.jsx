import { IoEllipsisVertical } from "react-icons/io5";

const CourtsPanel = ({
  courts,
  isCourtsLoading,
  courtsError,
  isUpdatingCourt,
  deletingCourtId,
  startingCourtId,
  resettingCourtId,
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
  handleStartCourt,
  handleResetCourt,
  isPlayersLoading,
}) => {
  return (
    <div
      className="w-full border p-4"
      onClick={() => {
        if (
          isUpdatingCourt ||
          deletingCourtId ||
          startingCourtId ||
          resettingCourtId
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
            <div key={court.id} className="relative rounded border px-3 py-2">
              {(() => {
                const currentMatch = court.currentMatch;
                const teamAPlayers =
                  currentMatch?.matchPlayers?.filter(
                    (matchPlayer) => matchPlayer.teamId === currentMatch?.teamAId,
                  ) ?? [];
                const teamBPlayers =
                  currentMatch?.matchPlayers?.filter(
                    (matchPlayer) => matchPlayer.teamId === currentMatch?.teamBId,
                  ) ?? [];
                const canStart =
                  !!currentMatch &&
                  !currentMatch.startedAt &&
                  teamAPlayers.length === 1 &&
                  teamBPlayers.length === 1;

                return (
                  <>
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
                  {teamAPlayers.length ? (
                    <div className="mt-1 grid grid-cols-2 gap-1">
                      {teamAPlayers.map((matchPlayer) => (
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
                  {teamBPlayers.length ? (
                    <div className="mt-1 grid grid-cols-2 gap-1">
                      {teamBPlayers.map((matchPlayer) => (
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

              {currentMatch ? (
                <div className="mt-3 flex gap-2">
                  {canStart ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleStartCourt(court.id);
                      }}
                      disabled={
                        isUpdatingCourt ||
                        deletingCourtId === court.id ||
                        startingCourtId === court.id ||
                        resettingCourtId === court.id
                      }
                      className="border px-2 py-1 text-xs"
                    >
                      {startingCourtId === court.id ? "Starting..." : "Start"}
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleResetCourt(court.id);
                    }}
                    disabled={
                      isUpdatingCourt ||
                      deletingCourtId === court.id ||
                      startingCourtId === court.id ||
                      resettingCourtId === court.id
                    }
                    className="border px-2 py-1 text-xs"
                  >
                    {resettingCourtId === court.id ? "Resetting..." : "Reset"}
                  </button>
                </div>
              ) : null}

              {activeCourtMenuId === court.id ? (
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
                        onChange={(event) =>
                          setEditCourtNameProp(event.target.value)
                        }
                        className="w-full border px-2 py-1 text-sm"
                        disabled={
                          deletingCourtId === court.id ||
                          startingCourtId === court.id ||
                          resettingCourtId === court.id ||
                          isUpdatingCourt
                        }
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
                                  checked={editCourtTeamAPlayerIds.includes(
                                    player.id,
                                  )}
                                  onChange={() =>
                                    toggleCourtPlayer("A", player.id)
                                  }
                                  disabled={
                                    isUpdatingCourt ||
                                    deletingCourtId === court.id ||
                                    startingCourtId === court.id ||
                                    resettingCourtId === court.id ||
                                    isPlayersLoading
                                  }
                                />
                                <span>{player.name}</span>
                              </span>
                              {editCourtTeamAPlayerIds.includes(player.id) ? (
                                <span className="border px-1 py-0.5 text-[10px]">
                                  Team A
                                </span>
                              ) : null}
                              {!editCourtTeamAPlayerIds.includes(player.id) &&
                              editCourtTeamBPlayerIds.includes(player.id) ? (
                                <span className="border px-1 py-0.5 text-[10px]">
                                  Team B
                                </span>
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
                                  checked={editCourtTeamBPlayerIds.includes(
                                    player.id,
                                  )}
                                  onChange={() =>
                                    toggleCourtPlayer("B", player.id)
                                  }
                                  disabled={
                                    isUpdatingCourt ||
                                    deletingCourtId === court.id ||
                                    startingCourtId === court.id ||
                                    resettingCourtId === court.id ||
                                    isPlayersLoading
                                  }
                                />
                                <span>{player.name}</span>
                              </span>
                              {editCourtTeamBPlayerIds.includes(player.id) ? (
                                <span className="border px-1 py-0.5 text-[10px]">
                                  Team B
                                </span>
                              ) : null}
                              {!editCourtTeamBPlayerIds.includes(player.id) &&
                              editCourtTeamAPlayerIds.includes(player.id) ? (
                                <span className="border px-1 py-0.5 text-[10px]">
                                  Team A
                                </span>
                              ) : null}
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
                          deletingCourtId === court.id ||
                          startingCourtId === court.id ||
                          resettingCourtId === court.id
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
                          deletingCourtId === court.id ||
                          startingCourtId === court.id ||
                          resettingCourtId === court.id
                        }
                        className="border px-2 py-1 text-xs"
                      >
                        {deletingCourtId === court.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                      <button
                        type="submit"
                        disabled={
                          isUpdatingCourt ||
                          deletingCourtId === court.id ||
                          startingCourtId === court.id ||
                          resettingCourtId === court.id ||
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
                  </>
                );
              })()}
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
