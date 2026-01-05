import { useEffect, useState } from 'react';
import api from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const DEFAULT_STATE = {
  bannerVideo: '',
  boxes: ['', '', ''],
  bigHeader: '',
  bigText: ''
};

const ManageAbout = () => {
  const [content, setContent] = useState(DEFAULT_STATE);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =========================
     FETCH CONTENT
  ========================== */
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/home');
      setContent({
        bannerVideo: data.bannerVideo || '',
        boxes: Array.isArray(data.boxes) && data.boxes.length ? data.boxes : ['', '', ''],
        bigHeader: data.bigHeader || '',
        bigText: data.bigText || ''
      });
    } catch (err) {
      console.error('Load failed:', err);
      alert('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     SAVE CONTENT
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put('/home', content);
      alert('Content updated successfully');
      setIsEditing(false);
      loadContent();
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save content');
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     HELPERS
  ========================== */
  const updateBox = (index, value) => {
    const updated = [...content.boxes];
    updated[index] = value;
    setContent({ ...content, boxes: updated });
  };

  /* =========================
     UI
  ========================== */
  return (
    <AdminLayout>
      <div style={page}>
        <header style={header}>
          <h2 style={title}>Manage About Page</h2>
          <button
            onClick={() => setIsEditing(prev => !prev)}
            style={{
              ...(isEditing ? btnCancel : btnEdit),
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            disabled={loading}
          >
            {!isEditing ? (
              <>
                <img
                  src="/Edit button.png"
                  alt="Edit"
                  style={{ width: '16px', height: '16px' }}
                />
                Edit
              </>
            ) : (
              <>
                ❌ Cancel
              </>
            )}
          </button>
        </header>

        {!isEditing ? (
          /* ================= VIEW MODE ================= */
          <table style={table}>
            <tbody>
              <tr>
                <td colSpan="3">
                  {content.bannerVideo ? (
                    <video
                      src={content.bannerVideo}
                      autoPlay
                      muted
                      loop
                      style={video}
                    />
                  ) : (
                    <div style={placeholder}>No Banner Video</div>
                  )}
                </td>
              </tr>

              <tr>
                {content.boxes.map((text, i) => (
                  <td key={i} style={smallBox}>
                    {text || '—'}
                  </td>
                ))}
              </tr>

              <tr>
                <td colSpan="3" style={bigBox}>
                  <h3 style={bigTitle}>{content.bigHeader || '—'}</h3>
                  <p style={bigText}>{content.bigText || '—'}</p>
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          /* ================= EDIT MODE ================= */
          <form onSubmit={handleSubmit}>
            <table style={table}>
              <tbody>
                <FormRow label="Banner Video URL">
                  <input
                    value={content.bannerVideo}
                    onChange={e => setContent({ ...content, bannerVideo: e.target.value })}
                    style={input}
                    placeholder="https://example.com/video.mp4"
                  />
                </FormRow>

                {content.boxes.map((box, i) => (
                  <FormRow key={i} label={`Box ${i + 1}`}>
                    <input
                      value={box}
                      onChange={e => updateBox(i, e.target.value)}
                      style={input}
                      placeholder={`Box ${i + 1} text`}
                    />
                  </FormRow>
                ))}

                <FormRow label="Big Box Header">
                  <input
                    value={content.bigHeader}
                    onChange={e => setContent({ ...content, bigHeader: e.target.value })}
                    style={input}
                  />
                </FormRow>

                <FormRow label="Big Box Content">
                  <textarea
                    value={content.bigText}
                    onChange={e => setContent({ ...content, bigText: e.target.value })}
                    style={{ ...input, height: '120px' }}
                  />
                </FormRow>
              </tbody>
            </table>

            <div style={saveWrap}>
              <button
                type="submit"
                style={{
                  ...btnSave,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                disabled={loading}
              >
                {loading ? (
                  'Saving...'
                ) : (
                  <>
                    <img
                      src="/Save button.png"
                      alt="Save"
                      style={{ width: '18px', height: '18px' }}
                    />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

/* =========================
   SMALL COMPONENT
========================== */
const FormRow = ({ label, children }) => (
  <tr>
    <td style={labelCell}>{label}</td>
    <td colSpan="2" style={valueCell}>{children}</td>
  </tr>
);

/* =========================
   STYLES
========================== */
const page = {
  background: '#0f3b2e',
  minHeight: '100vh',
  padding: '20px',
  color: '#fff'
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px'
};

const title = {
  fontSize: '28px',
  fontWeight: '700'
};

const table = {
  width: '100%',
  background: '#fff',
  color: '#000',
  borderCollapse: 'collapse',
  border: '1px solid #ddd'
};

const video = {
  width: '100%',
  height: '400px',
  objectFit: 'cover'
};

const placeholder = {
  height: '400px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f1f1f1',
  color: '#666'
};

const smallBox = {
  padding: '24px',
  border: '1px solid #ddd',
  textAlign: 'center',
  background: '#fdf6e3',
  fontWeight: '500'
};

const bigBox = {
  padding: '40px',
  borderTop: '2px solid #ccc',
  background: '#fdf6e3'
};

const bigTitle = {
  textAlign: 'center',
  marginBottom: '16px'
};

const bigText = {
  lineHeight: '1.7'
};

const labelCell = {
  padding: '14px',
  fontWeight: '600',
  width: '25%',
  borderBottom: '1px solid #ddd',
  background: '#f8f9fa'
};

const valueCell = {
  padding: '14px',
  borderBottom: '1px solid #ddd'
};

const input = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '5px',
  border: '1px solid #ccc'
};

const saveWrap = {
  textAlign: 'center',
  marginTop: '20px'
};

const btnEdit = {
  padding: '8px 16px',
  background: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

const btnCancel = {
  ...btnEdit,
  background: '#6c757d'
};

const btnSave = {
  padding: '12px 24px',
  background: '#28a745',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer'
};

export default ManageAbout;
