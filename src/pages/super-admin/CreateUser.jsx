import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IAMService } from "../../services/iam.service";
import { useAuth } from "../../context/AuthContext";
import { can } from "../../auth/permissions";
import SuperAdminLayout from "./SuperAdminLayout";

const FormField = ({ label, htmlFor, children }) => (
  <div>
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-gray-700">
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
    role: "creator"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const renderPage = (content) => (
    <SuperAdminLayout>
      <section className="w-full min-w-0 p-6 lg:p-8">
        <div className="mx-auto w-full max-w-2xl">{content}</div>
      </section>
    </SuperAdminLayout>
  );

  if (!can(user, "USER_CREATE")) {
    return renderPage(
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
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
      setForm({ name: "", email: "", password: "", role: "creator" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return renderPage(
    <div className="rounded-xl bg-white p-6 shadow-md sm:p-8">
      <div className="mb-1 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/admin/iam/users")}
          className="text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Create KPT Sports Account</h1>
      </div>

      <p className="mb-6 text-sm text-gray-500">
        Add a new user to your organization
      </p>

      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded bg-red-100 p-3 text-red-700">{error}</div>
        )}

        <FormField label="Name" htmlFor="create-user-name">
          <input
            id="create-user-name"
            name="name"
            className="input"
            placeholder="Full name"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </FormField>

        <FormField label="Email" htmlFor="create-user-email">
          <input
            id="create-user-email"
            name="email"
            className="input"
            type="email"
            placeholder="Email address"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </FormField>

        <FormField label="Password" htmlFor="create-user-password">
          <input
            id="create-user-password"
            name="password"
            className="input"
            type="password"
            placeholder="Temporary password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </FormField>

        <FormField label="Role" htmlFor="create-user-role">
          <select
            id="create-user-role"
            name="role"
            className="input"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="creator">Creator</option>
            <option value="admin">Admin</option>
          </select>
        </FormField>

        <div className="pt-2">
          <button
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;
