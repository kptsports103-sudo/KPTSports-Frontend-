import { optimizeCloudinaryUrl } from "./cloudinaryOptimize";

export const autoOptimizeMedia = (mediaList) => {
  if (!Array.isArray(mediaList)) return [];

  return mediaList.map((item) => ({
    ...item,
    files: item.files?.map((file) => ({
      ...file,
      url: optimizeCloudinaryUrl(file.url),
    })),
    link: optimizeCloudinaryUrl(item.link),
    imageUrl: optimizeCloudinaryUrl(item.imageUrl),
  }));
};

