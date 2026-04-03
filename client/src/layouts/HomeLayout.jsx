import { Outlet, useMatch, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/home_components/Sidebar";
import Header from "../components/home_components/Header";
import { apiFetch } from "../lib/api";
import { resolveWorkspace } from "../lib/workspace";

const HomeLayout = () => {
  const [sports, setSports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [workspaceId, setWorkspaceId] = useState(null);
  const navigate = useNavigate();
  const selectedSportMatch = useMatch("/sports/:sportId");
  const selectedSportId = selectedSportMatch?.params?.sportId ?? null;
  const selectedSport =
    sports.find((sport) => sport.id === selectedSportId) ?? null;

  useEffect(() => {
    let isCancelled = false;

    const initializeWorkspace = async () => {
      try {
        setIsLoading(true);
        setError("");

        const workspace = await resolveWorkspace();
        if (isCancelled) return;

        setWorkspaceId(workspace.id);

        const response = await apiFetch("/api/sports", {
          method: "GET",
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data?.message ?? "Sports API failed");
        }

        setSports(data.sports ?? []);
      } catch (fetchError) {
        if (isCancelled) return;

        console.error("Sports API failed", fetchError);
        setSports([]);
        setError(
          fetchError.message === "Unable to initialize workspace"
            ? "Unable to initialize workspace."
            : "Unable to load sports.",
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    initializeWorkspace();

    return () => {
      isCancelled = true;
    };
  }, []);

  const createSport = async (name) => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      throw new Error("Sport name is required.");
    }

    const response = await apiFetch("/api/sports/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: trimmedName }),
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data?.message ?? "Unable to create sport.");
    }

    setSports((currentSports) => {
      const nextSports = [...currentSports, data.sport];
      nextSports.sort((sportA, sportB) => sportA.name.localeCompare(sportB.name));
      return nextSports;
    });
    navigate(`/sports/${data.sport.id}`);

    return data.sport;
  };

  useEffect(() => {
    if (isLoading || sports.length === 0) return;

    const hasSelectedSport = sports.some((sport) => sport.id === selectedSportId);
    if (hasSelectedSport) return;

    navigate(`/sports/${sports[0].id}`, { replace: true });
  }, [isLoading, navigate, selectedSportId, sports]);

  return (
    <div className="mx-auto flex h-dvh w-full max-w-480 flex-col overflow-hidden bg-secondary text-text">
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
          createSport={createSport}
        />

        <div className="min-h-0 flex flex-1 flex-col">
          <Outlet
            context={{
              sports,
              isLoading,
              error,
              selectedSport,
              workspaceId,
              createSport,
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default HomeLayout;
