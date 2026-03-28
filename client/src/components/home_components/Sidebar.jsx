import { NavLink } from "react-router-dom";

const Sidebar = ({ sports, isLoading, error }) => {
  return (
    <aside className="w-48 shrink-0">
      <ul>
        {sports.map((sport) => (
          <li key={sport.id}>
            <NavLink
              to={`/sports/${sport.id}`}
              className={({ isActive }) =>
                `block px-3 py-2 ${isActive ? "font-semibold" : ""}`
              }
            >
              {sport.name}
            </NavLink>
          </li>
        ))}
      </ul>

      {isLoading ? <p className="px-3 py-2">Loading sports...</p> : null}
      {!isLoading && !error && sports.length === 0 ? (
        <p className="px-3 py-2">No sports yet.</p>
      ) : null}
      {error ? <p className="px-3 py-2">{error}</p> : null}
    </aside>
  );
};

export default Sidebar;
