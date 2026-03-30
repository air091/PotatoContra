import { IoEllipsisVertical } from "react-icons/io5";

const PlayersPanel = ({
  selectedSport,
  players,
  isPlayersLoading,
  playersError,
  setIsAddPlayerOpen,
  isUpdatingPlayer,
  deletingPlayerId,
  setActivePlayerMenuId,
  setEditPlayerError,
  openPlayerMenu,
  activePlayerMenuId,
  handleEditPlayer,
  editPlayerName,
  setEditPlayerName,
  editSkillLevel,
  setEditSkillLevel,
  editPaymentStatus,
  setEditPaymentStatus,
  editPlayerError,
  handleDeletePlayer,
}) => {
  return (
    <div
      className="min-w-0 flex-1 border p-4"
      onClick={() => {
        if (isUpdatingPlayer || deletingPlayerId) return;

        setActivePlayerMenuId(null);
        setEditPlayerError("");
      }}
    >
      <div className="w-full border px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold">{selectedSport.name}</h1>

          <div className="flex gap-x-2">
            <button
              type="button"
              onClick={() => setIsAddPlayerOpen(true)}
              className="cursor-pointer border px-2 py-1 text-xs"
            >
              Add player
            </button>
            <button
              type="button"
              className="cursor-pointer border px-2 py-1 text-xs"
            >
              Payment
            </button>
          </div>
        </div>
      </div>

      <div className="mt-2 w-full border p-3">
        {isPlayersLoading ? <p>Loading players...</p> : null}
        {!isPlayersLoading && playersError ? <p>{playersError}</p> : null}
        {!isPlayersLoading && !playersError && players.length === 0 ? (
          <p>No players yet.</p>
        ) : null}

        {!isPlayersLoading && !playersError && players.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="relative flex w-fit items-center justify-between gap-x-4 rounded border px-2 py-1"
              >
                <div>
                  <p className="text-sm font-semibold leading-tight">
                    {player.name}
                  </p>
                  <p className="text-xs leading-tight">{player.skillLevel}</p>
                </div>
                <div>
                  <button
                    type="button"
                    className="cursor-pointer"
                    onClick={(event) => {
                      event.stopPropagation();
                      openPlayerMenu(player);
                    }}
                  >
                    <IoEllipsisVertical />
                  </button>
                </div>

                {activePlayerMenuId === player.id ? (
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
                          onChange={(event) =>
                            setEditPlayerName(event.target.value)
                          }
                          className="w-full border px-2 py-1 text-sm"
                          disabled={deletingPlayerId === player.id}
                          autoFocus
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-xs">Skill</span>
                        <select
                          value={editSkillLevel}
                          onChange={(event) =>
                            setEditSkillLevel(event.target.value)
                          }
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
                          onChange={(event) =>
                            setEditPaymentStatus(event.target.checked)
                          }
                          disabled={deletingPlayerId === player.id}
                        />
                        <span>Payment received</span>
                      </label>

                      {editPlayerError ? (
                        <p className="text-xs">{editPlayerError}</p>
                      ) : null}

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActivePlayerMenuId(null);
                            setEditPlayerError("");
                          }}
                          disabled={
                            isUpdatingPlayer || deletingPlayerId === player.id
                          }
                          className="border px-2 py-1 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePlayer(player.id)}
                          disabled={
                            isUpdatingPlayer || deletingPlayerId === player.id
                          }
                          className="border px-2 py-1 text-xs"
                        >
                          {deletingPlayerId === player.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                        <button
                          type="submit"
                          disabled={
                            isUpdatingPlayer || deletingPlayerId === player.id
                          }
                          className="border px-2 py-1 text-xs"
                        >
                          {isUpdatingPlayer ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PlayersPanel;
