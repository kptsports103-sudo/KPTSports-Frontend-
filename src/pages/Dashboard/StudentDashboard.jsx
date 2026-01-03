import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Players from '../../components/coach/Players';
import TrainingSchedule from '../../components/student/TrainingSchedule';
import Attendance from '../../components/student/Attendance';
import Performance from '../../components/student/Performance';

const StudentDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [playersData, setPlayersData] = useState([]);
  const [trainingData, setTrainingData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [activeSection, setActiveSection] = useState('players');
  // Dummy data for demo
  const profile = { name: "John Doe", email: "student103@gmail.com", rollNo: "12345" };
  const attendance = { present: 85, total: 100 };
  const performance = { grade: "A", points: 95 };
  const events = ["Sports Day", "Annual Meet"];
  const notifications = ["New event scheduled", "Attendance updated"];

  useEffect(() => {
    const savedPlayers = localStorage.getItem("playersData");
    if (savedPlayers) {
      setPlayersData(JSON.parse(savedPlayers));
    }

    const savedTraining = localStorage.getItem("trainingSchedule");
    if (savedTraining) {
      setTrainingData(JSON.parse(savedTraining));
    }

    const savedPerformance = localStorage.getItem("performanceData");
    if (savedPerformance) {
      setPerformanceData(JSON.parse(savedPerformance));
    }

    const savedAttendance = localStorage.getItem("attendanceData");
    if (savedAttendance) {
      setAttendanceData(JSON.parse(savedAttendance));
    }
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case 'players':
        return <Players isStudent={true} />;
      case 'training':
        return <TrainingSchedule isStudent={true} />;
      case 'performance':
        return <Performance />;
      case 'attendance':
        return <Attendance />;
      default:
        return (
          <div className="text-center">
            <p className="text-gray-200">Click on the menu items to view information.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("/db.png")' }}>
      <div className="flex">
        <div className="w-full lg:w-72 min-h-screen lg:min-h-0 text-white p-8 bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl">
          <div className="flex flex-col items-center justify-center text-center mb-8">
            <img src="/logodb.png" alt="KPT Logo" className="w-24 h-24 mx-auto mb-4 object-contain drop-shadow-lg" />
            <img src="/persondb.png" alt="Profile" className="w-28 h-28 rounded-full mx-auto mb-4 object-cover border-4 border-blue-500 shadow-lg" />
            <h6 className="text-2xl font-bold mb-2 text-blue-300">KPT</h6>
            <p className="text-lg font-medium text-gray-300 mb-1">Student</p>
            <p className="text-sm text-gray-400">{profile.email}</p>
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
              { key: 'training', label: '📅 Training Schedule', desc: 'Plan sessions' },
              { key: 'performance', label: '📊 Performance Reports', desc: 'Track progress' },
              { key: 'attendance', label: '✅ Attendance', desc: 'Monitor presence' },
            ].map((item) => (
              <div
                key={item.key}
                className={`p-4 rounded-lg cursor-pointer transition duration-300 hover:bg-gray-700 hover:shadow-md ${
                  activeSection === item.key ? 'bg-blue-600 shadow-lg' : 'bg-gray-800'
                }`}
                onClick={() => setActiveSection(item.key)}
              >
                <p className="text-lg font-semibold">{item.label}</p>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </nav>
        </div>
        <div className="flex-1 p-8">
          <h1 className="text-4xl font-bold text-white mb-8">Student Dashboard</h1>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;