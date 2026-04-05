import { useState } from "react";
import PlayerCard from "./players/PlayerCard";
import { FaUsers } from "react-icons/fa";
import { FaRegMoneyBill1 } from "react-icons/fa6";

const PLAYER_STATUS_FILTERS = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "waiting",
    label: "Waiting",
  },
  {
    value: "queued",
    label: "Queued",
  },
  {
    value: "playing",
    label: "Playing",
  },
];

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
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const playerStatusCounts = {
    waiting: 0,
    queued: 0,
    playing: 0,
  };

  players.forEach((player) => {
    if (player.playerStatus in playerStatusCounts) {
      playerStatusCounts[player.playerStatus] += 1;
    }
  });

  const filteredPlayers =
    activeStatusFilter === "all"
      ? players
      : players.filter((player) => player.playerStatus === activeStatusFilter);

  return (
    <div
      className="flex min-h-0 w-full flex-col overflow-hidden rounded-[14px] border border-border bg-surface p-1.5 lg:max-w-105"
      onClick={() => {
        if (isUpdatingPlayer || deletingPlayerId) return;

        setActivePlayerMenuId(null);
        setEditPlayerError("");
      }}
    >
      <header className="">
        <div className="flex items-center justify-between text-text p-2.5">
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
        </div>
        
        <div className="flex flex-wrap items-center justify-evenly gap-2 px-2.5 pb-2">
          {PLAYER_STATUS_FILTERS.map((filter) => {
            const isActive = activeStatusFilter === filter.value;
            const count =
              filter.value === "all"
                ? players.length
                : playerStatusCounts[filter.value] ?? 0;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveStatusFilter(filter.value)}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "border-primary bg-primary text-surface"
                    : "border-border bg-secondary text-text hover:border-primary hover:text-primary"
                }`}
              >
                {filter.label} ({count})
              </button>
            );
          })}
        </div>
      </header>

      <div className="min-h-0 w-full flex-1 overflow-y-auto rounded-[10px] p-3">
        {isPlayersLoading ? <p>Loading players...</p> : null}
        {!isPlayersLoading && playersError ? <p>{playersError}</p> : null}
        {!isPlayersLoading && !playersError && players.length === 0 ? (
          <p>No players yet.</p>
        ) : null}

        {!isPlayersLoading &&
        !playersError &&
        players.length > 0 &&
        filteredPlayers.length === 0 ? (
          <p>No {activeStatusFilter} players right now.</p>
        ) : null}

        {!isPlayersLoading && !playersError && filteredPlayers.length > 0 ? (
          <div className="flex flex-wrap content-start items-start justify-center gap-2">
            {filteredPlayers.map((player) => (
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
