import { useEffect } from "react";
import { preloadMedia } from "../utils/preloadMedia";

const SmartPreloader = ({ urls = [] }) => {
  useEffect(() => {
    if (Array.isArray(urls) && urls.length) {
      preloadMedia(urls);
    }
  }, [urls]);

  return null;
};

export default SmartPreloader;

