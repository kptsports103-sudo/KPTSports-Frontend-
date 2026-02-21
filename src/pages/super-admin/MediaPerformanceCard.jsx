import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#ef4444", "#22c55e"];
const POLL_INTERVAL_MS = 10000;
const toMb = (value) => (Number(value || 0) / 1024 / 1024).toFixed(2);

const MediaPerformanceCard = () => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    let intervalId;

    const loadStats = async () => {
      try {
        setError("");
        const response = await api.get("/media/stats");
        const data = response?.data?.data;
        if (!ignore) {
          setStats(data || null);
          if (data) {
            setHistory((prev) => [
              ...prev.slice(-10),
              {
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                bandwidthMb: Number(toMb(data.bandwidth)),
                requests: Number(data.requests || 0),
                transformations: Number(data.transformations || 0),
              },
            ]);
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err?.response?.data?.message || "Unable to load media analytics");
        }
      }
    };

    loadStats();
    intervalId = setInterval(loadStats, POLL_INTERVAL_MS);
    return () => {
      ignore = true;
      clearInterval(intervalId);
    };
  }, []);

  const storageData = useMemo(() => {
    if (!stats) return [];
    const used = Number(stats.percentUsed || 0);
    return [
      { name: "Used", value: used },
      { name: "Remaining", value: Math.max(0, 100 - used) },
    ];
  }, [stats]);

  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Media Analytics</h2>
      <p className="mt-1 text-sm text-slate-500">Real-time Cloudinary performance and storage monitoring</p>

      {error ? (
        <p className="mt-4 text-sm text-rose-600">{error}</p>
      ) : !stats ? (
        <p className="mt-4 text-sm text-slate-600">Loading...</p>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-base font-semibold text-slate-900">Storage Usage (1 GB Limit)</h3>
            <div className="h-[260px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={storageData} dataKey="value" outerRadius={90} label>
                    {storageData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1 text-sm text-slate-700">
              <p><b>Used:</b> {toMb(stats.storageUsed)} MB</p>
              <p><b>Remaining:</b> {toMb(stats.remainingStorage)} MB</p>
              <p><b>Usage:</b> {stats.percentUsed}%</p>
            </div>
            <div className="mt-3 h-2 rounded bg-slate-200 overflow-hidden">
              <div
                className={stats.percentUsed > 80 ? "h-full bg-rose-500" : "h-full bg-blue-600"}
                style={{ width: `${Math.min(100, Number(stats.percentUsed || 0))}%` }}
              />
            </div>
            {stats.percentUsed > 80 ? (
              <p className="mt-2 text-xs text-rose-600">Storage is above 80%. Consider cleanup or archive.</p>
            ) : null}
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-base font-semibold text-slate-900">Real-time Bandwidth Trend</h3>
            <div className="h-[260px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="bandwidthMb" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded border border-slate-200 bg-white p-2">
                <p className="text-slate-500">Bandwidth</p>
                <p className="font-semibold text-slate-900">{toMb(stats.bandwidth)} MB</p>
              </div>
              <div className="rounded border border-slate-200 bg-white p-2">
                <p className="text-slate-500">Requests</p>
                <p className="font-semibold text-slate-900">{stats.requests || 0}</p>
              </div>
              <div className="rounded border border-slate-200 bg-white p-2">
                <p className="text-slate-500">Transforms</p>
                <p className="font-semibold text-slate-900">{stats.transformations || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaPerformanceCard;
