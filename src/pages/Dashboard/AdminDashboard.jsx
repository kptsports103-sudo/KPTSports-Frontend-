import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0f3b2e",
          padding: "20px",
          color: "#fff"
        }}
      >
        <h1 style={{ fontSize: "34px", fontWeight: "700", marginBottom: "20px" }}>
          Admin Dashboard
        </h1>

        {/* =====================
            QUICK ACTIONS
        ====================== */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              backgroundColor: "#fff",
              color: "#000",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "500px",
              width: "100%"
            }}
          >
          <h3 style={{ marginBottom: "15px" }}>Quick Actions</h3>

          {/* ACTIVE: MEDIA */}
          <Link
            to="/admin/media"
            style={{
              display: "block",
              padding: "12px",
              backgroundColor: "#0d6efd",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "6px",
              fontSize: "16px",
              textAlign: "center",
              marginBottom: "10px"
            }}
          >
            📁 Media Management
          </Link>

          {/* LOCKED BUTTONS */}
          {[
            "Manage Events",
            "Manage Gallery",
            "Manage Achievements",
            "Manage Results",
            "Manage Home",
            "Manage About",
            "Manage History"
          ].map((item, index) => (
            <div
              key={index}
              style={{
                padding: "12px",
                backgroundColor: "#e9ecef",
                color: "#6c757d",
                borderRadius: "6px",
                fontSize: "15px",
                marginBottom: "8px",
                cursor: "not-allowed",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span>🔒 {item}</span>
              <span style={{ fontSize: "13px" }}>(Locked)</span>
            </div>
          ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
