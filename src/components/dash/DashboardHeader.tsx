import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import type { User } from '../../types';

// --- Types ----------------------------------------------------

interface HeaderProps {
  isConnected?: boolean;
  user: User | null;
  onlineCount?: number;
  unreadCount?: number;
  onOpenNotifications: () => void;
  onOpenSchedule: () => void;
}

// --- Komponen Utama -------------------------------------------

export default function Header({
  isConnected = false,
  user = null,
  onlineCount = 0,
  unreadCount = 0,
  onOpenNotifications,
  onOpenSchedule,
}: HeaderProps) {
  const displayName  = user?.name  || 'Loading...';
  const displayNim   = user?.nim   || '-';
  const displayEmail = user?.email || '';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const fullDropdownRef    = useRef<HTMLDivElement | null>(null);  // full-mode relative wrapper
  const triggerRef         = useRef<HTMLButtonElement | null>(null);
  const navigate           = useNavigate();

  const PROXIMITY_PX = 32;
  const closeDropdown = useCallback(() => setDropdownOpen(false), []);

  // Proximity-based closing — only meaningful on desktop (full mode)
  const handleMouseMove = useCallback((e: MouseEvent) => {
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
    const handleKeyDown = (e: KeyboardEvent) => {
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
      {/* Profile info header */}
      <div className="px-3 py-2.5 border-b border-gray-100">
        <p className="text-[11px] font-bold text-gray-900 truncate">{displayName}</p>
        <p className="text-[10px] text-gray-400 truncate mt-0.5">{displayEmail || displayNim}</p>
      </div>

      {/* Mobile-only tools (visible only below md screen width) */}
      <div className="block md:hidden border-b border-gray-100 py-1">
        {/* Schedule Option */}
        <button
          role="menuitem"
          onClick={() => {
            closeDropdown();
            onOpenSchedule();
          }}
          className="w-full text-left px-3 py-2 text-[11px] font-bold text-gray-700 hover:bg-gray-50 hover:text-emerald-700 transition-colors flex items-center gap-2 focus:outline-none focus-visible:bg-gray-50 cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-400 hover:text-emerald-600">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8"  y1="2" x2="8"  y2="6" />
            <line x1="3"  y1="10" x2="21" y2="10" />
          </svg>
          SCHEDULE
        </button>

        {/* Notifications Option */}
        <button
          role="menuitem"
          onClick={() => {
            closeDropdown();
            onOpenNotifications();
          }}
          className="w-full text-left px-3 py-2 text-[11px] font-bold text-gray-700 hover:bg-gray-50 hover:text-emerald-700 transition-colors flex items-center justify-between focus:outline-none focus-visible:bg-gray-50 cursor-pointer"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-400 hover:text-emerald-600">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="truncate">NOTIFICATIONS</span>
          </div>
          {unreadCount > 0 && (
            <span className="shrink-0 min-w-[14px] h-[14px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-[3px] leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Standard Logout Option */}
      <div className="py-1">
        <button
          role="menuitem"
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-[11px] font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 focus:outline-none focus-visible:bg-red-50 cursor-pointer"
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

  const panelStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateRows: dropdownOpen ? '1fr' : '0fr',
    transition: 'grid-template-rows 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    opacity: dropdownOpen ? 1 : 0,
    pointerEvents: dropdownOpen ? 'auto' : 'none',
    transitionProperty: 'grid-template-rows, opacity',
  };

  return (
    <header className="bg-white border-b border-gray-200 px-2 py-1.5 md:px-4 md:py-2 flex-shrink-0 flex items-center justify-between">

      {/* LEFT — logo + connection status */}
      <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
        <div className="relative inline-flex items-center justify-center">
          <span className={`relative inline-flex rounded-full w-2 h-2 md:w-2.5 md:h-2.5 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300 animate-pulse'}`} />
          {isConnected && (
            <span className="animate-ping absolute inline-flex w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-green-400 opacity-75" />
          )}
        </div>
        <div className="flex flex-col">
          <h1 className="text-base md:text-lg font-bold text-gray-900 leading-tight mb-[-3px]">KRSWITCH</h1>
          <span className="text-[9px] md:text-[10px] font-semibold text-gray-500 tracking-wide">{onlineCount} Online</span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2 pl-2 ml-2 flex-1 justify-end min-w-0 md:flex-initial md:ml-auto md:shrink-0 md:pl-4">

        {/* Desktop-only Quick Access Tools (visible only at md and above) */}
        <div className="hidden md:flex items-center gap-2">
          {/* Schedule */}
          <button
            onClick={onOpenSchedule}
            aria-label="Lihat jadwal"
            title="Jadwal Kuliah"
            className="relative flex items-center justify-center w-9 h-9 text-gray-500 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8"  y1="2" x2="8"  y2="6" />
              <line x1="3"  y1="10" x2="21" y2="10" />
            </svg>
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            aria-label="Notifications"
            className="relative flex items-center justify-center w-9 h-9 text-gray-500 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

        {/* Uncollapsed account button — displays user avatar, name, and nim on ALL screen sizes */}
        <div className="relative flex-1 md:flex-initial min-w-0 max-w-[190px] md:max-w-none" ref={fullDropdownRef}>
          <button
            ref={triggerRef}
            onClick={() => setDropdownOpen(prev => !prev)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            className="flex items-center justify-between w-full md:w-auto md:min-w-[150px] md:max-w-[200px] px-1.5 md:px-2 h-8 md:h-9 border border-gray-300 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 cursor-pointer overflow-hidden min-w-0"
          >
            <div className="flex items-center gap-1.5 md:gap-2 overflow-hidden w-full min-w-0">
              <div className="flex items-center justify-center w-5.5 h-5.5 md:w-6 md:h-6 rounded-[0.35rem] md:rounded-[0.4rem] bg-emerald-600 text-white font-bold text-[9px] md:text-[10px] shrink-0 overflow-hidden">
                {user?.picture ? (
                  <img src={user.picture} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  displayName ? displayName.charAt(0).toUpperCase() : 'U'
                )}
              </div>
              <div className="flex flex-col items-start justify-center leading-none overflow-hidden flex-1 pr-1 min-w-0">
                <span className="text-[10.5px] md:text-[11px] font-bold text-gray-900 block truncate w-full text-left">{displayName}</span>
                <span className="text-[8.5px] md:text-[9px] text-gray-500 tracking-wide mt-[2.5px] md:mt-[3px] block truncate w-full text-left">{displayNim}</span>
              </div>
            </div>
            <svg
              viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className={`text-gray-400 shrink-0 w-2 h-2 md:w-2.5 md:h-2.5 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Account Dropdown — aligned right so it never overflows compact mobile layouts */}
          <div
            className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden"
            style={panelStyle}
          >
            {dropdownMenuContents}
          </div>
        </div>

      </div>

    </header>
  );
}
