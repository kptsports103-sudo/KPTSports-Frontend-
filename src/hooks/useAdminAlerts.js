import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

export const useAdminAlerts = (certificateStats) => {
  const previousRef = useRef({ generated: 0, pending: 0, initialized: false });

  useEffect(() => {
    if (!certificateStats) return;

    const prev = previousRef.current;
    const generated = Number(certificateStats.generated || 0);
    const pending = Number(certificateStats.pending || 0);

    if (!prev.initialized) {
      previousRef.current = { generated, pending, initialized: true };
      return;
    }

    if (pending > 10 && prev.pending <= 10) {
      toast.error(`Warning: ${pending} certificates are pending generation.`, {
        id: "pending-warning",
      });
    }

    if (generated > prev.generated) {
      const newlyGenerated = generated - prev.generated;
      toast.success(
        newlyGenerated > 1
          ? `${newlyGenerated} certificates were generated.`
          : "1 certificate was generated.",
        { id: "generated-success" }
      );
    }

    if (pending === 0 && prev.pending > 0) {
      toast.success("All pending certificates are cleared.", {
        id: "pending-cleared",
      });
    }

    previousRef.current = { generated, pending, initialized: true };
  }, [certificateStats]);
};
