import { useState } from "react";
import { NavLink } from "react-router-dom";
import { GiIncomingRocket } from "react-icons/gi";

const Sidebar = ({ sports, isLoading, error, isCollapsed, createSport }) => {
  const [sportName, setSportName] = useState("");
  const [sportError, setSportError] = useState("");
  const [isCreatingSport, setIsCreatingSport] = useState(false);

  const handleCreateSport = async (event) => {
    event.preventDefault();

    try {
      setIsCreatingSport(true);
      setSportError("");
      await createSport(sportName);
      setSportName("");
    } catch (createSportError) {
      console.error("Create sport failed", createSportError);
      setSportError(createSportError.message ?? "Unable to create sport.");
    } finally {
      setIsCreatingSport(false);
    }
  };

  return (
    <nav
      id="app-sidebar"
      aria-hidden={isCollapsed}
      className={`h-full w-full shrink-0 overflow-hidden rounded-[18px] bg-surface text-text transition-[max-height,width,opacity,border] duration-300 ease-out ${
        isCollapsed
          ? "max-h-0 border border-transparent opacity-0 md:max-h-none md:w-0"
          : "max-h-[70vh] border border-border opacity-100 md:max-h-none md:w-65 lg:w-70"
      }`}
    >
      <div
        className={`grid gap-y-2.5 p-2.5 transition-opacity duration-200 md:max-h-full overflow-x-hidden md:overflow-y-auto ${
          isCollapsed ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <h3 className="px-1 py-1.5 font-md text-[18px]">Sports</h3>
        <ul className="px-1">
          {sports.map((sport) => (
            <li key={sport.id} className="group text-text bg-secondary hover:bg-accent">
              <NavLink
                to={`/sports/${sport.id}`}
                className={({ isActive }) =>
                  `flex items-center justify-start px-3 py-2 gap-x-2.5 rounded-md text-[16px] ${isActive ? "font-normal bg-accent" : ""}`
                }
              >
                {({ isActive }) => (
                  <>
                   <GiIncomingRocket size={20} className={isActive ? "text-primary" : "group-hover:text-primary"} />
                  {sport.name}</>
                )}
               
              </NavLink>
            </li>
          ))}
        </ul>
        {isLoading ? <p className="px-3 py-2">Loading sports...</p> : null}
        {!isLoading && !error && sports.length === 0 ? (
          <p className="px-3 py-2">No sports yet.</p>
        ) : null}
        {error ? <p className="px-3 py-2">{error}</p> : null}
        <form onSubmit={handleCreateSport} className="grid gap-y-2 px-1 pt-2">
          <label htmlFor="sport-name" className="px-2 text-sm text-stone-300">
            New sport
          </label>
          <input
            id="sport-name"
            type="text"
            value={sportName}
            onChange={(event) => setSportName(event.target.value)}
            placeholder="Add a sport"
            disabled={isCreatingSport}
            className="rounded-md border border-border bg-secondary px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
          />
          <button
            type="submit"
            disabled={isCreatingSport}
            className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-secondary transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreatingSport ? "Creating..." : "Create sport"}
          </button>
          {sportError ? (
            <p className="px-2 text-xs text-error">{sportError}</p>
          ) : null}
        </form>
      </div>
    </nav>
  );
};

export default Sidebar;
