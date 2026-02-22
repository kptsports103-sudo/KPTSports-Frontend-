import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import SuperAdminLayout from "../super-admin/SuperAdminLayout";
import { IAMService } from "../../services/iam.service";
import { confirmAction } from "../../utils/notify";
import { useAuth } from "../../context/AuthContext";

const UsersManage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const tableStyles = {
    tableContainer: {
      background: "#fff",
      borderRadius: "16px",
      overflow: "auto",
      boxShadow: "0 8px 24px rgba(71, 85, 105, 0.12)",
      border: "1px solid #cfd6df",
      maxHeight: "600px",
    },
    table: {
      width: "100%",
      background: "#ffffff",
      color: "#1f2937",
      borderCollapse: "collapse",
      fontSize: 14,
      lineHeight: 1.5,
    },
    headerCell: {
      padding: "15px",
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: "0.8px",
      fontWeight: 600,
      position: "sticky",
      top: 0,
      zIndex: 2,
      background: "linear-gradient(135deg, #eef2f6 0%, #d6dde5 100%)",
      borderBottom: "1px solid #c0c8d2",
      color: "#111827",
    },
    row: {
      borderBottom: "1px solid #e5e7eb",
      backgroundColor: "#ffffff",
    },
    rowAlt: {
      borderBottom: "1px solid #e5e7eb",
      backgroundColor: "#f5f7fa",
    },
    cell: {
      padding: "15px",
      fontSize: 14,
      color: "#1f2937",
    },
  };

  const maskEmail = (email) => {
    if (!email || !email.includes("@")) return email;
    const [name, domain] = email.split("@");
    return name + "*******@" + domain;
  };

  const maskPhone = (phone) => {
    if (!phone) return "-------";
    return "******** " + phone.slice(-3);
  };

  const getRoleInfo = (role) => {
    if (role === "superadmin") {
      return "This user has full system control, including IAM, security, and audit visibility.";
    }
    if (role === "admin") {
      return "This user can manage operations, results, and content, but cannot manage system users.";
    }
    if (role === "creator") {
      return "This user can add and edit players/results and upload media, but cannot delete records.";
    }
    if (role === "viewer") {
      return "This user has read-only access to pages permitted by policy.";
    }
    return "Role information not available.";
  };

  const getCreatedDate = (createdAt) => {
    if (!createdAt) return "N/A";
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString();
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await IAMService.getUsers();
      setUsers(response);
      setError("");
      return response;
    } catch {
      setError("Failed to fetch users");
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    const shouldDelete = await confirmAction("Are you sure?");
    if (!shouldDelete) return;
    try {
      await IAMService.deleteUser(userId);
      setUsers(users.filter((u) => u._id !== userId));
    } catch {
      setError("Delete failed");
    }
  };

  const handleProfileClick = async (user) => {
    const latestUsers = await fetchUsers();
    const latestSelected = latestUsers.find((u) => u._id === user._id) || user;
    setSelectedUser(latestSelected);
    setShowProfileModal(true);
  };

  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const Layout = user?.role === "superadmin" ? SuperAdminLayout : AdminLayout;

  return (
    <Layout>
      <div className="p-8 min-h-screen" style={{ background: "#f4f6f8" }}>
        <div className="flex justify-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: "#000" }}>
            <img src="/group.png" className="w-8 h-8" />
            Manage Users
          </h1>
        </div>

        <div
          className="p-6"
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #cfd6df",
            boxShadow: "0 8px 24px rgba(71, 85, 105, 0.12)",
          }}
        >
          <div className="flex items-center gap-2 border-b pb-4 mb-6">
            <img src="/group.png" className="w-6 h-6" />
            <h2 className="text-xl font-semibold" style={{ color: "#000" }}>Admin Users</h2>
          </div>

          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No users found</div>
          ) : (
            <div style={tableStyles.tableContainer}>
              <table style={tableStyles.table}>
                <thead>
                  <tr>
                    <th style={{ ...tableStyles.headerCell, textAlign: "center" }}>Avatar</th>
                    <th style={{ ...tableStyles.headerCell, textAlign: "left" }}>Name</th>
                    <th style={{ ...tableStyles.headerCell, textAlign: "left" }}>Email</th>
                    <th style={{ ...tableStyles.headerCell, textAlign: "left" }}>Phone</th>
                    <th style={{ ...tableStyles.headerCell, textAlign: "center" }}>Role</th>
                    <th style={{ ...tableStyles.headerCell, textAlign: "center" }}>Verified</th>
                    <th style={{ ...tableStyles.headerCell, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <tr key={user._id} style={i % 2 ? tableStyles.rowAlt : tableStyles.row}>
                      <td style={{ ...tableStyles.cell, textAlign: "center" }}>
                        <img
                          src={user.profileImage || "/avatar.png"}
                          alt="profile"
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "6px",
                            objectFit: "cover",
                            border: "1px solid #ccc",
                          }}
                        />
                      </td>
                      <td style={tableStyles.cell}>{user.name}</td>
                      <td style={tableStyles.cell}>{maskEmail(user.email)}</td>
                      <td style={tableStyles.cell}>{maskPhone(user.phone)}</td>
                      <td style={{ ...tableStyles.cell, textAlign: "center" }}>{user.role}</td>
                      <td style={{ ...tableStyles.cell, textAlign: "center" }}>
                        <span className={`text-sm ${user.is_verified ? "text-green-600" : "text-red-600"}`}>
                          {user.is_verified ? "Yes" : "No"}
                        </span>
                      </td>
                      <td style={{ ...tableStyles.cell, textAlign: "right" }}>
                        <button
                          onClick={() => handleProfileClick(user)}
                          style={{
                            padding: "6px 12px",
                            background: "#dee2e6",
                            color: "#000",
                            border: "1px solid #adb5bd",
                            marginRight: "5px",
                            cursor: "pointer",
                          }}
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          style={{
                            padding: "6px 12px",
                            background: "#dc3545",
                            color: "#fff",
                            border: "1px solid #dc3545",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showProfileModal && selectedUser && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div
            style={{
              width: "min(460px, 92vw)",
              background: "#ffffff",
              borderRadius: "14px",
              border: "1px solid #cfd6df",
              boxShadow: "0 20px 40px rgba(15, 23, 42, 0.25)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2 className="text-xl font-semibold mb-1" style={{ color: "#111827", margin: 0 }}>{selectedUser.name}</h2>
                <p style={{ color: "#4b5563", margin: 0 }}>Profile</p>
              </div>
              <button
                onClick={handleCloseProfileModal}
                style={{ border: "none", background: "transparent", color: "#94a3b8", fontSize: "30px", lineHeight: 1, cursor: "pointer" }}
                aria-label="Close profile modal"
              >
                ×
              </button>
            </div>

            <div style={{ padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
                <img
                  src={selectedUser.profileImage || "/avatar.png"}
                  alt="profile"
                  style={{
                    width: 84,
                    height: 84,
                    objectFit: "cover",
                    borderRadius: "10px",
                    border: "1px solid #d1d5db",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
                  }}
                />
              </div>

              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px" }}>
                <p style={{ color: "#000", margin: "0 0 8px" }}><b>Email:</b> {selectedUser.email}</p>
                <p style={{ color: "#000", margin: "0 0 8px" }}><b>Phone:</b> {selectedUser.phone || "N/A"}</p>
                <p style={{ color: "#000", margin: "0 0 8px" }}><b>Role:</b> {selectedUser.role}</p>
                <p style={{ color: "#000", margin: 0 }}><b>Created:</b> {getCreatedDate(selectedUser.createdAt)}</p>
              </div>

              <p className="text-sm mt-4 leading-relaxed" style={{ color: "#000", marginTop: "12px" }}>
                {getRoleInfo(selectedUser.role)}
              </p>

              <div style={{ textAlign: "center", marginTop: "12px" }}>
                <button
                  onClick={handleCloseProfileModal}
                  style={{
                    padding: "8px 18px",
                    background: "#1f2937",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UsersManage;

