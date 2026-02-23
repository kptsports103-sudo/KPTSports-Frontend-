import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import activityLogService from '../../services/activityLog.service';
import AdminLayout from './AdminLayout';
import { confirmAction, notify } from '../../utils/notify';
import PageLatestChangeCard from '../../components/PageLatestChangeCard';

const MEDALS = ['Gold', 'Silver', 'Bronze'];

const medalPriority = {
  Gold: 1,
  Silver: 2,
  Bronze: 3
};

const normalizeName = (name) => {
  return (name || '').toLowerCase().trim().replace(/\s+/g, ' ');
};

const ManageResults = () => {
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();
  const canDelete = ['admin', 'superadmin'].includes(String(currentUser?.role || '').toLowerCase());

  const currentYear = new Date().getFullYear();
  const [data, setData] = useState([]); // [{ year, results: [] }]
  const [groupData, setGroupData] = useState([]); // [{ year, results: [] }]
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [players, setPlayers] = useState([]);
  const [playersById, setPlayersById] = useState({});
  const [playersByYear, setPlayersByYear] = useState({});
  const [bulkRows, setBulkRows] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [isGroupEditing, setIsGroupEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingGroupId, setEditingGroupId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    playerMasterId: '',
    branch: '',
    kpmNo: '',
    event: '',
    year: '',
    medal: '',
    diplomaYear: '',
    imageUrl: ''
  });

  const [groupForm, setGroupForm] = useState({
    teamName: '',
    event: '',
    year: '',
    memberIds: [],
    members: [],
    manualMembers: [{ name: '', branch: '', year: '' }],
    medal: '',
    imageUrl: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [resultsActivityLogs, setResultsActivityLogs] = useState([]);
  const [loadingResultsActivity, setLoadingResultsActivity] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      console.error('No authentication found');
      alert('Please log in to access this page');
      window.location.href = '/login';
      return;
    }

    console.log('Authentication found:', { token: token.substring(0, 20) + '...', user });
  }, []);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchResults();
    fetchGroupResults();
    fetchPlayers();
    fetchResultsActivityLogs();
  }, []);

  const fetchResultsActivityLogs = async () => {
    try {
      setLoadingResultsActivity(true);
      const response = await activityLogService.getPageActivityLogs('Results Page', 15);
      if (response?.success) {
        setResultsActivityLogs(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch results activity logs:', error);
      setResultsActivityLogs([]);
    } finally {
      setLoadingResultsActivity(false);
    }
  };

  const fetchResults = async () => {
    try {
      console.log('Fetching results...');
      const res = await api.get('/results');
      console.log('Fetch response:', res.data);

      // group results by year (Players-style)
      const grouped = res.data.reduce((acc, item) => {
        acc[item.year] = acc[item.year] || [];
        acc[item.year].push({
          ...item,
          imageUrl: item.imageUrl || null
        });
        return acc;
      }, {});

      const formatted = Object.keys(grouped).map(year => ({
        year: Number(year),
        results: grouped[year]
      }));

      setData(formatted);
      console.log('Formatted data:', formatted);
    } catch (error) {
      console.error('Failed to fetch results:', error);

      if (error.response?.status === 401) {
        alert('Authentication expired. Please log in again.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        alert('Failed to load results. Please try again.');
      }
    }
  };

  const fetchGroupResults = async () => {
    try {
      console.log('Fetching group results...');
      const res = await api.get('/group-results');
      console.log('Group fetch response:', res.data);

      // group results by year
      const grouped = res.data.reduce((acc, item) => {
        acc[item.year] = acc[item.year] || [];
        acc[item.year].push({
          ...item,
          imageUrl: item.imageUrl || null
        });
        return acc;
      }, {});

      const formatted = Object.keys(grouped).map(year => ({
        year: Number(year),
        results: grouped[year]
      }));

      setGroupData(formatted);
      console.log('Formatted group data:', formatted);
    } catch (error) {
      console.error('Failed to fetch group results:', error);
    }
  };

  const fetchPlayers = async () => {
    try {
      const res = await api.get('/home/players');
      const grouped = res.data || {};
      const masterMap = {};
      const yearMap = {};

      Object.keys(grouped).forEach(year => {
        const yearKey = String(year);
        yearMap[yearKey] = yearMap[yearKey] || [];

        grouped[year].forEach(p => {
          const masterId = String(p.masterId || p.id || p.playerId || '').trim();
          if (!masterId) return;
          const yearNumber = Number(year);
          const rowDiplomaYear = p.diplomaYear || p.currentDiplomaYear || p.baseDiplomaYear || '';
          const yearPlayer = {
            masterId,
            id: masterId,
            name: p.name || '',
            branch: p.branch || '',
            kpmNo: p.kpmNo || '',
            diplomaYear: rowDiplomaYear,
            year: yearNumber
          };
          yearMap[yearKey].push(yearPlayer);

          if (!masterMap[masterId]) {
            masterMap[masterId] = {
              masterId,
              id: masterId,
              name: p.name,
              branch: p.branch,
              kpmNo: p.kpmNo || '',
              diplomaYear: rowDiplomaYear,
              _latestYear: Number.isFinite(yearNumber) ? yearNumber : -1,
              aliasIds: new Set()
            };
          }

          if (Number.isFinite(yearNumber) && yearNumber >= masterMap[masterId]._latestYear) {
            masterMap[masterId].name = p.name || masterMap[masterId].name;
            masterMap[masterId].branch = p.branch || masterMap[masterId].branch;
            masterMap[masterId].kpmNo = p.kpmNo || masterMap[masterId].kpmNo;
            masterMap[masterId].diplomaYear = rowDiplomaYear || masterMap[masterId].diplomaYear;
            masterMap[masterId]._latestYear = yearNumber;
          }

          const rowId = String(p.id || p.playerId || '').trim();
          if (rowId) {
            masterMap[masterId].aliasIds.add(rowId);
          }
        });
      });

      const uniquePlayers = Object.values(masterMap).map(({ aliasIds, _latestYear, ...p }) => ({
        ...p,
        aliasIds: Array.from(aliasIds)
      }));
      const cleanedYearMap = Object.keys(yearMap).reduce((acc, yearKey) => {
        const byMaster = {};
        yearMap[yearKey].forEach(player => {
          byMaster[player.masterId] = player;
        });
        acc[yearKey] = Object.values(byMaster).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        return acc;
      }, {});

      const byId = uniquePlayers.reduce((acc, p) => {
        acc[p.masterId] = p;
        (p.aliasIds || []).forEach(aliasId => {
          acc[aliasId] = p;
        });
        return acc;
      }, {});

      setPlayers(uniquePlayers);
      setPlayersById(byId);
      setPlayersByYear(cleanedYearMap);
    } catch (error) {
      console.error('Failed to fetch players:', error);
    }
  };

  /* ================= SAVE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting form:', form);

      const selectedMasterId = String(form.playerMasterId || '').trim();
      if (!selectedMasterId) {
        alert('Please select a player.');
        return;
      }

      if (!playersById[selectedMasterId]) {
        alert('Selected player could not be resolved. Please reselect.');
        return;
      }

      const payload = {
        playerMasterId: selectedMasterId,
        event: form.event,
        year: form.year,
        medal: form.medal,
        imageUrl: form.imageUrl
      };

      if (editingId) {
        const response = await api.put(`/results/${editingId}`, payload);
        console.log('Update response:', response.data);
      } else {
        const response = await api.post('/results', payload);
        console.log('Create response:', response.data);
      }

      fetchResults();
      notify('Data saved successfully', { type: 'success', position: 'top-center' });
      setIsEditing(false);
      resetForm();
      
      // Log the activity
      await activityLogService.logActivity(
        'Updated Match Results',
        'Results Page',
        editingId ? `Updated result for ${form.event}` : `Created new result for ${form.event}`
      );
      fetchResultsActivityLogs();
    } catch (error) {
      console.error('Save error:', error);

      let errorMessage = 'Save failed';

      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (status === 403) {
          errorMessage = 'Permission denied. You may not have admin rights.';
        } else if (status === 400) {
          errorMessage = data?.message || 'Invalid data. Please check all fields.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = data?.message || `Error ${status}: Failed to save`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection.';
      }

      alert(errorMessage);
    }
  };

  /* ================= HELPERS ================= */
  const startIndividualBulkEntry = () => {
    const yearKey = String(selectedYear || '');
    const yearPlayers = (playersByYear[yearKey] || []).slice();

    if (!yearPlayers.length) {
      alert(`No players found for year ${yearKey || 'selected year'}.`);
      return;
    }

    const rows = yearPlayers.map(player => ({
      playerMasterId: player.masterId,
      name: player.name || '',
      branch: player.branch || '',
      kpmNo: player.kpmNo || '',
      diplomaYear: String(player.diplomaYear || ''),
      year: Number(yearKey),
      event: '',
      medal: '',
      imageUrl: ''
    }));

    resetForm();
    setEditingId(null);
    setIsGroupEditing(false);
    setIsEditing(true);
    setBulkRows(rows);
  };

  const handleBulkRowChange = (index, key, value) => {
    setBulkRows(prev => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    try {
      const readyRows = (bulkRows || []).filter(row => row.event && row.medal);
      if (!readyRows.length) {
        alert('Please fill at least one row with Event and Medal.');
        return;
      }

      await Promise.all(
        readyRows.map(row =>
          api.post('/results', {
            playerMasterId: row.playerMasterId,
            event: row.event,
            year: row.year,
            medal: row.medal,
            imageUrl: row.imageUrl
          })
        )
      );

      fetchResults();
      notify(`Saved ${readyRows.length} result(s)`, { type: 'success', position: 'top-center' });
      setIsEditing(false);
      setBulkRows([]);
      resetForm();

      await activityLogService.logActivity(
        'Updated Match Results',
        'Results Page',
        `Created ${readyRows.length} result(s) for year ${selectedYear}`
      );
      fetchResultsActivityLogs();
    } catch (error) {
      console.error('Bulk save error:', error);
      alert(error?.response?.data?.message || 'Bulk save failed');
    }
  };

  const handleEdit = (item) => {
    const matchedPlayer = item.playerMasterId
      ? playersById[item.playerMasterId]
      : item.playerId
      ? playersById[item.playerId]
      : players.find(p => normalizeName(p.name) === normalizeName(item.name));

    setForm({
      name: matchedPlayer?.name || item.name || '',
      playerMasterId: matchedPlayer?.masterId || item.playerMasterId || item.playerId || '',
      branch: matchedPlayer?.branch || item.branch || '',
      kpmNo: matchedPlayer?.kpmNo || '',
      event: item.event || '',
      year: item.year || '',
      medal: item.medal || '',
      diplomaYear: String(matchedPlayer?.diplomaYear || item.diplomaYear || ''),
      imageUrl: item.imageUrl || ''
    });
    setEditingId(item._id);
    setIsEditing(true);
    setBulkRows([]);
  };

  const handleGroupEdit = (item) => {
    const manualNames = (item.members || [])
      .map((member) => {
        if (typeof member === 'string') return member;
        if (member && typeof member === 'object' && !member.playerId) return member.name;
        return null;
      })
      .filter(Boolean);

    setGroupForm({
      ...item,
      memberIds: [],
      members: item.members && Array.isArray(item.members) ? item.members : [],
      manualMembers: manualNames.length
        ? manualNames.map(name => ({ name, branch: '', year: '' }))
        : [{ name: '', branch: '', year: '' }]
    });
    setEditingGroupId(item._id);
    setIsGroupEditing(true);
  };

  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting group form:', groupForm);

      const manualRows = Array.isArray(groupForm.manualMembers) ? groupForm.manualMembers : [];
      const manualMembers = manualRows
        .map(row => ({
          name: (row.name || '').trim(),
          branch: (row.branch || '').trim(),
          year: (row.year || '').toString().trim()
        }))
        .filter(row => row.name);

      const manualMembersResolved = manualMembers.map(row => {
        const matched = players.find(p => normalizeName(p.name) === normalizeName(row.name));
        const yearNum = Number(row.year);
        const diplomaYear = [1, 2, 3].includes(yearNum) ? yearNum : null;
        if (matched) {
          return {
            playerMasterId: matched.masterId,
            playerId: matched.id || '',
            name: matched.name,
            diplomaYear: diplomaYear || matched.diplomaYear || null
          };
        }
        return { playerMasterId: null, playerId: null, name: row.name, diplomaYear: diplomaYear || null };
      });

      const combinedMembers = [...manualMembersResolved];
      const dedupedMembers = [];
      const seen = new Set();
      combinedMembers.forEach(m => {
        const key = m.playerMasterId
          ? `mid:${m.playerMasterId}`
          : m.playerId
          ? `id:${m.playerId}`
          : `name:${normalizeName(m.name)}`;
        if (seen.has(key)) return;
        seen.add(key);
        dedupedMembers.push(m);
      });

      if (!dedupedMembers.length) {
        alert('Please add at least one member name.');
        return;
      }

      const combinedMemberIds = Array.from(new Set(dedupedMembers.map(m => m.playerId).filter(Boolean)));
      const combinedMemberMasterIds = Array.from(new Set(dedupedMembers.map(m => m.playerMasterId).filter(Boolean)));

      const payload = {
        teamName: groupForm.teamName,
        event: groupForm.event,
        year: groupForm.year,
        medal: groupForm.medal,
        imageUrl: groupForm.imageUrl,
        members: dedupedMembers,
        memberIds: combinedMemberIds,
        memberMasterIds: combinedMemberMasterIds
      };

      if (editingGroupId) {
        const response = await api.put(`/group-results/${editingGroupId}`, payload);
        console.log('Group update response:', response.data);
      } else {
        const response = await api.post('/group-results', payload);
        console.log('Group create response:', response.data);
      }

      fetchGroupResults();
      notify('Data saved successfully', { type: 'success', position: 'top-center' });
      setIsGroupEditing(false);
      setEditingGroupId(null);
      setGroupForm({ teamName: '', event: '', year: '', memberIds: [], members: [], manualMembers: [{ name: '', branch: '', year: '' }], medal: '', imageUrl: '' });
      
      // Log the activity
      await activityLogService.logActivity(
        'Updated Match Results',
        'Results Page',
        editingGroupId ? `Updated group result for ${groupForm.event}` : `Created new group result for ${groupForm.event}`
      );
      fetchResultsActivityLogs();
    } catch (error) {
      console.error('Group save error:', error);

      let errorMessage = 'Group save failed';

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (status === 403) {
          errorMessage = 'Permission denied. You may not have admin rights.';
        } else if (status === 400) {
          errorMessage = data?.message || 'Invalid data. Please check all fields.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = data?.message || `Error ${status}: Failed to save group`;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }

      alert(errorMessage);
    }
  };

  const handleGroupDelete = async (id, teamName) => {
    const shouldDelete = await confirmAction('Delete team result?');
    if (!shouldDelete) return;
    try {
      console.log('Deleting group result:', id);
      const response = await api.delete(`/group-results/${id}`);
      console.log('Group delete response:', response.data);
      fetchGroupResults();
      notify(`deleted ${teamName || 'record'}`, { type: 'success', position: 'top-center' });
    } catch (error) {
      console.error('Group delete error:', error);

      let errorMessage = 'Group delete failed';

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (status === 403) {
          errorMessage = 'Permission denied. You may not have admin rights.';
        } else if (status === 404) {
          errorMessage = 'Group record not found.';
        } else {
          errorMessage = data?.message || `Error ${status}: Failed to delete group`;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }

      alert(errorMessage);
    }
  };

  const handleDelete = async (id, name) => {
    const shouldDelete = await confirmAction('Delete this record?');
    if (!shouldDelete) return;
    try {
      console.log('Deleting result:', id);
      const response = await api.delete(`/results/${id}`);
      console.log('Delete response:', response.data);
      fetchResults();
      notify(`deleted ${name || 'record'}`, { type: 'success', position: 'top-center' });
    } catch (error) {
      console.error('Delete error:', error);

      let errorMessage = 'Delete failed';

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (status === 403) {
          errorMessage = 'Permission denied. You may not have admin rights.';
        } else if (status === 404) {
          errorMessage = 'Record not found.';
        } else {
          errorMessage = data?.message || `Error ${status}: Failed to delete`;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }

      alert(errorMessage);
    }
  };

  const resetForm = () => {
    setForm({ name: '', playerMasterId: '', branch: '', kpmNo: '', event: '', year: '', medal: '', diplomaYear: '', imageUrl: '' });
    setEditingId(null);
    setBulkRows([]);
  };

  /* ================= FILTERED DATA ================= */
  const availableYears = Array.from(
    new Set([
      ...data.map(d => Number(d.year)).filter(Boolean),
      ...groupData.map(g => Number(g.year)).filter(Boolean),
      currentYear
    ])
  ).sort((a, b) => b - a);

  const displayedData = data.filter(d => d.year === Number(selectedYear));
  const displayedGroupData = groupData.filter(g => g.year === Number(selectedYear));

  /* ================= UI ================= */
  return (
    <AdminLayout>
      <div style={styles.page}>
        <h2 style={styles.title}>🏆 Update Results</h2>
        <p style={styles.activitySubtitle}>Manage results page content</p>
        <PageLatestChangeCard pageName="Results Page" />

        <div style={styles.activitySection}>
          <h3 style={styles.activityTitle}>Recent Results Page Changes</h3>
          <p style={styles.activitySubtitle}>Visible details: change, admin name, admin email, and time.</p>
          {loadingResultsActivity ? (
            <div style={styles.activityEmpty}>Loading activity...</div>
          ) : resultsActivityLogs.length === 0 ? (
            <div style={styles.activityEmpty}>No Results page updates yet.</div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.headerRow}>
                    <th style={styles.headerCell}>Change</th>
                    <th style={styles.headerCell}>Admin Name</th>
                    <th style={styles.headerCell}>Admin Email</th>
                    <th style={styles.headerCell}>Updated At</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsActivityLogs.map((log) => (
                    <tr key={log._id} style={styles.bodyRow}>
                      <td style={styles.cell}>{log.details || log.action}</td>
                      <td style={styles.cell}>{log.adminName || '-'}</td>
                      <td style={styles.cell}>{log.adminEmail || '-'}</td>
                      <td style={styles.cell}>
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* YEAR SELECT (TOP CENTER like Players) */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <label htmlFor="manage-results-year" style={{ marginRight: '10px', fontWeight: 500 }}>Select Year:</label>
          <select
            id="manage-results-year"
            name="manage-results-year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={styles.yearSelect}
          >
            {availableYears
              .map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
          </select>
        </div>

        {/* ADD / CANCEL */}
        <div style={styles.topActionBar}>
          {!isEditing && !isGroupEditing ? (
            <>
              <button onClick={startIndividualBulkEntry} style={styles.topBtnPrimary}>
                ➕ Individual Result
              </button>
              <button onClick={() => setIsGroupEditing(true)} style={styles.topBtnSecondary}>
                🧑‍🤝‍🧑 Team Result
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                resetForm();
                setIsEditing(false);
                setIsGroupEditing(false);
                setEditingGroupId(null);
                setGroupForm({ teamName: '', event: '', year: '', memberIds: [], members: [], manualMembers: [{ name: '', branch: '', year: '' }], medal: '', imageUrl: '' });
              }}
              style={styles.topBtnSecondary}
            >
              ❌ Cancel
            </button>
          )}
        </div>

        {/* VIEW MODE */}
        {!isEditing && !isGroupEditing &&
          displayedData.map(yearBlock => (
            <div key={yearBlock.year}>
              {/* YEAR BAR */}
              <div style={styles.yearBar} />
              <h3 style={styles.yearTitle}>Year: {yearBlock.year}</h3>

              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <label htmlFor={`manage-results-search-${yearBlock.year}`} style={{ display: 'none' }}>Search by Name or Event</label>
                <input
                  id={`manage-results-search-${yearBlock.year}`}
                  name={`manage-results-search-${yearBlock.year}`}
                  type="text"
                  placeholder="Search by Name or Event"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>

              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.headerRow}>
                      <th style={styles.headerCell}>Name</th>
                      <th style={styles.headerCell}>Branch</th>
                      <th style={styles.headerCell}>Event</th>
                      <th style={styles.headerCell}>Medal</th>
                      <th style={styles.headerCell}>Image</th>
                      <th style={styles.headerCell}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...yearBlock.results]
                      .filter(item =>
                        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (item.event || '').toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .sort((a, b) => (medalPriority[a.medal] || 999) - (medalPriority[b.medal] || 999))
                      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'en', { sensitivity: 'base' }))
                      .map(item => (
                      <tr
                        key={item._id}
                        style={styles.bodyRow}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8f9ff';
                          e.currentTarget.style.transform = 'scale(1.001)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <td style={{...styles.cell, ...styles.nameCell}}>{item.name}</td>
                        <td style={styles.cell}>{item.branch || '-'}</td>
                        <td style={styles.cell}>
                          <span style={styles.eventBadge}>{item.event}</span>
                        </td>
                        <td style={styles.cell}>
                          <span style={{
                            ...styles.medalBadge,
                            ...(item.medal === 'Gold' ? styles.goldMedal :
                              item.medal === 'Silver' ? styles.silverMedal : styles.bronzeMedal)
                          }}>
                            {item.medal}
                          </span>
                        </td>
                        <td style={styles.cell}>
                          {item.imageUrl ? (
                            <a href={item.imageUrl} target="_blank" rel="noreferrer" style={styles.imageLink}>
                              🖼️ View Image
                            </a>
                          ) : (
                            <span style={styles.noImage}>No Image</span>
                          )}
                        </td>
                        <td style={styles.cell}>
                          <div style={styles.leftIconGroup}>
                            <img
                              src="/Edit button.png"
                              alt="Edit"
                              style={styles.iconButton}
                              onClick={() => handleEdit(item)}
                            />
                            {canDelete ? (
                              <img
                                src="/Delete button.png"
                                alt="Delete"
                                style={styles.iconButton}
                                onClick={() => handleDelete(item._id, item.name)}
                              />
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ================= GROUP RESULTS ================= */}
              <h4 style={{ marginTop: 20, fontSize: 16, fontWeight: 600, color: '#fff' }}>🧑‍🤝‍🧑 Group / Team Results</h4>

              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.headerRow}>
                      <th style={styles.headerCell}>Team</th>
                      <th style={styles.headerCell}>Event</th>
                      <th style={styles.headerCell}>Members</th>
                      <th style={styles.headerCell}>Medal</th>
                      <th style={styles.headerCell}>URL</th>
                      <th style={styles.headerCell}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedGroupData
                      .filter(g => {
                        // Find if this year block has group results
                        return g.year === yearBlock.year && g.results && g.results.length > 0;
                      })
                      .flatMap(g => g.results) // Flatten the results array
                      .map(item => (
                        <tr key={item._id} style={styles.bodyRow}>
                          <td style={styles.cell}>{item.teamName || ''}</td>
                          <td style={styles.cell}>
                            <span style={styles.eventBadge}>{item.event || ''}</span>
                          </td>
                          <td style={styles.cell}>
                            {(() => {
                              // Handle both legacy (string array) and new (object array) formats
                              let memberNames = [];
                              
                              if (item.members && Array.isArray(item.members)) {
                                // New format: array of objects
                                if (typeof item.members[0] === 'object') {
                                  memberNames = item.members.map(m => m.name).filter(Boolean);
                                } else {
                                  // Legacy format: array of strings
                                  memberNames = item.members;
                                }
                              }
                              
                              // Fallback: try memberIds
                              if (memberNames.length === 0 && (item.memberMasterIds || item.memberIds)) {
                                const memberRefs = item.memberMasterIds || item.memberIds || [];
                                memberNames = memberRefs.map(id => playersById[id]?.name).filter(Boolean);
                              }
                              
                              return memberNames.length > 0 ? (
                                <ul style={{ margin: 0, paddingLeft: 18 }}>
                                  {memberNames.map((m, i) => <li key={i}>{m}</li>)}
                                </ul>
                              ) : (
                                <span style={{ color: '#999' }}>No members</span>
                              );
                            })()}
                          </td>
                          <td style={styles.cell}>
                            <span style={{
                              ...styles.medalBadge,
                              ...(item.medal === 'Gold'
                                ? styles.goldMedal
                                : item.medal === 'Silver'
                                ? styles.silverMedal
                                : styles.bronzeMedal)
                            }}>
                              {item.medal || ''}
                            </span>
                          </td>
                          <td style={styles.cell}>
                            {item.imageUrl ? (
                              <a href={item.imageUrl} target="_blank" rel="noreferrer" style={styles.imageLink}>
                                View
                              </a>
                            ) : '—'}
                          </td>
                          <td style={styles.cell}>
                            <div style={styles.leftIconGroup}>
                              <img
                                src="/Edit button.png"
                                alt="Edit"
                                style={styles.iconButton}
                                onClick={() => handleGroupEdit(item)}
                              />
                              {canDelete ? (
                                <img
                                  src="/Delete button.png"
                                  alt="Delete"
                                  style={styles.iconButton}
                                  onClick={() => handleGroupDelete(item._id, item.teamName)}
                                />
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

        {/* INDIVIDUAL EDIT MODE */}
        {isEditing && !isGroupEditing && (
          editingId ? (
            <form onSubmit={handleSubmit}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.headerRow}>
                    <th style={styles.headerCell}>Player</th>
                    <th style={styles.headerCell}>Name</th>
                    <th style={styles.headerCell}>Branch</th>
                    <th style={styles.headerCell}>KPM No</th>
                    <th style={styles.headerCell}>Event</th>
                    <th style={styles.headerCell}>Year</th>
                    <th style={styles.headerCell}>Diploma Year</th>
                    <th style={styles.headerCell}>Medal</th>
                    <th style={styles.headerCell}>Image URL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={styles.bodyRow}>
                    <td style={styles.cell}>
                      <input style={styles.input} value={form.playerMasterId || ''} readOnly />
                    </td>
                    <td style={styles.cell}>
                      <input id="result-name" name="result-name" style={styles.input} value={form.name} readOnly />
                    </td>
                    <td style={styles.cell}>
                      <input id="result-branch" name="result-branch" style={styles.input} value={form.branch} readOnly />
                    </td>
                    <td style={styles.cell}>
                      <input id="result-kpm-no" name="result-kpm-no" style={styles.input} value={form.kpmNo} readOnly />
                    </td>
                    <td style={styles.cell}>
                      <input id="result-event" name="result-event" style={styles.input} value={form.event} onChange={e => setForm({ ...form, event: e.target.value })} required />
                    </td>
                    <td style={styles.cell}>
                      <input id="result-year" name="result-year" type="number" style={styles.input} value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} required />
                    </td>
                    <td style={styles.cell}>
                      <input id="result-diploma" name="result-diploma" style={styles.input} value={form.diplomaYear} readOnly />
                    </td>
                    <td style={styles.cell}>
                      <select id="result-medal" name="result-medal" style={styles.select} value={form.medal} onChange={e => setForm({ ...form, medal: e.target.value })} required>
                        <option value="">Select Medal</option>
                        {MEDALS.map(m => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                    </td>
                    <td style={styles.cell}>
                      <input id="result-image" name="result-image" type="text" style={styles.input} value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
                    </td>
                  </tr>
                </tbody>
              </table>
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button type="submit" style={{ ...styles.btnSaveWithIcon, background: 'linear-gradient(135deg, #28a745, #218838)' }}>
                  <img src="/Save button.png" alt="Save" style={styles.saveIconLeft} />
                  Save
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleBulkSubmit}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.headerRow}>
                    <th style={styles.headerCell}>Name</th>
                    <th style={styles.headerCell}>Branch</th>
                    <th style={styles.headerCell}>KPM No</th>
                    <th style={styles.headerCell}>Event</th>
                    <th style={styles.headerCell}>Year</th>
                    <th style={styles.headerCell}>Diploma Year</th>
                    <th style={styles.headerCell}>Medal</th>
                    <th style={styles.headerCell}>Image URL</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkRows.map((row, idx) => (
                    <tr key={row.playerMasterId} style={styles.bodyRow}>
                      <td style={styles.cell}><input style={styles.input} value={row.name} readOnly /></td>
                      <td style={styles.cell}><input style={styles.input} value={row.branch} readOnly /></td>
                      <td style={styles.cell}><input style={styles.input} value={row.kpmNo} readOnly /></td>
                      <td style={styles.cell}>
                        <input
                          style={styles.input}
                          value={row.event}
                          onChange={e => handleBulkRowChange(idx, 'event', e.target.value)}
                          placeholder="Event"
                        />
                      </td>
                      <td style={styles.cell}><input style={styles.input} value={row.year} readOnly /></td>
                      <td style={styles.cell}><input style={styles.input} value={row.diplomaYear} readOnly /></td>
                      <td style={styles.cell}>
                        <select
                          style={styles.select}
                          value={row.medal}
                          onChange={e => handleBulkRowChange(idx, 'medal', e.target.value)}
                        >
                          <option value="">Select Medal</option>
                          {MEDALS.map(m => (
                            <option key={m}>{m}</option>
                          ))}
                        </select>
                      </td>
                      <td style={styles.cell}>
                        <input
                          style={styles.input}
                          value={row.imageUrl}
                          onChange={e => handleBulkRowChange(idx, 'imageUrl', e.target.value)}
                          placeholder="Image URL"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button type="submit" style={{ ...styles.btnSaveWithIcon, background: 'linear-gradient(135deg, #28a745, #218838)' }}>
                  <img src="/Save button.png" alt="Save" style={styles.saveIconLeft} />
                  Save
                </button>
              </div>
            </form>
          )
        )}

        {/* GROUP EDIT MODE */}
        {isGroupEditing && (
          <form onSubmit={handleGroupSubmit}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.headerRow}>
                  <th style={styles.headerCell}>Team Name</th>
                  <th style={styles.headerCell}>Event</th>
                  <th style={styles.headerCell}>Year</th>
                  <th style={styles.headerCell}>Medal</th>
                  <th style={styles.headerCell}>URL</th>
                </tr>
              </thead>
              <tbody>
                <tr style={styles.bodyRow}>
                  <td style={styles.cell}>
                    <input
                      id="group-team"
                      name="group-team"
                      style={styles.input}
                      value={groupForm.teamName}
                      onChange={e => setGroupForm({ ...groupForm, teamName: e.target.value })}
                    />
                  </td>
                  <td style={styles.cell}>
                    <input
                      id="group-event"
                      name="group-event"
                      style={styles.input}
                      value={groupForm.event}
                      onChange={e => setGroupForm({ ...groupForm, event: e.target.value })}
                    />
                  </td>
                  <td style={styles.cell}>
                    <input
                      id="group-year"
                      name="group-year"
                      type="number"
                      style={styles.input}
                      value={groupForm.year}
                      onChange={e => setGroupForm({ ...groupForm, year: e.target.value })}
                    />
                  </td>
                  <td style={styles.cell}>
                    <select
                      id="group-medal"
                      name="group-medal"
                      style={styles.select}
                      value={groupForm.medal}
                      onChange={e => setGroupForm({ ...groupForm, medal: e.target.value })}
                    >
                      <option value="">Select Medal</option>
                      {MEDALS.map(m => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </td>
                  <td style={styles.cell}>
                    <input
                      id="group-url"
                      name="group-url"
                      style={styles.input}
                      value={groupForm.imageUrl}
                      onChange={e => setGroupForm({ ...groupForm, imageUrl: e.target.value })}
                    />
                  </td>
                </tr>
                <tr style={styles.bodyRow}>
                  <td style={styles.cell} colSpan={5}>
                    <div>
                      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                        <button
                          type="button"
                          onClick={() => {
                            setGroupForm({
                              ...groupForm,
                              manualMembers: [...(groupForm.manualMembers || []), { name: '', branch: '', year: '' }]
                            });
                          }}
                          style={styles.btnSecondary}
                        >
                          <img src="/Add button.png" alt="Add" style={styles.saveIconLeft} />
                          Add Rows
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const rows = [...(groupForm.manualMembers || [])];
                            if (rows.length <= 1) return;
                            rows.pop();
                            setGroupForm({ ...groupForm, manualMembers: rows });
                          }}
                          style={styles.btnSecondary}
                        >
                          <img src="/Delete button.png" alt="Delete" style={styles.saveIconLeft} />
                          Delete Rows
                        </button>
                      </div>
                      <table style={styles.table}>
                        <thead>
                          <tr style={styles.headerRow}>
                            <th style={styles.headerCell}>Name</th>
                            <th style={styles.headerCell}>Branch</th>
                            <th style={styles.headerCell}>Year</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(groupForm.manualMembers || []).map((row, idx) => (
                            <tr key={idx} style={styles.bodyRow}>
                              <td style={styles.cell}>
                                <input
                                  style={styles.input}
                                  value={row.name || ''}
                                  onChange={e => {
                                    const rows = [...groupForm.manualMembers];
                                    rows[idx] = { ...rows[idx], name: e.target.value };
                                    setGroupForm({ ...groupForm, manualMembers: rows });
                                  }}
                                  placeholder="Name"
                                />
                              </td>
                              <td style={styles.cell}>
                                <input
                                  style={styles.input}
                                  value={row.branch || ''}
                                  onChange={e => {
                                    const rows = [...groupForm.manualMembers];
                                    rows[idx] = { ...rows[idx], branch: e.target.value };
                                    setGroupForm({ ...groupForm, manualMembers: rows });
                                  }}
                                  placeholder="Branch"
                                />
                              </td>
                              <td style={styles.cell}>
                                <input
                                  type="number"
                                  style={styles.input}
                                  value={row.year || ''}
                                  onChange={e => {
                                    const rows = [...groupForm.manualMembers];
                                    rows[idx] = { ...rows[idx], year: e.target.value };
                                    setGroupForm({ ...groupForm, manualMembers: rows });
                                  }}
                                  placeholder="1/2/3"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button type="submit" style={{
                ...styles.btnSaveWithIcon,
                background: 'linear-gradient(135deg, #28a745, #218838)'
              }}>
                <img
                  src="/Save button.png"
                  alt="Save"
                  style={styles.saveIconLeft}
                />
                Save Group
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

/* ================= REUSABLE ================= */
const Field = ({ label, htmlFor, children }) => {
  // Ensure children have id and name attributes
  const childWithAttributes = React.isValidElement(children)
    ? React.cloneElement(children, {
        id: children.props.id || htmlFor,
        name: children.props.name || htmlFor
      })
    : children;

  return (
    <tr>
      <td style={styles.fieldLabel}>
        <label htmlFor={htmlFor}>{label}</label>
      </td>
      <td style={styles.fieldValue}>
        {childWithAttributes}
      </td>
    </tr>
  );
};

/* ================= STYLES ================= */
const styles = {
  page: {
    minHeight: '100vh',
    background: '#f6f8fb',
    padding: 20,
    color: '#1f2937'
  },

  title: {
    fontSize: 32,
    fontWeight: 700,
    marginBottom: 20,
    textShadow: 'none',
    letterSpacing: '-0.5px'
  },

  activitySection: {
    marginBottom: 24
  },

  activityTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 4,
    color: '#111827'
  },

  activitySubtitle: {
    marginTop: 0,
    marginBottom: 12,
    color: '#4b5563',
    fontSize: 13
  },

  activityEmpty: {
    padding: '12px 16px',
    background: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    color: '#4b5563',
    fontSize: 14
  },

  yearSelect: {
    padding: '10px 16px',
    borderRadius: 8,
    background: '#fff',
    color: '#1f2937',
    border: '1px solid #e5e7eb',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },

  yearBar: {
    height: 6,
    background: 'linear-gradient(90deg, #1f2937 0%, #374151 100%)',
    borderRadius: 3,
    marginBottom: 16,
    boxShadow: '0 2px 8px rgba(31, 41, 55, 0.24)'
  },

  yearTitle: {
    fontSize: 22,
    fontWeight: 600,
    marginBottom: 16,
    color: '#1f2937',
    textShadow: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },

  topActionBar: {
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap'
  },

  searchInput: {
    padding: '10px 14px',
    width: '320px',
    maxWidth: '92%',
    borderRadius: 8,
    border: '2px solid #000000',
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxShadow: 'none'
  },

  /* ================= TABLE ================= */

  tableContainer: {
    background: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(71, 85, 105, 0.12)',
    marginBottom: 32,
    border: '1px solid #cfd6df'
  },

  table: {
    width: '100%',
    background: '#ffffff',
    color: '#1f2937',
    borderCollapse: 'collapse',
    fontSize: 14,
    lineHeight: 1.5
  },

  headerRow: {
    background: 'linear-gradient(135deg, #eef2f6 0%, #d6dde5 100%)',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    fontWeight: 600,
    fontSize: 12,
    borderBottom: '1px solid #c0c8d2'
  },

  headerCell: {
    padding: '16px 20px',
    textAlign: 'left',
    fontWeight: 600,
    border: 'none',
    position: 'sticky',
    top: 0,
    zIndex: 10
  },

  bodyRow: {
    borderBottom: '1px solid #e5e7eb',
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff'
  },

  bodyRowHover: {
    backgroundColor: '#f5f7fa',
    transform: 'scale(1.001)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },

  cell: {
    padding: '16px 20px',
    verticalAlign: 'middle',
    borderBottom: '1px solid #e5e7eb'
  },

  nameCell: {
    fontWeight: 600,
    color: '#111827',
    fontSize: 15
  },

  eventBadge: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
    color: '#1565c0',
    padding: '6px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    border: '1px solid #90caf9'
  },

  medalBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
    border: '2px solid transparent'
  },

  goldMedal: {
    background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
    color: '#8b6914',
    borderColor: '#ffd700'
  },

  silverMedal: {
    background: 'linear-gradient(135deg, #c0c0c0, #e8e8e8)',
    color: '#595959',
    borderColor: '#c0c0c0'
  },

  bronzeMedal: {
    background: 'linear-gradient(135deg, #cd7f32, #daa520)',
    color: '#5d4037',
    borderColor: '#cd7f32'
  },

  imageLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#667eea',
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 600,
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #667eea',
    transition: 'all 0.2s ease'
  },

  noImage: {
    color: '#9e9e9e',
    fontSize: 13,
    fontStyle: 'italic'
  },

  /* ================= FORM ================= */

  fieldLabel: {
    padding: '16px 20px',
    fontWeight: 600,
    width: '30%',
    background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
    borderBottom: '1px solid #dee2e6',
    color: '#495057',
    fontSize: 14
  },

  fieldValue: {
    padding: '16px 20px',
    borderBottom: '1px solid #dee2e6',
    backgroundColor: '#ffffff'
  },

  input: {
    width: '100%',
    padding: '10px 14px',
    border: '2px solid #e9ecef',
    borderRadius: 8,
    fontSize: 14,
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff'
  },

  select: {
    width: '100%',
    padding: '10px 14px',
    border: '2px solid #e9ecef',
    borderRadius: 8,
    fontSize: 14,
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },

  /* ================= BUTTONS ================= */

  buttonGroup: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },

  btnPrimary: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  btnSecondary: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #6c757d, #495057)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(108, 117, 125, 0.3)'
  },

  topBtnPrimary: {
    padding: '11px 22px',
    background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
    color: '#ffffff',
    border: '1px solid #1e40af',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 5px 14px rgba(37, 99, 235, 0.28)',
    letterSpacing: '0.2px'
  },

  topBtnSecondary: {
    padding: '11px 22px',
    background: 'linear-gradient(135deg, #f9fafb, #e5e7eb)',
    color: '#1f2937',
    border: '1px solid #d1d5db',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 5px 14px rgba(15, 23, 42, 0.12)',
    letterSpacing: '0.2px'
  },

  btnEdit: {
    padding: '8px 14px',
    background: 'linear-gradient(135deg, #ffc107, #ffb300)',
    color: '#212529',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(255, 193, 7, 0.3)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },

  btnDelete: {
    padding: '8px 14px',
    background: 'linear-gradient(135deg, #dc3545, #c82333)',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },

  btnSave: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #28a745, #218838)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(40, 167, 69, 0.3)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  btnSaveWithIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 28px',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(40, 167, 69, 0.3)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  saveIconLeft: {
    width: '22px',
    height: '22px',
    objectFit: 'contain'
  },

  leftIconGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '10px'
  },

  iconButton: {
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },

};

export default ManageResults;


