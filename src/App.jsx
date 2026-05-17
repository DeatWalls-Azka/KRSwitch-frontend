import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import AuthCallback from './pages/AuthCallback';
import StudentManagementPage from './pages/StudentManagementPage'; 
import AdminManagementPage from './pages/AdminManagementPage';
import CourseManagementPage from './pages/CourseManagementPage';
import AdminLayout from './components/admin/AdminLayout';
import { getCurrentUser } from './api';

// Automated Redirect Loop Detector & Recovery Screen
function RedirectLoopGuard({ children }) {
  const location = useLocation();
  const [hasLoop, setHasLoop] = useState(false);

  useEffect(() => {
    const now = Date.now();
    let history = [];
    try {
      history = JSON.parse(sessionStorage.getItem('auth_redirect_history') || '[]');
    } catch {}

    // Track route switch
    history.push({ path: location.pathname, time: now });

    // Filter to retain only redirects within the last 5 seconds
    history = history.filter(item => now - item.time < 5000);

    try {
      sessionStorage.setItem('auth_redirect_history', JSON.stringify(history));
    } catch {}

    // Check if we are rapidly bouncing between login and protected domains
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
    
    // Revoke cookie states across all standard backend configurations
    try {
      await fetch('http://localhost:5000/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    try {
      await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}

    // Redirect to login page and trigger hard reload to guarantee blank memory scope
    window.location.href = '/login';
  };

  if (hasLoop) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-950 text-gray-100 font-mono p-6">
        <div className="max-w-md w-full border border-red-900 bg-red-950/20 rounded-lg p-6 shadow-2xl flex flex-col gap-4">
          <div className="flex items-center gap-3 text-red-500">
            <svg className="h-6 w-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
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

  return children;
}

// Cek auth — redirect ke /login kalo belum login
function ProtectedRoute({ children }) {
  const [authed, setAuthed] = useState(null);
  useEffect(() => {
    getCurrentUser().then(() => setAuthed(true)).catch(() => setAuthed(false));
  }, []);
  if (authed === null) return null;
  if (authed === false) return <Navigate to="/login" replace />;
  return children;
}

// Cek role student — redirect ke /admin kalo ternyata admin
function StudentRoute({ children }) {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    getCurrentUser()
      .then(res => {
        if (!res.data) setStatus('unauthenticated');
        else if (res.data.role === 'student') setStatus('student');
        else if (['super_admin', 'operator', 'admin'].includes(res.data.role)) setStatus('admin');
        else setStatus('unauthenticated');
      })
      .catch(() => setStatus('unauthenticated'));
  }, []);

  if (status === null) return null;
  if (status === 'unauthenticated') return <Navigate to="/login" replace />;
  if (status === 'admin') return <Navigate to="/admin" replace />;
  return children;
}

// Cek role admin — redirect ke / kalo bukan admin (operator atau super_admin bisa masuk)
function AdminRoute({ children }) {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    getCurrentUser()
      .then(res => {
        if (!res.data) setStatus('unauthenticated');
        else if (['super_admin', 'operator', 'admin'].includes(res.data.role)) setStatus('admin');
        else setStatus('forbidden');
      })
      .catch(() => setStatus('unauthenticated'));
  }, []);

  if (status === null) return null;
  if (status === 'unauthenticated') return <Navigate to="/login" replace />;
  if (status === 'forbidden') return <Navigate to="/" replace />;
  return children;
}

// Cek role super admin
function SuperAdminRoute({ children }) {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    getCurrentUser()
      .then(res => {
        if (!res.data) setStatus('unauthenticated');
        else if (['super_admin', 'admin'].includes(res.data.role)) setStatus('super_admin');
        else setStatus('forbidden');
      })
      .catch(() => setStatus('unauthenticated'));
  }, []);

  if (status === null) return null;
  if (status === 'unauthenticated') return <Navigate to="/login" replace />;
  if (status === 'forbidden') return <Navigate to="/admin" replace />;
  return children;
}

function App() {
  return (
    <Router>
      <RedirectLoopGuard>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<StudentRoute><Dashboard /></StudentRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Admin />} />
            <Route path="students" element={<StudentManagementPage />} />
            <Route path="courses" element={<CourseManagementPage />} />
            <Route path="management" element={<SuperAdminRoute><AdminManagementPage /></SuperAdminRoute>} />
          </Route>
        </Routes>
      </RedirectLoopGuard>
    </Router>
  );
}

export default App;