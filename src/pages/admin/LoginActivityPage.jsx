import { useEffect, useState } from "react";

const LoginActivityPage = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Placeholder - replace with real API call
    setLogs([
      { _id: 1, email: "admin@example.com", role: "admin", ipAddress: "192.168.1.1", loggedInAt: "2023-10-01T10:00:00Z" },
      { _id: 2, email: "coach@example.com", role: "coach", ipAddress: "192.168.1.2", loggedInAt: "2023-10-02T11:00:00Z" }
    ]);
  }, []);

  return (
    <div>
      <h2>Login Activity</h2>
      <table className="iam-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>IP</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log._id}>
              <td>{log.email}</td>
              <td>{log.role}</td>
              <td>{log.ipAddress}</td>
              <td>{new Date(log.loggedInAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoginActivityPage;