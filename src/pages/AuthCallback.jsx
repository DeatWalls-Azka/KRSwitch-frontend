import { useEffect } from 'react';

// Halaman ini jalan di dalam popup window pas login
// Tugasnya cuma baca query param, kirim pesan ke parent, lalu tutup diri sendiri
export default function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');

    if (window.opener) {
      window.opener.postMessage(
        error ? { type: 'AUTH_RESULT', error } : { type: 'AUTH_RESULT', success: true },
        window.location.origin
      );
      window.close();
    } else {
      // Fallback: kalau somehow bukan popup, redirect normal
      window.location.href = error ? `/login?error=${error}` : '/';
    }
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 font-mono">
      <p className="text-xs text-gray-400">Menyelesaikan login...</p>
    </div>
  );
}