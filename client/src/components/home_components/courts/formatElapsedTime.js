const formatElapsedTime = (startedAt, now) => {
  if (!startedAt) return null;

  const startedAtDate = new Date(startedAt);
  const startedAtTimestamp = startedAtDate.getTime();

  if (Number.isNaN(startedAtTimestamp)) return null;

  const totalSeconds = Math.max(0, Math.floor((now - startedAtTimestamp) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export default formatElapsedTime;
