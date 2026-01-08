import { useEffect, useState } from "react";

const IAMUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Placeholder - replace with real API call
    setUsers([
      { _id: 1, name: "John Admin", email: "admin@example.com", role: "admin", status: "active" },
      { _id: 2, name: "Jane Coach", email: "coach@example.com", role: "coach", status: "active" },
      { _id: 3, name: "Bob Student", email: "student@example.com", role: "student", status: "active" }
    ]);
  }, []);

  return (
    <div>
      <h2>Identity & Access Management</h2>

      <table className="iam-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IAMUsers;