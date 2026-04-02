import { useState } from "react";
import { IoEllipsisVertical } from "react-icons/io5";
import PlayerEditMenu from "./PlayerEditMenu";

const PlayerCard = ({
  player,
  selectedSport,
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
  setActivePlayerMenuId,
  setEditPlayerError,
  handleDeletePlayer,
  isUpdatingPlayer,
  deletingPlayerId,
  matchesPlayed,
}) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  return (
    <div className="relative flex w-fit items-center justify-between gap-x-4 rounded border px-2 py-1 bg-primary">
      <div className="text-accent">
        <p className="text-sm font-semibold leading-tight">{player.name}</p>
        <p className="text-xs leading-tight">{player.skillLevel}</p>
      </div>

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

      {activePlayerMenuId === player.id ? (
        <PlayerEditMenu
          player={player}
          selectedSport={selectedSport}
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
          matchesPlayed={matchesPlayed}
          isHistoryOpen={isHistoryOpen}
          setIsHistoryOpen={setIsHistoryOpen}
        />
      ) : null}
    </div>
  );
};

export default PlayerCard;
