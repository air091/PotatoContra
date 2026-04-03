import { NavLink } from "react-router-dom";
import { GiIncomingRocket } from "react-icons/gi";

const Sidebar = ({ sports, isLoading, error }) => {
  return (
    <nav className="w-full max-w-62.5 py-5 bg-secondary text-text">
      <div className="p-2.5 grid gap-y-2.5">
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
      </div>
      

      {isLoading ? <p className="px-3 py-2">Loading sports...</p> : null}
      {!isLoading && !error && sports.length === 0 ? (
        <p className="px-3 py-2">No sports yet.</p>
      ) : null}
      {error ? <p className="px-3 py-2">{error}</p> : null}
    </nav>
  );
};

export default Sidebar;
