import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { Camera, CheckCircle2, Copy, Pencil, QrCode, RefreshCcw, Save, Smartphone, Trash2, Trophy, Upload, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import api from '../../services/api';
import activityLogService from '../../services/activityLog.service';
import { confirmAction } from '../../utils/notify';
import PageLatestChangeCard from '../../components/PageLatestChangeCard';
import { SITE_URL } from '../../seo/siteMeta';

const MEDAL_OPTIONS = ['Gold', 'Silver', 'Bronze'];

const medalTheme = {
  Gold: { background: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  Silver: { background: '#e5e7eb', color: '#374151', border: '#cbd5e1' },
  Bronze: { background: '#fde68a', color: '#9a3412', border: '#f59e0b' },
};

const captureStatusTheme = {
  waiting: { background: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: 'Waiting for phone photo' },
  uploaded: { background: '#ecfdf5', color: '#047857', border: '#a7f3d0', label: 'Phone photo ready' },
  error: { background: '#fef2f2', color: '#b91c1c', border: '#fecaca', label: 'Phone sync error' },
  expired: { background: '#fff7ed', color: '#c2410c', border: '#fed7aa', label: 'Phone link expired' },
  idle: { background: '#f8fafc', color: '#334155', border: '#cbd5e1', label: 'Phone link inactive' },
};

const getCaptureBaseUrl = () => {
  if (typeof window === 'undefined') return SITE_URL;

  const hostname = String(window.location.hostname || '').toLowerCase();
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return SITE_URL;
  }

  return window.location.origin.replace(/\/+$/, '');
};

const createEmptyForm = () => ({
  eventName: '',
  playerName: '',
  teamName: '',
  branch: '',
  year: '',
  medal: 'Gold',
  linkedResultType: 'manual',
  linkedResultId: '',
  imageUrl: '',
  imagePublicId: '',
});

const getTeamWinnerLead = (groupResult) => {
  const firstNamedMember = (Array.isArray(groupResult?.members) ? groupResult.members : []).find(
    (member) => String(member?.name || '').trim()
  );
  return String(firstNamedMember?.name || groupResult?.teamName || '').trim();
};

const resolveTeamWinnerBranch = (groupResult) => {
  const branches = Array.from(
    new Set(
      (Array.isArray(groupResult?.members) ? groupResult.members : [])
        .map((member) => String(member?.branch || '').trim())
        .filter(Boolean)
    )
  );

  if (branches.length === 1) return branches[0];
  if (branches.length > 1) return String(groupResult?.teamName || 'Mixed Team').trim();
  return String(groupResult?.teamName || '').trim();
};

const getTeamRoster = (groupResult) =>
  (Array.isArray(groupResult?.members) ? groupResult.members : [])
    .map((member) => ({
      name: String(member?.name || '').trim(),
      branch: String(member?.branch || '').trim(),
      diplomaYear: String(member?.diplomaYear || '').trim(),
      semester: String(member?.semester || '').trim(),
    }))
    .filter((member) => member.name);

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
  infoCard: {
    background: '#eff6ff',
    borderRadius: 16,
    border: '1px solid #bfdbfe',
    boxShadow: '0 8px 20px rgba(37, 99, 235, 0.08)',
    padding: '18px 20px',
    marginBottom: '20px',
  },
  infoTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 800,
    color: '#1d4ed8',
  },
  infoText: {
    margin: '8px 0 0 0',
    color: '#334155',
    fontSize: 14,
    lineHeight: 1.6,
  },
  infoLink: {
    display: 'inline-flex',
    alignItems: 'center',
    marginTop: 12,
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #93c5fd',
    background: '#ffffff',
    color: '#0b3ea8',
    fontSize: 14,
    fontWeight: 700,
    textDecoration: 'none',
  },
  sourceCard: {
    marginBottom: 18,
    padding: 16,
    borderRadius: 14,
    border: '1px solid #dbeafe',
    background: '#f8fbff',
  },
  sourceTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 800,
    color: '#1d4ed8',
  },
  sourceText: {
    margin: '8px 0 0 0',
    color: '#475569',
    fontSize: 13,
    lineHeight: 1.6,
  },
  sourcePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 999,
    border: '1px solid #bfdbfe',
    background: '#eff6ff',
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: 700,
    marginTop: 10,
  },
};

