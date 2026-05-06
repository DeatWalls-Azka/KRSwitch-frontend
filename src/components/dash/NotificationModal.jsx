import { useState } from 'react';

function NotificationRow({ notification, parallelClasses }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasSeen, setHasSeen] = useState(false);
  const { type, data, read, createdAt } = notification;

  const isAutoMatched = type === 'barter_auto_matched';
  const isOfferer = type === 'barter_matched_as_offerer';

  // Defensive fallback — old notifications might not have all fields
  const counterpartName = (isAutoMatched
    ? data.counterpartName
    : isOfferer ? data.takerName : data.offererName) || '—';

  const timestamp = new Date(createdAt).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).replace('.', ':');

  // Ping hidden once expanded — stays hidden even after collapsing
  const showPing = !read && !hasSeen;

  const handleToggle = () => {
    if (!isExpanded) setHasSeen(true);
    setIsExpanded(prev => !prev);
  };

  // Title per type
  const title = isAutoMatched
    ? 'Auto-Match Berhasil'
    : isOfferer
      ? 'Penawaran Anda Diterima'
      : 'Anda Menerima Penawaran';

  // Subtitle label per type
  const counterpartLabel = isAutoMatched ? 'dengan' : isOfferer ? 'oleh' : 'dari';

  // Border + ping color — all green, consistent with platform
  const borderColor = read ? 'border-gray-200' : 'border-green-300';
  const pingColor = 'bg-green-500';

  return (
    <div className={`border rounded-sm mb-1 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] ${borderColor} bg-white`}>

      {/* Collapsed row */}
      <button
        onClick={handleToggle}
        className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <div className="relative inline-flex shrink min-w-0">
              <span className="text-xs font-bold text-gray-900 truncate block pr-4">
                {title}
              </span>
              {showPing && (
                <span className="absolute -top-0 right-1 flex">
                  <span className={`animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full ${pingColor} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${pingColor}`} />
                </span>
              )}
            </div>
          </div>
          <p className="text-[11px] text-gray-500 truncate">
            <span className="text-red-500 font-semibold">{data.yourOldClass?.classCode || '—'}</span>
            {' ⇌ '}
            <span className="text-green-600 font-semibold">{data.yourNewClass?.classCode || '—'}</span>
            {' · '}
            {counterpartLabel} <span className="text-gray-700 font-semibold">{counterpartName}</span>
          </p>
        </div>

        {/* Timestamp + drop down icon — right aligned, stacked */}
        <div className="flex flex-col items-end justify-center gap-1 shrink-0">
          <span className="text-[11px] text-gray-400">{timestamp}</span>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Expanded detail — grid-template-rows avoids max-height delay artifact */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: isExpanded ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{ overflow: 'hidden', minHeight: 0 }}>
          <div className="border-t border-gray-100 bg-white px-4 py-4 space-y-4">

            {/* Swap detail */}
            <div className="border border-gray-100 rounded-sm py-3.5 px-4">
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="text-[11px] text-gray-400 mb-1">Dilepas</div>
                  <div className="text-red-600 font-bold text-base">
                    {data.yourOldClass?.courseCode}-{data.yourOldClass?.classCode}
                  </div>
                </div>
                <div className="text-gray-300 font-bold text-xl">⇌</div>
                <div className="text-center">
                  <div className="text-[11px] text-gray-400 mb-1">Didapat</div>
                  <div className="text-green-600 font-bold text-base">
                    {data.yourNewClass?.courseCode}-{data.yourNewClass?.classCode}
                  </div>
                </div>
              </div>
            </div>

            {/* Stale cancelled offers */}
            {data.staleCancelledOffers && data.staleCancelledOffers.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] text-gray-400 font-bold uppercase">
                  Penawaran Dibatalkan Otomatis
                </div>
                {data.staleCancelledOffers.map((stale) => {
                  const myClass = parallelClasses.find(pc => pc.id === stale.myClassId);
                  const wantedClass = parallelClasses.find(pc => pc.id === stale.wantedClassId);

                  return (
                    <div key={stale.offerId} className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-sm px-3 py-2.5">
                      <span className="text-red-400 shrink-0 text-xs font-bold">{"<!>"}</span>
                      <div className="text-[11px] text-gray-600 leading-relaxed">
                        <span className="font-bold text-gray-800">
                          {myClass?.courseCode}-{myClass?.classCode} ⇌ {wantedClass?.classCode}
                        </span>
                        <br />
                        {stale.reason === 'no_longer_enrolled'
                          ? 'Kelas yang ditawarkan sudah tidak dimiliki'
                          : `Bentrok jadwal dengan ${stale.conflictingClass}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotificationModal({ isOpen, onClose, notifications = [], parallelClasses = [] }) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  };

  const handleBackdropClick = () => handleClose();

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') handleClose();
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div
      className={`fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-5 md:p-4 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div className="relative w-[calc(100vw-2.5rem)] md:w-full md:max-w-md">
        <div
          className={`bg-white rounded-lg shadow-2xl overflow-hidden relative flex flex-col ${isClosing ? 'animate-popDown' : 'animate-popUp'}`}
          style={{ height: '75vh', maxHeight: '680px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            aria-label="Tutup notifikasi"
            className="absolute top-3 right-3 z-20 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Panel Header */}
          <div className="px-5 py-3.5 border-b border-gray-200 flex-shrink-0 pr-12">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-bold text-gray-900 shrink-0">History Inbox</h3>
              <p className="text-[11px] text-gray-500">
                <span className="hidden md:inline">{notifications.length} total · </span>
                {unreadCount} belum dibaca
              </p>
            </div>
          </div>

          {/* Scrollable Notification List */}
          <div className="flex-1 overflow-y-auto p-4 notif-scroll">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  parallelClasses={parallelClasses}
                />
              ))
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400 text-xs">Tidak ada notifikasi</p>
              </div>
            )}
          </div>

          {/* Panel Footer */}
          <div className="px-5 py-2.5 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <p className="text-[10px] text-gray-400 text-center">
              Notifikasi ditandai sudah dibaca saat menutup panel ini
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .notif-scroll::-webkit-scrollbar { width: 4px; }
        .notif-scroll::-webkit-scrollbar-track { background: transparent; }
        .notif-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 999px; }
        .notif-scroll::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
        @keyframes popUp {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes popDown {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes fadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-popUp { animation: popUp 0.15s ease-out; }
        .animate-popDown { animation: popDown 0.15s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.15s ease-out; }
        .animate-fadeOut { animation: fadeOut 0.15s ease-out; }
      `}</style>
    </div>
  );
}