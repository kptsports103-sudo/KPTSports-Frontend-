import { useEffect, useState } from "react";
import api from "../services/api";

const Gallery = () => {
  const [galleries, setGalleries] = useState([]);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    api
      .get("/galleries")
      .then(res => setGalleries(res.data.filter(g => g.visibility)))
      .catch(console.error);
  }, []);

  // Collect all media
  const allMedia = galleries.flatMap(g => g.media);

  // Group images as pairs (1-2, 3-4...)
  const pairedMedia = [];
  for (let i = 0; i < allMedia.length; i += 2) {
    pairedMedia.push(allMedia.slice(i, i + 2));
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.headerBox}>
        <h1 style={styles.headerTitle}>🏅 Sports Gallery</h1>
        <p style={styles.headerSub}>
          Athletic moments, victories & memories
        </p>
      </div>

      {/* Empty */}
      {allMedia.length === 0 ? (
        <div style={styles.emptyBox}>
          <span style={styles.emptyIcon}>📷</span>
          <p style={styles.emptyText}>More images coming soon</p>
        </div>
      ) : (
        pairedMedia.map((pair, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              ...styles.row,
              background:
                rowIndex % 2 === 0 ? "#ffffff" : "#f0f3f8", // table style
            }}
          >
            {pair.map((media, index) => (
              <div key={index} style={styles.imageCard}>
                <img
                  src={media.url}
                  alt={media.overview || ""}
                  style={styles.image}
                  onClick={() => setActiveImage(media)}
                />
                {media.overview && (
                  <p style={styles.caption}>{media.overview}</p>
                )}
              </div>
            ))}
          </div>
        ))
      )}

      {/* LIGHTBOX POPUP */}
      {activeImage && (
        <div style={styles.lightbox} onClick={() => setActiveImage(null)}>
          <div style={styles.lightboxContent} onClick={e => e.stopPropagation()}>
            <img
              src={activeImage.url}
              alt=""
              style={styles.lightboxImage}
            />
            {activeImage.overview && (
              <p style={styles.lightboxText}>{activeImage.overview}</p>
            )}
            <button style={styles.closeBtn} onClick={() => setActiveImage(null)}>
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;

/* ===================== STYLES ===================== */

const styles = {
  page: {
    padding: "2.5rem",
    maxWidth: "1400px",
    margin: "0 auto",
    fontFamily: "Segoe UI, sans-serif",
    background: "#eaeef3",
  },

  headerBox: {
    textAlign: "center",
    padding: "2rem",
    marginBottom: "3rem",
    borderRadius: "16px",
    background: "linear-gradient(135deg,#ffffff,#dde4ef)",
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
  },

  headerTitle: {
    fontSize: "2.6rem",
    margin: 0,
  },

  headerSub: {
    marginTop: "0.6rem",
    fontSize: "1.1rem",
    color: "#555",
  },

  emptyBox: {
    height: "50vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    border: "2px dashed #ccc",
    borderRadius: "14px",
    background: "#fff",
  },

  emptyIcon: { fontSize: "3rem" },
  emptyText: { fontSize: "1.2rem", marginTop: "1rem" },

  /* TABLE ROW STYLE */
  row: {
    display: "flex",
    justifyContent: "center",
    gap: "3rem",
    padding: "2.5rem",
    marginBottom: "1.5rem",
    borderRadius: "14px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  },

  imageCard: {
    width: "600px",
    borderRadius: "16px",
    overflow: "hidden",
    background: "#fff",
    boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
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
    background: "#fff",
    color: "#333",
    fontWeight: "500",
  },

  /* LIGHTBOX */
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
    background: "#000",
    borderRadius: "12px",
    padding: "1rem",
  },

  lightboxImage: {
    width: "100%",
    maxHeight: "80vh",
    objectFit: "contain",
  },

  lightboxText: {
    color: "#fff",
    textAlign: "center",
    marginTop: "0.8rem",
    fontSize: "1.1rem",
  },

  closeBtn: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
  },
};