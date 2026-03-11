import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import "./VerifyCertificate.css";

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
      <div className="verify-certificate">
        <h2 className="verify-certificate__title">Checking certificate...</h2>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="verify-certificate">
        <h2 className="verify-certificate__title verify-certificate__title--invalid">Invalid Certificate</h2>
        <p className="verify-certificate__lead verify-certificate__lead--compact">
          The certificate ID <strong>{routeCertificateId || "-"}</strong> was not found.
        </p>
      </div>
    );
  }

  return (
    <div className="verify-certificate">
      <h2 className="verify-certificate__title verify-certificate__title--valid">Certificate Verified</h2>
      <p className="verify-certificate__lead">
        This certificate is authentic and issued by KPT Sports.
      </p>

      <div className="verify-certificate__row">
        <strong>Certificate ID</strong>
        <span>{data.certificateId || "-"}</span>
      </div>
      <div className="verify-certificate__row">
        <strong>Student Name</strong>
        <span>{data.name || "-"}</span>
      </div>
      <div className="verify-certificate__row">
        <strong>KPM No.</strong>
        <span>{data.kpmNo || "-"}</span>
      </div>
      <div className="verify-certificate__row">
        <strong>Competition</strong>
        <span>{data.competition || "-"}</span>
      </div>
      <div className="verify-certificate__row">
        <strong>Position</strong>
        <span>{data.position || "-"}</span>
      </div>
      <div className="verify-certificate__row">
        <strong>Department</strong>
        <span>{data.department || "-"}</span>
      </div>
      <div className="verify-certificate__row">
        <strong>Year</strong>
        <span>{data.year || "-"}</span>
      </div>
      <div className="verify-certificate__row verify-certificate__row--last">
        <strong>Issued On</strong>
        <span>{issuedDate}</span>
      </div>
    </div>
  );
};

export default VerifyCertificate;
