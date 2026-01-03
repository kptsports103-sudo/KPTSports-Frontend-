import { useEffect, useState } from 'react';
import api from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const ManageGallery = () => {
  const [galleries, setGalleries] = useState([]);
  const [form, setForm] = useState({
    title: '',
    visibility: true,
    images: [{ url: '', overview: '', fixed: false }]
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const res = await api.get('/galleries');
      setGalleries(res.data || []);
    } catch (error) {
      console.error('Error fetching galleries:', error);
      alert('Failed to load galleries.');
    }
  };

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setForm({
      title: '',
      visibility: true,
      images: [{ url: '', overview: '', fixed: false }]
    });
    setEditingId(null);
    setIsEditing(false);
  };

  const handleEdit = (gallery) => {
    setForm({
      title: gallery.title,
      visibility: gallery.visibility,
      images: gallery.media?.length
        ? gallery.media.map(item => ({
            url: item.url || item,
            overview: item.overview || '',
            fixed: true
          }))
        : [{ url: '', overview: '', fixed: false }]
    });
    setEditingId(gallery._id);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this gallery?')) {
      try {
        await api.delete(`/galleries/${id}`);
        fetchGalleries();
      } catch (error) {
        console.error('Error deleting gallery:', error);
        alert('Failed to delete gallery.');
      }
    }
  };

  const updateRow = (index, field, value) => {
    const images = [...form.images];
    images[index][field] = value;
    setForm({ ...form, images });
  };

  const toggleFix = (index) => {
    const images = [...form.images];
    images[index].fixed = !images[index].fixed;
    setForm({ ...form, images });
  };

  const addRow = () => {
    setForm({
      ...form,
      images: [...form.images, { url: '', overview: '', fixed: false }]
    });
  };

  const removeRow = (index) => {
    setForm({
      ...form,
      images: form.images.filter((_, i) => i !== index)
    });
  };

  /* ================= SAVE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: form.title,
      visibility: form.visibility,
      media: form.images
        .filter(img => img.fixed && img.url.trim())
        .map(img => ({
          url: img.url,
          overview: img.overview
        }))
    };

    try {
      editingId
        ? await api.put(`/galleries/${editingId}`, payload)
        : await api.post('/galleries', payload);

      resetForm();
      fetchGalleries();
    } catch (error) {
      console.error('Error saving gallery:', error);
      alert('Failed to save gallery. Please try again.');
    }
  };

  /* ================= UI ================= */
  return (
    <AdminLayout>
      <div style={{ background: '#f4f6f8', minHeight: '100vh', padding: '20px', color: '#000' }}>
        <h3 style={{ fontSize: '34px', fontWeight: '700' }}>Manage Gallery</h3>

        {/* TOP BUTTON */}
        <div style={{ marginBottom: '12px' }}>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              style={{ padding: '8px 14px', background: '#dee2e6', color: '#000', border: '1px solid #adb5bd' }}
            >
              ➕ Add Gallery
            </button>
          ) : (
            <button
              onClick={resetForm}
              style={{ padding: '8px 14px', background: '#dee2e6', color: '#000', border: '1px solid #adb5bd' }}
            >
              ❌ Cancel
            </button>
          )}
        </div>

        {/* ================= VIEW MODE ================= */}
        {!isEditing ? (
          <table style={{ width: '100%', background: '#fff', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ background: '#e9ecef' }}>
                <th style={{ padding: '15px', textAlign: 'left' }}>Title</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Images</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Visible</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {galleries.map((g, i) => (
                <tr key={g._id} style={{ background: i % 2 ? '#f8f9fa' : '#fff' }}>
                  <td style={{ padding: '15px' }}>{g.title}</td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>{g.media?.length || 0}</td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>{g.visibility ? 'Yes' : 'No'}</td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    <button style={{ background: 'none', border: 'none' }} onClick={() => handleEdit(g)}>Edit</button>
                    <button style={{ background: 'none', border: 'none', marginLeft: '10px' }} onClick={() => handleDelete(g._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* ================= EDIT MODE ================= */
          <form onSubmit={handleSubmit}>
            <table style={{ width: '100%', background: '#fff', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <tbody>
                <tr style={{ background: '#e9ecef' }}>
                  <th style={{ padding: '15px', width: '25%', textAlign: 'left' }}>Field</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Value</th>
                </tr>

                <tr>
                  <td style={{ padding: '15px', fontWeight: '600' }}>Title</td>
                  <td style={{ padding: '15px' }}>
                    <input
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', color: '#000' }}
                      required
                    />
                  </td>
                </tr>

                <tr>
                  <td style={{ padding: '15px', fontWeight: '600' }}>Images & Overview</td>
                  <td style={{ padding: '15px' }}>
                    {form.images.map((img, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr auto auto',
                          gap: '10px',
                          marginBottom: '10px',
                          background: '#f8f9fa',
                          padding: '10px',
                          borderRadius: '6px'
                        }}
                      >
                        <input
                          placeholder="Image URL"
                          value={img.url}
                          disabled={img.fixed}
                          onChange={e => updateRow(i, 'url', e.target.value)}
                          style={{ padding: '8px', border: '1px solid #ccc', background: img.fixed ? '#e9ecef' : '#fff' }}
                        />

                        <input
                          placeholder="Overview"
                          value={img.overview}
                          disabled={img.fixed}
                          onChange={e => updateRow(i, 'overview', e.target.value)}
                          style={{ padding: '8px', border: '1px solid #ccc', background: img.fixed ? '#e9ecef' : '#fff' }}
                        />

                        <button
                          type="button"
                          onClick={() => toggleFix(i)}
                          style={{ padding: '6px 12px', border: '1px solid #adb5bd', background: '#dee2e6' }}
                        >
                          {img.fixed ? 'Fixed' : 'Fix'}
                        </button>

                        {!img.fixed && (
                          <button
                            type="button"
                            onClick={() => removeRow(i)}
                            style={{ padding: '6px 12px', border: '1px solid #adb5bd', background: '#dee2e6' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addRow}
                      style={{ padding: '8px 14px', border: '1px solid #adb5bd', background: '#dee2e6' }}
                    >
                      ➕ Add Row
                    </button>
                  </td>
                </tr>

                <tr>
                  <td style={{ padding: '15px', fontWeight: '600' }}>Visible</td>
                  <td style={{ padding: '15px' }}>
                    <input
                      type="checkbox"
                      checked={form.visibility}
                      onChange={e => setForm({ ...form, visibility: e.target.checked })}
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                type="submit"
                style={{ padding: '12px 24px', border: '1px solid #adb5bd', background: '#dee2e6', fontWeight: 'bold' }}
              >
                Save Gallery
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageGallery;
