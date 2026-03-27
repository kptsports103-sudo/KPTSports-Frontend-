import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, Camera, CheckCircle2, Upload } from 'lucide-react';
import api from '../services/api';

const shellStyles = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 42%, #ffffff 100%)',
  padding: '24px 16px 40px',
  color: '#0f172a',
};

const cardStyles = {
  maxWidth: 480,
  margin: '0 auto',
  background: '#ffffff',
  borderRadius: 24,
  border: '1px solid #dbe4ee',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
  padding: 22,
};

const buttonStyles = {
  width: '100%',
  borderRadius: 14,
  border: '1px solid #0b3ea8',
  background: '#0b3ea8',
  color: '#ffffff',
  padding: '14px 16px',
  fontSize: 15,
  fontWeight: 700,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  cursor: 'pointer',
};

const WinnerCameraCapture = () => {
  const [searchParams] = useSearchParams();
  const sessionId = String(searchParams.get('session') || '').trim();
  const token = String(searchParams.get('token') || '').trim();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!String(file.type || '').startsWith('image/')) {
      setErrorMessage('Please choose a valid image file.');
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
    setUploadedImage(null);
    setErrorMessage('');
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!sessionId || !token) {
      setErrorMessage('This phone link is invalid. Scan a fresh QR code from the laptop.');
      return;
    }

    if (!selectedFile) {
      setErrorMessage('Choose or capture a photo first.');
      return;
    }

    const formData = new FormData();
    formData.append('photo', selectedFile);
    formData.append('token', token);

    setIsUploading(true);
    setErrorMessage('');

    try {
      const response = await api.post(`/winners/capture-sessions/${sessionId}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadedImage({
        imageUrl: response?.data?.imageUrl || '',
        imagePublicId: response?.data?.imagePublicId || '',
      });
      setSelectedFile(null);
    } catch (error) {
      console.error('Failed to upload winner phone photo:', error);
      setErrorMessage(error?.response?.data?.message || 'Upload failed. Scan a new QR code and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const displayPreview = uploadedImage?.imageUrl || previewUrl;
  const isSessionMissing = !sessionId || !token;

  return (
    <div style={shellStyles}>
      <div style={cardStyles}>
        <div style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: 18, background: '#dbeafe', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
          <Camera size={28} color="#0b3ea8" />
        </div>

        <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.15 }}>Winner Camera</h1>
        <p style={{ margin: '10px 0 0 0', color: '#475569', fontSize: 15, lineHeight: 1.6 }}>
          Capture the winner photo on your phone and send it back to the laptop form automatically.
        </p>

        {isSessionMissing ? (
          <div style={{ marginTop: 18, borderRadius: 18, border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
              <AlertCircle size={18} />
              Invalid phone link
            </div>
            <p style={{ margin: '8px 0 0 0', lineHeight: 1.6 }}>
              Open the admin winners page on the laptop and scan a fresh QR code.
            </p>
          </div>
        ) : (
          <form onSubmit={handleUpload} style={{ marginTop: 20 }}>
            <label
              htmlFor="winner-phone-photo"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                borderRadius: 16,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                padding: '14px 16px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedFile?.name || (uploadedImage?.imageUrl ? 'Photo uploaded successfully' : 'Take photo or choose from gallery')}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#0b3ea8' }}>
                <Upload size={16} />
                <Camera size={16} />
              </span>
            </label>
            <input
              id="winner-phone-photo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <p style={{ margin: '10px 0 0 0', fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
              Most phones will open the camera directly. You can also choose an existing photo.
            </p>

            <div
              style={{
                marginTop: 18,
                borderRadius: 18,
                border: '1px dashed #cbd5e1',
                background: '#f8fafc',
                minHeight: 280,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {displayPreview ? (
                <img
                  src={displayPreview}
                  alt="Winner phone preview"
                  style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b', padding: 24, lineHeight: 1.6 }}>
                  The selected photo preview will appear here.
                </div>
              )}
            </div>

            {errorMessage ? (
              <div style={{ marginTop: 16, borderRadius: 16, border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', padding: 14, lineHeight: 1.6 }}>
                {errorMessage}
              </div>
            ) : null}

            {uploadedImage?.imageUrl ? (
              <div style={{ marginTop: 16, borderRadius: 16, border: '1px solid #a7f3d0', background: '#ecfdf5', color: '#047857', padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                  <CheckCircle2 size={18} />
                  Photo sent to laptop
                </div>
                <p style={{ margin: '8px 0 0 0', lineHeight: 1.6 }}>
                  Return to the admin winners page on the laptop. The winner photo is already filled there and ready to save.
                </p>
              </div>
            ) : null}

            <button type="submit" style={{ ...buttonStyles, marginTop: 18 }} disabled={isUploading || !selectedFile}>
              <Upload size={18} />
              {isUploading ? 'Uploading...' : 'Send Photo To Laptop'}
            </button>
          </form>
        )}

        <div style={{ marginTop: 22, fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>
          Keep the laptop page open while you upload. You can retake and upload again if needed before saving the winner.
        </div>

        <div style={{ marginTop: 18 }}>
          <Link to="/" style={{ color: '#0b3ea8', textDecoration: 'none', fontWeight: 700 }}>
            Back to KPT Sports
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WinnerCameraCapture;
