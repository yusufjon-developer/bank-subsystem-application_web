import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export const PublicRoute: React.FC = () => {
  const { token, user } = useAuthStore();

  if (token && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
