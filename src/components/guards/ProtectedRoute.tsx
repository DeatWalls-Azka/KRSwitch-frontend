import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface GuardProps {
  children: React.ReactNode;
}

const ADMIN_ROLES = ['super_admin', 'operator', 'admin'];
const SUPER_ADMIN_ROLES = ['super_admin', 'admin'];

export function AuthLoadingScreen() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-50 font-mono">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin text-green-600" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Memuat Sesi...</span>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: GuardProps) {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function StudentRoute({ children }: GuardProps) {
  const { user, loading } = useAuth();

  if (loading) return <AuthLoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (ADMIN_ROLES.includes(user.role)) return <Navigate to="/admin" replace />;
  if (user.role === 'student') return <>{children}</>;
  return <Navigate to="/login" replace />;
}

export function AdminRoute({ children }: GuardProps) {
  const { user, loading } = useAuth();

  if (loading) return <AuthLoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (ADMIN_ROLES.includes(user.role)) return <>{children}</>;
  return <Navigate to="/" replace />;
}

export function SuperAdminRoute({ children }: GuardProps) {
  const { user, loading } = useAuth();

  if (loading) return <AuthLoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (SUPER_ADMIN_ROLES.includes(user.role)) return <>{children}</>;
  return <Navigate to="/admin" replace />;
}
