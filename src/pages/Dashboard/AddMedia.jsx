import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";


const AddMedia = () => {
  const navigate = useNavigate();

  const [media, setMedia] = useState({
    category: "",
    title: "",
    description: "",
    link: "",
    files: [],
    uploadedFiles: [], // {url, public_id}
    locked: false
  });

  const [progress, setProgress] = useState(0);

  const handleChange = (field, value) => {
    if (media.locked) return;
    setMedia({ ...media, [field]: value });
  };

  const handleFiles = (files) => {
    if (media.locked) return;
    setMedia({ ...media, files: Array.from(files) });
  };

  const uploadFiles = async () => {
    if (media.files.length === 0) {
      alert("No files selected");
      return;
    }

    const formData = new FormData();
    media.files.forEach(f => formData.append("files", f));

    try {
      const res = await api.post("/upload", formData, {
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setProgress(percent);
        }
      });

      setMedia(prev => ({
        ...prev,
        uploadedFiles: res.data.files,
        locked: true // AUTO LOCK AFTER UPLOAD
      }));
    } catch (error) {
      console.error('Upload error:', error.response?.data || error.message);
      alert("Upload failed: " + (error.response?.data?.message || error.message));
    }
  };


  const confirmLock = async () => {
    if (!media.category) {
      alert("Category is required");
      return;
    }

    // If files are selected, upload them
    if (media.files.length > 0) {
      await uploadFiles();
    } else if (media.link.trim()) {
      // If no files but link provided, allow direct saving
      setMedia(prev => ({ ...prev, locked: true }));
    } else {
      alert("Either files or a link is required");
      return;
    }
  };

  const unlock = () => {
    setMedia({ ...media, locked: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!media.locked) {
      alert("Confirm upload first");
      return;
    }

    const newMedia = {
      id: Date.now(),
      category: media.category,
      title: media.title,
      description: media.description,
      link: media.link
        ? media.link.startsWith("http")
          ? media.link
          : `https://${media.link}`
        : "",
      files: media.uploadedFiles,
      createdAt: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem("media") || "[]");
    existing.push(newMedia);
    localStorage.setItem("media", JSON.stringify(existing));

    alert("Media saved successfully");
    navigate("/admin/media");
  };

  return (
    <AdminLayout>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f4f6f8",
          padding: "20px",
          color: "#000"
        }}
      >
        <h3 style={{ fontSize: "34px", fontWeight: "700", marginBottom: "10px", color: "#000" }}>
          Add Media
        </h3>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(71, 85, 105, 0.12)",
              marginBottom: "24px",
              border: "1px solid #cfd6df"
            }}
          >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#fff",
              color: "#000"
            }}
          >
            <tbody>
              <tr style={{ background: "linear-gradient(135deg, #eef2f6 0%, #d6dde5 100%)", color: "#111827", borderBottom: "1px solid #c0c8d2" }}>
                <th style={{ padding: "10px", textAlign: "left" }}>Field</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Value</th>
              </tr>

              <tr>
                <td style={{ padding: "10px", fontWeight: "bold" }}>Category *</td>
                <td style={{ padding: "10px" }}>
                  <select
                    value={media.category}
                    disabled={media.locked}
                    onChange={(e) => handleChange("category", e.target.value)}
                    style={{
                      width: "95%",
                      height: "36px",
                      borderRadius: "8px",
                      border: "1px solid #000",
                      backgroundColor: media.locked ? "#f0f0f0" : "#fff",
                      color: "#000"
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Home Page Slider">Home Page Slider</option>
                    <option value="Documents">Documents</option>
                    <option value="Featured Images">Featured Images</option>
                    <option value="Audio">Audio</option>
                    <option value="Video">Video</option>
                  </select>
                </td>
              </tr>

              <tr>
                <td style={{ padding: "10px", fontWeight: "bold" }}>Title</td>
                <td style={{ padding: "10px" }}>
                  <input
                    value={media.title}
                    disabled={media.locked}
                    onChange={(e) => handleChange("title", e.target.value)}
                    style={{
                      width: "95%",
                      height: "36px",
                      borderRadius: "8px",
                      border: "1px solid #000",
                      backgroundColor: media.locked ? "#f0f0f0" : "#fff",
                      color: "#000"
                    }}
                  />
                </td>
              </tr>

              <tr>
                <td style={{ padding: "10px", fontWeight: "bold" }}>Description</td>
                <td style={{ padding: "10px" }}>
                  <input
                    value={media.description}
                    disabled={media.locked}
                    onChange={(e) => handleChange("description", e.target.value)}
                    style={{
                      width: "95%",
                      height: "36px",
                      borderRadius: "8px",
                      border: "1px solid #000",
                      backgroundColor: media.locked ? "#f0f0f0" : "#fff",
                      color: "#000"
                    }}
                  />
                </td>
              </tr>

              <tr>
                <td style={{ padding: "10px", fontWeight: "bold" }}>Link (optional)</td>
                <td style={{ padding: "10px" }}>
                  <input
                    value={media.link}
                    disabled={media.locked}
                    onChange={(e) => handleChange("link", e.target.value)}
                    style={{
                      width: "95%",
                      height: "36px",
                      borderRadius: "8px",
                      border: "1px solid #000",
                      backgroundColor: media.locked ? "#f0f0f0" : "#fff",
                      color: "#000"
                    }}
                  />
                </td>
              </tr>

              <tr>
                <td style={{ padding: "10px", fontWeight: "bold" }}>Choose Files (optional if link provided)</td>
                <td style={{ padding: "10px" }}>
                  <input
                    type="file"
                    multiple
                    disabled={media.locked}
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  {media.files.length > 0 && (
                    <div style={{ marginTop: "10px" }}>
                      <p>Selected files: {media.files.map(f => f.name).join(', ')}</p>
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
          </div>

          {progress > 0 && (
            <div style={{ width: "100%", background: "#ddd", marginTop: "10px" }}>
              <div
                style={{
                  width: `${progress}%`,
                  background: "#1d4ed8",
                  color: "#fff",
                  padding: "4px",
                  textAlign: "center"
                }}
              >
                {progress}%
              </div>
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "25px" }}>
            {!media.locked ? (
              <button
                type="button"
                onClick={confirmLock}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#ffc107",
                  color: "#000",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "16px",
                  marginRight: "10px"
                }}
              >
                🔒 Confirm Media
              </button>
            ) : (
              <button
                type="button"
                onClick={unlock}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "16px",
                  marginRight: "10px"
                }}
              >
                ❌ Unlock
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#6c757d",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
                marginRight: "10px"
              }}
            >
              ⬅️ Go Back
            </button>

            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: "#1d4ed8",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              💾 Save Media
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddMedia;
