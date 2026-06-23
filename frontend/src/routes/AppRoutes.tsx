import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';

export const AppRoutes: React.FC = () => {
  const getSessionUser = () => {
    const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  };

  const user = getSessionUser() || { fullName: "Amine Hamed", role: "Administrator" };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home fullName={user.fullName} role={user.role} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;