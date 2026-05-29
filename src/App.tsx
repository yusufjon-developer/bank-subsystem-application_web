import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { PublicRoute } from './components/layout/PublicRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/client/DashboardPage';
import { AccountsPage } from './pages/client/AccountsPage';
import { TransferPage } from './pages/client/TransferPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { OperatorAccountsPage } from './pages/admin/OperatorAccountsPage';
import { RegistrationPage } from './pages/operator/RegistrationPage';
import { CashDeskPage } from './pages/operator/CashDeskPage';
import { ExchangeRatesPage } from './pages/shared/ExchangeRatesPage';
import { SettingsPage } from './pages/shared/SettingsPage';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize dark/light theme based on localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected Routes (Requires Authentication) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Accessible to all authenticated users */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/exchange-rates" element={<ExchangeRatesPage />} />

            {/* Clients only */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_CLIENT']} />}>
              <Route path="/accounts" element={<AccountsPage />} />
              <Route path="/transfer" element={<TransferPage />} />
            </Route>

            {/* Client & Admin */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_CLIENT', 'ROLE_ADMIN']} />}>
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Route>

            {/* Operators only */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_OPERATOR']} />}>
              <Route path="/cash" element={<CashDeskPage />} />
              <Route path="/register-client" element={<RegistrationPage />} />
            </Route>

            {/* Admin only */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
              <Route path="/admin/users" element={<AdminUsersPage />} />
            </Route>

            {/* Operator & Admin */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_OPERATOR', 'ROLE_ADMIN']} />}>
              <Route path="/admin/accounts" element={<OperatorAccountsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
