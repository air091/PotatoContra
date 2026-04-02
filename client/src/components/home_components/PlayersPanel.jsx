import PlayerCard from "./players/PlayerCard";
import { FaUsers } from "react-icons/fa";
import { FaRegMoneyBill1 } from "react-icons/fa6";

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
      className="border border-accent p-1.5 w-full max-w-79 rounded-[14px] bg-secondary"
      onClick={() => {
        if (isUpdatingPlayer || deletingPlayerId) return;

        setActivePlayerMenuId(null);
        setEditPlayerError("");
      }}
    >
      <header className="flex items-center justify-between text-text p-2.5">
        <h1 className="text-xl font-bold">{selectedSport.name}</h1>

        <div className="flex gap-x-2.5">
          <button
            type="button"
            onClick={() => setIsAddPlayerOpen(true)}
            className="group cursor-pointer px-1.5 py-1 rounded-sm hover:bg-accent"
          >
            <FaUsers size={16} className="group-hover:text-primary" />
          </button>
          <button
            type="button"
            className="group cursor-pointer px-1.5 py-1 rounded-sm hover:bg-accent"
          >
            <FaRegMoneyBill1 size={16} className="group-hover:text-primary" />
          </button>
        </div>
      </header>

      <div className="w-full p-3 rounded-[10px]">
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
