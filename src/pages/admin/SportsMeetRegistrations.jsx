import { useMemo, useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import AdminLayout from './AdminLayout';
import api from '../../services/api';

const toRows = (registrations) => {
  const rows = [];
  registrations.forEach((reg) => {
    const members = Array.isArray(reg.members) ? reg.members : [];
    members.forEach((member, idx) => {
      rows.push({
        registrationId: reg._id || reg.id,
        memberIndex: idx,
        eventName: reg.eventName || '',
        teamName: reg.teamName || '',
        teamHeadName: reg.teamHeadName || '',
        status: reg.status || 'Locked',
        name: member.name || '',
        branch: member.branch || '',
        registerNumber: member.registerNumber || '',
        year: member.year || '',
        sem: member.sem || '',
      });
    });
  });
  return rows;
};

const SportsMeetRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const rows = useMemo(() => toRows(registrations), [registrations]);

  const load = async () => {
    try {
      setError('');
      const res = await api.get('/registrations');
      setRegistrations(Array.isArray(res.data) ? res.data : []);
    } catch (loadError) {
      setError(loadError.response?.data?.error || 'Unable to load registrations');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const beginEdit = (row) => {
    setEditingKey(`${row.registrationId}-${row.memberIndex}`);
    setDraft({ ...row });
  };

  const cancelEdit = () => {
    setEditingKey('');
    setDraft(null);
  };

  const saveRow = async () => {
    if (!draft) return;
    try {
      setSaving(true);
      setError('');
      const reg = registrations.find((item) => (item._id || item.id) === draft.registrationId);
      if (!reg) throw new Error('Registration not found');
      const members = Array.isArray(reg.members) ? [...reg.members] : [];
      members[draft.memberIndex] = {
        ...members[draft.memberIndex],
        name: draft.name,
        branch: draft.branch,
        registerNumber: draft.registerNumber,
        year: draft.year,
        sem: draft.sem,
      };
      await api.put(`/registrations/${draft.registrationId}`, {
        teamName: draft.teamName,
        teamHeadName: draft.teamHeadName,
        members,
      });
      await load();
      cancelEdit();
    } catch (saveError) {
      setError(saveError.response?.data?.error || saveError.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(12);
    doc.text('Sports Meet Registrations', 14, 12);
    let y = 22;
    doc.setFontSize(9);
    doc.text('Event', 10, y);
    doc.text('Team', 55, y);
    doc.text('Head', 95, y);
    doc.text('Student', 130, y);
    doc.text('Branch', 170, y);
    doc.text('Register No', 200, y);
    doc.text('Year', 240, y);
    doc.text('Sem', 255, y);
    doc.text('Status', 270, y);
    y += 6;
    rows.forEach((row) => {
      if (y > 190) {
        doc.addPage('a4', 'landscape');
        y = 20;
      }
      doc.text(String(row.eventName || '-').slice(0, 24), 10, y);
      doc.text(String(row.teamName || 'Individual').slice(0, 20), 55, y);
      doc.text(String(row.teamHeadName || '-').slice(0, 18), 95, y);
      doc.text(String(row.name || '-').slice(0, 18), 130, y);
      doc.text(String(row.branch || '-').slice(0, 14), 170, y);
      doc.text(String(row.registerNumber || '-').slice(0, 14), 200, y);
      doc.text(String(row.year || '-'), 240, y);
      doc.text(String(row.sem || '-'), 255, y);
      doc.text(String(row.status || '-'), 270, y);
      y += 6;
    });
    doc.save('sports-meet-registrations.pdf');
  };

  return (
    <AdminLayout>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h1 style={{ margin: 0 }}>Sports Meet Registration</h1>
          <button onClick={exportPdf} style={styles.btn}>
            Download PDF
          </button>
        </div>
        {error ? <div style={styles.error}>{error}</div> : null}
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Event</th>
                <th style={styles.th}>Team</th>
                <th style={styles.th}>Head</th>
                <th style={styles.th}>Student</th>
                <th style={styles.th}>Branch</th>
                <th style={styles.th}>Register No</th>
                <th style={styles.th}>Year</th>
                <th style={styles.th}>Sem</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td style={styles.td} colSpan={10}>
                    No registration data
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const key = `${row.registrationId}-${row.memberIndex}`;
                  const isEditing = key === editingKey;
                  const data = isEditing ? draft : row;
                  return (
                    <tr key={key}>
                      <td style={styles.td}>{row.eventName}</td>
                      <td style={styles.td}>{isEditing ? <input style={styles.inp} value={data.teamName} onChange={(e) => setDraft((d) => ({ ...d, teamName: e.target.value }))} /> : row.teamName || 'Individual'}</td>
                      <td style={styles.td}>{isEditing ? <input style={styles.inp} value={data.teamHeadName} onChange={(e) => setDraft((d) => ({ ...d, teamHeadName: e.target.value }))} /> : row.teamHeadName}</td>
                      <td style={styles.td}>{isEditing ? <input style={styles.inp} value={data.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} /> : row.name}</td>
                      <td style={styles.td}>{isEditing ? <input style={styles.inp} value={data.branch} onChange={(e) => setDraft((d) => ({ ...d, branch: e.target.value }))} /> : row.branch}</td>
                      <td style={styles.td}>{isEditing ? <input style={styles.inp} value={data.registerNumber} onChange={(e) => setDraft((d) => ({ ...d, registerNumber: e.target.value }))} /> : row.registerNumber}</td>
                      <td style={styles.td}>{isEditing ? <input style={styles.inp} value={data.year} onChange={(e) => setDraft((d) => ({ ...d, year: e.target.value }))} /> : row.year}</td>
                      <td style={styles.td}>{isEditing ? <input style={styles.inp} value={data.sem} onChange={(e) => setDraft((d) => ({ ...d, sem: e.target.value }))} /> : row.sem}</td>
                      <td style={styles.td}>{row.status}</td>
                      <td style={styles.td}>
                        {isEditing ? (
                          <>
                            <button onClick={saveRow} disabled={saving} style={styles.smallBtn}>
                              Save
                            </button>
                            <button onClick={cancelEdit} style={styles.smallBtn}>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button onClick={() => beginEdit(row)} style={styles.smallBtn}>
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

const styles = {
  tableWrap: { border: '1px solid #d1d5db', borderRadius: 10, overflow: 'auto', background: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 1200 },
  th: { textAlign: 'left', padding: 10, background: '#f3f4f6', borderBottom: '1px solid #d1d5db' },
  td: { padding: 10, borderBottom: '1px solid #e5e7eb' },
  inp: { width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 8px' },
  btn: { border: '1px solid #111827', background: '#111827', color: '#fff', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' },
  smallBtn: { marginRight: 6, border: '1px solid #d1d5db', background: '#fff', borderRadius: 6, padding: '6px 8px', cursor: 'pointer' },
  error: { color: '#b91c1c', marginBottom: 10 },
};

export default SportsMeetRegistrations;
