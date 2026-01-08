import { useEffect, useState } from "react";

const MediaStats = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Placeholder - replace with real API call
    setStats({
      totalAssets: 342,
      storageUsedMB: 150,
      bandwidthMB: 500
    });
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h2>Cloudinary Media Stats</h2>
      <div className="stat-card">
        <h4>Media Overview</h4>
        <p>Total Assets: {stats.totalAssets}</p>
        <p>Storage Used: {stats.storageUsedMB} MB</p>
        <p>Bandwidth Used: {stats.bandwidthMB} MB</p>
      </div>
    </div>
  );
};

export default MediaStats;