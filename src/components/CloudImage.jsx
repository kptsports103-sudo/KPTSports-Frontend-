import React, { useRef } from "react";
import { optimizeCloudinaryUrl } from "../utils/cloudinaryOptimize";
import { trackMediaUsage } from "../utils/mediaTracker";

const CloudImage = ({
  url,
  mediaId,
  mediaType = "image",
  width = 400,
  height = 300,
  style = {},
  ...props
}) => {
  const didLogRef = useRef(false);

  if (!url) return null;

  const optimizedUrl = optimizeCloudinaryUrl(url, { width, height });

  const logMediaView = () => {
    if (didLogRef.current || !mediaId) return;
    didLogRef.current = true;
    trackMediaUsage(mediaId, mediaType, "view", { mediaUrl: optimizedUrl });
  };

  return (
    <img
      src={optimizedUrl}
      loading="lazy"
      decoding="async"
      onLoad={logMediaView}
      style={{
        width: "100%",
        objectFit: "cover",
        borderRadius: "6px",
        ...style,
      }}
      {...props}
    />
  );
};

export default CloudImage;
