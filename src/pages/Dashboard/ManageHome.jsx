import { useEffect, useState } from 'react';
import api from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const ManageHome = () => {
  const [content, setContent] = useState({
    welcomeText: '',
    banners: [{ image: '', year: '', fixed: false }],
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
        image: b.image || '',
        year: b.year || '',
        fixed: true
      }));

      setContent({
        welcomeText: res.data.welcomeText || '',
        banners: normalizedBanners.length
          ? normalizedBanners
          : [{ image: '', year: '', fixed: false }],
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
        .filter(b => b.fixed && b.image.trim() && b.year)
        .map(b => ({
          image: b.image.startsWith('http') ? b.image : b.image.startsWith('/') ? `http://localhost:5001${b.image}` : `https://${b.image}`,
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

  const toggleFixedBanner = (index) => {
    const banners = [...content.banners];
    banners[index].fixed = !banners[index].fixed;
    setContent({ ...content, banners });
  };

  const removeBanner = (index) => {
    setContent({
      ...content,
      banners: content.banners.filter((_, i) => i !== index)
    });
  };

  const handleFileUpload = async (index, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('banner', file);
    try {
      const res = await api.post('/home/upload-banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateBanners(index, 'image', res.data.url);
    } catch {
      alert('Upload failed');
    }
  };

  const addBanner = () => {
    setContent({
      ...content,
      banners: [...content.banners, { image: '', year: '', fixed: false }]
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

        {/* TOP ACTIONS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: '8px 14px',
                background: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              ✏️ Edit
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              style={{
                padding: '8px 14px',
                background: '#6c757d',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              ❌ Cancel
            </button>
          )}

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 14px',
              background: '#28a745',
              color: '#fff',
              borderRadius: '5px',
              textDecoration: 'none'
            }}
          >
            🔗 View Home Page
          </a>
        </div>

        {!isEditing ? (
          /* ================= VIEW MODE ================= */
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', background: '#fff', color: '#000', borderCollapse: 'collapse', border: '1px solid #ddd', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <tbody>
                <tr style={{ background: '#007bff', color: '#fff' }}>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', borderBottom: '2px solid #0056b3' }}>Field</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', borderBottom: '2px solid #0056b3' }}>Value</th>
                </tr>

                <tr style={{ background: '#f8f9fa' }}>
                  <td style={{ padding: '15px', fontWeight: '600', borderBottom: '1px solid #ddd' }}>Welcome Text</td>
                  <td style={{ padding: '15px', whiteSpace: 'pre-wrap', borderBottom: '1px solid #ddd' }}>
                    {content.welcomeText}
                  </td>
                </tr>

                <tr>
                  <td style={{ padding: '15px', fontWeight: '600', borderBottom: '1px solid #ddd' }}>Banners</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid #ddd' }}>
                    {content.banners.map((b, i) => (
                      <div key={i} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {b.image && <img src={b.image} alt={`Banner ${i+1}`} style={{ width: '50px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />}
                        <span>📅 {b.year}</span>
                      </div>
                    ))}
                  </td>
                </tr>

                <tr style={{ background: '#f8f9fa' }}>
                  <td style={{ padding: '15px', fontWeight: '600', borderBottom: '1px solid #ddd' }}>Highlights</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid #ddd' }}>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {content.highlights.map((h, i) => (
                        <li key={i} style={{ marginBottom: '5px' }}>{typeof h === 'object' ? h.title : h}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          /* ================= EDIT MODE ================= */
          <form onSubmit={handleSubmit}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', background: '#fff', color: '#000', borderCollapse: 'collapse', border: '1px solid #ddd', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <tbody>
                  <tr style={{ background: '#007bff', color: '#fff' }}>
                    <th style={{ padding: '15px', textAlign: 'left', width: '25%', fontWeight: 'bold', borderBottom: '2px solid #0056b3' }}>Field</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', borderBottom: '2px solid #0056b3' }}>Value</th>
                  </tr>

                  {/* WELCOME TEXT */}
                  <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '15px', fontWeight: '600' }}>Welcome Text</td>
                    <td style={{ padding: '15px' }}>
                      <textarea
                        value={content.welcomeText}
                        onChange={e =>
                          setContent({ ...content, welcomeText: e.target.value })
                        }
                        style={{
                          width: '100%',
                          height: '90px',
                          padding: '10px',
                          borderRadius: '6px',
                          border: '1px solid #ccc',
                          fontFamily: 'inherit'
                        }}
                      />
                    </td>
                  </tr>

                  {/* BANNERS */}
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '15px', fontWeight: '600' }}>Banners</td>
                    <td style={{ padding: '15px' }}>
                      {content.banners.map((b, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 120px auto',
                            gap: '10px',
                            alignItems: 'center',
                            marginBottom: '12px',
                            padding: '10px',
                            background: '#f8f9fa',
                            borderRadius: '6px',
                            border: '1px solid #e9ecef'
                          }}
                        >
                          <input
                            value={b.image}
                            disabled={b.fixed}
                            placeholder="Image URL"
                            onChange={e => updateBanners(i, 'image', e.target.value)}
                            style={{
                              padding: '8px',
                              borderRadius: '5px',
                              border: '1px solid #ccc',
                              background: b.fixed ? '#eee' : '#fff'
                            }}
                          />

                          <input
                            value={b.year}
                            disabled={b.fixed}
                            placeholder="Year"
                            onChange={e => updateBanners(i, 'year', e.target.value)}
                            style={{
                              padding: '8px',
                              borderRadius: '5px',
                              border: '1px solid #ccc',
                              background: b.fixed ? '#eee' : '#fff'
                            }}
                          />

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => toggleFixedBanner(i)}
                              style={{
                                padding: '6px 10px',
                                background: b.fixed ? '#28a745' : '#ffc107',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              {b.fixed ? 'Fixed' : 'Fix'}
                            </button>
                            {!b.fixed && (
                              <button
                                type="button"
                                onClick={() => removeBanner(i)}
                                style={{
                                  padding: '6px 10px',
                                  background: '#dc3545',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addBanner}
                        style={{
                          padding: '10px 15px',
                          background: '#007bff',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          marginTop: '10px'
                        }}
                      >
                        ➕ Add Banner
                      </button>
                    </td>
                  </tr>

                  {/* HIGHLIGHTS */}
                  <tr style={{ background: '#f8f9fa' }}>
                    <td style={{ padding: '15px', fontWeight: '600' }}>Highlights</td>
                    <td style={{ padding: '15px' }}>
                      {content.highlights.map((h, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                          <input
                            value={h}
                            onChange={e => updateHighlights(i, e.target.value)}
                            style={{
                              flex: 1,
                              padding: '8px',
                              borderRadius: '5px',
                              border: '1px solid #ccc'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setContent({
                                ...content,
                                highlights: content.highlights.filter((_, x) => x !== i)
                              })
                            }
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
                          borderRadius: '5px',
                          cursor: 'pointer',
                          marginTop: '10px'
                        }}
                      >
                        ➕ Add Highlight
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                type="submit"
                style={{
                  padding: '12px 20px',
                  background: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  transition: 'background 0.3s'
                }}
                onMouseOver={(e) => e.target.style.background = '#218838'}
                onMouseOut={(e) => e.target.style.background = '#28a745'}
              >
                💾 Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageHome;
