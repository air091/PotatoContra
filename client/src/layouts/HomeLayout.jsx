import { Outlet } from "react-router-dom";
import Sidebar from "../components/home_components/Sidebar";

const HomeLayout = () => {
  return (
    <div>
      <Sidebar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default HomeLayout;
