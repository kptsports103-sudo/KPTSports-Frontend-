import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Players from '../../components/Creator/Players';
import Attendance from '../../components/Creator/Attendance';

const CoachDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('players');

  const isCreator = user?.role === 'creator';
  const dashboardTitle = isCreator ? 'Creator Dashboard' : 'Coach Dashboard';
  const welcomeMessage = isCreator ? 'Welcome back, Creator! Manage your team efficiently with our comprehensive tools.' : 'Welcome back, Coach! Manage your team efficiently with our comprehensive tools.';
  const roleLabel = isCreator ? 'Creator' : 'Coach';

  const renderContent = () => {
    switch (activeTab) {
      case 'players':
        return <Players />;
      case 'attendance':
        return <Attendance />;
      default:
        return (
          <div className="space-y-8">
            <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
              <h1 className="text-5xl font-bold mb-4">🏆 {dashboardTitle}</h1>
              <p className="text-xl opacity-90">{welcomeMessage}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition duration-300 cursor-pointer group">
                <div className="text-5xl mb-4 group-hover:animate-bounce">👥</div>
                <h3 className="text-2xl font-bold text-white mb-2">Players</h3>
                <p className="text-blue-100 mb-4">Manage player information and profiles</p>
                <button onClick={() => setActiveTab('players')} className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition duration-200 font-semibold shadow-lg">
                  View Players →
                </button>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition duration-300 cursor-pointer group">
                <div className="text-5xl mb-4 group-hover:animate-bounce">✅</div>
                <h3 className="text-2xl font-bold text-white mb-2">Attendance</h3>
                <p className="text-orange-100 mb-4">Monitor and track player attendance</p>
                <button onClick={() => setActiveTab('attendance')} className="bg-white text-orange-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition duration-200 font-semibold shadow-lg">
                  View Attendance →
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-72 min-h-screen lg:min-h-0 text-white p-8 bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl">
          <div className="flex flex-col items-center justify-center text-center mb-8">
            <img src="/logodb.png" alt="KPT Logo" className="w-24 h-24 mx-auto mb-4 object-contain drop-shadow-lg" />
            <img src="/persondb.png" alt="Profile" className="w-28 h-28 rounded-full mx-auto mb-4 object-cover border-4 border-blue-500 shadow-lg" />
            <h6 className="text-2xl font-bold mb-2 text-blue-300">KPT</h6>
            <p className="text-lg font-medium text-gray-300 mb-1">{roleLabel}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg hover:from-red-700 hover:to-red-800 transition duration-300 mb-8 shadow-lg font-semibold"
          >
            Logout
          </button>
          <nav className="space-y-2">
            {[
              { key: 'players', label: '👥 Player List', desc: 'Manage players' },
              { key: 'attendance', label: '✅ Attendance', desc: 'Monitor presence' },
            ].map((item) => (
              <div
                key={item.key}
                className={`p-4 rounded-lg cursor-pointer transition duration-300 hover:bg-gray-700 hover:shadow-md ${
                  activeTab === item.key ? 'bg-blue-600 shadow-lg' : 'bg-gray-800'
                }`}
                onClick={() => setActiveTab(item.key)}
              >
                <p className="text-lg font-semibold">{item.label}</p>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </nav>
        </div>
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;