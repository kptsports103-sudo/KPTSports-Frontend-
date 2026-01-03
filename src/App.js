import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PagesList from './pages/PagesList';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/pages" element={<ProtectedRoute><PagesList /></ProtectedRoute>} />
      {/* add events route etc */}
    </Routes>
  );
}