const ManageWinners = () => {
  const currentYear = String(new Date().getFullYear());
  const [winners, setWinners] = useState([]);
  const [individualResults, setIndividualResults] = useState([]);
  const [teamResults, setTeamResults] = useState([]);
  const [form, setForm] = useState(createEmptyForm());
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [captureSession, setCaptureSession] = useState(null);
  const [captureQrCode, setCaptureQrCode] = useState('');
  const [captureStatus, setCaptureStatus] = useState('idle');
  const [captureMessage, setCaptureMessage] = useState('');
  const [isPreparingCapture, setIsPreparingCapture] = useState(false);
  const [sourceYearFilter, setSourceYearFilter] = useState(currentYear);

  useEffect(() => {
    fetchWinners();
    fetchResultSources();
  }, []);

  const availableSourceYears = useMemo(() => {
    return Array.from(
      new Set(
        [...individualResults, ...teamResults]
          .map((item) => String(item?.year || '').trim())
          .filter(Boolean)
      )
    ).sort((left, right) => Number(right) - Number(left));
  }, [individualResults, teamResults]);

  const filteredIndividualResults = useMemo(() => {
    return individualResults
      .filter((item) => !sourceYearFilter || String(item?.year || '') === String(sourceYearFilter))
      .sort((left, right) => {
        const leftLabel = `${left?.year || ''} ${left?.event || ''} ${left?.name || ''}`;
        const rightLabel = `${right?.year || ''} ${right?.event || ''} ${right?.name || ''}`;
        return leftLabel.localeCompare(rightLabel, 'en', { sensitivity: 'base' });
      });
  }, [individualResults, sourceYearFilter]);

  const filteredTeamResults = useMemo(() => {
    return teamResults
      .filter((item) => !sourceYearFilter || String(item?.year || '') === String(sourceYearFilter))
      .sort((left, right) => {
        const leftLabel = `${left?.year || ''} ${left?.event || ''} ${left?.teamName || ''}`;
        const rightLabel = `${right?.year || ''} ${right?.event || ''} ${right?.teamName || ''}`;
        return leftLabel.localeCompare(rightLabel, 'en', { sensitivity: 'base' });
      });
  }, [sourceYearFilter, teamResults]);

  const selectedTeamResult = useMemo(() => {
    if (form.linkedResultType !== 'team' || !form.linkedResultId) return null;
    return teamResults.find((item) => String(item?._id || '') === String(form.linkedResultId)) || null;
  }, [form.linkedResultId, form.linkedResultType, teamResults]);

  const selectedTeamRoster = useMemo(() => getTeamRoster(selectedTeamResult), [selectedTeamResult]);

  useEffect(() => {
    if (availableSourceYears.length === 0) return;
    if (!availableSourceYears.includes(String(sourceYearFilter || ''))) {
      setSourceYearFilter(availableSourceYears[0]);
    }
  }, [availableSourceYears, sourceYearFilter]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (!captureSession?.sessionId || captureStatus !== 'waiting') {
      return undefined;
    }

    let isCancelled = false;

    const pollCaptureSession = async () => {
      try {
        const response = await api.get(`/winners/capture-sessions/${captureSession.sessionId}`);
        if (isCancelled) return;

        const sessionData = response?.data || {};
        setCaptureSession((current) => (current ? { ...current, ...sessionData } : current));

        if (sessionData.status === 'uploaded' && sessionData.imageUrl) {
          setCapturedImage({
            imageUrl: sessionData.imageUrl,
            imagePublicId: sessionData.imagePublicId || '',
          });
          setSelectedFile(null);
          setPreviewUrl('');
          setCaptureStatus('uploaded');
          setCaptureMessage('Phone photo received. It is filled into the form preview and ready to save.');
        }
      } catch (error) {
        if (isCancelled) return;

        if (error?.response?.status === 404 || error?.response?.status === 410) {
          setCaptureStatus('expired');
          setCaptureMessage('Phone camera link expired. Create a new link to continue.');
          return;
        }

        console.error('Failed to sync winner capture session:', error);
        setCaptureStatus('error');
        setCaptureMessage(error?.response?.data?.message || 'Failed to sync phone photo.');
      }
    };

    pollCaptureSession();
    const intervalId = window.setInterval(pollCaptureSession, 2500);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [captureSession?.sessionId, captureStatus]);

  const fetchWinners = async () => {
    try {
      const response = await api.get('/winners');
      setWinners(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load winners:', error);
      alert('Failed to load winners.');
    }
  };

  const fetchResultSources = async () => {
    try {
      const [individualResponse, teamResponse] = await Promise.all([
        api.get('/results'),
        api.get('/group-results'),
      ]);

      setIndividualResults(Array.isArray(individualResponse?.data) ? individualResponse.data.filter((item) => MEDAL_OPTIONS.includes(item?.medal)) : []);
      setTeamResults(Array.isArray(teamResponse?.data) ? teamResponse.data.filter((item) => MEDAL_OPTIONS.includes(item?.medal)) : []);
    } catch (error) {
      console.error('Failed to load result sources for winners:', error);
      setIndividualResults([]);
      setTeamResults([]);
    }
  };

  const clearCaptureUi = () => {
    setCaptureSession(null);
    setCaptureQrCode('');
    setCaptureStatus('idle');
    setCaptureMessage('');
  };

  const releaseCaptureSession = async ({ preserveAsset = false } = {}) => {
    const activeSessionId = captureSession?.sessionId;

    clearCaptureUi();
    if (!preserveAsset) {
      setCapturedImage(null);
    }

    if (!activeSessionId || preserveAsset) {
      return;
    }

    try {
      await api.delete(`/winners/capture-sessions/${activeSessionId}`);
    } catch (error) {
      console.error('Failed to clean up winner capture session:', error);
    }
  };

  const resetForm = ({ preserveCaptureAsset = false } = {}) => {
    if (preserveCaptureAsset) {
      clearCaptureUi();
      setCapturedImage(null);
    } else {
      void releaseCaptureSession();
    }

    setForm(createEmptyForm());
    setEditingId(null);
    setSelectedFile(null);
    setPreviewUrl('');
    setSourceYearFilter(currentYear);
  };

  const applyLinkedSource = (nextType, nextId) => {
    if (nextType === 'manual' || !nextId) {
      setForm((current) => ({
        ...current,
        linkedResultType: nextType,
        linkedResultId: nextId,
      }));
      return;
    }

    if (nextType === 'individual') {
      const linkedResult = individualResults.find((item) => String(item?._id || '') === String(nextId));
      if (!linkedResult) return;

      setSourceYearFilter(String(linkedResult?.year || currentYear));
      setForm((current) => ({
        ...current,
        linkedResultType: 'individual',
        linkedResultId: String(linkedResult._id || ''),
        eventName: String(linkedResult.event || '').trim(),
        playerName: String(linkedResult.name || '').trim(),
        teamName: '',
        branch: String(linkedResult.branch || '').trim(),
        year: String(linkedResult.year || ''),
        medal: linkedResult.medal || 'Gold',
      }));
      return;
    }

    const linkedTeamResult = teamResults.find((item) => String(item?._id || '') === String(nextId));
    if (!linkedTeamResult) return;

    setSourceYearFilter(String(linkedTeamResult?.year || currentYear));
    setForm((current) => ({
      ...current,
      linkedResultType: 'team',
      linkedResultId: String(linkedTeamResult._id || ''),
      eventName: String(linkedTeamResult.event || '').trim(),
      playerName: getTeamWinnerLead(linkedTeamResult),
      teamName: String(linkedTeamResult.teamName || '').trim(),
      branch: resolveTeamWinnerBranch(linkedTeamResult),
      year: String(linkedTeamResult.year || ''),
      medal: linkedTeamResult.medal || 'Gold',
    }));
  };

  const handleEdit = (winner) => {
    void releaseCaptureSession();
    setForm({
      eventName: winner.eventName || '',
      playerName: winner.playerName || '',
      teamName: winner.teamName || '',
      branch: winner.branch || '',
      year: winner.year ? String(winner.year) : '',
      medal: winner.medal || 'Gold',
      linkedResultType: winner.linkedResultType || 'manual',
      linkedResultId: winner.linkedResultId || '',
      imageUrl: winner.imageUrl || '',
      imagePublicId: winner.imagePublicId || '',
    });
    setSourceYearFilter(String(winner.year || currentYear));
    setEditingId(winner._id);
    setSelectedFile(null);
    setPreviewUrl('');
    setCapturedImage(null);
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

    void releaseCaptureSession();
    setSelectedFile(file);
  };

  const handleStartPhoneCapture = async () => {
    setIsPreparingCapture(true);
    setCaptureStatus('waiting');
    setCaptureMessage('');

    try {
      await releaseCaptureSession();

      const response = await api.post('/winners/capture-sessions');
      const sessionId = String(response?.data?.sessionId || '').trim();
      const token = String(response?.data?.token || '').trim();
      const expiresAt = response?.data?.expiresAt || null;

      if (!sessionId || !token) {
        throw new Error('Capture session did not return a valid phone link.');
      }

      const mobileUrl = `${getCaptureBaseUrl()}/winner-camera?session=${encodeURIComponent(sessionId)}&token=${encodeURIComponent(token)}`;
      const qrCodeDataUrl = await QRCode.toDataURL(mobileUrl, {
        width: 240,
        margin: 1,
      });

      setCaptureSession({
        sessionId,
        expiresAt,
        mobileUrl,
        status: 'pending',
        imageUrl: '',
        imagePublicId: '',
      });
      setCaptureQrCode(qrCodeDataUrl);
      setCaptureStatus('waiting');
      setCaptureMessage('Scan this QR code on the phone, take the photo, and it will appear here automatically.');
      setSelectedFile(null);
      setPreviewUrl('');
    } catch (error) {
      console.error('Failed to start winner phone capture:', error);
      clearCaptureUi();
      setCaptureStatus('error');
      setCaptureMessage(error?.response?.data?.message || error?.message || 'Failed to generate phone camera link.');
    } finally {
      setIsPreparingCapture(false);
    }
  };

  const handleCopyPhoneLink = async () => {
    if (!captureSession?.mobileUrl) return;

    try {
      await navigator.clipboard.writeText(captureSession.mobileUrl);
      setCaptureMessage('Phone link copied. Open it on the phone and take the photo there.');
    } catch (error) {
      console.error('Failed to copy phone link:', error);
      alert('Unable to copy the phone link automatically. Open it directly from the QR code.');
    }
  };

  const uploadImage = async () => {
    if (!selectedFile && !capturedImage?.imageUrl) {
      return {
        imageUrl: form.imageUrl,
        imagePublicId: form.imagePublicId,
      };
    }

    if (!selectedFile && capturedImage?.imageUrl) {
      return {
        imageUrl: capturedImage.imageUrl,
        imagePublicId: capturedImage.imagePublicId || '',
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
      teamName: form.teamName.trim(),
      branch: form.branch.trim(),
      year: form.year ? Number(form.year) : null,
      medal: form.medal,
      linkedResultType: form.linkedResultType || 'manual',
      linkedResultId: form.linkedResultId || '',
      imageUrl: form.imageUrl,
      imagePublicId: form.imagePublicId,
    };

    if (!payload.playerName) {
      alert('Player name is required.');
      return;
    }

    if (payload.linkedResultType === 'manual' && !payload.eventName) {
      alert('Event name is required for manual winners.');
      return;
    }

    if (payload.linkedResultType !== 'manual' && !payload.linkedResultId) {
      alert('Please select a linked result.');
      return;
    }

    setIsSaving(true);

    try {
      const activeCaptureSessionId = captureSession?.sessionId;
      const activeCapturedImageId = capturedImage?.imagePublicId || '';
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

      if (activeCaptureSessionId && activeCapturedImageId && payload.imagePublicId === activeCapturedImageId) {
        try {
          await api.post(`/winners/capture-sessions/${activeCaptureSessionId}/claim`);
        } catch (claimError) {
          console.error('Failed to claim winner capture session:', claimError);
        }
      }

      await fetchWinners();
      resetForm({ preserveCaptureAsset: true });

      await activityLogService.logActivity(
        editingId ? 'Updated Winner' : 'Created Winner',
        'Winners Page',
        editingId
          ? `Updated winner entry for ${payload.playerName}`
          : `Created winner entry for ${payload.playerName}`,
        [
          { field: 'Event Name', after: payload.eventName || '-' },
          { field: 'Player Name', after: payload.playerName || '-' },
          { field: 'Team Name', after: payload.teamName || '-' },
          { field: 'Branch', after: payload.branch || '-' },
          { field: 'Year', after: payload.year ? String(payload.year) : '-' },
          { field: 'Medal', after: payload.medal || '-' },
          { field: 'Result Source', after: payload.linkedResultType || 'manual' },
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
          { field: 'Team Name', before: winner.teamName || '-', after: '-' },
          { field: 'Branch', before: winner.branch || '-', after: '-' },
          { field: 'Year', before: winner.year ? String(winner.year) : '-', after: '-' },
          { field: 'Medal', before: winner.medal || '-', after: '-' },
          { field: 'Operation', after: 'Delete' },
        ]
      );
    } catch (error) {
      console.error('Failed to delete winner:', error);
      alert(error?.response?.data?.message || 'Failed to delete winner.');
    }
  };

  const currentPreview = previewUrl || capturedImage?.imageUrl || form.imageUrl || '';
  const isEditing = Boolean(editingId);
  const isLinkedWinner = form.linkedResultType !== 'manual';
  const previewSourceLabel = previewUrl
    ? 'Photo selected from this device'
    : capturedImage?.imageUrl
      ? 'Photo received from phone'
      : form.imageUrl
        ? 'Current saved winner photo'
        : '';
  const captureTheme = captureStatusTheme[captureStatus] || captureStatusTheme.idle;

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

        <div style={containerStyles.infoCard}>
          <h4 style={containerStyles.infoTitle}>Winners page feeds the Points Table</h4>
          <p style={containerStyles.infoText}>
            Entries saved here appear on the public Winners page and create points automatically. Linking a winner to
            Manage Results is optional and only needed when you want the public Results page to stay synced with the
            same medal, branch, event, and year.
          </p>
          <Link to="/points-table" style={containerStyles.infoLink}>
            Open Points Table
          </Link>
        </div>

        <form onSubmit={handleSubmit} style={containerStyles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <h4 style={{ margin: 0, fontSize: 22, color: '#0f172a' }}>
                {isEditing ? 'Edit Winner' : 'Add Winner'}
              </h4>
              <p style={{ margin: '6px 0 0 0', color: '#475569', fontSize: 14 }}>
                Upload from this device, or scan a phone link to capture a photo and auto-fill it here.
              </p>
            </div>

            {isEditing ? (
              <button type="button" style={containerStyles.button} onClick={resetForm}>
                <X size={16} />
                Cancel Edit
              </button>
            ) : null}
          </div>

          <div style={containerStyles.sourceCard}>
            <h5 style={containerStyles.sourceTitle}>Winner Source</h5>
            <p style={containerStyles.sourceText}>
              Link this winner to an Individual Result or Team Result when you want the public Results page to stay
              aligned. Points are created from the winner card itself, even in manual mode.
            </p>
            <div style={containerStyles.grid}>
              <div>
                <label htmlFor="winner-linked-type" style={containerStyles.label}>Source Type</label>
                <select
                  id="winner-linked-type"
                  value={form.linkedResultType}
                  onChange={(event) => {
                    const nextType = event.target.value;
                    if (nextType === 'manual') {
                      applyLinkedSource('manual', '');
                      return;
                    }
                    setForm((current) => ({
                      ...current,
                      linkedResultType: nextType,
                      linkedResultId: '',
                    }));
                  }}
                  style={containerStyles.input}
                >
                  <option value="manual">Manual Winner Card</option>
                  <option value="individual">Link Individual Result</option>
                  <option value="team">Link Team Result</option>
                </select>
              </div>

              <div>
                <label htmlFor="winner-source-year" style={containerStyles.label}>Source Year</label>
                <select
                  id="winner-source-year"
                  value={sourceYearFilter}
                  onChange={(event) => setSourceYearFilter(event.target.value)}
                  style={containerStyles.input}
                  disabled={availableSourceYears.length === 0}
                >
                  {availableSourceYears.length === 0 ? <option value="">No result years</option> : null}
                  {availableSourceYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="winner-linked-result" style={containerStyles.label}>Linked Result</label>
                <select
                  id="winner-linked-result"
                  value={form.linkedResultId}
                  onChange={(event) => applyLinkedSource(form.linkedResultType, event.target.value)}
                  style={containerStyles.input}
                  disabled={form.linkedResultType === 'manual'}
                >
                  <option value="">
                    {form.linkedResultType === 'manual'
                      ? 'Manual winner does not use linked results'
                      : form.linkedResultType === 'individual'
                        ? 'Select Individual Result'
                        : 'Select Team Result'}
                  </option>
                  {(form.linkedResultType === 'individual' ? filteredIndividualResults : filteredTeamResults).map((item) => (
                    <option key={item._id} value={item._id}>
                      {form.linkedResultType === 'individual'
                        ? `${item.year} | ${item.event} | ${item.name} | ${item.branch || '-'} | ${item.medal}`
                        : `${item.year} | ${item.event} | ${item.teamName} | ${resolveTeamWinnerBranch(item) || '-'} | ${item.medal} | ${getTeamRoster(item).length} players`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={containerStyles.sourcePill}>
              <Trophy size={14} />
              {isLinkedWinner
                ? 'Linked winners sync event, branch, medal, and year from Manage Results'
                : 'Manual mode still creates points without linking a result'}
            </div>
            {form.linkedResultType === 'team' ? (
              <div
                style={{
                  marginTop: 14,
                  padding: 16,
                  borderRadius: 14,
                  border: '1px solid #bfdbfe',
                  background: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <h6 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1d4ed8' }}>Team Source Preview</h6>
                    <p style={{ margin: '6px 0 0 0', color: '#475569', fontSize: 13, lineHeight: 1.6 }}>
                      Check the team event, team name, and roster before saving. Team player names on the public Winners
                      page come from this linked team result.
                    </p>
                  </div>
                  <Link to="/admin/sports-meet-registrations" style={containerStyles.infoLink}>
                    Open Sports Meet Registration
                  </Link>
                </div>

                {selectedTeamResult ? (
                  <>
                    <div
                      style={{
                        marginTop: 14,
                        display: 'grid',
                        gap: 12,
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Event</div>
                        <div style={{ marginTop: 6, color: '#0f172a', fontWeight: 700 }}>{selectedTeamResult.event || '-'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Team Name</div>
                        <div style={{ marginTop: 6, color: '#0f172a', fontWeight: 700 }}>{selectedTeamResult.teamName || '-'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Branch / Label</div>
                        <div style={{ marginTop: 6, color: '#0f172a', fontWeight: 700 }}>{resolveTeamWinnerBranch(selectedTeamResult) || '-'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Players</div>
                        <div style={{ marginTop: 6, color: '#0f172a', fontWeight: 700 }}>{selectedTeamRoster.length}</div>
                      </div>
                    </div>

                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>
                        Team Players
                      </div>
                      {selectedTeamRoster.length === 0 ? (
                        <div style={{ color: '#64748b', fontSize: 13 }}>No player names found in this linked team result.</div>
                      ) : (
                        <div style={{ display: 'grid', gap: 8 }}>
                          {selectedTeamRoster.map((member, index) => (
                            <div
                              key={`${member.name}-${index}`}
                              style={{
                                padding: '10px 12px',
                                borderRadius: 10,
                                border: '1px solid #dbeafe',
                                background: '#f8fbff',
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: 12,
                                flexWrap: 'wrap',
                              }}
                            >
                              <span style={{ color: '#0f172a', fontWeight: 700 }}>{member.name}</span>
                              <span style={{ color: '#475569', fontSize: 13 }}>
                                {[member.branch, member.diplomaYear ? `Year ${member.diplomaYear}` : '', member.semester ? `Sem ${member.semester}` : '']
                                  .filter(Boolean)
                                  .join(' | ') || 'Player info not available'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ marginTop: 14, color: '#64748b', fontSize: 13 }}>
                    Select a linked team result to preview the event, team name, and player names.
                  </div>
                )}
              </div>
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
                readOnly={isLinkedWinner}
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
                disabled={isLinkedWinner}
              >
                {MEDAL_OPTIONS.map((medal) => (
                  <option key={medal} value={medal}>
                    {medal}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="winner-team-name" style={containerStyles.label}>Team Name</label>
              <input
                id="winner-team-name"
                value={form.teamName}
                onChange={(event) => setForm((current) => ({ ...current, teamName: event.target.value }))}
                style={containerStyles.input}
                placeholder="CSE Champions"
                readOnly={isLinkedWinner}
              />
            </div>

            <div>
              <label htmlFor="winner-branch" style={containerStyles.label}>Branch</label>
              <input
                id="winner-branch"
                value={form.branch}
                onChange={(event) => setForm((current) => ({ ...current, branch: event.target.value }))}
                style={containerStyles.input}
                placeholder="Computer Science"
                readOnly={isLinkedWinner}
              />
            </div>

            <div>
              <label htmlFor="winner-year" style={containerStyles.label}>Year</label>
              <input
                id="winner-year"
                value={form.year}
                onChange={(event) => setForm((current) => ({ ...current, year: event.target.value }))}
                style={containerStyles.input}
                placeholder="2026"
                readOnly={isLinkedWinner}
              />
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
                  {selectedFile?.name || (capturedImage?.imageUrl ? 'Phone photo selected' : (form.imageUrl ? 'Current image selected' : 'Choose image or open camera'))}
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
              <p style={{ margin: '8px 0 0 0', fontSize: 12, color: '#64748b' }}>
                On mobile this can open the camera directly. On laptop, use the phone link below.
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
              borderRadius: 16,
              border: '1px solid #dbe4ee',
              background: '#f8fafc',
              padding: 18,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                  <Smartphone size={18} color="#0b3ea8" />
                  Phone Camera Link
                </div>
                <p style={{ margin: '8px 0 0 0', color: '#475569', fontSize: 14, maxWidth: 640 }}>
                  Use this when the laptop camera picker is not enough. Scan the QR code on your phone, take the photo there, and the winner photo preview here updates automatically.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  style={containerStyles.button}
                  onClick={handleStartPhoneCapture}
                  disabled={isPreparingCapture || isSaving || isUploading}
                >
                  {captureSession ? <RefreshCcw size={16} /> : <QrCode size={16} />}
                  {isPreparingCapture ? 'Preparing...' : (captureSession ? 'Generate New Link' : 'Use Phone Camera')}
                </button>
                {captureSession ? (
                  <button
                    type="button"
                    style={containerStyles.button}
                    onClick={() => void releaseCaptureSession()}
                    disabled={isPreparingCapture || isSaving || isUploading}
                  >
                    <X size={16} />
                    Close Link
                  </button>
                ) : null}
              </div>
            </div>

            <div
              style={{
                marginTop: 14,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 12px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
                border: `1px solid ${captureTheme.border}`,
                background: captureTheme.background,
                color: captureTheme.color,
              }}
            >
              {captureStatus === 'uploaded' ? <CheckCircle2 size={16} /> : <Smartphone size={16} />}
              {captureTheme.label}
            </div>

            {captureMessage ? (
              <p style={{ margin: '10px 0 0 0', color: '#475569', fontSize: 14 }}>
                {captureMessage}
              </p>
            ) : null}

            {captureSession ? (
              <div style={{ marginTop: 16, display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', alignItems: 'start' }}>
                <div
                  style={{
                    borderRadius: 16,
                    border: '1px solid #dbe4ee',
                    background: '#ffffff',
                    padding: 16,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 220,
                  }}
                >
                  {captureQrCode ? (
                    <img
                      src={captureQrCode}
                      alt="Winner phone camera QR code"
                      style={{ width: '100%', maxWidth: 220, height: 'auto', display: 'block' }}
                    />
                  ) : (
                    <div style={{ color: '#64748b', fontSize: 14 }}>Generating QR code...</div>
                  )}
                </div>

                <div style={{ display: 'grid', gap: 12 }}>
                  <div
                    style={{
                      borderRadius: 14,
                      border: '1px solid #dbe4ee',
                      background: '#ffffff',
                      padding: 14,
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>Phone Link</div>
                    <a
                      href={captureSession.mobileUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#0b3ea8', wordBreak: 'break-all', fontSize: 13, textDecoration: 'none' }}
                    >
                      {captureSession.mobileUrl}
                    </a>
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button type="button" style={containerStyles.button} onClick={handleCopyPhoneLink}>
                      <Copy size={16} />
                      Copy Link
                    </button>
                    <a
                      href={captureSession.mobileUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ ...containerStyles.button, textDecoration: 'none' }}
                    >
                      <Smartphone size={16} />
                      Open on Phone
                    </a>
                  </div>

                  <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                    1. Open the QR/link on the phone.
                    <br />
                    2. Take the winner photo there.
                    <br />
                    3. Keep this page open. The preview here updates automatically.
                  </div>
                </div>
              </div>
            ) : null}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Preview</div>
                {previewSourceLabel ? (
                  <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                    {previewSourceLabel}
                  </div>
                ) : null}
              </div>
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
                {form.year ? (
                  <p style={{ margin: '8px 0 0 0', color: '#0b3ea8', fontSize: 13, fontWeight: 700 }}>
                    Year: {form.year}
                  </p>
                ) : null}
                {form.teamName ? (
                  <p style={{ margin: '10px 0 0 0', color: '#0b3ea8', fontSize: 14, fontWeight: 700 }}>
                    Team: {form.teamName}
                  </p>
                ) : null}
                {form.branch ? (
                  <p style={{ margin: '6px 0 0 0', color: '#475569', fontSize: 14 }}>
                    Branch: {form.branch}
                  </p>
                ) : null}
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
                <th style={{ ...containerStyles.headerCell, textAlign: 'left' }}>Team</th>
                <th style={{ ...containerStyles.headerCell, textAlign: 'left' }}>Branch</th>
                <th style={{ ...containerStyles.headerCell, textAlign: 'left' }}>Event</th>
                <th style={{ ...containerStyles.headerCell, textAlign: 'left' }}>Year</th>
                <th style={{ ...containerStyles.headerCell, textAlign: 'center' }}>Medal</th>
                <th style={{ ...containerStyles.headerCell, textAlign: 'left' }}>Source</th>
                <th style={{ ...containerStyles.headerCell, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {winners.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ ...containerStyles.cell, textAlign: 'center', color: '#64748b', padding: '28px 16px' }}>
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
                  <td style={containerStyles.cell}>{winner.teamName || '-'}</td>
                  <td style={containerStyles.cell}>{winner.branch || '-'}</td>
                  <td style={containerStyles.cell}>{winner.eventName}</td>
                  <td style={containerStyles.cell}>{winner.year || '-'}</td>
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
                  <td style={containerStyles.cell}>
                    {winner.linkedResultType === 'team'
                      ? 'Team Result'
                      : winner.linkedResultType === 'individual'
                        ? 'Individual Result'
                        : 'Manual'}
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
