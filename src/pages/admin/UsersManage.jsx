import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { IAMService } from "../../services/iam.service";
import { useAuth } from "../../context/AuthContext";

const UsersManage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    password: "",
    profileImage: null,
    profileImagePreview: null
  });

  const maskEmail = (email) => {
    if (!email || !email.includes("@")) return email;
    const [name, domain] = email.split("@");

    if (name.length <= 5) return "-------@" + domain;

    const visible = name.slice(0, name.length - 5);
    return visible + "-------@" + domain;
  };

  const maskPhone = (phone) => {
    if (!phone) return "-------";
    return "---- " + phone.slice(-3);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await IAMService.getUsers();
      setUsers(response);
    } catch {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await IAMService.deleteUser(userId);
      setUsers(users.filter((u) => u._id !== userId));
    } catch {
      setError("Delete failed");
    }
  };

  const handleProfileClick = (user) => {
    setSelectedUser(user);
    setProfileForm({
      name: user.name || "",
      phone: user.phone || "",
      password: "",
      profileImage: null,
      profileImagePreview: null
    });
    setShowProfileModal(true);
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileForm({
        ...profileForm,
        profileImage: reader.result,
        profileImagePreview: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async () => {
    try {
      // Here you would call an API to update the user profile
      // For now, just close the modal
      setShowProfileModal(false);
      setSelectedUser(null);
      // You could refetch users here if needed
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 bg-gray-50 min-h-screen">

        {/* Center Heading */}
        <div className="flex justify-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <img src="/group.png" className="w-8 h-8" />
            Manage Users
          </h1>
        </div>

        {/* Big Box */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">

          {/* Inner Heading */}
          <div className="flex items-center gap-2 border-b pb-4 mb-6">
            <img src="/group.png" className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Admin Users</h2>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : (
            users.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No users found
              </div>
            ) : (
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <table style={{ width: '100%', background: '#fff', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                <thead>
                  <tr style={{ background: '#e9ecef' }}>
                    <th style={{ padding: '15px', textAlign: 'center' }}>Avatar</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Phone</th>
                    <th style={{ padding: '15px', textAlign: 'center' }}>Role</th>
                    <th style={{ padding: '15px', textAlign: 'center' }}>Verified</th>
                    <th style={{ padding: '15px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <tr key={user._id} style={{ background: i % 2 ? '#f8f9fa' : '#fff' }}>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <img
                          src={user.profileImage || "https://via.placeholder.com/40"}
                          alt="profile"
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '6px',
                            objectFit: 'cover',
                            border: '1px solid #ccc'
                          }}
                        />
                      </td>
                      <td style={{ padding: '15px' }}>{user.name}</td>
                      <td style={{ padding: '15px' }}>{user.role === 'superadmin' || user.role === 'AssetAdmin' ? user.email : maskEmail(user.email)}</td>
                      <td style={{ padding: '15px' }}>{user.role === 'superadmin' || user.role === 'AssetAdmin' ? user.phone : maskPhone(user.phone)}</td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>{user.role}</td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <span
                          className={`text-sm ${
                            user.is_verified ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {user.is_verified ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleProfileClick(user)}
                          style={{
                            padding: '6px 12px',
                            background: '#dee2e6',
                            color: '#000',
                            border: '1px solid #adb5bd',
                            marginRight: '5px',
                            cursor: 'pointer'
                          }}
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          style={{
                            padding: '6px 12px',
                            background: '#dc3545',
                            color: '#fff',
                            border: '1px solid #dc3545'
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
            )
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[380px] shadow-2xl p-6 relative">

            {/* Close */}
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-black text-xl"
            >
              ×
            </button>

            {/* Name */}
            <h2 className="text-xl font-semibold text-center mb-4">
              {selectedUser.name}
            </h2>

            {/* Image */}
            <div className="flex justify-center mb-4">
              <img
                src={selectedUser.profileImage || "https://via.placeholder.com/150"}
                alt="profile"
                className="w-32 h-32 object-cover rounded-xl border shadow"
              />
            </div>

            {/* Info */}
            <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
              <p><span className="font-semibold">Email:</span> {maskEmail(selectedUser.email)}</p>
              <p><span className="font-semibold">Phone:</span> {maskPhone(selectedUser.phone)}</p>
              <p><span className="font-semibold">Role:</span> {selectedUser.role}</p>
            </div>

            {/* Explanation */}
            <p className="text-xs text-gray-600 mt-3 leading-relaxed">
              This user logs in using <b>Email & Password</b>.
              The assigned role <b>{selectedUser.role}</b> decides what features and pages
              this user can access in the system.
            </p>

            {/* Button */}
            <div className="mt-5 flex justify-center">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UsersManage;
