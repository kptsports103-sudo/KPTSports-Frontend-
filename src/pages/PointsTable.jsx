import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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

const resolveWinnerKind = (winner) => {
  const linkedType = String(winner?.linkedResultType || '').trim().toLowerCase();
  if (linkedType === 'team') return 'team';
  if (linkedType === 'individual') return 'individual';
  if (String(winner?.teamName || '').trim()) return 'team';
  return 'individual';
};

const resolveWinnerLabel = (winner, kind) => {
  const branch = String(winner?.branch || '').trim();
  const teamName = String(winner?.teamName || '').trim();

  if (branch) return branch;
  if (teamName) return teamName;

  return kind === 'team' ? 'Unassigned Team' : 'Unknown Branch';
};

const buildSummary = ({ winners, events, selectedYear }) => {
  const eventLookup = buildEventLookup(events);

  const overallMap = new Map();
  const indoorMap = new Map();
  const outdoorMap = new Map();
  const unassignedMap = new Map();

  const includeYear = (value) =>
    !selectedYear || selectedYear === 'all' || String(value || '') === String(selectedYear);

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

  (winners || []).forEach((winner) => {
    if (!includeYear(winner?.year)) return;

    const medal = String(winner?.medal || '').trim();
    const kind = resolveWinnerKind(winner);
    const points = kind === 'team' ? (TEAM_POINTS[medal] || 0) : (INDIVIDUAL_POINTS[medal] || 0);
    if (!points) return;

    const label = resolveWinnerLabel(winner, kind);
    const category = resolveCategory(winner?.eventName, eventLookup);

    addToBuckets(category, label, kind, medal, points);
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
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedYear = String(searchParams.get('year') || '').trim();
  const currentYear = String(new Date().getFullYear());
  const [winners, setWinners] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(requestedYear || currentYear);

  useEffect(() => {
    const fetchPointsData = async () => {
      setLoading(true);

      const [winnersResponse, eventsResponse] = await Promise.allSettled([
        api.get('/winners'),
        api.get('/events'),
      ]);

      if (winnersResponse.status === 'fulfilled') {
        setWinners(Array.isArray(winnersResponse.value?.data) ? winnersResponse.value.data : []);
      } else {
        console.error('Failed to fetch points table winners:', winnersResponse.reason);
        setWinners([]);
      }

      if (eventsResponse.status === 'fulfilled') {
        setEvents(Array.isArray(eventsResponse.value?.data) ? eventsResponse.value.data : []);
      } else {
        console.error('Failed to fetch events for points table:', eventsResponse.reason);
        setEvents([]);
      }

      setLoading(false);
    };

    fetchPointsData();
  }, []);

  const availableYears = useMemo(() => {
    return Array.from(
      new Set(
        winners
          .map((item) => Number(item?.year))
          .filter(Boolean)
      )
    ).sort((left, right) => right - left);
  }, [winners]);

  const resolvedSelectedYear = useMemo(() => {
    if (availableYears.length === 0) return '';

    if (availableYears.some((year) => String(year) === String(selectedYear))) {
      return String(selectedYear);
    }

    if (requestedYear && availableYears.some((year) => String(year) === String(requestedYear))) {
      return requestedYear;
    }

    if (availableYears.includes(Number(currentYear))) {
      return currentYear;
    }

    return String(availableYears[0]);
  }, [availableYears, currentYear, requestedYear, selectedYear]);

  useEffect(() => {
    if (resolvedSelectedYear !== String(selectedYear || '')) {
      setSelectedYear(resolvedSelectedYear);
    }
  }, [resolvedSelectedYear, selectedYear]);

  useEffect(() => {
    if (requestedYear && requestedYear !== String(selectedYear || '')) {
      setSelectedYear(requestedYear);
    }
  }, [requestedYear, selectedYear]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (resolvedSelectedYear) {
      next.set('year', resolvedSelectedYear);
    } else {
      next.delete('year');
    }
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [resolvedSelectedYear, searchParams, setSearchParams]);

  const summary = useMemo(
    () => buildSummary({ winners, events, selectedYear: resolvedSelectedYear }),
    [events, resolvedSelectedYear, winners]
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
          Winner Based Scoring
        </p>
        <h1 style={{ margin: '0.55rem 0 0', fontSize: '2.5rem' }}>Points Table</h1>
        <p style={{ margin: '0.8rem 0 0', color: palette.muted, maxWidth: '820px', lineHeight: 1.7 }}>
          This page calculates points directly from published winner cards. Individual winners use 5, 3, 1 points and
          team winners use 10, 7, 4 points. Indoor and Outdoor sections use Annual Sports Celebration event mapping
          when the winner event matches a configured event name.
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
          <div style={styles.summarySub}>{summary.leader ? `${summary.leader.totalPoints} points` : 'Points will appear after winners are added.'}</div>
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
          marginTop: '1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}
      >
        {summary.overallRows.slice(0, 3).map((row, index) => (
          <div key={`${row.label}-top-${index}`} style={styles.topStandingsCard}>
            <div style={styles.topStandingsRank}>#{index + 1}</div>
            <div style={styles.topStandingsLabel}>{row.label}</div>
            <div style={styles.topStandingsPoints}>{row.totalPoints} pts</div>
            <div style={styles.topStandingsMeta}>
              Individual {row.individualPoints} | Team {row.teamPoints}
            </div>
          </div>
        ))}
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

        <div style={styles.yearControl}>
          <label htmlFor="points-table-year" style={styles.yearLabel}>
            Select Year:
          </label>
          <select
            id="points-table-year"
            name="points-table-year"
            value={resolvedSelectedYear}
            onChange={(event) => setSelectedYear(event.target.value)}
            disabled={loading || availableYears.length === 0}
            style={styles.yearSelect}
          >
            {loading || availableYears.length === 0 ? (
              <option value="" style={styles.yearOption}>
                {loading ? 'Loading years...' : 'No years available'}
              </option>
            ) : null}
            {availableYears.map((year) => (
              <option key={year} value={String(year)} style={styles.yearOption}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {!loading && winners.length === 0 ? (
          <div style={styles.syncNotice}>
            Points Table is empty because no winner cards have been added yet. Add winners in Admin - Manage Winners
            and they will create points automatically.
          </div>
        ) : null}
      </section>

      {loading ? (
        <div style={{ ...styles.emptyState, marginTop: '1.75rem' }}>
          Loading points table...
        </div>
      ) : (
        <>
          <PointsSection
            title="Overall Points Table"
            subtitle="Combined winner-card points for the selected year."
            rows={summary.overallRows}
          />
          <PointsSection
            title="Indoor Events"
            subtitle="Winner-card points collected from events mapped as Indoor."
            rows={summary.indoorRows}
          />
          <PointsSection
            title="Outdoor Events"
            subtitle="Winner-card points collected from events mapped as Outdoor."
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
  topStandingsCard: {
    padding: '1rem 1.1rem',
    borderRadius: '18px',
    background: palette.surface,
    border: `1px solid ${palette.border}`,
    boxShadow: palette.shadow
  },
  topStandingsRank: {
    fontSize: '0.82rem',
    fontWeight: 800,
    color: palette.accent,
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  topStandingsLabel: {
    marginTop: '0.45rem',
    fontSize: '1.15rem',
    fontWeight: 800,
    color: palette.text
  },
  topStandingsPoints: {
    marginTop: '0.4rem',
    fontSize: '1.45rem',
    fontWeight: 800,
    color: palette.text
  },
  topStandingsMeta: {
    marginTop: '0.3rem',
    fontSize: '0.9rem',
    color: palette.muted
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
  yearControl: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.75rem'
  },
  yearLabel: {
    fontWeight: 700,
    color: palette.text
  },
  yearSelect: {
    padding: '12px 44px 12px 14px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    minWidth: '180px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: 1.2,
    outline: 'none',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    colorScheme: 'light',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27none%27 stroke=%27%230f172a%27 stroke-width=%271.8%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27M5 7.5 10 12.5 15 7.5%27/%3E%3C/svg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    backgroundSize: '16px'
  },
  yearOption: {
    backgroundColor: '#ffffff',
    color: '#0f172a'
  },
  syncNotice: {
    marginTop: '0.9rem',
    padding: '0.95rem 1rem',
    borderRadius: '14px',
    background: '#fff7ed',
    border: '1px solid #fdba74',
    color: '#9a3412',
    fontSize: '0.95rem',
    lineHeight: 1.5
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
