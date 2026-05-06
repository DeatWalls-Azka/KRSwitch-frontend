import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

export default function Header({
  isConnected = false,
  user = null,
  onlineCount = 0,
  unreadCount = 0,
  onOpenNotifications,
  onOpenSchedule,
}) {
  const displayName  = user?.name  || 'Loading...';
  const displayNim   = user?.nim   || '—';
  const displayEmail = user?.email || '';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const fullDropdownRef    = useRef(null);  // full-mode relative wrapper
  const compactDropdownRef = useRef(null);  // compact-mode relative wrapper
  const triggerRef         = useRef(null);
  const navigate           = useNavigate();

  const PROXIMITY_PX = 32;
  const closeDropdown = useCallback(() => setDropdownOpen(false), []);

  // Proximity-based closing — only meaningful on desktop (full mode)
  const handleMouseMove = useCallback((e) => {
    if (!dropdownOpen || !fullDropdownRef.current) return;
    const elements = [fullDropdownRef.current, ...Array.from(fullDropdownRef.current.children)];
    const inside = elements.some(el => {
      const rect = el.getBoundingClientRect();
      const dx = Math.max(rect.left - e.clientX, e.clientX - rect.right, 0);
      const dy = Math.max(rect.top  - e.clientY, e.clientY - rect.bottom, 0);
      return dx <= PROXIMITY_PX && dy <= PROXIMITY_PX;
    });
    if (!inside) closeDropdown();
  }, [dropdownOpen, closeDropdown]);

  useEffect(() => {
    if (dropdownOpen) document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [dropdownOpen, handleMouseMove]);

  // Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && dropdownOpen) {
        closeDropdown();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dropdownOpen, closeDropdown]);

  const handleLogout = async () => {
    closeDropdown();
    try { await api.post('/auth/logout'); } catch (_) {}
    navigate('/login');
  };

  const dropdownMenuContents = (
    <div style={{ overflow: 'hidden', minHeight: 0 }}>
      <div className="px-3 py-2.5 border-b border-gray-100">
        <p className="text-[11px] font-bold text-gray-900 truncate">{displayName}</p>
        <p className="text-[10px] text-gray-400 truncate mt-0.5">{displayEmail || displayNim}</p>
      </div>
      <div className="py-1">
        <button
          role="menuitem"
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-[11px] font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 focus:outline-none focus-visible:bg-red-50"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          LOGOUT
        </button>
      </div>
    </div>
  );

  const panelStyle = {
    display: 'grid',
    gridTemplateRows: dropdownOpen ? '1fr' : '0fr',
    transition: 'grid-template-rows 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    opacity: dropdownOpen ? 1 : 0,
    pointerEvents: dropdownOpen ? 'auto' : 'none',
    transitionProperty: 'grid-template-rows, opacity',
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0 flex items-center justify-between">

      {/* LEFT — logo + connection status */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative inline-flex items-center justify-center">
          <span className={`relative inline-flex rounded-full w-2.5 h-2.5 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300 animate-pulse'}`} />
          {isConnected && (
            <span className="animate-ping absolute inline-flex w-2.5 h-2.5 rounded-full bg-green-400 opacity-75" />
          )}
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-gray-900 leading-tight mb-[-3px]">KRSWITCH</h1>
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{onlineCount} Online</span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2 pl-4 ml-auto shrink-0">

        {/* ── Compact — below 400px ───────────────────────────── */}
        <div className="flex min-[400px]:hidden items-center gap-2">
          <button
            onClick={onOpenSchedule}
            aria-label="Lihat jadwal"
            className="relative flex items-center justify-center w-9 h-9 text-gray-500 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors active:bg-gray-200"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8"  y1="2" x2="8"  y2="6" />
              <line x1="3"  y1="10" x2="21" y2="10" />
            </svg>
          </button>

          <button
            onClick={onOpenNotifications}
            aria-label="Notifications"
            className="relative flex items-center justify-center w-9 h-9 text-gray-500 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors active:bg-gray-200"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-[3px] leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Compact account button — dropdown anchored to its own relative wrapper */}
          <div className="relative" ref={compactDropdownRef}>
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              className="flex items-center justify-center w-9 h-9 text-gray-500 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </button>

            {/* Compact dropdown — right-0 anchored to this 36px button */}
            <div
              className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden"
              style={panelStyle}
            >
              {dropdownMenuContents}
            </div>
          </div>
        </div>

        {/* ── Full — 400px and above ───────────────────────────── */}
        <div className="hidden min-[400px]:flex items-center gap-2">

          {/* Full account button — its own separate relative wrapper and ref */}
          <div className="relative" ref={fullDropdownRef}>
            <button
              ref={triggerRef}
              onClick={() => setDropdownOpen(prev => !prev)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              className="flex items-center gap-2 px-2.5 h-8 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
            >
              <div className="flex flex-col items-start justify-center leading-none">
                <span className="text-[11px] font-bold text-gray-900 whitespace-nowrap">{displayName}</span>
                <span className="text-[9px] text-gray-500 tracking-wide mt-[1px]">{displayNim}</span>
              </div>
              <svg
                width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className={`text-gray-400 shrink-0 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Full dropdown — right-0 anchored to the full-width button */}
            <div
              className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden"
              style={panelStyle}
            >
              {dropdownMenuContents}
            </div>
          </div>

          {/* Schedule */}
          <button
            onClick={onOpenSchedule}
            aria-label="Lihat jadwal"
            title="Jadwal Kuliah"
            className="relative flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8"  y1="2" x2="8"  y2="6" />
              <line x1="3"  y1="10" x2="21" y2="10" />
            </svg>
          </button>

          {/* Bell */}
          <button
            onClick={onOpenNotifications}
            aria-label="Notifications"
            className="relative flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-[3px] leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>

      </div>

    </header>
  );
}