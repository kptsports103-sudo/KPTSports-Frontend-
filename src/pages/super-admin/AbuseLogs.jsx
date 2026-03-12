import { useEffect, useState } from "react";
import SuperAdminLayout from "./SuperAdminLayout";

const AbuseLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Placeholder - replace with real API call
    setLogs([
      { _id: 1, ip: "192.168.1.1", route: "/api/users", count: 100, detectedAt: "2023-10-01" },
      { _id: 2, ip: "192.168.1.2", route: "/api/media", count: 50, detectedAt: "2023-10-02" }
    ]);
  }, []);

  return (
    <SuperAdminLayout>
      <section className="w-full min-w-0 p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Abuse Logs</h1>
          <p className="mt-2 text-slate-600">
            Review flagged routes and suspicious request spikes.
          </p>
        </header>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {logs.length === 0 ? (
            <div className="px-6 py-8 text-sm text-slate-500">No abuse events detected.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Route</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Requests</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Detected At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{log.ip}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{log.route}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{log.count}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(log.detectedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </SuperAdminLayout>
  );
};

export default AbuseLogs;
