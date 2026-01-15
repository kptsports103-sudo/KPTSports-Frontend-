import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../../services/api";
import { IAMService } from "../../services/iam.service";
import { useAuth } from "../../context/AuthContext";
import { can } from "../../auth/permissions";

const IAMUsers = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const hasValidToken = token && token.trim() !== '';

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [step, setStep] = useState("identity");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "admin"
  });
  const [otpDeliveryMethod, setOtpDeliveryMethod] = useState("email"); // "email" or "sms"
  const [selectedRole, setSelectedRole] = useState("admin");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hasValidToken) {
      resolveToken();
    }
  }, [hasValidToken]);

  const resolveToken = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/iam/resolve-token?token=${token}`);
      const { phone, role } = response.data;
      setForm(f => ({
        ...f,
        phone: phone || "",
        role: role || "admin"
      }));
      setSelectedRole(role || "admin");
    } catch (err) {
      setError("Invalid or expired invitation link");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async () => {
    if (!form.email) {
      setError("Email address is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setError("");
      // Update form with selected role
      setForm(f => ({ ...f, role: selectedRole }));
      await api.post("/iam/send-otp", { email: form.email });
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await api.post("/iam/verify-otp-onboarding", { email: form.email, otp });
      setStep("profile");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Name, email, and password are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      // Only send token if it exists and is valid (for invitation-based onboarding)
      const payload = { ...form };
      if (hasValidToken) {
        payload.token = token;
      }
      await api.post("/iam/create-user", payload);
      setStep("done");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create account");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetProcess = () => {
    setStep("identity");
    setForm({
      name: "",
      phone: "",
      email: "",
      password: "",
      role: "admin"
    });
    setOtp("");
    setError("");
  };

  if (loading && step === "identity") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Resolving invitation...</p>
        </div>
      </div>
    );
  }

  if (step === "identity") {
    return (
      <div style={{ background: "#f0f4ff", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <div style={{ background: "#4f46e5", color: "white", padding: "24px", textAlign: "center", borderRadius: "12px", marginBottom: "32px" }}>
              <h3 style={{ fontSize: "24px", fontWeight: "bold", margin: "0 0 8px 0" }}>Verify Mobile</h3>
              <p style={{ margin: 0, opacity: 0.9 }}>Enter your details to continue</p>
            </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label htmlFor="userRole" style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                User Role *
              </label>
              <select
                id="userRole"
                name="userRole"
                autoComplete="organization-title"
                value={selectedRole}
                disabled={!!token} // Disable if role is pre-filled from token
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  backgroundColor: "white",
                  cursor: !!token ? "not-allowed" : "pointer"
                }}
              >
                <option value="superadmin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="creator">Creator</option>
              </select>
            </div>

            <div>
              <label htmlFor="email" style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none"
                }}
                placeholder="Enter your email address"
                value={form.email}
                disabled={!!form.email && !!token} // Disable if pre-filled from token
                onChange={(e) => setForm({...form, email: e.target.value})}
              />
              <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>We'll send an OTP for verification</p>
            </div>

            <button
              onClick={sendOTP}
              disabled={loading || !form.email}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading || !form.email ? "not-allowed" : "pointer",
                opacity: loading || !form.email ? 0.5 : 1
              }}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div style={{ background: "#f0f4ff", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div style={{ background: "#10b981", color: "white", padding: "24px", textAlign: "center", borderRadius: "12px", marginBottom: "32px" }}>
            <h3 style={{ fontSize: "24px", fontWeight: "bold", margin: "0 0 8px 0" }}>Enter OTP</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>Verify your mobile number</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
              {error}
            </div>
          )}

          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">
              An OTP has been sent to <strong>{form.email}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Please enter the 6-digit code
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="otp" className="sr-only">Enter OTP</label>
            <input
              id="otp"
              name="otp"
              type="text"
              autoComplete="one-time-code"
              className="w-full px-4 py-4 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength="6"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("identity")}
              className="flex-1 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
            >
              Back
            </button>
            <button
              onClick={verifyOTP}
              disabled={loading || otp.length !== 6}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "profile") {
    return (
      <div style={{ background: "#f0f4ff", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div style={{ background: "#8b5cf6", color: "white", padding: "24px", textAlign: "center", borderRadius: "12px", marginBottom: "32px" }}>
            <h3 style={{ fontSize: "24px", fontWeight: "bold", margin: "0 0 8px 0" }}>Complete Profile</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>Set up your account details</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label htmlFor="fullName" style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none"
                }}
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
              />
            </div>

            <div>
              <label htmlFor="mobile" style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                Mobile Number *
              </label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                autoComplete="tel"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none"
                }}
                placeholder="Enter 10-digit mobile number"
                value={form.phone}
                onChange={(e) => setForm({...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
              />
            </div>

            <div>
              <label htmlFor="password" style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none"
                }}
                placeholder="Create a strong password"
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
              />
            </div>

            <div style={{ backgroundColor: "#f9fafb", padding: "12px", borderRadius: "8px" }}>
              <p style={{ fontSize: "14px", color: "#374151", margin: "4px 0" }}>
                <strong>Role:</strong> {form.role}
              </p>
              <p style={{ fontSize: "14px", color: "#374151", margin: "4px 0" }}>
                <strong>Email:</strong> {form.email}
              </p>
            </div>

            <button
              onClick={createUser}
              disabled={loading || !form.name || !form.email || !form.password}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div style={{ background: "#f0f4ff", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div style={{ background: "#10b981", color: "white", padding: "32px", borderRadius: "12px", marginBottom: "24px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <h3 style={{ fontSize: "24px", fontWeight: "bold", margin: "0 0 8px 0" }}>Account Activated!</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>Welcome to KPT Sports</p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Welcome, {form.name}!</strong>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Your account has been successfully activated. You can now log in using your email and password.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={resetProcess}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition font-semibold"
              >
                Create Another
              </button>
              <Link
                to="/admin/users-manage"
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-semibold text-center"
              >
                View All Users
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default IAMUsers;
