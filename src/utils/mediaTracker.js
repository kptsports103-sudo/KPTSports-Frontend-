import api from "../services/api";
import { getParsedUser } from "../context/tokenStorage";

export const trackMediaUsage = async (mediaId, type = "other", action = "view", extra = {}) => {
  if (!mediaId) return;

  try {
    const storedUser = getParsedUser() || {};
    const userId = storedUser?._id || storedUser?.id || storedUser?.userId || "";
    const userRole = storedUser?.role || "";

    await api.post("/media/track", {
      mediaId: String(mediaId),
      mediaType: String(type || "other"),
      action: String(action || "view"),
      userId: String(userId || ""),
      userRole: String(userRole || ""),
      timestamp: Date.now(),
      ...extra,
    });
  } catch (err) {
    // Tracking failure should never block user flow.
  }
};
