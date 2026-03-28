import { NavLink } from "react-router-dom";
import { LuPlus } from "react-icons/lu";
import { useEffect, useState } from "react";

const Sidebar = () => {
  const [sports, setSports] = useState([]);

  const getSportsAPI = async () => {
    try {
      const response = await fetch("http://localhost:7007/api/sports", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (!data.success) throw new Error(data?.message);

      setSports(data.sports);
    } catch (error) {
      console.error(`Sports API failed`);
      throw error;
    }
  };

  useEffect(() => {
    getSportsAPI();
  }, []);

  return (
    <div className="border-2 border-red-500 w-36">
      <ul>
        {sports.length > 0
          ? sports.map((sport) => (
              <li key={sport.id} className="border">
                <NavLink to={`${sport.id}`} className="">
                  {sport.name}
                </NavLink>
              </li>
            ))
          : ""}
      </ul>
      <button className="border flex items-center px-4 py-1 gap-x-2">
        <LuPlus size={18} /> Sport
      </button>
    </div>
  );
};

export default Sidebar;
