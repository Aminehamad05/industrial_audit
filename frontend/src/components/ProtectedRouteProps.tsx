// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const role = userData?.role;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;
}