import { useState, useEffect } from "react";
import { IAMService } from "../../services/iam.service";

const IAMUsers = () => {
  const [view, setView] = useState("list");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "Creator"
  });
  const [pendingUser, setPendingUser] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (view === "list") {
      fetchUsers();
    }
  }, [view]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await IAMService.getUsers();
      setUsers(data);
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError("Name, email, password, and mobile number are required");
      return;
    }

    // Mobile number validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await IAMService.createUser(formData);
      setPendingUser(result.user);
      setView("otp");
    } catch (err) {
      console.error('Create user error:', err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to create user";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setOtpLoading(true);
      setError(null);
      await IAMService.verifyOTP(pendingUser.id, otp);
      alert("User verified and activated successfully!");
      setPendingUser(null);
      setOtp("");
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "Creator"
      });
      setView("list");
      fetchUsers(); // Refresh the user list
    } catch (err) {
      setError(err.message || "Failed to verify OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setOtpLoading(true);
      setError(null);
      await IAMService.resendOTP(pendingUser.id);
      alert("OTP resent successfully!");
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await IAMService.deleteUser(userId);
      alert("User deleted successfully!");
      fetchUsers(); // Refresh the user list
    } catch (err) {
      setError(err.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  if (view === "list") {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              👥 All Users
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1">
              <span className="text-sm font-medium text-blue-700">
                Total Users: {users.length}
              </span>
            </div>
          </div>
          <button
            onClick={() => setView("form")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add User
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">Loading users...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">
                    Email
                  </th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">
                    Mobile
                  </th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">
                    Role
                  </th>
                  <th className="px-5 py-3 text-center font-semibold text-gray-600 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id || u.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-medium text-blue-600">
                        {u.name}
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {u.email}
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {u.phone}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <button className="rounded-md bg-blue-600 px-3 py-1 text-white hover:bg-blue-700">
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id || u.id, u.name)}
                            className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  if (view === "otp") {
    return (
      <div className="flex justify-center py-10">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md">
          <div className="bg-gray-100 py-4 mb-8 text-center text-lg font-medium">
            Verify Mobile Number
          </div>
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">
              An OTP has been sent to <strong>{pendingUser?.phone}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Please enter the 6-digit OTP to activate the account
            </p>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP *
            </label>
            <input
              type="text"
              className="input text-center text-2xl tracking-widest"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength="6"
            />
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => setView("form")}
              className="px-6 py-2 rounded border"
            >
              Back
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleResendOTP}
                disabled={otpLoading}
                className="px-4 py-2 rounded border text-sm disabled:opacity-50"
              >
                Resend OTP
              </button>
              <button
                onClick={handleVerifyOTP}
                disabled={otpLoading || otp.length !== 6}
                className="bg-green-600 text-white px-6 py-2 rounded disabled:opacity-50"
              >
                {otpLoading ? "Verifying..." : "Verify & Activate"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-10">
      <div className="bg-white rounded-2xl p-8 w-full max-w-5xl">
        <div className="bg-gray-100 py-4 mb-8 text-center text-lg font-medium">
          Add / Edit Users
        </div>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <label>Name *</label>
            <input
              className="input"
              placeholder="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            <label className="mt-4 block">Mobile *</label>
            <input
              className="input"
              placeholder="10-digit mobile number"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
            <label className="mt-4 block">Password *</label>
            <input
              className="input"
              type="password"
              placeholder="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Email *</label>
            <input
              className="input"
              placeholder="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <label className="mt-4 block">User Role</label>
            <select
              className="input"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
            >
              <option value="Super Admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="Creator">Creator</option>
              <option value="coach">Coach</option>
              <option value="student">Student</option>
            </select>
          </div>
        </div>
        <div className="flex justify-between mt-10">
          <button onClick={() => setView("list")} className="px-6 py-2 rounded border">
            Back
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IAMUsers;
