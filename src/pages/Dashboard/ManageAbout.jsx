import { useEffect, useState } from 'react';
import api from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const DEFAULT_STATE = {
  bannerImages: [{ image: '', year: '', fixed: false }],
  boxes: ['', '', ''],
  bigHeader: '',
  bigText: ''
};

const ManageAbout = () => {
  const [content, setContent] = useState(DEFAULT_STATE);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/home');
      const normalizedBannerImages = (data.bannerImages || []).map(b => ({
        image: b.image || '',
        year: b.year || '',
        fixed: true
      }));

      setContent({
        bannerImages: normalizedBannerImages.length
          ? normalizedBannerImages
          : [{ image: '', year: '', fixed: false }],
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const processedBannerImages = content.bannerImages
        .filter(b => b.fixed && b.image.trim() && b.year)
        .map(b => ({
          image: b.image.startsWith('http')
            ? b.image
            : b.image.startsWith('/')
              ? `https://kpt-sports-backend.vercel.app${b.image}`
              : `https://${b.image}`,
          year: parseInt(b.year, 10) || 0
        }));

      const payload = {
        ...content,
        bannerImages: processedBannerImages
      };

      await api.put('/home', payload);
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

  const updateBox = (index, value) => {
    const updated = [...content.boxes];
    updated[index] = value;
    setContent({ ...content, boxes: updated });
  };

  const updateBannerImages = (index, field, value) => {
    const bannerImages = [...content.bannerImages];
    bannerImages[index] = { ...bannerImages[index], [field]: value };
    setContent({ ...content, bannerImages });
  };

  const toggleFixedBanner = (index) => {
    const bannerImages = [...content.bannerImages];
    bannerImages[index].fixed = !bannerImages[index].fixed;
    setContent({ ...content, bannerImages });
  };

  const removeBanner = (index) => {
    setContent({
      ...content,
      bannerImages: content.bannerImages.filter((_, i) => i !== index)
    });
  };

  const addBanner = () => {
    setContent({
      ...content,
      bannerImages: [...content.bannerImages, { image: '', year: '', fixed: false }]
    });
  };


  return (
    <AdminLayout>
      <div style={{ background: '#c0c0c0', minHeight: '100vh', padding: '20px', color: '#000' }}>
        <h2 style={{ color: '#000' }}>Manage About Page</h2>
        <button onClick={() => setIsEditing(p => !p)}>
          {isEditing ? 'Cancel' : 'Edit'}
        </button>

        {!isEditing ? (
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', color: '#000' }}>
            {content.bannerImages.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {b.image && (
                  <img
                    src={b.image}
                    alt={`Banner ${i + 1}`}
                    style={{ width: '50px', height: '30px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                )}
                <span>📅 {b.year}</span>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '20px', borderRadius: '8px', color: '#000' }}>

            {/* BANNERS */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '10px' }}>Banner Images</h4>
              {content.bannerImages.map((b, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px auto', gap: '10px', alignItems: 'center' }}>
                  <input
                    id={`banner-image-${i}`}
                    name={`banner-image-${i}`}
                    value={b.image}
                    disabled={b.fixed}
                    placeholder="Image URL"
                    onChange={e => updateBannerImages(i, 'image', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />

                  <input
                    id={`banner-year-${i}`}
                    name={`banner-year-${i}`}
                    value={b.year}
                    disabled={b.fixed}
                    placeholder="Year"
                    onChange={e => updateBannerImages(i, 'year', e.target.value)}
                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />

                  <div>
                    <button type="button" onClick={() => toggleFixedBanner(i)} style={{ padding: '8px 12px', marginRight: '5px' }}>
                      {b.fixed ? 'Fixed' : 'Fix'}
                    </button>
                    {!b.fixed && (
                      <button type="button" onClick={() => removeBanner(i)} style={{ padding: '8px 12px' }}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button type="button" onClick={addBanner}>
                Add Banner
              </button>

              {/* SAME STYLE AS ManageHome */}
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
                    gap: '8px'
                  }}
                >
                  ➕ Add Banner
                </button>
                <p style={{ margin: '8px 0 0', color: '#666', fontSize: '14px' }}>
                  Click to add a new banner image
                </p>
              </div>
            </div>

            {/* BOXES */}
            {content.boxes.map((box, i) => (
              <div key={i} style={{ marginBottom: '15px' }}>
                <label htmlFor={`box-${i}`}>Box {i + 1}</label>
                <input
                  id={`box-${i}`}
                  name={`box-${i}`}
                  value={box}
                  onChange={e => updateBox(i, e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
            ))}

            {/* BIG SECTION */}
            <input
              id="big-header"
              name="big-header"
              value={content.bigHeader}
              onChange={e => setContent({ ...content, bigHeader: e.target.value })}
              placeholder="Big Header"
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />

            <textarea
              value={content.bigText}
              onChange={e => setContent({ ...content, bigText: e.target.value })}
              style={{ width: '100%', height: '150px', padding: '8px' }}
            />

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button type="submit" disabled={loading} style={{ padding: '12px 24px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>

          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageAbout;
