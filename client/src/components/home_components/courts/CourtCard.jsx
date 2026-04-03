import { useRef, useState } from "react";
import { IoEllipsisVertical } from "react-icons/io5";
import CourtEditMenu from "./CourtEditMenu";
import formatElapsedTime from "./formatElapsedTime";
import { GoPlus } from "react-icons/go";
import { LuMinus } from "react-icons/lu";
import { IoIosPause } from "react-icons/io";
import { RiResetLeftFill } from "react-icons/ri";
import { FaPlay } from "react-icons/fa6";
import { apiFetch } from "../../../lib/api";

const CourtCard = ({
  court,
  timerNow,
  openCourtMenu,
  activeCourtMenuId,
  editCourtName,
  setEditCourtNameProp,
  editCourtTeamAPlayerIds,
  editCourtTeamBPlayerIds,
  players,
  unavailablePlayerCourtMap,
  toggleCourtPlayer,
  editCourtError,
  handleDeleteCourt,
  handleEditCourt,
  handleStartCourt,
  handleResetCourt,
  handleEndCourt,
  isUpdatingCourt,
  deletingCourtId,
  startingCourtId,
  resettingCourtId,
  endingCourtId,
  setActiveCourtMenuId,
  setEditCourtName,
  setEditCourtTeamAPlayerIds,
  setEditCourtTeamBPlayerIds,
  setEditCourtError,
  isPlayersLoading,
  setCourts,
}) => {
  const [isUpdatingScore, setIsUpdatingScore] = useState(false);
  const menuButtonRef = useRef(null);
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
    teamAPlayers.length > 0 &&
    teamBPlayers.length > 0;
  const canReset = !!currentMatch && !currentMatch.startedAt;
  const canEnd = !!currentMatch && !!currentMatch.startedAt;
  const elapsedTime = formatElapsedTime(currentMatch?.startedAt, timerNow);
  const isBusy =
    isUpdatingCourt ||
    deletingCourtId === court.id ||
    startingCourtId === court.id ||
    resettingCourtId === court.id ||
    endingCourtId === court.id ||
    isUpdatingScore;

  const updateScore = async (team, value) => {
    if (!currentMatch) return;

    const newScore = Math.max(0, value);
    const previousMatchSnapshot = currentMatch;
    setIsUpdatingScore(true);

    setCourts((prevCourts) =>
      prevCourts.map((currentCourt) =>
        currentCourt.id === court.id
          ? {
              ...currentCourt,
              currentMatch: {
                ...currentCourt.currentMatch,
                ...(team === "teamA"
                  ? { scoreA: newScore }
                  : { scoreB: newScore }),
              },
            }
          : currentCourt,
      ),
    );

    try {
      const scoreData =
        team === "teamA" ? { scoreA: newScore } : { scoreB: newScore };

      const response = await apiFetch(
        `/api/matches/${currentMatch.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(scoreData),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message ?? "Failed to update score");
      }

      // Update the courts state with the updated match
      setCourts((prevCourts) =>
        prevCourts.map((currentCourt) =>
          currentCourt.id === court.id
            ? {
                ...currentCourt,
                currentMatch: {
                  ...currentCourt.currentMatch,
                  ...data.match,
                },
              }
            : currentCourt,
        ),
      );
    } catch (error) {
      setCourts((prevCourts) =>
        prevCourts.map((currentCourt) =>
          currentCourt.id === court.id
            ? { ...currentCourt, currentMatch: previousMatchSnapshot }
            : currentCourt,
        ),
      );
      console.error("Error updating score:", error);
    } finally {
      setIsUpdatingScore(false);
    }
  };

  return (
    <div className="relative border border-accent bg-border px-3 py-2 w-67 rounded-[10px]">
      <header className="flex items-start justify-between p-1">
        <div className="flex items-center gap-x-2.5">
          <p className="text-[18px] font-md leading-tight text-text">
            {court.name}
          </p>
          {elapsedTime ? (
            <p className="text-[12px] text-stone-400 leading-tight">
              {elapsedTime}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-x-1.5">
          {currentMatch ? (
            <div className="flex gap-2">
              {canStart ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleStartCourt(court.id);
                  }}
                  disabled={isBusy}
                  className="rounded-full p-1 bg-success cursor-pointer"
                >
                  {startingCourtId === court.id ? (
                    <FaPlay size={14} />
                  ) : (
                    <FaPlay size={14} />
                  )}
                </button>
              ) : null}

              {canReset ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleResetCourt(court.id);
                  }}
                  disabled={isBusy}
                  className="rounded-full p-1 bg-primary cursor-pointer text-secondary"
                >
                  {resettingCourtId === court.id ? (
                    <RiResetLeftFill size={14} />
                  ) : (
                    <RiResetLeftFill size={14} />
                  )}
                </button>
              ) : null}

              {canEnd ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleEndCourt(court.id);
                  }}
                  disabled={isBusy}
                  className="rounded-full text-xs p-1 bg-error text-text cursor-pointer"
                >
                  {endingCourtId === court.id ? (
                    <IoIosPause size={14} />
                  ) : (
                    <IoIosPause size={14} />
                  )}
                </button>
              ) : null}
            </div>
          ) : null}

          <button
            ref={menuButtonRef}
            type="button"
            className="cursor-pointer block"
            onClick={(event) => {
              event.stopPropagation();
              openCourtMenu(court);
            }}
          >
            <IoEllipsisVertical size={14} className="text-text" />
          </button>
        </div>
      </header>

      <div className="flex p-1 w-full">
        <div className="w-full grid justify-start gap-y-1">
          <p className="text-[14px] font-semibold text-text">Team A</p>
          {teamAPlayers.length ? (
            <div className="w-full flex flex-wrap flex-2 gap-1 justify-start">
              {teamAPlayers.map((matchPlayer) => (
                <span
                  key={`${court.id}-team-a-${matchPlayer.playerId}`}
                  className="px-2 w-fit py-0.5 text-[14px] bg-primary text-accent font-md rounded-xs"
                >
                  {matchPlayer.player.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-text">No players yet.</p>
          )}

          {currentMatch && currentMatch.startedAt ? (
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => updateScore("teamA", currentMatch.scoreA - 1)}
                disabled={isBusy}
                className="bg-error text-xs rounded-full text-text"
              >
                <LuMinus size={20} />
              </button>
              <span className="w-6 text-center text-[18px] font-semibold text-text">
                {currentMatch.scoreA}
              </span>
              <button
                type="button"
                onClick={() => updateScore("teamA", currentMatch.scoreA + 1)}
                disabled={isBusy}
                className="rounded-full text-xs text-text bg-success"
              >
                <GoPlus size={20} />
              </button>
            </div>
          ) : null}
        </div>

        <div className="w-full grid justify-end gap-y-1">
          <p className="text-[14px] font-semibold text-text text-end">Team B</p>

          {teamBPlayers.length ? (
            <div className="flex flex-wrap flex-2 gap-1 justify-end">
              {teamBPlayers.map((matchPlayer) => (
                <span
                  key={`${court.id}-team-b-${matchPlayer.playerId}`}
                  className="px-1 py-0.5 text-[14px] bg-primary text-accent font-md rounded-xs"
                >
                  {matchPlayer.player.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-end text-text">No players yet.</p>
          )}

          {currentMatch && currentMatch.startedAt ? (
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => updateScore("teamB", currentMatch.scoreB - 1)}
                disabled={isBusy}
                className="bg-error text-xs rounded-full text-text"
              >
                <LuMinus size={20} />
              </button>
              <span className="w-6 text-center text-[18px] font-semibold text-text">
                {currentMatch.scoreB}
              </span>
              <button
                type="button"
                onClick={() => updateScore("teamB", currentMatch.scoreB + 1)}
                disabled={isBusy}
                className="rounded-full text-xs text-text bg-success"
              >
                <GoPlus size={20} />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {activeCourtMenuId === court.id ? (
        <CourtEditMenu
          court={court}
          handleEditCourt={handleEditCourt}
          editCourtName={editCourtName}
          setEditCourtNameProp={setEditCourtNameProp}
          players={players}
          editCourtTeamAPlayerIds={editCourtTeamAPlayerIds}
          editCourtTeamBPlayerIds={editCourtTeamBPlayerIds}
          unavailablePlayerCourtMap={unavailablePlayerCourtMap}
          toggleCourtPlayer={toggleCourtPlayer}
          editCourtError={editCourtError}
          setActiveCourtMenuId={setActiveCourtMenuId}
          setEditCourtName={setEditCourtName}
          setEditCourtTeamAPlayerIds={setEditCourtTeamAPlayerIds}
          setEditCourtTeamBPlayerIds={setEditCourtTeamBPlayerIds}
          setEditCourtError={setEditCourtError}
          handleDeleteCourt={handleDeleteCourt}
          isUpdatingCourt={isUpdatingCourt}
          deletingCourtId={deletingCourtId}
          startingCourtId={startingCourtId}
          resettingCourtId={resettingCourtId}
          endingCourtId={endingCourtId}
          isPlayersLoading={isPlayersLoading}
          anchorRef={menuButtonRef}
        />
      ) : null}
    </div>
  );
};

export default CourtCard;
