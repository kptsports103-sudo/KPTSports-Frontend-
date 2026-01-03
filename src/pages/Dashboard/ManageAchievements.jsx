import { useEffect, useState } from 'react';

import api from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const ManageAchievements = () => {

  const [achievements, setAchievements] = useState([]);

  const [form, setForm] = useState({ title: '', year: '', teamOrPlayer: '', description: '' });

  const [editing, setEditing] = useState(null);

  useEffect(() => {

    fetchAchievements();

  }, []);

  const fetchAchievements = async () => {

    const res = await api.get('/achievements');

    setAchievements(res.data);

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (editing) {

      await api.put(`/achievements/${editing}`, form);

    } else {

      await api.post('/achievements', form);

    }

    setForm({ title: '', year: '', teamOrPlayer: '', description: '' });

    setEditing(null);

    fetchAchievements();

  };

  const handleEdit = (achievement) => {

    setForm(achievement);

    setEditing(achievement._id);

  };

  const handleDelete = async (id) => {

    await api.delete(`/achievements/${id}`);

    fetchAchievements();

  };

  return (
    <AdminLayout>
      <div className="manage-achievements">
        <h1>Manage Achievements</h1>
        <form onSubmit={handleSubmit} className="achievement-form">
          <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input type="number" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required />
          <input type="text" placeholder="Team/Player" value={form.teamOrPlayer} onChange={(e) => setForm({ ...form, teamOrPlayer: e.target.value })} />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button type="submit">{editing ? 'Update' : 'Add'}</button>
        </form>
        <ul className="achievements-list">
          {achievements.map(achievement => (
            <li key={achievement._id}>
              {achievement.title} - {achievement.year}
              <button onClick={() => handleEdit(achievement)}>Edit</button>
              <button onClick={() => handleDelete(achievement._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </AdminLayout>
  );

};

export default ManageAchievements;