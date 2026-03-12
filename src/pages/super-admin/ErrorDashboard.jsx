import { useEffect, useState } from "react";
import SuperAdminLayout from "./SuperAdminLayout";

const ErrorDashboard = () => {
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    // Placeholder - replace with real API call
    setErrors([
      { _id: 1, type: "API_ERROR", message: "Database connection failed", route: "/api/users", createdAt: "2023-10-01T10:00:00Z", user: "admin@example.com", status: "unresolved" },
      { _id: 2, type: "UPLOAD_ERROR", message: "File size too large", route: "/api/media", createdAt: "2023-10-02T14:30:00Z", user: "user@example.com", status: "resolved" }
    ]);
  }, []);

  const toggleStatus = (id) => {
    setErrors(errors.map(err =>
      err._id === id ? { ...err, status: err.status === 'resolved' ? 'unresolved' : 'resolved' } : err
    ));
  };

  return (
    <SuperAdminLayout>
      <section className="w-full min-w-0 p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Error Dashboard</h1>
          <p className="mt-2 text-slate-600">Monitor and manage system errors.</p>
        </header>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Recent Errors (Last 24 Hours)</h2>

          {errors.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No errors reported in the last 24 hours.</p>
          ) : (
            <div className="mt-6 grid gap-4">
              {errors.map((err) => (
                <article
                  key={err._id}
                  className={`rounded-xl border p-5 ${
                    err.status === "resolved"
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-rose-200 bg-rose-50"
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold uppercase tracking-wide ${
                          err.type.includes("ERROR") ? "text-rose-600" : "text-amber-600"
                        }`}
                      >
                        {err.type}
                      </p>
                      <p className="mt-2 text-base font-medium text-slate-900">{err.message}</p>
                      <p className="mt-2 text-sm text-slate-600">
                        Route: {err.route} | User: {err.user} | Time: {new Date(err.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleStatus(err._id)}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                        err.status === "resolved"
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-rose-600 hover:bg-rose-700"
                      }`}
                    >
                      {err.status === "resolved" ? "Resolved" : "Mark Resolved"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </SuperAdminLayout>
  );
};

export default ErrorDashboard;
