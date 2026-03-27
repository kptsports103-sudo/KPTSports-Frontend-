import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const INDIVIDUAL_POINTS = {
  Gold: 5,
  Silver: 3,
  Bronze: 1,
};

const TEAM_POINTS = {
  Gold: 10,
  Silver: 7,
  Bronze: 4,
};

const palette = {
  bg: 'var(--app-bg)',
  surface: 'var(--app-surface)',
  surfaceAlt: 'var(--app-surface-alt)',
  surfaceMuted: 'var(--app-surface-muted)',
  text: 'var(--app-text)',
  muted: 'var(--app-text-muted)',
  border: 'var(--app-border)',
  shadow: 'var(--app-shadow)',
  accent: 'var(--page-accent)'
};

const normalizeKey = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

const buildEventLookup = (events) => {
  const lookup = new Map();

  (events || []).forEach((event) => {
    const payload = {
      category: String(event?.category || '').trim(),
      eventType: String(event?.eventType || '').trim(),
    };

    [event?.eventName, event?.event_title]
      .map(normalizeKey)
      .filter(Boolean)
      .forEach((key) => {
        if (!lookup.has(key)) {
          lookup.set(key, payload);
        }
      });
  });

  return lookup;
};

const buildPlayerLookup = (groupedPlayers) => {
  const lookup = new Map();

  Object.values(groupedPlayers || {}).forEach((players) => {
    (players || []).forEach((player) => {
      const branch = String(player?.branch || '').trim();
      if (!branch) return;

      const masterId = String(player?.masterId || '').trim();
      const playerId = String(player?.id || '').trim();

      if (masterId && !lookup.has(`master:${masterId}`)) {
        lookup.set(`master:${masterId}`, branch);
      }

      if (playerId && !lookup.has(`player:${playerId}`)) {
        lookup.set(`player:${playerId}`, branch);
      }
    });
  });

  return lookup;
};

const createRow = (label) => ({
  label,
  individualPoints: 0,
  teamPoints: 0,
  totalPoints: 0,
  goldCount: 0,
  silverCount: 0,
  bronzeCount: 0,
});

const addPointsToMap = (targetMap, label, kind, medal, points) => {
  const safeLabel = String(label || '').trim();
  if (!safeLabel || !points) return;

  const row = targetMap.get(safeLabel) || createRow(safeLabel);

  if (kind === 'team') {
    row.teamPoints += points;
  } else {
    row.individualPoints += points;
  }

  row.totalPoints += points;

  if (medal === 'Gold') row.goldCount += 1;
  if (medal === 'Silver') row.silverCount += 1;
  if (medal === 'Bronze') row.bronzeCount += 1;

  targetMap.set(safeLabel, row);
};

const sortRows = (targetMap) =>
  Array.from(targetMap.values()).sort(
    (left, right) =>
      right.totalPoints - left.totalPoints ||
      right.teamPoints - left.teamPoints ||
      right.individualPoints - left.individualPoints ||
      left.label.localeCompare(right.label, 'en', { sensitivity: 'base' })
  );

const resolveCategory = (eventName, eventLookup) => {
  const match = eventLookup.get(normalizeKey(eventName));
  if (match?.category === 'Indoor' || match?.category === 'Outdoor') {
    return match.category;
  }
  return 'Unassigned';
};

const resolveIndividualBranch = (result, playerLookup) => {
  const explicitBranch = String(result?.branch || '').trim();
  if (explicitBranch) return explicitBranch;

  const masterId = String(result?.playerMasterId || '').trim();
  const playerId = String(result?.playerId || '').trim();

  return (
    playerLookup.get(`master:${masterId}`) ||
    playerLookup.get(`player:${playerId}`) ||
    'Unknown Branch'
  );
};

