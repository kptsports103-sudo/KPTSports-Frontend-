import React from 'react';
import Layout from '../components/Layout';

export default function Dashboard() {
  return (
    <Layout>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">Registrations (last 7 days)</div>
        <div className="p-4 bg-white rounded shadow">Upcoming Events</div>
        <div className="p-4 bg-white rounded shadow">Top Pages</div>
      </div>
    </Layout>
  );
}
