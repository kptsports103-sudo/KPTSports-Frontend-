import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { IAMService } from "../../services/iam.service";
import { useAuth } from "../../context/AuthContext";

const UsersManage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const maskPhone = (phone) => {
    if (!phone) return "-------";
    return "-------" + phone.slice(-3);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await IAMService.getUsers();
      setUsers(response);
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await IAMService.deleteUser(userId);
      setUsers(users.filter((u) => u._id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          👥 Manage Users
        </h1>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {users.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No users found
              </div>
            )}

            <div className="grid grid-cols-4 gap-6">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="bg-white rounded-lg shadow-sm p-5 flex flex-col justify-between"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-medium text-gray-800">
                      {user.name}
                    </h2>
                    <button className="text-xs border border-gray-300 bg-gray-50 px-3 py-1 rounded-md hover:bg-gray-100">
                      Profile
                    </button>
                  </div>

                  {/* Info */}
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>Email: {user.email}</p>
                    <p>Phone: {maskPhone(user.phone)}</p>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center mt-6">
                    <span
                      className={`flex items-center gap-1 text-sm font-normal ${
                        user.is_verified
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ✔ Verified Role: {user.role}
                    </span>

                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-sm bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default UsersManage;
