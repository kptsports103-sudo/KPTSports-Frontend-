import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CreatorLayout from "../../components/CreatorLayout";
import Players from '../../components/Creator/Players';
import TrainingSchedule from '../../components/Creator/TrainingSchedule';
import Performance from '../../components/Creator/Performance';
import Attendance from '../../components/Creator/Attendance';

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
      case 'training':
        return <TrainingSchedule />;
      case 'performance':
        return <Performance />;
      case 'attendance':
        return <Attendance />;
      default:
        return (
          <div className="space-y-8">
            <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
              <h1 className="text-5xl font-bold mb-4">🏆 Creator Dashboard</h1>
              <p className="text-xl opacity-90">Welcome back, Creator! Manage your team efficiently with our comprehensive tools.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition duration-300 cursor-pointer group">
                <div className="text-5xl mb-4 group-hover:animate-bounce">👥</div>
                <h3 className="text-2xl font-bold text-white mb-2">Players</h3>
                <p className="text-blue-100 mb-4">Manage player information and profiles</p>
                <button onClick={() => handleTabChange('players')} className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition duration-200 font-semibold shadow-lg">
                  View Players →
                </button>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition duration-300 cursor-pointer group">
                <div className="text-5xl mb-4 group-hover:animate-bounce">📅</div>
                <h3 className="text-2xl font-bold text-white mb-2">Training Schedule</h3>
                <p className="text-green-100 mb-4">Plan and organize training sessions</p>
                <button onClick={() => handleTabChange('training')} className="bg-white text-green-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition duration-200 font-semibold shadow-lg">
                  View Schedule →
                </button>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition duration-300 cursor-pointer group">
                <div className="text-5xl mb-4 group-hover:animate-bounce">📊</div>
                <h3 className="text-2xl font-bold text-white mb-2">Performance Reports</h3>
                <p className="text-purple-100 mb-4">Track and analyze player performance</p>
                <button onClick={() => handleTabChange('performance')} className="bg-white text-purple-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition duration-200 font-semibold shadow-lg">
                  View Reports →
                </button>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition duration-300 cursor-pointer group">
                <div className="text-5xl mb-4 group-hover:animate-bounce">✅</div>
                <h3 className="text-2xl font-bold text-white mb-2">Attendance</h3>
                <p className="text-orange-100 mb-4">Monitor and track player attendance</p>
                <button onClick={() => handleTabChange('attendance')} className="bg-white text-orange-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition duration-200 font-semibold shadow-lg">
                  View Attendance →
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <CreatorLayout>
      <div className="min-h-screen bg-gray-50">
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
                    Creator Dashboard
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
                { key: 'overview', label: 'Overview' },
                { key: 'players', label: 'Players' },
                { key: 'training', label: 'Training' },
                { key: 'performance', label: 'Performance' },
                { key: 'attendance', label: 'Attendance' },
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
        <div className="max-w-7xl mx-auto px-6 py-8">
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
