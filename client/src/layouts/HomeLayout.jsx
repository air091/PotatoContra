import { Outlet, useMatch, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/home_components/Sidebar";
import Header from "../components/home_components/Header";

const HomeLayout = () => {
  const [sports, setSports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const selectedSportMatch = useMatch("/sports/:sportId");
  const selectedSportId = selectedSportMatch?.params?.sportId ?? null;
  const selectedSport =
    sports.find((sport) => sport.id === selectedSportId) ?? null;

  useEffect(() => {
    const getSportsAPI = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("http://localhost:7007/api/sports", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (response.status === 404) {
          setSports([]);
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(data?.message ?? "Sports API failed");
        }

        setSports(data.sports);
      } catch (fetchError) {
        console.error("Sports API failed", fetchError);
        setError("Unable to load sports.");
      } finally {
        setIsLoading(false);
      }
    };

    getSportsAPI();
  }, []);

  useEffect(() => {
    if (isLoading || sports.length === 0) return;

    const hasSelectedSport = sports.some((sport) => sport.id === selectedSportId);
    if (hasSelectedSport) return;

    navigate(`/sports/${sports[0].id}`, { replace: true });
  }, [isLoading, navigate, selectedSportId, sports]);

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[1920px] flex-col overflow-hidden bg-secondary text-text">
      <Header
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() =>
          setIsSidebarCollapsed((currentValue) => !currentValue)
        }
      />
      <main
        className={`flex min-h-0 flex-1 flex-col px-4 pb-4 md:flex-row md:px-6 md:pb-6 ${
          isSidebarCollapsed ? "gap-0" : "gap-4"
        }`}
      >
        <Sidebar
          sports={sports}
          isLoading={isLoading}
          error={error}
          isCollapsed={isSidebarCollapsed}
        />

        <div className="min-h-0 flex flex-1 flex-col">
        <Outlet
          context={{
            sports,
            isLoading,
            error,
            selectedSport,
          }}
        />
        </div>
      </main>
    </div>
  );
};

export default HomeLayout;
