import { useEffect, useState } from "react";
import AdminLayout from "../admin/AdminLayout";

const ErrorDashboard = () => {
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    // Placeholder - replace with real API call
    setErrors([
      { _id: 1, type: "API_ERROR", message: "Database connection failed", route: "/api/users", createdAt: "2023-10-01T10:00:00Z", user: "admin@example.com", status: "unresolved" },
      { _id: 2, type: "UPLOAD_ERROR", message: "File size too large", route: "/api/media", createdAt: "2023-10-02T14:30:00Z", user: "user@example.com", status: "resolved" }
    ]);
  }, []);

  const toggleStatus = (id) => {
    setErrors(errors.map(err =>
      err._id === id ? { ...err, status: err.status === 'resolved' ? 'unresolved' : 'resolved' } : err
    ));
  };

  return (
    <AdminLayout>
      <div className="dashboard-title">Error Dashboard</div>
      <div className="dashboard-subtitle">Monitor and manage system errors</div>

      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", color: "#000" }}>
        <h3>Recent Errors (Last 24 Hours)</h3>
        {errors.length === 0 ? (
          <p>No errors reported in the last 24 hours.</p>
        ) : (
          <div style={{ display: "grid", gap: "15px" }}>
            {errors.map(err => (
              <div key={err._id} style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                backgroundColor: err.status === 'resolved' ? "#f0f8f0" : "#fff5f5"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong style={{ color: err.type.includes('ERROR') ? "#e74c3c" : "#f39c12" }}>{err.type}</strong>
                    <p style={{ margin: "5px 0" }}>{err.message}</p>
                    <small style={{ color: "#666" }}>
                      Route: {err.route} | User: {err.user} | Time: {new Date(err.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <button
                    onClick={() => toggleStatus(err._id)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: err.status === 'resolved' ? "#27ae60" : "#e74c3c",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    {err.status === 'resolved' ? 'Resolved' : 'Mark Resolved'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ErrorDashboard;
