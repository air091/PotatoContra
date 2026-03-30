const AddPlayerModal = ({
  selectedSport,
  playerName,
  setPlayerName,
  submitError,
  isSubmitting,
  closeAddPlayerModal,
  handleAddPlayer,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md border bg-white p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Add player</h2>
          <p>Create a player for {selectedSport.name}.</p>
        </div>

        <form onSubmit={handleAddPlayer} className="space-y-4">
          <label className="block">
            <span className="mb-1 block">Player names</span>
            <textarea
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              className="min-h-32 w-full border px-3 py-2"
              placeholder={`ace\nray\njosh`}
              autoFocus
            />
          </label>
          <p className="text-xs">Add one player per line.</p>

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
              {isSubmitting ? "Saving..." : "Save players"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlayerModal;
