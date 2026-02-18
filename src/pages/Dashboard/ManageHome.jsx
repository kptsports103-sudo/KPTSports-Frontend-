import { useEffect, useState } from 'react';
import api from '../../services/api';
import activityLogService from '../../services/activityLog.service';
import AdminLayout from '../../components/AdminLayout';
import PageLatestChangeCard from '../../components/PageLatestChangeCard';
import { emitPageUpdate } from '../../utils/eventBus';
import './ManageHome.css';

const createDefaultContent = () => ({
  heroTitle: 'Champions in Spirit, Champions in Action',
  heroSubtitle: 'Karnataka Government Polytechnic, Mangaluru Sports Portal',
  heroButtons: [
    { text: 'View Results', link: '/results' },
    { text: 'Explore Events', link: '/events' }
  ],
  banners: [{ image: '/Gallery1.jpg', year: String(new Date().getFullYear()) }],
  achievements: [
    { title: 'Total Prizes', value: '110+' },
    { title: 'Active Players', value: '21' },
    { title: 'Sports Meets', value: '45' },
    { title: 'Years Excellence', value: '12' }
  ],
  sportsCategories: [
    { name: 'Football', image: '/Gallery3.jpg' },
    { name: 'Cricket', image: '/Gallery7.jpg' }
  ],
  gallery: [{ image: '/Gallery2.jpg', caption: 'Track Sprint Final' }],
  upcomingEvents: [{ name: 'Annual Sports Meet', date: 'March 15, 2026', venue: 'Main Ground', image: '/Gallery10.jpg' }],
  clubs: [{ name: 'KPT College', url: '/college', description: 'Excellence in technical education and sports.', image: '/KPT 2.png', theme: 'college' }],
  announcements: [
    'Inter-department athletics trials are open for all first-year students.',
    'Team registration for the annual sports meet closes on March 8, 2026.'
  ]
});

const normalize = (raw) => {
  const defaults = createDefaultContent();
  if (!raw) return defaults;

  return {
    heroTitle: raw.heroTitle || defaults.heroTitle,
    heroSubtitle: raw.heroSubtitle || defaults.heroSubtitle,
    heroButtons: (raw.heroButtons || defaults.heroButtons).map((x, i) => ({
      text: x?.text || defaults.heroButtons[i]?.text || 'Action',
      link: x?.link || defaults.heroButtons[i]?.link || '/'
    })),
    banners: (raw.banners || defaults.banners).map((x) => ({
      image: x?.image || x?.video || '',
      year: String(x?.year || '')
    })),
    achievements: (raw.achievements || defaults.achievements).map((x) => ({
      title: x?.title || '',
      value: x?.value || ''
    })),
    sportsCategories: (raw.sportsCategories || defaults.sportsCategories).map((x) => ({
      name: x?.name || '',
      image: x?.image || ''
    })),
    gallery: (raw.gallery || defaults.gallery).map((x) => ({
      image: x?.image || '',
      caption: x?.caption || ''
    })),
    upcomingEvents: (raw.upcomingEvents || defaults.upcomingEvents).map((x) => ({
      name: x?.name || '',
      date: x?.date || '',
      venue: x?.venue || '',
      image: x?.image || ''
    })),
    clubs: (raw.clubs || defaults.clubs).map((x) => ({
      name: x?.name || '',
      url: x?.url || '',
      description: x?.description || '',
      image: x?.image || '',
      theme: x?.theme || 'blue'
    })),
    announcements: (raw.announcements || defaults.announcements).map((x) => String(x || ''))
  };
};

