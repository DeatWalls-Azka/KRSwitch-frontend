export default function Header({ isConnected = false, user = null, onlineCount = 0, unreadCount = 0, onOpenNotifications }) {
  // Fallback values for when data is loading
  const displayName = user?.name || 'Loading...';
  const displayNim = user?.nim || '—';

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0 flex items-center justify-between">
      
      <div className="flex items-center gap-2">
        <div className="relative inline-flex items-center justify-center">
          <span 
            className={`relative inline-flex rounded-full w-2.5 h-2.5 ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300 animate-pulse'
            }`}
          />
          {isConnected && (
            <span className="animate-ping absolute inline-flex w-2.5 h-2.5 rounded-full bg-green-400 opacity-75" />
          )}
        </div>
        <div className="flex flex-col">
          {/* Judul */}
          <h1 className="text-lg font-bold text-gray-900 leading-tight mb-[-3px]">
            KRSWITCH
          </h1>
          {/* Online Count */}
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            {onlineCount} Online
          </span>
        </div>
      </div>

      {/* === BAGIAN KANAN: PROFIL + NOTIF BUTTON === */}
      {/* items-stretch biar button ikut tinggi name/nim, bukan tinggi full header */}
      <div className="hidden sm:flex items-center gap-2 pl-4 ml-auto">
        <div className="text-right flex flex-col justify-center">
          <p className="text-sm font-bold text-gray-900 leading-none">
            {displayName}
          </p>
          <p className="text-[10px] text-gray-500 font-mono tracking-wide mt-0.5">
            {displayNim}
          </p>
        </div>

        {/* Bell button */}
        <button
          onClick={onOpenNotifications}
          aria-label="Notifications"
          className="mb-1 relative flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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

    </header>
  );
}