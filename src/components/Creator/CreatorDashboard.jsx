import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CreatorLayout from './CreatorLayout';
import Players from './Players';
import Attendance from './Attendance';
import PerformanceAnalysis from './PerformanceAnalysis';
import PlayerIntelligence from './PlayerIntelligence';
import api from '../../services/api';

const CreatorOverview = ({ onNavigate }) => {
  const [poolStatus, setPoolStatus] = useState(null);
  const [poolError, setPoolError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchPoolStatus = async () => {
      try {
        setPoolError('');
        const res = await api.get('/home/pool-status');
        if (!cancelled) {
          setPoolStatus(res.data || null);
        }
      } catch {
        if (!cancelled) {
          setPoolError('Unable to load pool status');
        }
      }
    };

    fetchPoolStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      id: 1,
      title: 'Players Management',
      description: 'Manage and organize players by year, add new players, and maintain player records',
      icon: 'P',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      tab: 'players',
    },
    {
      id: 2,
      title: 'Attendance Tracking',
      description: 'Track daily attendance, monitor presence, and generate attendance reports',
      icon: 'A',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
      tab: 'attendance',
    },
    {
      id: 3,
      title: 'Performance Analytics',
      description: 'Analyze player performance, view statistics, and track progress over time',
      icon: 'R',
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      tab: 'performance',
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>Dashboard</h1>
        <p style={styles.pageSubtitle}>Manage your sports academy efficiently</p>
      </div>
      <div style={styles.kpmCard}>
        <div style={styles.kpmHeader}>KPM Pool Status</div>
        <div style={styles.kpmGrid}>
          <div style={styles.kpmItem}>
            <span style={styles.kpmLabel}>Total</span>
            <span style={styles.kpmValue}>{poolStatus?.total ?? '--'}</span>
          </div>
          <div style={styles.kpmItem}>
            <span style={styles.kpmLabel}>Used</span>
            <span style={styles.kpmValue}>{poolStatus?.allocated ?? '--'}</span>
          </div>
          <div style={styles.kpmItem}>
            <span style={styles.kpmLabel}>Free</span>
            <span style={styles.kpmValue}>{poolStatus?.available ?? '--'}</span>
          </div>
          <div style={styles.kpmItem}>
            <span style={styles.kpmLabel}>Usage</span>
            <span style={styles.kpmValue}>{poolStatus?.usagePercent ?? '--'}%</span>
          </div>
        </div>
        {poolError && <div style={styles.kpmError}>{poolError}</div>}
      </div>
      <div style={styles.cardsContainer}>
        {cards.map((card) => (
          <div key={card.id} style={styles.card}>
            <div style={{ ...styles.cardHeader, background: card.gradient }}>
              <div style={styles.iconContainer}>
                <span style={styles.icon}>{card.icon}</span>
              </div>
            </div>
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>{card.title}</h3>
              <p style={styles.cardDescription}>{card.description}</p>
              <button
                style={{ ...styles.viewButton, backgroundColor: card.color }}
                onClick={() => onNavigate(card.tab)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CreatorDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'players':
        return <Players />;
      case 'attendance':
        return <Attendance />;
      case 'performance':
        return <PerformanceAnalysis />;
      case 'player-intelligence':
        return <PlayerIntelligence />;
      default:
        return <CreatorOverview onNavigate={handleTabChange} />;
    }
  };

  return (
    <CreatorLayout>
      <div className="min-h-screen bg-[#e5e7eb]">
        <div className="bg-white border-b border-gray-300">
          <div className="creator-content-stretch px-8">
            <div className="flex items-center justify-between py-8">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-gray-900 text-white flex items-center justify-center font-semibold rounded-lg text-lg">
                  KPT
                </div>
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900 leading-tight">CreatorDashboard</h1>
                  <p className="text-base text-gray-500 mt-1">Manage players, schedules, and performance</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-base font-medium text-gray-900">Creator</div>
                  <div className="text-sm text-gray-500">Administrator</div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-semibold text-base">
                  C
                </div>
              </div>
            </div>

            <div className="flex gap-10 pb-4">
              {[
                { key: 'players', label: 'Players' },
                { key: 'player-intelligence', label: 'Player Intelligence' },
                { key: 'attendance', label: 'Attendance' },
                { key: 'performance', label: 'Performance Analysis' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`relative text-lg font-medium pb-3 transition-colors ${
                    activeTab === tab.key ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <span className="absolute left-0 -bottom-[2px] w-full h-[3px] bg-gray-900 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="creator-content-stretch px-8 py-10">
          <div className="bg-white border border-gray-200">
            <div className="p-8">{renderContent()}</div>
          </div>
        </div>
      </div>
    </CreatorLayout>
  );
};

export default CreatorDashboard;

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
    boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: '8px',
  },
  pageSubtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0,
  },
  kpmCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '24px',
  },
  kpmHeader: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '12px',
  },
  kpmGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '10px',
  },
  kpmItem: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  kpmLabel: {
    fontSize: '12px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  kpmValue: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#111827',
  },
  kpmError: {
    marginTop: '10px',
    color: '#b91c1c',
    fontSize: '12px',
  },
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    width: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
  },
  cardHeader: {
    height: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: '80px',
    height: '80px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  icon: {
    fontSize: '36px',
  },
  cardContent: {
    padding: '24px',
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: '12px',
    margin: '0 0 12px 0',
  },
  cardDescription: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.5',
    marginBottom: '20px',
    margin: '0 0 20px 0',
  },
  viewButton: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    width: '100%',
  },
};

