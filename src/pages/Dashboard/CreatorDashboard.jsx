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
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Creator Dashboard</h1>
          <p className="text-gray-600">Manage your content and team efficiently</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white p-4 rounded-lg shadow-sm border">
          {[
            { key: 'overview', label: '📊 Overview' },
            { key: 'players', label: '👥 Players' },
            { key: 'training', label: '📅 Training' },
            { key: 'performance', label: '📈 Performance' },
            { key: 'attendance', label: '✅ Attendance' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {renderContent()}
        </div>
      </div>
    </CreatorLayout>
  );
};

export default CreatorDashboard;
