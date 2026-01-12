import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IAMService } from "../../services/iam.service";
import { useAuth } from "../../context/AuthContext";
import { can } from "../../auth/permissions";

const FormField = ({ label, children }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700">
      {label}
    </label>
    {children}
  </div>
);

const CreateUser = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!can(user, "USER_CREATE")) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
        You do not have permission to create users.
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await IAMService.createUser(form);
      alert("User successfully created");
      setForm({ name: "", email: "", password: "", role: "student" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center pt-16">
      <div className="w-full max-w-lg">
        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-4 mb-1">
            <button
              type="button"
              onClick={() => navigate("/admin/iam/users")}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Create User</h1>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Add a new user to your organization
          </p>

          <form onSubmit={submit} className="space-y-4">
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>
            )}

            <FormField label="Name">
              <input className="input" placeholder="Full name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </FormField>

            <FormField label="Email">
              <input className="input" type="email" placeholder="Email address"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </FormField>

            <FormField label="Password">
              <input className="input" type="password" placeholder="Temporary password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </FormField>

            <FormField label="Role">
              <select className="input"
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="student">Student</option>
                <option value="coach">Coach</option>
                <option value="admin">Admin</option>
              </select>
            </FormField>

            <div className="pt-2">
              <button disabled={loading} className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700">
                {loading ? "Creating…" : "Create User"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;