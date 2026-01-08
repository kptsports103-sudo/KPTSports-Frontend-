import { useEffect, useState } from "react";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Placeholder - replace with real API call
    setLogs([
      { _id: 1, action: "CREATE_USER", performedBy: "admin@example.com", target: "user@example.com", details: "Created admin account", createdAt: "2023-10-01" },
      { _id: 2, action: "DISABLE_USER", performedBy: "admin@example.com", target: "coach@example.com", details: "User status changed to disabled", createdAt: "2023-10-02" }
    ]);
  }, []);

  return (
    <div>
      <h2>Audit Logs</h2>
      <ul>
        {logs.map(log => (
          <li key={log._id}>
            <b>{log.action}</b> — {log.details} by {log.performedBy} on {log.createdAt}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AuditLogs;