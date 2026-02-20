import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CreatorLayout from "../../components/CreatorLayout";
import Players from '../../components/Creator/Players';
import Attendance from '../../components/Creator/Attendance';
import PerformanceAnalysis from '../../components/Creator/PerformanceAnalysis';
import PlayerIntelligence from '../../components/Creator/PlayerIntelligence';
import CreatorDashboardUI from '../../components/Creator/CreatorDashboard';

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
        return <CreatorDashboardUI onNavigate={handleTabChange} />;
    }
  };

  return (
    <CreatorLayout>
      <div className="min-h-screen bg-[#e5e7eb]">
        {/* Refined Professional Navbar */}
        <div className="bg-white border-b border-gray-300">
          <div className="max-w-7xl mx-auto px-8">

            {/* Top Row */}
            <div className="flex items-center justify-between py-8">
              <div className="flex items-center gap-6">
                {/* Logo */}
                <div className="w-14 h-14 bg-gray-900 text-white flex items-center justify-center font-semibold rounded-lg text-lg">
                  KPT
                </div>

                {/* Title */}
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900 leading-tight">
                    Dashboard
                  </h1>
                  <p className="text-base text-gray-500 mt-1">
                    Manage players, schedules, and performance
                  </p>
                </div>
              </div>

              {/* User */}
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-base font-medium text-gray-900">
                    Creator
                  </div>
                  <div className="text-sm text-gray-500">
                    Administrator
                  </div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-semibold text-base">
                  C
                </div>
              </div>
            </div>

            {/* Tabs */}
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
                    activeTab === tab.key
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab.label}

                  {/* Underline */}
                  {activeTab === tab.key && (
                    <span className="absolute left-0 -bottom-[2px] w-full h-[3px] bg-gray-900 rounded-full"></span>
                  )}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="bg-white border border-gray-200">
            <div className="p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </CreatorLayout>
  );
};

export default CreatorDashboard;
