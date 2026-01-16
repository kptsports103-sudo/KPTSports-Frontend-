import { useEffect, useState } from 'react';
import api from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const ManageHome = () => {
  const [content, setContent] = useState({
    welcomeText: '',
    banners: [{ video: '', year: '' }],
    highlights: []
  });

  const [isEditing, setIsEditing] = useState(false);

  /* =========================
     FETCH & NORMALIZE DATA
  ========================== */
  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await api.get('/home');

      const normalizedBanners = (res.data.banners || []).map(b => ({
        video: b.video || '',
        year: b.year || ''
      }));

      setContent({
        welcomeText: res.data.welcomeText || '',
        banners: normalizedBanners.length
          ? normalizedBanners
          : [{ video: '', year: '' }],
        highlights: res.data.highlights || []
      });
    } catch {
      console.error('Failed to load home content');
    }
  };

  /* =========================
     SAVE CONTENT
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const processedBanners = content.banners
        .filter(b => b.video.trim() && b.year.trim())
        .map(b => ({
          video: b.video,
          year: parseInt(b.year, 10) || 0
        }));

      const payload = {
        welcomeText: content.welcomeText,
        banners: processedBanners,
        highlights: content.highlights
      };

      console.log('Payload to save:', payload);
      await api.put('/home', payload);
      alert('Home page updated successfully');
      setIsEditing(false);
      fetchContent();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save changes');
    }
  };

  /* =========================
     HELPERS
  ========================== */
  const updateBanners = (index, field, value) => {
    const banners = [...content.banners];
    banners[index] = { ...banners[index], [field]: value };
    setContent({ ...content, banners });
  };


  const removeBanner = (index) => {
    setContent({
      ...content,
      banners: content.banners.filter((_, i) => i !== index)
    });
  };


  const addBanner = () => {
    setContent({
      ...content,
      banners: [...content.banners, { video: '', year: '' }]
    });
  };

  const updateHighlights = (index, value) => {
    const highlights = [...content.highlights];
    highlights[index] = value;
    setContent({ ...content, highlights });
  };

  const addHighlight = () => {
    setContent({ ...content, highlights: [...content.highlights, ''] });
  };

  /* =========================
     UI
  ========================== */
  return (
    <AdminLayout>
      <div style={{ background: '#0f3b2e', minHeight: '100vh', padding: '15px', color: '#fff' }}>
        <h3 style={{ fontSize: '34px', fontWeight: '700' }}>Manage Home</h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} style={{ padding: '8px 14px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' }}>
              Edit
            </button>
          ) : (
            <button onClick={() => setIsEditing(false)} style={{ padding: '8px 14px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px' }}>
              Cancel
            </button>
          )}
        </div>

        {!isEditing ? (
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', color: '#000' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '15px', fontWeight: 'bold', width: '200px' }}>Welcome Text</td>
                  <td style={{ padding: '15px', whiteSpace: 'pre-wrap' }}>{content.welcomeText}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>Banners</td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                      {content.banners.map((b, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                          {b.video && (
                            <video src={b.video} width="120" height="70" autoPlay muted loop style={{ borderRadius: '4px' }} />
                          )}
                          <span style={{ fontSize: '14px', color: '#666' }}>{b.year}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>Highlights</td>
                  <td style={{ padding: '15px' }}>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {content.highlights.map((h, i) => <li key={i} style={{ marginBottom: '5px' }}>{h}</li>)}
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '20px', borderRadius: '8px', color: '#000' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Welcome Text</label>
              <textarea
                value={content.welcomeText}
                onChange={e => setContent({ ...content, welcomeText: e.target.value })}
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '10px', color: '#333' }}>Banners</h4>
              {content.banners.map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                  <input
                    value={b.video}
                    placeholder="Video URL"
                    onChange={e => updateBanners(i, 'video', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                  <input
                    value={b.year}
                    placeholder="Year"
                    onChange={e => updateBanners(i, 'year', e.target.value)}
                    style={{
                      width: '80px',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeBanner(i)}
                    style={{
                      padding: '8px 12px',
                      background: '#dc3545',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div style={{ marginTop: '15px', padding: '15px', background: '#f0f8ff', borderRadius: '6px', border: '2px dashed #007bff' }}>
                <button
                  type="button"
                  onClick={addBanner}
                  style={{
                    padding: '12px 20px',
                    background: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#0056b3'}
                  onMouseOut={(e) => e.target.style.background = '#007bff'}
                >
                  ➕ Add Banner
                </button>
                <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
                  Click to add a new video banner with URL and year
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '10px', color: '#333' }}>Highlights</h4>
              {content.highlights.map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                  <input
                    value={h}
                    onChange={e => updateHighlights(i, e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setContent({ ...content, highlights: content.highlights.filter((_, x) => x !== i) })}
                    style={{
                      padding: '8px 12px',
                      background: '#dc3545',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addHighlight}
                style={{
                  padding: '10px 15px',
                  background: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                Add Highlight
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  background: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageHome;
