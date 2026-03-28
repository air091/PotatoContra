import { useOutletContext } from "react-router-dom";

const Home = () => {
  const { sports, isLoading, error, selectedSport } = useOutletContext();

  if (isLoading) return <div>Loading sports...</div>;
  if (error) return <div>{error}</div>;
  if (sports.length === 0) return <div>No sports available yet.</div>;
  if (!selectedSport) return <div>Select a sport from the sidebar.</div>;

  return (
    <section className="p-4">
      <h1 className="text-xl font-semibold">{selectedSport.name}</h1>
      <p>Sport selected. We can attach the rest of the client flow to this view next.</p>
    </section>
  );
};

export default Home;
