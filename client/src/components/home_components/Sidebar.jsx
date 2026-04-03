import { NavLink } from "react-router-dom";
import { GiIncomingRocket } from "react-icons/gi";

const Sidebar = ({ sports, isLoading, error, isCollapsed }) => {
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
      </div>
    </nav>
  );
};

export default Sidebar;