const resolveTeamBranch = (groupResult, playerLookup) => {
  const memberBranches = Array.from(
    new Set(
      (Array.isArray(groupResult?.members) ? groupResult.members : [])
        .map((member) => {
          const masterId = String(member?.playerMasterId || '').trim();
          const playerId = String(member?.playerId || '').trim();

          return (
            playerLookup.get(`master:${masterId}`) ||
            playerLookup.get(`player:${playerId}`) ||
            ''
          );
        })
        .filter(Boolean)
    )
  );

  if (memberBranches.length === 1) return memberBranches[0];
  if (memberBranches.length > 1) return String(groupResult?.teamName || '').trim() || 'Mixed Team';
  return String(groupResult?.teamName || '').trim() || 'Unassigned Team';
};

const buildSummary = ({ results, groupResults, events, players, selectedYear }) => {
  const eventLookup = buildEventLookup(events);
  const playerLookup = buildPlayerLookup(players);

  const overallMap = new Map();
  const indoorMap = new Map();
  const outdoorMap = new Map();
  const unassignedMap = new Map();

  const includeYear = (value) =>
    selectedYear === 'all' || String(value || '') === String(selectedYear);

  const addToBuckets = (category, label, kind, medal, points) => {
    addPointsToMap(overallMap, label, kind, medal, points);

    if (category === 'Indoor') {
      addPointsToMap(indoorMap, label, kind, medal, points);
      return;
    }

    if (category === 'Outdoor') {
      addPointsToMap(outdoorMap, label, kind, medal, points);
      return;
    }

    addPointsToMap(unassignedMap, label, kind, medal, points);
  };

  (results || []).forEach((result) => {
    if (!includeYear(result?.year)) return;

    const medal = String(result?.medal || '').trim();
    const points = INDIVIDUAL_POINTS[medal] || 0;
    if (!points) return;

    const label = resolveIndividualBranch(result, playerLookup);
    const category = resolveCategory(result?.event, eventLookup);

    addToBuckets(category, label, 'individual', medal, points);
  });

  (groupResults || []).forEach((groupResult) => {
    if (!includeYear(groupResult?.year)) return;

    const medal = String(groupResult?.medal || '').trim();
    const points = TEAM_POINTS[medal] || 0;
    if (!points) return;

    const label = resolveTeamBranch(groupResult, playerLookup);
    const category = resolveCategory(groupResult?.event, eventLookup);

    addToBuckets(category, label, 'team', medal, points);
  });

  const overallRows = sortRows(overallMap);
  const indoorRows = sortRows(indoorMap);
  const outdoorRows = sortRows(outdoorMap);
  const unassignedRows = sortRows(unassignedMap);

  return {
    overallRows,
    indoorRows,
    outdoorRows,
    unassignedRows,
    leader: overallRows[0] || null,
    totalIndividualPoints: overallRows.reduce((sum, row) => sum + row.individualPoints, 0),
    totalTeamPoints: overallRows.reduce((sum, row) => sum + row.teamPoints, 0),
  };
};

