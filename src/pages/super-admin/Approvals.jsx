import { useEffect, useState } from "react";
import SuperAdminLayout from "./SuperAdminLayout";

const Approvals = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Placeholder - replace with real API call
    setItems([
      { _id: 1, type: "CONTENT", requestedBy: "coach@example.com", status: "pending", createdAt: "2023-10-01" },
      { _id: 2, type: "USER_REGISTRATION", requestedBy: "student@example.com", status: "pending", createdAt: "2023-10-02" }
    ]);
  }, []);

  return (
    <SuperAdminLayout>
      <section className="w-full min-w-0 p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Approval Requests</h1>
          <p className="mt-2 text-slate-600">
            Review pending requests without shrinking the main content area.
          </p>
        </header>

        {items.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-8 text-sm text-slate-500 shadow-sm">
            No approval requests are pending.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {items.map((item) => (
              <article
                key={item._id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-slate-900">{item.type}</h2>
                    <p className="mt-1 text-sm text-slate-600">Requested by {item.requestedBy}</p>
                    <p className="mt-3 text-sm text-slate-500">
                      Created on {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
                    {item.status}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
                    Approve
                  </button>
                  <button className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50">
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </SuperAdminLayout>
  );
};

export default Approvals;
