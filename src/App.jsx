import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import AuthCallback from './pages/AuthCallback';
import StudentManagementPage from './pages/StudentManagementPage'; 
import AdminManagementPage from './pages/AdminManagementPage';
import AdminLayout from './components/admin/AdminLayout';
import { getCurrentUser } from './api';

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
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={<StudentRoute><Dashboard /></StudentRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Admin />} />
          <Route path="students" element={<StudentManagementPage />} />
          <Route path="management" element={<SuperAdminRoute><AdminManagementPage /></SuperAdminRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;