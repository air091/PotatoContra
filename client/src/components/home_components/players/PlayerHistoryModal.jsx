import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";

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

        const response = await fetch(
          `http://localhost:7007/api/players/${playerId}/history`,
          {
            method: "GET",
            credentials: "include",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg border bg-white shadow-lg">
        {/* Header */}
        <div className="border-b bg-white px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{playerData?.name}</h2>
              <p className="text-sm text-gray-600">{playerData?.sport?.name}</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <IoClose size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
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
              <p className="text-center text-red-600">{error}</p>
            </div>
          )}

          {!isLoading && !error && summary && (
            <>
              {/* Summary Stats */}
              <div className="border-b bg-gray-50 px-6 py-4">
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Games</p>
                    <p className="text-xl font-bold">{summary.gamesPlayed}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Wins</p>
                    <p className="text-xl font-bold text-green-600">
                      {summary.wins}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Losses</p>
                    <p className="text-xl font-bold text-red-600">
                      {summary.losses}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Draws</p>
                    <p className="text-xl font-bold text-gray-600">
                      {summary.draws}
                    </p>
                  </div>
                </div>
              </div>

              {/* Matches List */}
              <div className="p-6 space-y-3">
                {matches.length === 0 ? (
                  <p className="text-center text-sm text-gray-600">
                    No completed matches yet.
                  </p>
                ) : (
                  matches.map((match) => (
                    <div
                      key={match.matchId}
                      className="border rounded p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="grid grid-cols-2 gap-3 mb-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">
                            Court
                          </p>
                          <p className="font-medium">
                            {match.court?.name ?? "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">
                            Duration
                          </p>
                          <p className="font-medium">
                            {formatDuration(match.startedAt, match.endedAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">
                            Start
                          </p>
                          <p className="text-xs">
                            {formatTime(match.startedAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">
                            End
                          </p>
                          <p className="text-xs">{formatTime(match.endedAt)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div className="text-xs bg-blue-50 rounded p-2">
                          <p className="font-semibold text-gray-700 mb-1">
                            Your Team
                          </p>
                          <p className="font-bold text-blue-700 mb-1">
                            Score: {match.score.playerTeam}
                          </p>
                          {match.teamMembers.length > 0 && (
                            <div>
                              <p className="text-gray-600 text-xs mb-1">
                                Members:
                              </p>
                              {match.teamMembers.map((member) => (
                                <p
                                  key={member.id}
                                  className="text-gray-700 truncate"
                                >
                                  • {member.name}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="text-xs bg-gray-100 rounded p-2">
                          <p className="font-semibold text-gray-700 mb-1">
                            Opponent Team
                          </p>
                          <p className="font-bold text-gray-700 mb-1">
                            Score: {match.score.opponent}
                          </p>
                          <p className="text-gray-600 text-xs mb-1">
                            {match.opponentTeam?.name ?? "Unknown"}
                          </p>
                          {match.opponentMembers &&
                            match.opponentMembers.length > 0 && (
                              <div>
                                <p className="text-gray-600 text-xs mb-1">
                                  Members:
                                </p>
                                {match.opponentMembers.map((member) => (
                                  <p
                                    key={member.id}
                                    className="text-gray-700 truncate"
                                  >
                                    • {member.name}
                                  </p>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                            match.result === "win"
                              ? "bg-green-100 text-green-800"
                              : match.result === "loss"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-200 text-gray-800"
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
