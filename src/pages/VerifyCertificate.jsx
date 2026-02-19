import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

const containerStyle = {
  maxWidth: 760,
  margin: "48px auto",
  padding: "24px",
  borderRadius: "16px",
  border: "1px solid #d7def2",
  background: "#ffffff",
  boxShadow: "0 12px 28px rgba(10, 30, 90, 0.08)",
};

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "180px 1fr",
  gap: "12px",
  padding: "10px 0",
  borderBottom: "1px solid #eef2fb",
};

const VerifyCertificate = () => {
  const { certificateId = "", id = "" } = useParams();
  const routeCertificateId = certificateId || id;
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchCertificate = async () => {
      try {
        setStatus("loading");
        const response = await api.get(`/certificates/verify/${encodeURIComponent(routeCertificateId)}`);
        if (!mounted) return;
        setData(response.data);
        setStatus("valid");
      } catch (error) {
        if (!mounted) return;
        setData(null);
        setStatus("invalid");
      }
    };

    if (routeCertificateId) fetchCertificate();
    else setStatus("invalid");

    return () => {
      mounted = false;
    };
  }, [routeCertificateId]);

  const issuedDate = useMemo(() => {
    if (!data?.issuedAt) return "-";
    const dt = new Date(data.issuedAt);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleDateString();
  }, [data]);

  if (status === "loading") {
    return (
      <div style={containerStyle}>
        <h2>Checking certificate...</h2>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div style={containerStyle}>
        <h2 style={{ color: "#b42318", marginTop: 0 }}>Invalid Certificate</h2>
        <p style={{ marginBottom: 0 }}>
          The certificate ID <strong>{routeCertificateId || "-"}</strong> was not found.
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ color: "#067647", marginTop: 0 }}>Certificate Verified</h2>
      <p style={{ marginTop: 0, color: "#344054" }}>
        This certificate is authentic and issued by KPT Sports.
      </p>

      <div style={rowStyle}>
        <strong>Certificate ID</strong>
        <span>{data.certificateId || "-"}</span>
      </div>
      <div style={rowStyle}>
        <strong>Student Name</strong>
        <span>{data.name || "-"}</span>
      </div>
      <div style={rowStyle}>
        <strong>KPM No.</strong>
        <span>{data.kpmNo || "-"}</span>
      </div>
      <div style={rowStyle}>
        <strong>Competition</strong>
        <span>{data.competition || "-"}</span>
      </div>
      <div style={rowStyle}>
        <strong>Position</strong>
        <span>{data.position || "-"}</span>
      </div>
      <div style={rowStyle}>
        <strong>Department</strong>
        <span>{data.department || "-"}</span>
      </div>
      <div style={rowStyle}>
        <strong>Year</strong>
        <span>{data.year || "-"}</span>
      </div>
      <div style={{ ...rowStyle, borderBottom: "none", paddingBottom: 0 }}>
        <strong>Issued On</strong>
        <span>{issuedDate}</span>
      </div>
    </div>
  );
};

export default VerifyCertificate;