const ManageHome = () => {
  const [content, setContent] = useState(createDefaultContent());
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [toastTitle, setToastTitle] = useState('KPT Sports CMS');
  const [toastMessage, setToastMessage] = useState('Home page content has been updated successfully. All changes are now live on the website.');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await api.get('/home');
      setContent(normalize(res.data));
    } catch (error) {
      console.error('ManageHome - Failed to load home content:', error);
      setContent(createDefaultContent());
    }
  };

  const updateField = (section, index, field, value) => {
    setContent((prev) => ({
      ...prev,
      [section]: prev[section].map((item, i) => (
        i === index ? { ...item, [field]: value } : item
      ))
    }));
  };

  const updateRootField = (field, value) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  const addItem = (section, template) => {
    setContent((prev) => ({ ...prev, [section]: [...prev[section], template] }));
  };

  const removeItem = (section, index) => {
    setContent((prev) => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }));
  };

  const openToast = (title, message) => {
    setToastTitle(title);
    setToastMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const generateAIContent = () => {
    setContent((prev) => ({
      ...prev,
      heroTitle: 'Building Champions, Inspiring Excellence',
      heroSubtitle: 'KPT Mangaluru Sports Portal - Empowering Athletes for State and National Success',
      announcements: [
        'Registrations open for the Annual Inter-Department Sports Championship.',
        'New training schedule released for track and field athletes.',
        'Congratulations to our state-level medal winners.'
      ],
      achievements: [
        { title: 'Total Prizes Won', value: '110+' },
        { title: 'Active Players', value: '21' },
        { title: 'Sports Meets Conducted', value: '45' },
        { title: 'Years of Excellence', value: '12' }
      ],
      upcomingEvents: [
        { name: 'Annual Sports Meet', date: 'March 15, 2026', venue: 'Main Stadium', image: '/Gallery10.jpg' },
        { name: 'Inter Polytechnic Championship', date: 'April 10, 2026', venue: 'Indoor Complex', image: '/Gallery16.jpg' }
      ]
    }));
    openToast('KPT Sports CMS', 'AI content generated successfully. Review and save to publish.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        heroTitle: content.heroTitle.trim(),
        heroSubtitle: content.heroSubtitle.trim(),
        heroButtons: content.heroButtons
          .filter((x) => x.text.trim() && x.link.trim())
          .map((x) => ({ text: x.text.trim(), link: x.link.trim() })),
        banners: content.banners
          .filter((x) => x.image.trim())
          .map((x) => ({ image: x.image.trim(), year: x.year.trim() })),
        achievements: content.achievements
          .filter((x) => x.title.trim() && x.value.trim())
          .map((x) => ({ title: x.title.trim(), value: x.value.trim() })),
        sportsCategories: content.sportsCategories
          .filter((x) => x.name.trim() && x.image.trim())
          .map((x) => ({ name: x.name.trim(), image: x.image.trim() })),
        gallery: content.gallery
          .filter((x) => x.image.trim())
          .map((x) => ({ image: x.image.trim(), caption: x.caption.trim() })),
        upcomingEvents: content.upcomingEvents
          .filter((x) => x.name.trim())
          .map((x) => ({
            name: x.name.trim(),
            date: x.date.trim(),
            venue: x.venue.trim(),
            image: x.image.trim()
          })),
        clubs: content.clubs
          .filter((x) => x.name.trim() && x.url.trim())
          .map((x) => ({
            name: x.name.trim(),
            url: x.url.trim(),
            description: x.description.trim(),
            image: x.image.trim(),
            theme: x.theme.trim() || 'blue'
          })),
        announcements: content.announcements.map((x) => x.trim()).filter(Boolean)
      };

      await api.put('/home', payload);
      openToast('KPT Sports CMS', 'Home page content has been updated successfully. All changes are now live on the website.');
      setIsEditing(false);

      activityLogService.logActivity(
        'Home Page Updated',
        'Home Page',
        'Content was successfully modified'
      );
      emitPageUpdate('Home Page');
      // Backward-compatible event for older listeners.
      window.dispatchEvent(new CustomEvent('HOME_UPDATED', { detail: { pageName: 'Home Page', time: Date.now() } }));

      await fetchContent();
    } catch (error) {
      console.error('ManageHome - Save error:', error);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="manage-home">
        <div className="manage-header">
          <div>
            <h1>Home Page CMS Manager</h1>
            <p>Manage all Home page sections from one control panel</p>
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
              <h3>Hero Section</h3>
              <p><strong>Title:</strong> {content.heroTitle}</p>
              <p><strong>Subtitle:</strong> {content.heroSubtitle}</p>
                <div className="chips">
                  {content.heroButtons.map((button, i) => (
                    <span key={`${button.text}-${i}`} className="chip">{button.text}{' -> '}{button.link}</span>
                  ))}
                </div>
              </section>

            <section className="admin-card">
              <h3>Banners</h3>
              <div className="banner-preview">
                {content.banners.map((b, i) => (
                  <article key={i} className="banner-item">
                    {b.image ? <img src={b.image} alt={`Banner ${i + 1}`} /> : <div className="banner-placeholder">No image</div>}
                    <span>{b.year || 'Year not set'}</span>
                  </article>
                ))}
              </div>
            </section>

            <section className="admin-card">
              <h3>Achievements</h3>
              <div className="simple-grid">
                {content.achievements.map((x, i) => (
                  <div key={i} className="mini-card">
                    <strong>{x.value}</strong>
                    <p>{x.title}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="admin-card">
              <h3>Sports Categories</h3>
              <div className="simple-grid">
                {content.sportsCategories.map((x, i) => (
                  <div key={i} className="mini-card">
                    <strong>{x.name}</strong>
                    <p>{x.image}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="admin-card">
              <h3>Gallery</h3>
              <div className="simple-grid">
                {content.gallery.map((x, i) => (
                  <div key={i} className="mini-card">
                    <strong>{x.caption || 'No caption'}</strong>
                    <p>{x.image}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="admin-card">
              <h3>Upcoming Events</h3>
              <div className="simple-grid">
                {content.upcomingEvents.map((x, i) => (
                  <div key={i} className="mini-card">
                    <strong>{x.name}</strong>
                    <p>{x.date}</p>
                    <p>{x.venue}</p>
                  </div>
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
          <div className="cms-layout">
            <div className="cms-editor">
              <button type="button" className="ai-btn" onClick={generateAIContent}>
                Generate AI Content
              </button>

              <form className="admin-form" onSubmit={handleSubmit}>
                <section className="admin-card">
                  <h3>Hero Section</h3>
                  <div className="form-row single-row">
                    <input
                      placeholder="Hero Title"
                      value={content.heroTitle}
                      onChange={(e) => updateRootField('heroTitle', e.target.value)}
                    />
                  </div>
                  <div className="form-row single-row">
                    <input
                      placeholder="Hero Subtitle"
                      value={content.heroSubtitle}
                      onChange={(e) => updateRootField('heroSubtitle', e.target.value)}
                    />
                  </div>
                  {content.heroButtons.map((button, i) => (
                    <div key={i} className="form-row hero-button-row">
                      <input
                        placeholder="Button Text"
                        value={button.text}
                        onChange={(e) => updateField('heroButtons', i, 'text', e.target.value)}
                      />
                      <input
                        placeholder="Button Link"
                        value={button.link}
                        onChange={(e) => updateField('heroButtons', i, 'link', e.target.value)}
                      />
                      <button type="button" className="danger-btn" onClick={() => removeItem('heroButtons', i)}>
                        Remove
                      </button>
                    </div>
                  ))}
                  <button type="button" className="add-btn" onClick={() => addItem('heroButtons', { text: '', link: '' })}>
                    Add Hero Button
                  </button>
                </section>

                <section className="admin-card">
                  <h3>Banner Images</h3>
                  {content.banners.map((b, i) => (
                    <div key={i} className="form-row banner-row">
                      <input
                        placeholder="Image URL"
                        value={b.image}
                        onChange={(e) => updateField('banners', i, 'image', e.target.value)}
                      />
                      <input
                        placeholder="Year"
                        value={b.year}
                        onChange={(e) => updateField('banners', i, 'year', e.target.value)}
                      />
                      <button type="button" className="danger-btn" onClick={() => removeItem('banners', i)}>
                        Remove
                      </button>
                    </div>
                  ))}
                  <button type="button" className="add-btn" onClick={() => addItem('banners', { image: '', year: '' })}>
                    Add Banner
                  </button>
                </section>

                <section className="admin-card">
                  <h3>Achievements</h3>
                  {content.achievements.map((x, i) => (
                    <div key={i} className="form-row two-col-row">
                      <input
                        placeholder="Title"
                        value={x.title}
                        onChange={(e) => updateField('achievements', i, 'title', e.target.value)}
                      />
                      <input
                        placeholder="Value"
                        value={x.value}
                        onChange={(e) => updateField('achievements', i, 'value', e.target.value)}
                      />
                      <button type="button" className="danger-btn" onClick={() => removeItem('achievements', i)}>
                        Remove
                      </button>
                    </div>
                  ))}
                  <button type="button" className="add-btn" onClick={() => addItem('achievements', { title: '', value: '' })}>
                    Add Achievement
                  </button>
                </section>

                <section className="admin-card">
                  <h3>Sports Categories</h3>
                  {content.sportsCategories.map((x, i) => (
                    <div key={i} className="form-row two-col-row">
                      <input
                        placeholder="Category Name"
                        value={x.name}
                        onChange={(e) => updateField('sportsCategories', i, 'name', e.target.value)}
                      />
                      <input
                        placeholder="Image URL"
                        value={x.image}
                        onChange={(e) => updateField('sportsCategories', i, 'image', e.target.value)}
                      />
                      <button type="button" className="danger-btn" onClick={() => removeItem('sportsCategories', i)}>
                        Remove
                      </button>
                    </div>
                  ))}
                  <button type="button" className="add-btn" onClick={() => addItem('sportsCategories', { name: '', image: '' })}>
                    Add Category
                  </button>
                </section>

                <section className="admin-card">
                  <h3>Gallery Preview</h3>
                  {content.gallery.map((x, i) => (
                    <div key={i} className="form-row two-col-row">
                      <input
                        placeholder="Image URL"
                        value={x.image}
                        onChange={(e) => updateField('gallery', i, 'image', e.target.value)}
                      />
                      <input
                        placeholder="Caption"
                        value={x.caption}
                        onChange={(e) => updateField('gallery', i, 'caption', e.target.value)}
                      />
                      <button type="button" className="danger-btn" onClick={() => removeItem('gallery', i)}>
                        Remove
                      </button>
                    </div>
                  ))}
                  <button type="button" className="add-btn" onClick={() => addItem('gallery', { image: '', caption: '' })}>
                    Add Gallery Item
                  </button>
                </section>

                <section className="admin-card">
                  <h3>Upcoming Events</h3>
                  {content.upcomingEvents.map((x, i) => (
                    <div key={i} className="form-row event-row">
                      <input
                        placeholder="Event Name"
                        value={x.name}
                        onChange={(e) => updateField('upcomingEvents', i, 'name', e.target.value)}
                      />
                      <input
                        placeholder="Date"
                        value={x.date}
                        onChange={(e) => updateField('upcomingEvents', i, 'date', e.target.value)}
                      />
                      <input
                        placeholder="Venue"
                        value={x.venue}
                        onChange={(e) => updateField('upcomingEvents', i, 'venue', e.target.value)}
                      />
                      <input
                        placeholder="Image URL"
                        value={x.image}
                        onChange={(e) => updateField('upcomingEvents', i, 'image', e.target.value)}
                      />
                      <button type="button" className="danger-btn" onClick={() => removeItem('upcomingEvents', i)}>
                        Remove
                      </button>
                    </div>
                  ))}
                  <button type="button" className="add-btn" onClick={() => addItem('upcomingEvents', { name: '', date: '', venue: '', image: '' })}>
                    Add Event
                  </button>
                </section>

                <section className="admin-card">
                  <h3>Announcements</h3>
                  {content.announcements.map((text, i) => (
                    <div key={i} className="form-row single-row">
                      <input
                        placeholder="Announcement text"
                        value={text}
                        onChange={(e) => {
                          const next = [...content.announcements];
                          next[i] = e.target.value;
                          updateRootField('announcements', next);
                        }}
                      />
                      <button type="button" className="danger-btn" onClick={() => removeItem('announcements', i)}>
                        Remove
                      </button>
                    </div>
                  ))}
                  <button type="button" className="add-btn" onClick={() => addItem('announcements', '')}>
                    Add Announcement
                  </button>
                </section>

                <section className="admin-card">
                  <h3>Clubs and Activities</h3>
                  {content.clubs.map((club, i) => (
                    <div key={i} className="form-row club-row">
                      <input
                        placeholder="Club Name"
                        value={club.name}
                        onChange={(e) => updateField('clubs', i, 'name', e.target.value)}
                      />
                      <input
                        placeholder="URL"
                        value={club.url}
                        onChange={(e) => updateField('clubs', i, 'url', e.target.value)}
                      />
                      <input
                        placeholder="Description"
                        value={club.description}
                        onChange={(e) => updateField('clubs', i, 'description', e.target.value)}
                      />
                      <input
                        placeholder="Image URL"
                        value={club.image}
                        onChange={(e) => updateField('clubs', i, 'image', e.target.value)}
                      />
                      <input
                        placeholder="Theme (blue, pink...)"
                        value={club.theme}
                        onChange={(e) => updateField('clubs', i, 'theme', e.target.value)}
                      />
                      <button type="button" className="danger-btn" onClick={() => removeItem('clubs', i)}>
                        Remove
                      </button>
                    </div>
                  ))}
                  <button type="button" className="add-btn" onClick={() => addItem('clubs', { name: '', url: '', description: '', image: '', theme: 'blue' })}>
                    Add Club
                  </button>
                </section>

                <button type="submit" className="save-btn" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            <div className="cms-preview">
              <div className="preview-hero">
                <h1>{content.heroTitle}</h1>
                <p>{content.heroSubtitle}</p>
                <div className="preview-buttons">
                  {content.heroButtons.slice(0, 2).map((button, i) => (
                    <span key={`${button.text}-${i}`} className="preview-btn">{button.text}</span>
                  ))}
                </div>
              </div>

              <div className="preview-stats">
                {content.achievements.map((a, i) => (
                  <div key={i} className="preview-stat">
                    <h2>{a.value}</h2>
                    <span>{a.title}</span>
                  </div>
                ))}
              </div>

              <div className="preview-section">
                <h4>Sports Categories</h4>
                <div className="preview-list">
                  {content.sportsCategories.map((item, i) => (
                    <div key={i}>{item.name || 'Category'}</div>
                  ))}
                </div>
              </div>

              <div className="preview-section">
                <h4>Upcoming Events</h4>
                <div className="preview-list">
                  {content.upcomingEvents.map((item, i) => (
                    <div key={i}>{item.name || 'Event'} - {item.date || '-'}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-card">
            <h2>{toastTitle}</h2>
            <p>{toastMessage}</p>
            <button type="button" onClick={() => setShowSuccess(false)}>OK</button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageHome;
