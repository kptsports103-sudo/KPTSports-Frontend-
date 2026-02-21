import { useEffect, useMemo, useState } from "react";
import HeatMap from "react-heatmap-grid";
import api from "../../services/api";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hours = Array.from({ length: 24 }, (_, i) => String(i));

const MediaHeatmap = () => {
  const [matrix, setMatrix] = useState(Array.from({ length: 7 }, () => Array(24).fill(0)));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadHeatmap = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/media/heatmap?days=30");
        const data = response?.data?.data?.matrix;
        if (!ignore && Array.isArray(data)) {
          setMatrix(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err?.response?.data?.message || "Unable to load heatmap");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadHeatmap();
    return () => {
      ignore = true;
    };
  }, []);

  const maxValue = useMemo(() => {
    let max = 0;
    matrix.forEach((row) => {
      row.forEach((cell) => {
        if (Number(cell) > max) max = Number(cell);
      });
    });
    return max;
  }, [matrix]);

  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Media Activity Heatmap</h2>
      <p className="mt-1 text-sm text-slate-500">Usage intensity by day and hour (last 30 days)</p>

      {loading ? <p className="mt-4 text-sm text-slate-600">Loading...</p> : null}
      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      {!loading && !error ? (
        <div className="mt-5 overflow-x-auto">
          <HeatMap
            xLabels={hours}
            yLabels={days}
            data={matrix}
            square
            xLabelsLocation="bottom"
            xLabelWidth={24}
            yLabelWidth={50}
            cellStyle={(_, value) => {
              const ratio = maxValue > 0 ? Number(value) / maxValue : 0;
              const alpha = 0.08 + ratio * 0.85;
              return {
                background: `rgba(37, 99, 235, ${alpha})`,
                fontSize: "10px",
                color: ratio > 0.5 ? "#fff" : "#0f172a",
                borderRadius: "4px",
                border: "1px solid rgba(148, 163, 184, 0.25)",
              };
            }}
            cellRender={(value) => (value > 0 ? value : "")}
          />
        </div>
      ) : null}
    </div>
  );
};

export default MediaHeatmap;

