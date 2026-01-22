import { useSearchParams, Link } from 'react-router-dom';

const ChooseDashboard = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');
  console.log('ChooseDashboard role:', role);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-6">Choose Your Dashboard</h2>
        {role === 'superadmin' && (
          <div className="space-y-4">
            <Link to="/admin/super-admin-dashboard" className="block w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700">Superadmin Dashboard</Link>
            <Link to="/admin/dashboard" className="block w-full bg-green-600 text-white py-3 rounded hover:bg-green-700">Admin Dashboard</Link>
          </div>
        )}
        {role === 'admin' && (
          <div className="space-y-4">
            <Link to="/admin/dashboard" className="block w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700">Admin Dashboard</Link>
            <Link to="/dashboard/creator" className="block w-full bg-green-600 text-white py-3 rounded hover:bg-green-700">Creator Dashboard</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChooseDashboard;