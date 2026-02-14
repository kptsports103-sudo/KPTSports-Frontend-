import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

const UPDATE_CARDS = [
  {
    title: 'Update Home',
    icon: '🏠',
    description: 'Manage home page content',
    path: '/admin/manage-home'
  },
  {
    title: 'Update About',
    icon: 'ℹ️',
    description: 'Manage about page content',
    path: '/admin/manage-about'
  },
  {
    title: 'Update History',
    icon: '📜',
    description: 'Manage history page content',
    path: '/admin/manage-history'
  },
  {
    title: 'Update Events',
    icon: '📅',
    description: 'Manage events page content',
    path: '/admin/manage-events'
  },
  {
    title: 'Update Gallery',
    icon: '🖼️',
    description: 'Manage gallery page content',
    path: '/admin/manage-gallery'
  },
  {
    title: 'Update Results',
    icon: '🏆',
    description: 'Manage results page content',
    path: '/admin/manage-results'
  }
];

const UpdatePages = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <AdminLayout>
      <div style={{ padding: '20px', color: '#000' }}>
        <h1 style={{ marginBottom: 6 }}>Update Pages</h1>
        <p style={{ marginTop: 0 }}>Only Admin update actions from these pages are logged.</p>

        <div style={{ margin: '10px 0', fontWeight: 700 }}>
          Date: {dateTime.toLocaleDateString()} <br />
          Time: {dateTime.toLocaleTimeString()}
        </div>

        <div
          style={{
            marginTop: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '20px'
          }}
        >
          {UPDATE_CARDS.map((card) => (
            <Link
              key={card.path}
              to={card.path}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  cursor: 'pointer'
                }}
              >
                <h3 style={{ margin: '0 0 10px 0', color: '#000' }}>
                  {card.icon} {card.title}
                </h3>
                <p style={{ margin: 0, color: '#000' }}>{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default UpdatePages;
