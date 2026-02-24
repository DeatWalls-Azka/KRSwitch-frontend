import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api';

const ERROR_MESSAGES = {
  wrong_domain: 'Harus menggunakan akun @apps.ipb.ac.id untuk login.',
  not_registered: 'Akunmu belum terdaftar di sistem ini. Hubungi administrator.',
  oauth_failed: 'Login gagal. Coba lagi.',
  oauth_denied: 'Login dibatalkan.',
};

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Kalo udah login, langsung ke dashboard
    getCurrentUser()
      .then(() => navigate('/'))
      .catch(() => setChecking(false));
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get('error');
    if (errorCode) setError(ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.oauth_failed);
  }, []);

  if (checking) return null;

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 font-mono">
      <div className="flex flex-col items-center gap-6">

        {/* App name */}
        <div className="text-center mb-2">
          <h1 className="text-xs font-bold text-gray-900 tracking-widest uppercase">KRSwitch</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">Platform Barter Kelas IPB</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 p-6 flex flex-col items-center gap-4 w-72">
          {/* Error message */}
          {error && (
            <div className="w-full bg-red-50 border border-red-200 px-3 py-2">
              <p className="text-[11px] text-red-700 font-bold">⚠ {error}</p>
            </div>
          )}

          {/* Google sign-in button — plain anchor, no JS needed */}
          <a
            href="http://localhost:5000/auth/google"
            className="w-full flex items-center justify-center gap-2.5 bg-white border border-gray-300 px-4 py-2.5 text-[11px] font-bold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer no-underline"
          >
            {/* Google logo SVG */}
            <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            LOGIN WITH GOOGLE
          </a>

          {/* Footer hint */}
          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
            harus menggunakan akun ipb untuk login!
          </p>
        </div>

      </div>
    </div>
  );
}