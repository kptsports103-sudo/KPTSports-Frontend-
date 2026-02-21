import { useEffect, useState } from "react";

const AbuseLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Placeholder - replace with real API call
    setLogs([
      { _id: 1, ip: "192.168.1.1", route: "/api/users", count: 100, detectedAt: "2023-10-01" },
      { _id: 2, ip: "192.168.1.2", route: "/api/media", count: 50, detectedAt: "2023-10-02" }
    ]);
  }, []);

  return (
    <div>
      <h2>Abuse Detection</h2>
      {logs.map(log => (
        <p key={log._id}>
          {log.ip} blocked on {log.route} ({log.count} requests) at {log.detectedAt}
        </p>
      ))}
    </div>
  );
};

export default AbuseLogs;