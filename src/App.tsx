import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import StudentManagementPage from './pages/StudentManagementPage'; 
import AdminManagementPage from './pages/AdminManagementPage';
import CourseManagementPage from './pages/CourseManagementPage';
import AuditLogPage from './pages/AuditLogPage';
import AdminLayout from './components/admin/AdminLayout';
import { AuthProvider, useAuth } from './context/AuthContext';

// --- Konstanta ------------------------------------------------

const ADMIN_ROLES = ['super_admin', 'operator', 'admin'];
const SUPER_ADMIN_ROLES = ['super_admin', 'admin'];

// --- Types ----------------------------------------------------

interface GuardProps {
  children: React.ReactNode;
}

interface RedirectHistoryItem {
  path: string;
  time: number;
}

// --- Helpers & Guards -----------------------------------------

function RedirectLoopGuard({ children }: GuardProps) {
  const location = useLocation();
  const [hasLoop, setHasLoop] = useState(false);

  useEffect(() => {
    const now = Date.now();
    let history: RedirectHistoryItem[] = [];
    try {
      history = JSON.parse(sessionStorage.getItem('auth_redirect_history') || '[]');
    } catch {}

    // Lacak perpindahan route
    history.push({ path: location.pathname, time: now });

    // Filter buat nyimpen redirect dalam 5 detik terakhir saja
    history = history.filter(item => now - item.time < 5000);

    try {
      sessionStorage.setItem('auth_redirect_history', JSON.stringify(history));
    } catch {}

    // Cek apakah mental bolak-balik antara login dan area berproteksi secara cepat
    const routeChanges = history.map(h => h.path);
    const loginCount = routeChanges.filter(p => p === '/login').length;
    const mainCount = routeChanges.filter(p => p === '/' || p.startsWith('/admin')).length;

    if (loginCount >= 2 && mainCount >= 2) {
      setHasLoop(true);
    }
  }, [location]);

  const handleForceReset = async () => {
    localStorage.clear();
    sessionStorage.clear();
    
    // Cabut state cookie di semua konfigurasi backend standar
    try {
      await fetch('http://localhost:5000/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    try {
      await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}

    // Arahkan ke login dan paksa hard reload biar memori benar-benar bersih
    window.location.href = '/login';
  };

  if (hasLoop) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-950 text-gray-100 font-mono p-6">
        <div className="max-w-md w-full border border-red-900 bg-red-950/20 rounded-lg p-6 shadow-2xl flex flex-col gap-4">
          <div className="flex items-center gap-3 text-red-500">
            <svg className="h-6 w-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-sm font-bold tracking-wider">LOOP AUTENTIKASI DIHENTIKAN</h2>
          </div>
          
          <div className="h-px bg-red-950 w-full" />
          
          <p className="text-[12px] text-gray-400 leading-relaxed">
            Sistem mendeteksi adanya perulangan autentikasi beruntun (auth redirect loop). 
            Ini biasanya disebabkan oleh cookie sesi usang atau konflik port localhost.
          </p>

          <p className="text-[11px] text-red-400 bg-red-950/40 border border-red-900/30 p-2 rounded">
            Langkah pemulihan otomatis telah disiapkan. Klik tombol di bawah untuk membersihkan 
            seluruh data sesi dan melakukan login ulang secara aman.
          </p>

          <button
            onClick={handleForceReset}
            className="w-full bg-red-900 hover:bg-red-800 active:bg-red-950 text-white border border-red-700 px-4 py-3 rounded text-[11px] font-bold tracking-wider transition-colors duration-150 shadow-md shadow-red-950/30"
          >
            BERSIHKAN SESI & LOGIN ULANG
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AuthLoadingScreen() {
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

function ProtectedRoute({ children }: GuardProps) {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function StudentRoute({ children }: GuardProps) {
  const { user, loading } = useAuth();

  if (loading) return <AuthLoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (ADMIN_ROLES.includes(user.role)) return <Navigate to="/admin" replace />;
  if (user.role === 'student') return <>{children}</>;
  return <Navigate to="/login" replace />;
}

function AdminRoute({ children }: GuardProps) {
  const { user, loading } = useAuth();

  if (loading) return <AuthLoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (ADMIN_ROLES.includes(user.role)) return <>{children}</>;
  return <Navigate to="/" replace />;
}

function SuperAdminRoute({ children }: GuardProps) {
  const { user, loading } = useAuth();

  if (loading) return <AuthLoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (SUPER_ADMIN_ROLES.includes(user.role)) return <>{children}</>;
  return <Navigate to="/admin" replace />;
}

// --- Aplikasi Utama -------------------------------------------

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <RedirectLoopGuard>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/" element={<StudentRoute><DashboardPage /></StudentRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminPage />} />
              <Route path="students" element={<StudentManagementPage />} />
              <Route path="courses" element={<CourseManagementPage />} />
              <Route path="logs" element={<AuditLogPage />} />
              <Route path="management" element={<SuperAdminRoute><AdminManagementPage /></SuperAdminRoute>} />
            </Route>
          </Routes>
        </RedirectLoopGuard>
      </AuthProvider>
    </Router>
  );
}
