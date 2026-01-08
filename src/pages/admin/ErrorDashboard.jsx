import { useEffect, useState } from "react";

const ErrorDashboard = () => {
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    // Placeholder - replace with real API call
    setErrors([
      { _id: 1, type: "API_ERROR", message: "Database connection failed", route: "/api/users", createdAt: "2023-10-01" },
      { _id: 2, type: "UPLOAD_ERROR", message: "File size too large", route: "/api/media", createdAt: "2023-10-02" }
    ]);
  }, []);

  return (
    <div>
      <h2>System Errors</h2>
      {errors.map(err => (
        <div key={err._id} className="error-card">
          <b>{err.type}</b>
          <p>{err.message}</p>
          <small>{err.route} - {err.createdAt}</small>
        </div>
      ))}
    </div>
  );
};

export default ErrorDashboard;