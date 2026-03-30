import PlayerCard from "./players/PlayerCard";

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
  playerMatchCounts,
}) => {
  return (
    <div
      className="border p-4 w-full max-w-lg"
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
              <PlayerCard
                key={player.id}
                player={player}
                selectedSport={selectedSport}
                openPlayerMenu={openPlayerMenu}
                activePlayerMenuId={activePlayerMenuId}
                handleEditPlayer={handleEditPlayer}
                editPlayerName={editPlayerName}
                setEditPlayerName={setEditPlayerName}
                editSkillLevel={editSkillLevel}
                setEditSkillLevel={setEditSkillLevel}
                editPaymentStatus={editPaymentStatus}
                setEditPaymentStatus={setEditPaymentStatus}
                editPlayerError={editPlayerError}
                setActivePlayerMenuId={setActivePlayerMenuId}
                setEditPlayerError={setEditPlayerError}
                handleDeletePlayer={handleDeletePlayer}
                isUpdatingPlayer={isUpdatingPlayer}
                deletingPlayerId={deletingPlayerId}
                matchesPlayed={playerMatchCounts[player.id] ?? 0}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PlayersPanel;
