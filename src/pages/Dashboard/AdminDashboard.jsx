import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";

/* =====================
   YEAR DATA (ONLY 2024 & 2025)
====================== */
const yearlyMedals = [
  {
    year: 2024,
    gold: 52,   // Overall champion points converted to medal weight (example)
    silver: 0,
    bronze: 0
  },
  {
    year: 2025,
    gold: 4,
    silver: 0,
    bronze: 1
  }
];

const AdminDashboard = () => {
  const medalData = yearlyMedals.map((y) => ({
    ...y,
    total: y.gold + y.silver + y.bronze
  }));

  const topYears = [...medalData].sort((a, b) => b.total - a.total);

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
        <h1 style={{ fontSize: "34px", fontWeight: "700", marginBottom: "25px" }}>
          Admin Dashboard
        </h1>

        {/* =====================
            MEDAL TALLY (2024 & 2025)
        ====================== */}
        <h2 style={{ marginBottom: "15px" }}>
          📈 Medal Tally by Year (2024 – 2025)
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "25px",
            marginBottom: "40px"
          }}
        >
          {medalData.map((item) => (
            <div
              key={item.year}
              style={{
                backgroundColor: "#ffffff",
                color: "#000",
                borderRadius: "12px",
                padding: "25px",
                textAlign: "center"
              }}
            >
              <div
                style={{
                  width: "130px",
                  height: "130px",
                  borderRadius: "50%",
                  margin: "0 auto 15px",
                  background: `conic-gradient(
                    #f1c40f 0 ${(item.gold / item.total) * 100}%,
                    #bdc3c7 ${(item.gold / item.total) * 100}% ${((item.gold + item.silver) / item.total) * 100}%,
                    #cd7f32 ${((item.gold + item.silver) / item.total) * 100}% 100%
                  )`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "22px"
                }}
              >
                {item.total}
              </div>

              <h2 style={{ marginBottom: "5px" }}>{item.year}</h2>
              <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>
                Total Medals / Points
              </p>
            </div>
          ))}
        </div>

        {/* =====================
            TOP YEARS
        ====================== */}
        <h2 style={{ marginBottom: "15px" }}>🏆 Best Performing Years</h2>

        <div style={{ display: "flex", gap: "20px", marginBottom: "50px" }}>
          {topYears.map((year, index) => (
            <div
              key={year.year}
              style={{
                flex: 1,
                backgroundColor: "#ffffff",
                color: "#000",
                borderRadius: "12px",
                padding: "30px",
                textAlign: "center"
              }}
            >
              <h1 style={{ margin: 0 }}>
                {index === 0 ? "🥇" : "🥈"}
              </h1>
              <h2 style={{ margin: "10px 0" }}>{year.year}</h2>
              <h3 style={{ margin: 0 }}>{year.total} Total</h3>
            </div>
          ))}
        </div>

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

            {[
              "Manage Events",
              "Manage Gallery",
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
