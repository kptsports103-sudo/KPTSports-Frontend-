import { useEffect, useState } from 'react';
import { Camera, Pencil, Save, Trash2, Trophy, Upload, X } from 'lucide-react';
import AdminLayout from './AdminLayout';
import api from '../../services/api';
import activityLogService from '../../services/activityLog.service';
import { confirmAction } from '../../utils/notify';
import PageLatestChangeCard from '../../components/PageLatestChangeCard';

const MEDAL_OPTIONS = ['Gold', 'Silver', 'Bronze'];

const medalTheme = {
  Gold: { background: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  Silver: { background: '#e5e7eb', color: '#374151', border: '#cbd5e1' },
  Bronze: { background: '#fde68a', color: '#9a3412', border: '#f59e0b' },
};

const createEmptyForm = () => ({
  eventName: '',
  playerName: '',
  medal: 'Gold',
  imageUrl: '',
  imagePublicId: '',
});

const containerStyles = {
  page: {
    background: '#f4f6f8',
    minHeight: '100vh',
    padding: '20px',
    color: '#111827',
    width: '100%',
    minWidth: 0,
  },
  card: {
    background: '#ffffff',
    borderRadius: 16,
    border: '1px solid #d8e0ea',
    boxShadow: '0 8px 24px rgba(71, 85, 105, 0.12)',
    padding: '20px',
    marginBottom: '20px',
  },
  grid: {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 6,
    color: '#334155',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#0f172a',
    fontSize: 14,
    boxSizing: 'border-box',
  },
  tableContainer: {
    background: '#fff',
    borderRadius: 16,
    overflowX: 'auto',
    boxShadow: '0 8px 24px rgba(71, 85, 105, 0.12)',
    border: '1px solid #cfd6df',
  },
  table: {
    width: '100%',
    background: '#ffffff',
    color: '#1f2937',
    borderCollapse: 'collapse',
    fontSize: 14,
    lineHeight: 1.5,
  },
  headerRow: {
    background: 'linear-gradient(135deg, #eef2f6 0%, #d6dde5 100%)',
    color: '#111827',
    borderBottom: '1px solid #c0c8d2',
  },
  headerCell: {
    padding: '15px',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  row: {
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
  },
  rowAlt: {
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f5f7fa',
  },
  cell: {
    padding: '15px',
    fontSize: 14,
    color: '#1f2937',
    verticalAlign: 'middle',
  },
  button: {
    padding: '10px 16px',
    borderRadius: 10,
    border: '1px solid #cbd5e1',
    background: '#e2e8f0',
    color: '#0f172a',
    fontSize: 14,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
  },
  primaryButton: {
    padding: '12px 18px',
    borderRadius: 10,
    border: '1px solid #0b3ea8',
    background: '#0b3ea8',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
  },
};

const ManageWinners = () => {
  const [winners, setWinners] = useState([]);
  const [form, setForm] = useState(createEmptyForm());
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchWinners();
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const fetchWinners = async () => {
    try {
      const response = await api.get('/winners');
      setWinners(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load winners:', error);
      alert('Failed to load winners.');
    }
  };

  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleEdit = (winner) => {
    setForm({
      eventName: winner.eventName || '',
      playerName: winner.playerName || '',
      medal: winner.medal || 'Gold',
      imageUrl: winner.imageUrl || '',
      imagePublicId: winner.imagePublicId || '',
    });
    setEditingId(winner._id);
    setSelectedFile(null);
    setPreviewUrl('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!String(file.type || '').startsWith('image/')) {
      alert('Please select an image file.');
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const uploadImage = async () => {
    if (!selectedFile) {
      return {
        imageUrl: form.imageUrl,
        imagePublicId: form.imagePublicId,
      };
    }

    const data = new FormData();
    data.append('files', selectedFile);

    setIsUploading(true);
    try {
      const response = await api.post('/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const uploadedFile = response?.data?.files?.[0];
      if (!uploadedFile?.url) {
        throw new Error('Upload did not return a valid image URL.');
      }

      return {
        imageUrl: uploadedFile.url,
        imagePublicId: uploadedFile.public_id || '',
      };
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      eventName: form.eventName.trim(),
      playerName: form.playerName.trim(),
      medal: form.medal,
      imageUrl: form.imageUrl,
      imagePublicId: form.imagePublicId,
    };

    if (!payload.eventName || !payload.playerName) {
      alert('Event name and player name are required.');
      return;
    }

    setIsSaving(true);

    try {
      const uploadedImage = await uploadImage();
      payload.imageUrl = uploadedImage.imageUrl;
      payload.imagePublicId = uploadedImage.imagePublicId;

      if (!payload.imageUrl) {
        alert('Please upload an image or take a photo before saving.');
        return;
      }

      if (editingId) {
        await api.put(`/winners/${editingId}`, payload);
      } else {
        await api.post('/winners', payload);
      }

      await fetchWinners();
      resetForm();

      await activityLogService.logActivity(
        editingId ? 'Updated Winner' : 'Created Winner',
        'Winners Page',
        editingId
          ? `Updated winner entry for ${payload.playerName}`
          : `Created winner entry for ${payload.playerName}`,
        [
          { field: 'Event Name', after: payload.eventName || '-' },
          { field: 'Player Name', after: payload.playerName || '-' },
          { field: 'Medal', after: payload.medal || '-' },
          { field: 'Operation', after: editingId ? 'Update' : 'Create' },
        ]
      );
    } catch (error) {
      console.error('Failed to save winner:', error);
      alert(error?.response?.data?.message || 'Failed to save winner.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (winner) => {
    const shouldDelete = await confirmAction('Delete this winner entry?');
    if (!shouldDelete) return;

    try {
      await api.delete(`/winners/${winner._id}`);
      await fetchWinners();

      if (editingId === winner._id) {
        resetForm();
      }

      await activityLogService.logActivity(
        'Deleted Winner',
        'Winners Page',
        `Deleted winner entry for ${winner.playerName || 'winner'}`,
        [
          { field: 'Event Name', before: winner.eventName || '-', after: '-' },
          { field: 'Player Name', before: winner.playerName || '-', after: '-' },
          { field: 'Medal', before: winner.medal || '-', after: '-' },
          { field: 'Operation', after: 'Delete' },
        ]
      );
    } catch (error) {
      console.error('Failed to delete winner:', error);
      alert(error?.response?.data?.message || 'Failed to delete winner.');
    }
  };

  const currentPreview = previewUrl || form.imageUrl || '';
  const isEditing = Boolean(editingId);

  return (
    <AdminLayout>
      <div style={containerStyles.page}>
        <h3 style={{ fontSize: '34px', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Trophy size={30} color="#0b3ea8" />
          Winners
        </h3>
        <p style={{ marginTop: 0, marginBottom: 12, color: '#334155' }}>
          Add and manage winner showcase cards for the public frontend.
        </p>

        <PageLatestChangeCard pageName="Winners Page" />

        <form onSubmit={handleSubmit} style={containerStyles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <h4 style={{ margin: 0, fontSize: 22, color: '#0f172a' }}>
                {isEditing ? 'Edit Winner' : 'Add Winner'}
              </h4>
              <p style={{ margin: '6px 0 0 0', color: '#475569', fontSize: 14 }}>
                Upload a photo or capture one directly from a mobile device camera.
              </p>
            </div>

            {isEditing ? (
              <button type="button" style={containerStyles.button} onClick={resetForm}>
                <X size={16} />
                Cancel Edit
              </button>
            ) : null}
          </div>

          <div style={containerStyles.grid}>
            <div>
              <label htmlFor="winner-event-name" style={containerStyles.label}>Event Name</label>
              <input
                id="winner-event-name"
                value={form.eventName}
                onChange={(event) => setForm((current) => ({ ...current, eventName: event.target.value }))}
                style={containerStyles.input}
                placeholder="100m Sprint"
                required
              />
            </div>

            <div>
              <label htmlFor="winner-player-name" style={containerStyles.label}>Player Name</label>
              <input
                id="winner-player-name"
                value={form.playerName}
                onChange={(event) => setForm((current) => ({ ...current, playerName: event.target.value }))}
                style={containerStyles.input}
                placeholder="Aarav Shetty"
                required
              />
            </div>

            <div>
              <label htmlFor="winner-medal" style={containerStyles.label}>Medal</label>
              <select
                id="winner-medal"
                value={form.medal}
                onChange={(event) => setForm((current) => ({ ...current, medal: event.target.value }))}
                style={containerStyles.input}
              >
                {MEDAL_OPTIONS.map((medal) => (
                  <option key={medal} value={medal}>
                    {medal}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="winner-image-upload" style={containerStyles.label}>Winner Photo</label>
              <label
                htmlFor="winner-image-upload"
                style={{
                  ...containerStyles.input,
                  minHeight: 49,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedFile?.name || (form.imageUrl ? 'Current image selected' : 'Choose image or open camera')}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#0b3ea8', fontWeight: 700 }}>
                  <Upload size={16} />
                  <Camera size={16} />
                </span>
              </label>
              <input
                id="winner-image-upload"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <div
              style={{
                border: '1px dashed #cbd5e1',
                borderRadius: 16,
                padding: 14,
                background: '#f8fafc',
                minHeight: 260,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 10 }}>Preview</div>
              {currentPreview ? (
                <img
                  src={currentPreview}
                  alt={form.playerName || 'Winner preview'}
                  style={{
                    width: '100%',
                    height: 220,
                    objectFit: 'cover',
                    borderRadius: 14,
                    border: '1px solid #dbe4ee',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: 220,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #dbeafe, #eff6ff)',
                    border: '1px solid #dbe4ee',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1d4ed8',
                    fontWeight: 700,
                    textAlign: 'center',
                    padding: 20,
                    boxSizing: 'border-box',
                  }}
                >
                  Image preview will appear here
                </div>
              )}
            </div>

            <div
              style={{
                borderRadius: 16,
                border: '1px solid #dbe4ee',
                background: '#f8fafc',
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    borderRadius: 999,
                    padding: '6px 12px',
                    fontSize: 13,
                    fontWeight: 700,
                    border: `1px solid ${medalTheme[form.medal].border}`,
                    color: medalTheme[form.medal].color,
                    background: medalTheme[form.medal].background,
                    marginBottom: 14,
                  }}
                >
                  <Trophy size={16} />
                  {form.medal} Medal
                </div>

                <h5 style={{ margin: 0, fontSize: 28, color: '#0f172a' }}>
                  {form.playerName || 'Winner Name'}
                </h5>
                <p style={{ margin: '8px 0 0 0', color: '#475569', fontSize: 16 }}>
                  {form.eventName || 'Event name will be shown here'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button type="submit" style={containerStyles.primaryButton} disabled={isSaving || isUploading}>
                  <Save size={16} />
                  {isSaving || isUploading ? 'Saving...' : (isEditing ? 'Update Winner' : 'Save Winner')}
                </button>
                <button type="button" style={containerStyles.button} onClick={resetForm} disabled={isSaving || isUploading}>
                  <X size={16} />
                  Reset Form
                </button>
              </div>
            </div>
          </div>
        </form>

        <div style={containerStyles.tableContainer}>
          <table style={containerStyles.table}>
            <thead>
              <tr style={containerStyles.headerRow}>
                <th style={{ ...containerStyles.headerCell, textAlign: 'left' }}>Photo</th>
                <th style={{ ...containerStyles.headerCell, textAlign: 'left' }}>Player</th>
                <th style={{ ...containerStyles.headerCell, textAlign: 'left' }}>Event</th>
                <th style={{ ...containerStyles.headerCell, textAlign: 'center' }}>Medal</th>
                <th style={{ ...containerStyles.headerCell, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {winners.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...containerStyles.cell, textAlign: 'center', color: '#64748b', padding: '28px 16px' }}>
                    No winners added yet.
                  </td>
                </tr>
              ) : winners.map((winner, index) => (
                <tr key={winner._id} style={index % 2 === 0 ? containerStyles.row : containerStyles.rowAlt}>
                  <td style={containerStyles.cell}>
                    <img
                      src={winner.imageUrl}
                      alt={winner.playerName || 'Winner'}
                      style={{
                        width: 78,
                        height: 78,
                        objectFit: 'cover',
                        borderRadius: 14,
                        border: '1px solid #dbe4ee',
                        display: 'block',
                      }}
                    />
                  </td>
                  <td style={{ ...containerStyles.cell, fontWeight: 700 }}>{winner.playerName}</td>
                  <td style={containerStyles.cell}>{winner.eventName}</td>
                  <td style={{ ...containerStyles.cell, textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 92,
                        padding: '6px 12px',
                        borderRadius: 999,
                        fontSize: 13,
                        fontWeight: 700,
                        border: `1px solid ${medalTheme[winner.medal]?.border || '#cbd5e1'}`,
                        color: medalTheme[winner.medal]?.color || '#334155',
                        background: medalTheme[winner.medal]?.background || '#f8fafc',
                      }}
                    >
                      {winner.medal}
                    </span>
                  </td>
                  <td style={{ ...containerStyles.cell, textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleEdit(winner)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', verticalAlign: 'middle' }}
                      title="Edit"
                      aria-label="Edit"
                    >
                      <Pencil size={20} color="#1f2937" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(winner)}
                      style={{ background: 'none', border: 'none', padding: 0, marginLeft: 14, cursor: 'pointer', verticalAlign: 'middle' }}
                      title="Delete"
                      aria-label="Delete"
                    >
                      <Trash2 size={20} color="#dc2626" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageWinners;
