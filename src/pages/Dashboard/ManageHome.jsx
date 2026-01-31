import { useEffect, useState } from 'react';
import api from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const ManageHome = () => {
  const [content, setContent] = useState({
    welcomeText: '',
    banners: [{ video: '', year: '' }],
    clubs: [{ name: '', url: '', description: '' }]
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
      console.log('ManageHome - Starting API call to /home');
      const res = await api.get('/home');
      console.log('ManageHome - Raw API response:', res.data);
      console.log('ManageHome - API response status:', res.status);
      console.log('ManageHome - Full response object:', res);
      
      // Check if clubs field exists in response
      console.log('ManageHome - clubs field in response:', res.data.clubs);
      console.log('ManageHome - banners field in response:', res.data.banners);
      console.log('ManageHome - welcomeText field in response:', res.data.welcomeText);
      
      const normalizedBanners = (res.data.banners || []).map(b => ({
        video: b.video || '',
        year: b.year || ''
      }));

      const clubsData = res.data.clubs || [{ name: '', url: '', description: '' }];
      console.log('ManageHome - Clubs data from API:', clubsData);
      console.log('ManageHome - Clubs data type:', typeof clubsData);
      console.log('ManageHome - Clubs data length:', clubsData.length);

      setContent({
        welcomeText: res.data.welcomeText || '',
        banners: normalizedBanners.length
          ? normalizedBanners
          : [{ video: '', year: '' }],
        clubs: clubsData
      });
      console.log('ManageHome - Final content state set:', {
        welcomeText: res.data.welcomeText || '',
        banners: normalizedBanners.length ? normalizedBanners : [{ video: '', year: '' }],
        clubs: clubsData
      });
    } catch (error) {
      console.error('ManageHome - Failed to load home content:', error);
      console.error('ManageHome - Error status:', error.response?.status);
      console.error('ManageHome - Error message:', error.response?.data?.message);
      console.error('ManageHome - Error details:', error.response);
    }
  };

  /* =========================
     SAVE CONTENT
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('ManageHome - handleSubmit called');
    console.log('ManageHome - Current content state:', content);

    try {
      const processedBanners = content.banners
        .filter(b => b.video.trim() && String(b.year).trim())
        .map(b => ({
          video: b.video,
          year: parseInt(b.year, 10) || 0
        }));

      const payload = {
        welcomeText: content.welcomeText,
        banners: processedBanners,
        clubs: content.clubs.filter(c => c.name.trim() && c.url.trim()).map(c => ({
          name: c.name.trim(),
          url: c.url.trim(),
          description: c.description ? c.description.trim() : ''
        }))
      };

      console.log('ManageHome - Full content state:', content);
      console.log('ManageHome - Clubs before filter:', content.clubs);
      console.log('ManageHome - Clubs after filter:', content.clubs.filter(c => c.name.trim() && c.url.trim()));
      console.log('ManageHome - Final payload to save:', payload);
      
      console.log('ManageHome - Making PUT request to /home');
      const saveResponse = await api.put('/home', payload);
      console.log('ManageHome - Backend save response status:', saveResponse.status);
      console.log('ManageHome - Backend save response data:', saveResponse.data);
      
      alert('Home page updated successfully');
      setIsEditing(false);
      
      // Immediately fetch to verify save worked
      console.log('ManageHome - Fetching data immediately after save to verify...');
      await fetchContent();
    } catch (error) {
      console.error('ManageHome - Save error:', error);
      console.error('ManageHome - Save error status:', error.response?.status);
      console.error('ManageHome - Save error message:', error.response?.data?.message);
      console.error('ManageHome - Save error full response:', error.response);
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

  const updateClubs = (index, field, value) => {
    const clubs = [...content.clubs];
    clubs[index] = { ...clubs[index], [field]: value };
    setContent({ ...content, clubs });
  };

  const removeClub = (index) => {
    setContent({
      ...content,
      clubs: content.clubs.filter((_, i) => i !== index)
    });
  };

  const addClub = () => {
    setContent({
      ...content,
      clubs: [...content.clubs, { name: '', url: '', description: '' }]
    });
  };

  /* =========================
     UI
  ========================== */
  return (
    <AdminLayout>
      <div style={{ background: '#c0c0c0', minHeight: '100vh', padding: '15px', color: '#000' }}>
        <h3 style={{ fontSize: '34px', fontWeight: '700', color: '#000' }}>Manage Home</h3>

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
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>Clubs</td>
                  <td style={{ padding: '15px' }}>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {content.clubs.map((c, i) => (
                        <li key={i} style={{ marginBottom: '10px' }}>
                          <strong>{c.name}</strong> → {c.url}
                          {c.description && <div style={{ color: '#666', fontSize: '14px', marginTop: '3px' }}>{c.description}</div>}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '20px', borderRadius: '8px', color: '#000' }}>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="welcomeText" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Welcome Text</label>
              <textarea
                id="welcomeText"
                name="welcomeText"
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
                    id={`video-${i}`}
                    name={`video-${i}`}
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
                    id={`year-${i}`}
                    name={`year-${i}`}
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
              <h4 style={{ marginBottom: '10px', color: '#333' }}>Clubs (Name, URL & Description)</h4>
              {content.clubs.map((club, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr auto',
                    gap: '10px',
                    marginBottom: '10px'
                  }}
                >
                  <input
                    id={`club-name-${i}`}
                    name={`club-name-${i}`}
                    placeholder="Club Name"
                    value={club.name}
                    onChange={e => updateClubs(i, 'name', e.target.value)}
                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <input
                    id={`club-url-${i}`}
                    name={`club-url-${i}`}
                    placeholder="URL (e.g. /clubs/eco-club)"
                    value={club.url}
                    onChange={e => updateClubs(i, 'url', e.target.value)}
                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <input
                    id={`club-description-${i}`}
                    name={`club-description-${i}`}
                    placeholder="Description"
                    value={club.description || ''}
                    onChange={e => updateClubs(i, 'description', e.target.value)}
                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <button
                    type="button"
                    onClick={() => removeClub(i)}
                    style={{
                      padding: '8px 12px',
                      background: '#dc3545',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addClub}
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
                ➕ Add Club
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
