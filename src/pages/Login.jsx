import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api';
import MarbotBanner from '../assets/MarbotBanner.jpg';

const ERROR_MESSAGES = {
  wrong_domain:   'Harus menggunakan akun @apps.ipb.ac.id untuk login.',
  not_registered: 'Akunmu belum terdaftar di sistem ini. Hubungi administrator.',
  oauth_failed:   'Login gagal. Coba lagi.',
  oauth_denied:   'Login dibatalkan.',
};

export default function Login() {
  const navigate    = useNavigate();
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [checking, setChecking] = useState(true);
  const popupRef = useRef(null);

  useEffect(() => {
    getCurrentUser()
      .then(() => navigate('/'))
      .catch(() => setChecking(false));
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get('error');
    if (errorCode) setError(ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.oauth_failed);
  }, []);

  useEffect(() => {
    const handleMessage = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type !== 'AUTH_RESULT') return;
      setLoading(false);
      popupRef.current = null;
      if (e.data.success) {
        navigate('/');
      } else {
        setError(ERROR_MESSAGES[e.data.error] ?? ERROR_MESSAGES.oauth_failed);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  const handleLogin = () => {
    setError(null);
    setLoading(true);
    if (popupRef.current && !popupRef.current.closed) popupRef.current.close();

    const width  = 500;
    const height = 600;
    const left   = window.screenX + (window.outerWidth  - width)  / 2;
    const top    = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      'http://localhost:5000/auth/google',
      'google-oauth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
    );
    popupRef.current = popup;

    const pollClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(pollClosed);
        setLoading(false);
      }
    }, 500);
  };

  if (checking) return null;

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 font-mono">
      <div className="flex flex-col gap-2" style={{ width: '432px' }}>

        {/* Banner image box */}
        <div className="rounded-t-xl rounded-b-md overflow-hidden border border-gray-200 shadow-md" style={{ height: '240px' }}>
          <img
            src={MarbotBanner}
            alt="KRSwitch Banner"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Login box */}
        <div className="bg-white border border-gray-200 rounded-t-md rounded-b-xl p-5 flex flex-col items-center gap-5 shadow-md z-10">

          {/* Title — centered */}
          <div className="text-center">
            <h1 className="text-sm font-bold text-gray-900 tracking-widest uppercase">KRSwitch</h1>
            <p className="text-[12px] text-gray-500 mt-0.5">Platform Barter Kelas IPB</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="w-full bg-red-50 border border-red-200 px-3 py-2 rounded-sm">
              <p className="text-[12px] text-red-700 font-bold">⚠ {error}</p>
            </div>
          )}

          {/* Google button — hover matches FilterButton active state */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 px-5 py-3 text-[12px] font-bold text-gray-500 rounded-sm transition-all duration-150 hover:bg-green-50 hover:text-green-600 hover:border-green-600 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-white disabled:hover:text-gray-500 disabled:hover:border-gray-300 disabled:hover:shadow-none"
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                MENUNGGU...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                LOGIN WITH GOOGLE
              </>
            )}
          </button>

          <p className="text-[10px] text-gray-400 mt-[-12px]">
            *harus menggunakan akun ipb untuk login!
          </p>
        </div>

      </div>
    </div>
  );
}