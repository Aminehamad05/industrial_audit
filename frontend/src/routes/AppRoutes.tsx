import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import { ProtectedRoute } from '../components/ProtectedRouteProps';
import AdminDashboard from '../pages/admin/AdminDashboard';
import SupervisorDashboard from '../pages/SupervisorDashboard';
import AuditorDashboard from '../pages/AuditorDashboard';
import TechnicianDashboard from '../pages/TechnicianDashboard';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Administrator']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Supervisor']}>
              <SupervisorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auditor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Auditor']}>
              <AuditorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/dashboard"
          element={
            <ProtectedRoute allowedRoles={['MaintenanceTechnician']}>
              <TechnicianDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;