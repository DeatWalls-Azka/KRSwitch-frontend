import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import TradingPage from './pages/TradingPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AuthCallbackPage from './pages/auth/AuthCallbackPage';
import StudentManagementPage from './pages/admin/StudentManagementPage'; 
import AdminManagementPage from './pages/admin/AdminManagementPage';
import CourseManagementPage from './pages/admin/CourseManagementPage';
import AuditLogPage from './pages/admin/AuditLogPage';
import AdminLayout from './components/admin/AdminLayout';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import RedirectLoopGuard from './components/guards/RedirectLoopGuard';
import { StudentRoute, AdminRoute, SuperAdminRoute } from './components/guards/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <RedirectLoopGuard>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/" element={<StudentRoute><TradingPage /></StudentRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="students" element={<StudentManagementPage />} />
              <Route path="courses" element={<CourseManagementPage />} />
              <Route path="logs" element={<AuditLogPage />} />
              <Route path="management" element={<SuperAdminRoute><AdminManagementPage /></SuperAdminRoute>} />
            </Route>
          </Routes>
        </RedirectLoopGuard>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}
