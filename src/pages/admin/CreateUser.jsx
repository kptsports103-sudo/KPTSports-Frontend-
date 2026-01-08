import { useState } from "react";

const CreateUser = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Placeholder - replace with real API call
    console.log("Creating user:", form);
    alert("User created successfully");
  };

  return (
    <div className="iam-form">
      <h2>Create User</h2>

      <input
        placeholder="Name"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />

      <input
        placeholder="Email"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
      />

      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
      />

      <select
        value={form.role}
        onChange={e => setForm({ ...form, role: e.target.value })}
      >
        <option value="admin">Admin</option>
        <option value="coach">Coach</option>
        <option value="student">Student</option>
      </select>

      <button type="submit" onClick={handleSubmit}>Create</button>
    </div>
  );
};

export default CreateUser;