import { useEffect, useState } from "react";
import AdminLayout from "../admin/AdminLayout";
import SuperAdminLayout from "./SuperAdminLayout";
import { useAuth } from "../../context/AuthContext";

const MediaStats = () => {
  const { user } = useAuth();
  const [media, setMedia] = useState([]);
  const [calculator, setCalculator] = useState({
    fileSize: '',
    format: '',
    uploadedKB: 0,
    remainingKB: 0,
    progress: 0
  });

  const TOTAL_LIMIT_KB = 1048576; // 1 GB in KB

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = () => {
    const stored = JSON.parse(localStorage.getItem("media") || "[]");
    setMedia(stored);
    calculateStats(stored);
  };

  const calculateStats = (mediaList) => {
    let totalSizeKB = 0;

    mediaList.forEach(item => {
      if (item.files && item.files.length > 0) {
        item.files.forEach(file => {
          // Assuming file size is stored or can be estimated
          // For now, we'll use a placeholder size per file
          totalSizeKB += 1024; // 1MB per file as placeholder
        });
      }
    });

    const remainingKB = Math.max(0, TOTAL_LIMIT_KB - totalSizeKB);
    const progress = ((totalSizeKB / TOTAL_LIMIT_KB) * 100).toFixed(1);

    setCalculator(prev => ({
      ...prev,
      uploadedKB: totalSizeKB,
      remainingKB: remainingKB,
      progress: parseFloat(progress)
    }));
  };

  const handleFileSizeChange = (e) => {
    const size = parseFloat(e.target.value) || 0;
    setCalculator(prev => ({
      ...prev,
      fileSize: e.target.value,
      uploadedKB: prev.uploadedKB + (size * 1024), // Convert MB to KB
      remainingKB: Math.max(0, TOTAL_LIMIT_KB - (prev.uploadedKB + (size * 1024))),
      progress: (((prev.uploadedKB + (size * 1024)) / TOTAL_LIMIT_KB) * 100).toFixed(1)
    }));
  };

  const handleFormatChange = (e) => {
    setCalculator(prev => ({
      ...prev,
      format: e.target.value
    }));
  };

  const resetCalculator = () => {
    loadMedia(); // Recalculate based on actual media
    setCalculator(prev => ({
      ...prev,
      fileSize: '',
      format: ''
    }));
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const Layout = user?.role === "superadmin" ? SuperAdminLayout : AdminLayout;

  return (
    <Layout>
      <div style={{ padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <h2 style={{ color: '#333', marginBottom: '30px', fontSize: '28px', fontWeight: '700' }}>
          Media Statistics & Calculator
        </h2>

        {/* Current Stats */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '25px',
          marginBottom: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ color: '#495057', marginBottom: '20px', fontSize: '22px' }}>Current Media Usage</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ color: '#28a745', margin: '0 0 10px 0', fontSize: '18px' }}>Total Assets</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: 0 }}>{media.length}</p>
            </div>

            <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ color: '#007bff', margin: '0 0 10px 0', fontSize: '18px' }}>Uploaded</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: 0 }}>{formatNumber(calculator.uploadedKB)} KB</p>
            </div>

            <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ color: '#ffc107', margin: '0 0 10px 0', fontSize: '18px' }}>Remaining</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: 0 }}>{formatNumber(calculator.remainingKB)} KB</p>
            </div>

            <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ color: '#dc3545', margin: '0 0 10px 0', fontSize: '18px' }}>Progress</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: 0 }}>{calculator.progress}%</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginTop: '30px' }}>
            <div style={{
              width: '100%',
              height: '20px',
              backgroundColor: '#e9ecef',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min(calculator.progress, 100)}%`,
                height: '100%',
                backgroundColor: calculator.progress > 90 ? '#dc3545' : calculator.progress > 70 ? '#ffc107' : '#28a745',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <p style={{ textAlign: 'center', marginTop: '10px', color: '#6c757d' }}>
              1 GB Total Limit
            </p>
          </div>
        </div>

        {/* Media Calculator */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ color: '#495057', marginBottom: '20px', fontSize: '22px' }}>Media Size Calculator</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <label htmlFor="media-calc-file-size" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057' }}>
                File Size (MB)
              </label>
              <input
                id="media-calc-file-size"
                name="fileSize"
                type="number"
                value={calculator.fileSize}
                onChange={handleFileSizeChange}
                placeholder="Enter size in MB"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>

            <div>
              <label htmlFor="media-calc-format" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057' }}>
                Format
              </label>
              <select
                id="media-calc-format"
                name="format"
                value={calculator.format}
                onChange={handleFormatChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '16px',
                  backgroundColor: '#fff'
                }}
              >
                <option value="">Select Format</option>
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
                <option value="gif">GIF</option>
                <option value="mp4">MP4</option>
                <option value="pdf">PDF</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {calculator.fileSize && (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>Calculation Result:</h4>
              <p style={{ margin: '5px 0', color: '#333' }}>
                <strong>Size:</strong> {calculator.fileSize} MB ({(parseFloat(calculator.fileSize) * 1024).toLocaleString()} KB)
              </p>
              <p style={{ margin: '5px 0', color: '#333' }}>
                <strong>Format:</strong> {calculator.format.toUpperCase() || 'Not selected'}
              </p>
              <p style={{ margin: '5px 0', color: calculator.remainingKB < 0 ? '#dc3545' : '#28a745' }}>
                <strong>After Upload:</strong> {formatNumber(calculator.uploadedKB)} KB used, {formatNumber(Math.max(0, calculator.remainingKB))} KB remaining
              </p>
              {calculator.remainingKB < 0 && (
                <p style={{ color: '#dc3545', fontWeight: 'bold', margin: '10px 0' }}>
                  ⚠️ File size exceeds remaining storage limit!
                </p>
              )}
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            <button
              onClick={resetCalculator}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              Reset Calculator
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MediaStats;

