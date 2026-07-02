import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import { ProtectedRoute } from '../components/ProtectedRouteProps';
import AdminDashboard from '../pages/admin/AdminDashboard';
import SupervisorDashboard from '../pages/SupervisorDashboard';
import AuditorDashboard from '../pages/auditor/AuditorDashboard';

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
            <ProtectedRoute allowedRoles={['ADMINISTRATOR']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['SUPERVISOR']}>
              <SupervisorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auditor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['AUDITOR']}>
              <AuditorDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;