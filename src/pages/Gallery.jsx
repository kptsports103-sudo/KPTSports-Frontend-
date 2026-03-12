import { useEffect, useMemo, useState } from "react";
import OptimizedImage from "../components/OptimizedImage";
import api from "../services/api";

const Gallery = () => {
  const [galleries, setGalleries] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/galleries")
      .then((res) => setGalleries(res.data.filter((g) => g.visibility)))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const allMedia = useMemo(() => galleries.flatMap((g) => g.media), [galleries]);

  const pairedMedia = useMemo(() => {
    const grouped = [];
    for (let i = 0; i < allMedia.length; i += 2) {
      grouped.push(allMedia.slice(i, i + 2));
    }
    return grouped;
  }, [allMedia]);

  return (
    <div style={styles.page}>
      <div style={styles.headerBox}>
        <h1 style={styles.headerTitle}>KPT Sports Gallery</h1>
        <p style={styles.headerSub}>Athletic moments, victories and memories</p>
      </div>

      {isLoading ? (
        <div style={styles.emptyBox}>
          <p style={styles.emptyText}>Loading gallery...</p>
        </div>
      ) : allMedia.length === 0 ? (
        <div style={styles.emptyBox}>
          <span style={styles.emptyIcon}>[Gallery]</span>
          <p style={styles.emptyText}>More images coming soon</p>
        </div>
      ) : (
        pairedMedia.map((pair, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              ...styles.row,
              background: rowIndex % 2 === 0 ? "var(--app-surface)" : "var(--app-surface-alt)",
              contentVisibility: "auto",
              containIntrinsicSize: "900px",
            }}
          >
            {pair.map((media, index) => (
              <div key={index} style={styles.imageCard}>
                <OptimizedImage
                  src={media.url}
                  alt={media.overview || "Gallery image"}
                  width={600}
                  height={400}
                  loading={rowIndex === 0 ? "eager" : "lazy"}
                  fetchPriority={rowIndex === 0 && index === 0 ? "high" : undefined}
                  sizes="(max-width: 900px) 100vw, 600px"
                  style={styles.image}
                  onClick={() => setActiveImage(media)}
                />
                {media.overview && <p style={styles.caption}>{media.overview}</p>}
              </div>
            ))}
          </div>
        ))
      )}

      {activeImage && (
        <div style={styles.lightbox} onClick={() => setActiveImage(null)}>
          <div style={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <OptimizedImage
              src={activeImage.url}
              alt={activeImage.overview || "Selected gallery image"}
              width={1440}
              height={1080}
              crop="limit"
              loading="eager"
              fetchPriority="high"
              sizes="90vw"
              style={styles.lightboxImage}
            />
            {activeImage.overview && <p style={styles.lightboxText}>{activeImage.overview}</p>}
            <button style={styles.closeBtn} onClick={() => setActiveImage(null)}>
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;

const styles = {
  page: {
    padding: "2.5rem",
    maxWidth: "1400px",
    margin: "0 auto",
    minHeight: "100vh",
    fontFamily: "Segoe UI, sans-serif",
    background: "var(--app-bg)",
    color: "var(--app-text)",
  },

  headerBox: {
    textAlign: "center",
    padding: "2rem",
    marginBottom: "3rem",
    borderRadius: "16px",
    background: "linear-gradient(135deg, var(--app-surface), var(--app-surface-muted))",
    border: "1px solid var(--app-border)",
    boxShadow: "var(--app-shadow)",
  },

  headerTitle: {
    fontSize: "2.6rem",
    margin: 0,
    color: "var(--app-text)",
  },

  headerSub: {
    marginTop: "0.6rem",
    fontSize: "1.1rem",
    color: "var(--app-text-muted)",
  },

  emptyBox: {
    height: "50vh",
    display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    border: "2px dashed var(--app-border)",
    borderRadius: "14px",
    background: "var(--app-surface)",
    color: "var(--app-text)",
  },

  emptyIcon: { fontSize: "1.8rem" },
  emptyText: { fontSize: "1.2rem", marginTop: "1rem" },

  row: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "3rem",
    padding: "2.5rem",
    marginBottom: "1.5rem",
    borderRadius: "14px",
    border: "1px solid var(--app-border)",
    boxShadow: "var(--app-shadow)",
  },

  imageCard: {
    width: "100%",
    maxWidth: "600px",
    flex: "1 1 320px",
    borderRadius: "16px",
    overflow: "hidden",
    background: "var(--app-surface)",
    border: "1px solid var(--app-border)",
    boxShadow: "var(--app-shadow)",
    cursor: "pointer",
  },

  image: {
    width: "100%",
    height: "400px",
    objectFit: "cover",
  },

  caption: {
    padding: "0.9rem",
    fontSize: "1rem",
    textAlign: "center",
    background: "var(--app-surface)",
    color: "var(--app-text)",
    fontWeight: "500",
  },

  lightbox: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  lightboxContent: {
    position: "relative",
    maxWidth: "90%",
    maxHeight: "90%",
    background: "var(--app-surface)",
    border: "1px solid var(--app-border)",
    borderRadius: "12px",
    padding: "1rem",
  },

  lightboxImage: {
    width: "100%",
    maxHeight: "80vh",
    objectFit: "contain",
  },

  lightboxText: {
    color: "var(--app-text)",
    textAlign: "center",
    marginTop: "0.8rem",
    fontSize: "1.1rem",
  },

  closeBtn: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "var(--app-surface-alt)",
    border: "1px solid var(--app-border)",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
    color: "var(--app-text)",
  },
};
