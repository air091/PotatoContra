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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[18px] border border-border bg-surface p-5 text-text shadow-2xl">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Add player</h2>
          <p className="text-sm text-stone-400">
            Create a player for {selectedSport.name}.
          </p>
        </div>

        <form onSubmit={handleAddPlayer} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm">Player names</span>
            <textarea
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              className="min-h-32 w-full rounded-[12px] border border-border bg-border px-3 py-2 text-sm text-text outline-none transition-colors placeholder:text-stone-500 focus:border-primary"
              placeholder={`ace\nray\njosh`}
              autoFocus
            />
          </label>
          <p className="text-xs text-stone-400">Add one player per line.</p>

          {submitError ? <p className="text-sm text-error">{submitError}</p> : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeAddPlayerModal}
              className="rounded-[10px] border border-border bg-border px-3 py-2 text-sm text-text transition-colors hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-[10px] border border-primary bg-primary px-3 py-2 text-sm font-medium text-accent transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
