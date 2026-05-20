import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface GuardProps {
  children: React.ReactNode;
}

interface RedirectHistoryItem {
  path: string;
  time: number;
}

export default function RedirectLoopGuard({ children }: GuardProps) {
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
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      await fetch(`${baseUrl}/auth/logout`, { method: 'POST', credentials: 'include' });
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
