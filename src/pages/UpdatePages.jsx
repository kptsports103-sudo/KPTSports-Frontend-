import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";

// Get user
const getUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

const UpdatePages = () => {
  const user = getUser();
  const [dateTime, setDateTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!user || user.role !== "admin") {
    return (
      <AdminLayout>
        <div style={{ padding: "20px" }}>
          <h1>Access Denied</h1>
          <p>You are not allowed to view this page.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ padding: "20px" }}>
        <h1 style={{ color: '#000' }}>Update Pages</h1>
        <p style={{ color: '#000' }}>This is the Update Pages page.</p>

        {/* Date & Time */}
        <div style={{ margin: "10px 0", fontWeight: "bold", color: '#000' }}>
          Date: {dateTime.toLocaleDateString()} <br />
          Time: {dateTime.toLocaleTimeString()}
        </div>

        <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          <div style={{ backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "8px", padding: "20px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", transition: "transform 0.2s", cursor: "pointer" }} onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.target.style.transform = "scale(1)"}>
            <h3 style={{ margin: "0 0 10px 0", color: "#000" }}>🏠 Update Home</h3>
            <p style={{ margin: "0", color: "#000" }}>Manage home page content</p>
          </div>
          <div style={{ backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "8px", padding: "20px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", transition: "transform 0.2s", cursor: "pointer" }} onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.target.style.transform = "scale(1)"}>
            <h3 style={{ margin: "0 0 10px 0", color: "#000" }}>ℹ️ Update About</h3>
            <p style={{ margin: "0", color: "#000" }}>Manage about page content</p>
          </div>
          <div style={{ backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "8px", padding: "20px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", transition: "transform 0.2s", cursor: "pointer" }} onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.target.style.transform = "scale(1)"}>
            <h3 style={{ margin: "0 0 10px 0", color: "#000" }}>📜 Update History</h3>
            <p style={{ margin: "0", color: "#000" }}>Manage history page content</p>
          </div>
          <div style={{ backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "8px", padding: "20px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", transition: "transform 0.2s", cursor: "pointer" }} onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.target.style.transform = "scale(1)"}>
            <h3 style={{ margin: "0 0 10px 0", color: "#000" }}>📅 Update Events</h3>
            <p style={{ margin: "0", color: "#000" }}>Manage events page content</p>
          </div>
          <div style={{ backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "8px", padding: "20px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", transition: "transform 0.2s", cursor: "pointer" }} onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.target.style.transform = "scale(1)"}>
            <h3 style={{ margin: "0 0 10px 0", color: "#000" }}>🖼️ Update Gallery</h3>
            <p style={{ margin: "0", color: "#000" }}>Manage gallery page content</p>
          </div>
          <div style={{ backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "8px", padding: "20px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", transition: "transform 0.2s", cursor: "pointer" }} onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.target.style.transform = "scale(1)"}>
            <h3 style={{ margin: "0 0 10px 0", color: "#000" }}>🏆 Update Results</h3>
            <p style={{ margin: "0", color: "#000" }}>Manage results page content</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UpdatePages;