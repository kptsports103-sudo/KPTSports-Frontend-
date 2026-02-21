import { useEffect, useRef } from "react";
import api from "../services/api";

const REFRESH_INTERVAL = 8000;

export const useRealtimeAnalytics = ({
  onPlayersUpdate,
  onCertificatesUpdate,
  onResultsUpdate,
  intervalMs = REFRESH_INTERVAL,
}) => {
  const callbacksRef = useRef({
    onPlayersUpdate,
    onCertificatesUpdate,
    onResultsUpdate,
  });

  useEffect(() => {
    callbacksRef.current = {
      onPlayersUpdate,
      onCertificatesUpdate,
      onResultsUpdate,
    };
  }, [onPlayersUpdate, onCertificatesUpdate, onResultsUpdate]);

  useEffect(() => {
    let isMounted = true;
    let isFetching = false;

    const fetchAll = async () => {
      if (!isMounted || isFetching) return;
      isFetching = true;

      try {
        const [players, certs, results, group] = await Promise.all([
          api.get("/home/players"),
          api.get("/certificates"),
          api.get("/results"),
          api.get("/group-results"),
        ]);

        if (!isMounted) return;

        callbacksRef.current.onPlayersUpdate?.(players.data);
        callbacksRef.current.onCertificatesUpdate?.(certs.data);
        callbacksRef.current.onResultsUpdate?.(results.data, group.data);
      } catch (error) {
        console.error("Realtime sync error:", error);
      } finally {
        isFetching = false;
      }
    };

    fetchAll();
    const timerId = window.setInterval(fetchAll, intervalMs);

    return () => {
      isMounted = false;
      window.clearInterval(timerId);
    };
  }, [intervalMs]);
};
