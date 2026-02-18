import { useEffect, useState } from 'react';
import api from '../../services/api';
import activityLogService from '../../services/activityLog.service';
import AdminLayout from '../../components/AdminLayout';
import PageLatestChangeCard from '../../components/PageLatestChangeCard';
import './ManageHome.css';

const ManageHome = () => {
  const [content, setContent] = useState({
    welcomeText: '',
    banners: [{ video: '', year: '' }],
    clubs: [{ name: '', url: '', description: '' }]
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await api.get('/home');
      const normalizedBanners = (res.data.banners || []).map((b) => ({
        video: b.video || '',
        year: b.year || ''
      }));
      const clubsData = res.data.clubs || [{ name: '', url: '', description: '' }];

      setContent({
        welcomeText: res.data.welcomeText || '',
        banners: normalizedBanners.length ? normalizedBanners : [{ video: '', year: '' }],
        clubs: clubsData
      });
    } catch (error) {
      console.error('ManageHome - Failed to load home content:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const processedBanners = content.banners
        .filter((b) => b.video.trim() && String(b.year).trim())
        .map((b) => ({
          video: b.video,
          year: parseInt(b.year, 10) || 0
        }));

      const payload = {
        welcomeText: content.welcomeText,
        banners: processedBanners,
        clubs: content.clubs
          .filter((c) => c.name.trim() && c.url.trim())
          .map((c) => ({
            name: c.name.trim(),
            url: c.url.trim(),
            description: c.description ? c.description.trim() : ''
          }))
      };

      await api.put('/home', payload);
      alert('Home page updated successfully');
      setIsEditing(false);

      activityLogService.logActivity(
        'Updated Home Page Content',
        'Home Page',
        'Updated banners and clubs'
      );

      await fetchContent();
    } catch (error) {
      console.error('ManageHome - Save error:', error);
      alert('Failed to save changes');
    }
  };

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

  return (
    <AdminLayout>
      <div className="manage-home">
        <div className="manage-header">
          <div>
            <h1>Home Page Manager</h1>
            <p>Control hero banners and club sections</p>
          </div>

          {!isEditing ? (
            <button className="primary-btn" onClick={() => setIsEditing(true)}>
              Edit Content
            </button>
          ) : (
            <button className="secondary-btn" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          )}
        </div>

        <PageLatestChangeCard pageName="Home Page" />

        {!isEditing ? (
          <div className="preview-grid">
            <section className="admin-card">
              <h3>Hero Banners</h3>
              <div className="banner-preview">
                {content.banners.map((b, i) => (
                  <article key={i} className="banner-item">
                    {b.video ? (
                      <video src={b.video} autoPlay muted loop />
                    ) : (
                      <div className="banner-placeholder">No video URL</div>
                    )}
                    <span>{b.year || 'Year not set'}</span>
                  </article>
                ))}
              </div>
            </section>

            <section className="admin-card">
              <h3>Clubs and Activities</h3>
              <div className="clubs-grid">
                {content.clubs.map((club, i) => (
                  <article key={i} className="club-preview">
                    <h4>{club.name || 'Untitled Club'}</h4>
                    <p>{club.description || 'No description yet'}</p>
                    <span>{club.url || 'No URL yet'}</span>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <form className="admin-form" onSubmit={handleSubmit}>
            <section className="admin-card">
              <h3>Manage Hero Banners</h3>
              {content.banners.map((b, i) => (
                <div key={i} className="form-row banner-row">
                  <input
                    placeholder="Video URL"
                    value={b.video}
                    onChange={(e) => updateBanners(i, 'video', e.target.value)}
                  />
                  <input
                    placeholder="Year"
                    value={b.year}
                    onChange={(e) => updateBanners(i, 'year', e.target.value)}
                  />
                  <button type="button" className="danger-btn" onClick={() => removeBanner(i)}>
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" className="add-btn" onClick={addBanner}>
                Add Banner
              </button>
            </section>

            <section className="admin-card">
              <h3>Manage Clubs</h3>
              {content.clubs.map((club, i) => (
                <div key={i} className="form-row club-row">
                  <input
                    placeholder="Club Name"
                    value={club.name}
                    onChange={(e) => updateClubs(i, 'name', e.target.value)}
                  />
                  <input
                    placeholder="URL"
                    value={club.url}
                    onChange={(e) => updateClubs(i, 'url', e.target.value)}
                  />
                  <input
                    placeholder="Description"
                    value={club.description || ''}
                    onChange={(e) => updateClubs(i, 'description', e.target.value)}
                  />
                  <button type="button" className="danger-btn" onClick={() => removeClub(i)}>
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" className="add-btn" onClick={addClub}>
                Add Club
              </button>
            </section>

            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageHome;