const PointsSection = ({ title, subtitle, rows }) => (
  <section
    style={{
      marginTop: '1.75rem',
      borderRadius: '18px',
      border: `1px solid ${palette.border}`,
      background: palette.surface,
      boxShadow: palette.shadow,
      overflow: 'hidden'
    }}
  >
    <div style={{ padding: '1.1rem 1.2rem', borderBottom: `1px solid ${palette.border}`, background: palette.surfaceAlt }}>
      <h2 style={{ margin: 0, color: palette.text }}>{title}</h2>
      <p style={{ margin: '0.45rem 0 0', color: palette.muted }}>{subtitle}</p>
    </div>

    {rows.length === 0 ? (
      <div style={{ padding: '1.4rem 1.2rem', color: palette.muted }}>
        No points available for this section yet.
      </div>
    ) : (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
          <thead>
            <tr style={{ background: palette.surfaceMuted }}>
              <th style={styles.tableHead}>Rank</th>
              <th style={styles.tableHead}>Branch / Team</th>
              <th style={styles.tableHead}>Individual Points</th>
              <th style={styles.tableHead}>Team Points</th>
              <th style={styles.tableHead}>Total Points</th>
              <th style={styles.tableHead}>Gold</th>
              <th style={styles.tableHead}>Silver</th>
              <th style={styles.tableHead}>Bronze</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.label}-${index}`} style={index % 2 === 0 ? styles.row : styles.rowAlt}>
                <td style={styles.tableCell}>{index + 1}</td>
                <td style={{ ...styles.tableCell, fontWeight: 700 }}>{row.label}</td>
                <td style={styles.tableCell}>{row.individualPoints}</td>
                <td style={styles.tableCell}>{row.teamPoints}</td>
                <td style={{ ...styles.tableCell, color: palette.accent, fontWeight: 800 }}>{row.totalPoints}</td>
                <td style={styles.tableCell}>{row.goldCount}</td>
                <td style={styles.tableCell}>{row.silverCount}</td>
                <td style={styles.tableCell}>{row.bronzeCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

export default function PointsTable() {
  const currentYear = String(new Date().getFullYear());
  const [results, setResults] = useState([]);
  const [groupResults, setGroupResults] = useState([]);
  const [events, setEvents] = useState([]);
  const [players, setPlayers] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    const fetchPointsData = async () => {
      setLoading(true);

      const [resultsResponse, groupResultsResponse, eventsResponse, playersResponse] = await Promise.allSettled([
        api.get('/results'),
        api.get('/group-results'),
        api.get('/events'),
        api.get('/home/players'),
      ]);

      if (resultsResponse.status === 'fulfilled') {
        setResults(Array.isArray(resultsResponse.value?.data) ? resultsResponse.value.data : []);
      } else {
        console.error('Failed to fetch points table results:', resultsResponse.reason);
        setResults([]);
      }

      if (groupResultsResponse.status === 'fulfilled') {
        setGroupResults(Array.isArray(groupResultsResponse.value?.data) ? groupResultsResponse.value.data : []);
      } else {
        console.error('Failed to fetch points table team results:', groupResultsResponse.reason);
        setGroupResults([]);
      }

      if (eventsResponse.status === 'fulfilled') {
        setEvents(Array.isArray(eventsResponse.value?.data) ? eventsResponse.value.data : []);
      } else {
        console.error('Failed to fetch events for points table:', eventsResponse.reason);
        setEvents([]);
      }

      if (playersResponse.status === 'fulfilled') {
        setPlayers(playersResponse.value?.data || {});
      } else {
        console.error('Failed to fetch players for branch lookup:', playersResponse.reason);
        setPlayers({});
      }

      setLoading(false);
    };

    fetchPointsData();
  }, []);

  const availableYears = useMemo(() => {
    return Array.from(
      new Set(
        [...results, ...groupResults]
          .map((item) => Number(item?.year))
          .filter(Boolean)
      )
    ).sort((left, right) => right - left);
  }, [results, groupResults]);

  useEffect(() => {
    if (availableYears.length === 0) {
      if (selectedYear !== currentYear) {
        setSelectedYear(currentYear);
      }
      return;
    }

    const preferredYear = availableYears.includes(Number(currentYear))
      ? currentYear
      : String(availableYears[0]);

    if (!availableYears.includes(Number(selectedYear)) || selectedYear === currentYear) {
      setSelectedYear(preferredYear);
    }
  }, [availableYears, currentYear, selectedYear]);

  const summary = useMemo(
    () => buildSummary({ results, groupResults, events, players, selectedYear }),
    [events, groupResults, players, results, selectedYear]
  );

  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '1220px',
        margin: '0 auto',
        minHeight: '100vh',
        color: palette.text,
        background: palette.bg
      }}
    >
      <header
        style={{
          padding: '1.8rem',
          borderRadius: '22px',
          border: `1px solid ${palette.border}`,
          background: `linear-gradient(135deg, ${palette.surfaceAlt} 0%, ${palette.surface} 100%)`,
          boxShadow: palette.shadow
        }}
      >
        <p style={{ margin: 0, color: palette.accent, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Annual Sports Celebration
        </p>
        <h1 style={{ margin: '0.55rem 0 0', fontSize: '2.5rem' }}>Points Table</h1>
        <p style={{ margin: '0.8rem 0 0', color: palette.muted, maxWidth: '820px', lineHeight: 1.7 }}>
          Clear points information is shown here for Indoor Events and Outdoor Events. Individual games use 5, 3, 1 points and team games use 10, 7, 4 points.
        </p>
      </header>

      <section
        style={{
          marginTop: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}
      >
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Leading Branch / Team</div>
          <div style={styles.summaryValue}>{summary.leader?.label || 'No data'}</div>
          <div style={styles.summarySub}>{summary.leader ? `${summary.leader.totalPoints} points` : 'Points will appear after results are added.'}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Individual Points</div>
          <div style={styles.summaryValue}>{summary.totalIndividualPoints}</div>
          <div style={styles.summarySub}>Gold 5, Silver 3, Bronze 1</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Team Points</div>
          <div style={styles.summaryValue}>{summary.totalTeamPoints}</div>
          <div style={styles.summarySub}>Gold 10, Silver 7, Bronze 4</div>
        </div>
      </section>

      <section
        style={{
          marginTop: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.9rem' }}>
          <div style={styles.ruleCard}>
            <div style={styles.ruleTitle}>Single Games</div>
            <div style={styles.ruleText}>Gold 5 | Silver 3 | Bronze 1</div>
          </div>
          <div style={styles.ruleCard}>
            <div style={styles.ruleTitle}>Team Games</div>
            <div style={styles.ruleText}>Gold 10 | Silver 7 | Bronze 4</div>
          </div>
        </div>

        <div>
          <label htmlFor="points-table-year" style={{ marginRight: 10, fontWeight: 700, color: palette.text }}>
            Select Year:
          </label>
          <select
            id="points-table-year"
            name="points-table-year"
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value)}
            style={styles.yearSelect}
          >
            {availableYears.map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </section>

      {loading ? (
        <div style={{ ...styles.emptyState, marginTop: '1.75rem' }}>
          Loading points table...
        </div>
      ) : (
        <>
          <PointsSection
            title="Overall Points Table"
            subtitle="Combined view of individual and team points for the selected year."
            rows={summary.overallRows}
          />
          <PointsSection
            title="Indoor Events"
            subtitle="Points collected from Indoor events only."
            rows={summary.indoorRows}
          />
          <PointsSection
            title="Outdoor Events"
            subtitle="Points collected from Outdoor events only."
            rows={summary.outdoorRows}
          />
          {summary.unassignedRows.length > 0 ? (
            <PointsSection
              title="Unassigned Events"
              subtitle="These events do not currently have Indoor or Outdoor category mapping."
              rows={summary.unassignedRows}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

const styles = {
  summaryCard: {
    padding: '1.1rem 1.2rem',
    borderRadius: '18px',
    background: palette.surface,
    border: `1px solid ${palette.border}`,
    boxShadow: palette.shadow
  },
  summaryLabel: {
    fontSize: '0.9rem',
    color: palette.muted
  },
  summaryValue: {
    marginTop: '0.45rem',
    fontSize: '1.7rem',
    fontWeight: 800,
    color: palette.text
  },
  summarySub: {
    marginTop: '0.35rem',
    fontSize: '0.92rem',
    color: palette.accent
  },
  ruleCard: {
    padding: '0.9rem 1rem',
    borderRadius: '16px',
    background: palette.surface,
    border: `1px solid ${palette.border}`,
    boxShadow: palette.shadow
  },
  ruleTitle: {
    fontWeight: 800,
    color: palette.text
  },
  ruleText: {
    marginTop: '0.3rem',
    color: palette.muted
  },
  yearSelect: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: `1px solid ${palette.border}`,
    background: palette.surface,
    color: palette.text,
    minWidth: '150px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '2.8rem',
    backgroundColor: palette.surfaceAlt,
    border: `1px solid ${palette.border}`,
    borderRadius: '16px',
    color: palette.muted
  },
  tableHead: {
    padding: '12px',
    textAlign: 'left',
    color: palette.text,
    borderBottom: `1px solid ${palette.border}`,
    fontSize: '0.82rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  tableCell: {
    padding: '12px',
    borderBottom: `1px solid ${palette.border}`,
    color: palette.text
  },
  row: {
    background: palette.surface
  },
  rowAlt: {
    background: palette.surfaceAlt
  }
};
