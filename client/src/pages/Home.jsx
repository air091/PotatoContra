import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

const Home = () => {
  const { sports, isLoading, error, selectedSport } = useOutletContext();
  const [players, setPlayers] = useState([]);
  const [isPlayersLoading, setIsPlayersLoading] = useState(false);
  const [playersError, setPlayersError] = useState("");
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!selectedSport) {
      setPlayers([]);
      setPlayersError("");
      return;
    }

    const abortController = new AbortController();

    const getPlayersAPI = async () => {
      try {
        setIsPlayersLoading(true);
        setPlayersError("");

        const response = await fetch(
          `http://localhost:7007/api/players/${selectedSport.id}`,
          {
            method: "GET",
            credentials: "include",
            signal: abortController.signal,
          },
        );
        const data = await response.json();

        if (response.status === 404) {
          setPlayers([]);
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(data?.message ?? "Players API failed");
        }

        setPlayers(
          data.players.filter((player) => player.sportId === selectedSport.id),
        );
      } catch (fetchError) {
        if (fetchError.name === "AbortError") return;

        console.error("Players API failed", fetchError);
        setPlayersError("Unable to load players.");
      } finally {
        setIsPlayersLoading(false);
      }
    };

    setIsAddPlayerOpen(false);
    setPlayerName("");
    setSubmitError("");
    getPlayersAPI();

    return () => {
      abortController.abort();
    };
  }, [selectedSport]);

  const closeAddPlayerModal = () => {
    if (isSubmitting) return;

    setIsAddPlayerOpen(false);
    setPlayerName("");
    setSubmitError("");
  };

  const handleAddPlayer = async (event) => {
    event.preventDefault();

    const trimmedPlayerName = playerName.trim();
    if (!trimmedPlayerName) {
      setSubmitError("Player name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const response = await fetch(
        `http://localhost:7007/api/players/register/${selectedSport.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ name: trimmedPlayerName }),
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message ?? "Add player failed");
      }

      setPlayers((currentPlayers) => [...currentPlayers, data.player]);
      setPlayerName("");
      setIsAddPlayerOpen(false);
    } catch (submitPlayerError) {
      console.error("Add player failed", submitPlayerError);
      setSubmitError(submitPlayerError.message ?? "Unable to add player.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div>Loading sports...</div>;
  if (error) return <div>{error}</div>;
  if (sports.length === 0) return <div>No sports available yet.</div>;
  if (!selectedSport) return <div>Select a sport from the sidebar.</div>;

  return (
    <>
      <section className="p-4">
        <div className="w-full max-w-3xl border p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">{selectedSport.name}</h1>
              <p>Players for this sport live in the section below.</p>
            </div>

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

        <div className="mt-4 w-full max-w-3xl border p-3">
          {isPlayersLoading ? <p>Loading players...</p> : null}
          {!isPlayersLoading && playersError ? <p>{playersError}</p> : null}
          {!isPlayersLoading && !playersError && players.length === 0 ? (
            <p>No players yet.</p>
          ) : null}

          {!isPlayersLoading && !playersError && players.length > 0 ? (
            <div className="grid gap-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded border px-3 py-2 w-fit"
                >
                  <div>
                    <p className="text-sm font-semibold leading-tight">
                      {player.name}
                    </p>
                    <p className="text-xs leading-tight">
                      Skill: {player.skillLevel}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {isAddPlayerOpen ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md border bg-white p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Add player</h2>
              <p>Create a player for {selectedSport.name}.</p>
            </div>

            <form onSubmit={handleAddPlayer} className="space-y-4">
              <label className="block">
                <span className="mb-1 block">Player name</span>
                <input
                  type="text"
                  value={playerName}
                  onChange={(event) => setPlayerName(event.target.value)}
                  className="w-full border px-3 py-2"
                  placeholder="Enter player name"
                  autoFocus
                />
              </label>

              {submitError ? <p>{submitError}</p> : null}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeAddPlayerModal}
                  className="border px-3 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="border px-3 py-2"
                >
                  {isSubmitting ? "Saving..." : "Save player"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Home;
