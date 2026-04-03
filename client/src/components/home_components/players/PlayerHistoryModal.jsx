import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { apiFetch } from "../../../lib/api";

const PlayerHistoryModal = ({ playerId, isOpen, onClose }) => {
  const [playerData, setPlayerData] = useState(null);
  const [matches, setMatches] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !playerId) return;

    const abortController = new AbortController();

    const fetchPlayerHistory = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await apiFetch(
          `/api/players/${playerId}/history`,
          {
            method: "GET",
            signal: abortController.signal,
          },
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data?.message ?? "Failed to fetch player history");
        }

        setPlayerData(data.player);
        setSummary(data.summary);
        setMatches(data.matches.filter((match) => match.startedAt));
      } catch (fetchError) {
        if (fetchError.name === "AbortError") return;
        console.error("Fetch error:", fetchError);
        setError("Unable to load player history.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayerHistory();

    return () => abortController.abort();
  }, [isOpen, playerId]);

  const formatTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (startedAt, endedAt) => {
    if (!startedAt || !endedAt) return "-";
    const start = new Date(startedAt);
    const end = new Date(endedAt);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    return `${diffMins}m`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-[20px] border border-border bg-surface text-text shadow-2xl">
        <div className="border-b border-border bg-border px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{playerData?.name}</h2>
              <p className="text-sm text-stone-400">{playerData?.sport?.name}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 transition-colors hover:bg-accent"
            >
              <IoClose size={24} />
            </button>
          </div>
        </div>

        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 140px)" }}
        >
          {isLoading && (
            <div className="p-6">
              <p className="text-center">Loading player history...</p>
            </div>
          )}

          {error && (
            <div className="p-6">
              <p className="text-center text-error">{error}</p>
            </div>
          )}

          {!isLoading && !error && summary && (
            <>
              <div className="border-b border-border bg-border px-6 py-4">
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center">
                    <p className="text-xs text-stone-400">Games</p>
                    <p className="text-xl font-bold">{summary.gamesPlayed}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-stone-400">Wins</p>
                    <p className="text-xl font-bold text-success">{summary.wins}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-stone-400">Losses</p>
                    <p className="text-xl font-bold text-error">{summary.losses}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-stone-400">Draws</p>
                    <p className="text-xl font-bold text-stone-300">{summary.draws}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-6">
                {matches.length === 0 ? (
                  <p className="text-center text-sm text-stone-400">
                    No completed matches yet.
                  </p>
                ) : (
                  matches.map((match) => (
                    <div
                      key={match.matchId}
                      className="rounded-[14px] border border-border bg-border p-3 transition-colors hover:bg-accent"
                    >
                      <div className="mb-2 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs font-semibold text-stone-400">
                            Court
                          </p>
                          <p className="font-medium text-text">
                            {match.court?.name ?? "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-stone-400">
                            Duration
                          </p>
                          <p className="font-medium text-text">
                            {formatDuration(match.startedAt, match.endedAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-stone-400">
                            Start
                          </p>
                          <p className="text-xs text-text">
                            {formatTime(match.startedAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-stone-400">
                            End
                          </p>
                          <p className="text-xs text-text">
                            {formatTime(match.endedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-2 grid grid-cols-2 gap-3">
                        <div className="rounded-[12px] border border-primary/30 bg-primary/10 p-2 text-xs">
                          <p className="mb-1 font-semibold text-primary">
                            Your Team
                          </p>
                          <p className="mb-1 font-bold text-primary">
                            Score: {match.score.playerTeam}
                          </p>
                          {match.teamMembers.length > 0 && (
                            <div>
                              <p className="mb-1 text-xs text-stone-400">
                                Members:
                              </p>
                              {match.teamMembers.map((member) => (
                                <p key={member.id} className="truncate text-text">
                                  - {member.name}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="rounded-[12px] border border-border bg-secondary p-2 text-xs">
                          <p className="mb-1 font-semibold text-stone-300">
                            Opponent Team
                          </p>
                          <p className="mb-1 font-bold text-text">
                            Score: {match.score.opponent}
                          </p>
                          <p className="mb-1 text-xs text-stone-400">
                            {match.opponentTeam?.name ?? "Unknown"}
                          </p>
                          {match.opponentMembers &&
                            match.opponentMembers.length > 0 && (
                              <div>
                                <p className="mb-1 text-xs text-stone-400">
                                  Members:
                                </p>
                                {match.opponentMembers.map((member) => (
                                  <p key={member.id} className="truncate text-text">
                                    - {member.name}
                                  </p>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                            match.result === "win"
                              ? "bg-success/20 text-success"
                              : match.result === "loss"
                                ? "bg-error/20 text-error"
                                : "bg-accent text-stone-300"
                          }`}
                        >
                          {match.result.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerHistoryModal;
