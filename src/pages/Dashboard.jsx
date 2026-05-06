import { useState, useEffect, useMemo, useRef } from 'react';
import { markAllNotificationsRead } from '../api';

import Header from '../components/dash/Header';
import CourseTabs from '../components/dash/CourseTabs';
import SessionTypeTabs from '../components/dash/SessionTypeTabs';
import ClassCard from '../components/dash/ClassCard';
import BarterCard from '../components/dash/BarterCard';
import TradeConfirmationModal from '../components/dash/TradeConfirmationModal';
import NotificationModal from '../components/dash/NotificationModal';
import ScheduleGraphModal from '../components/dash/ScheduleGraphModal';
import FilterButton from '../components/dash/FilterButton';
import CreateOfferForm from '../components/dash/CreateOfferForm';

import { useDashboardData } from '../hooks/useDashboardData';
import { useSocket } from '../hooks/useSocket';
import { useOfferAnimations } from '../hooks/useOfferAnimations';
import { useTooltip } from '../hooks/useTooltip';
import { enrichOffer, getStudentsInClass, hasScheduleConflict } from '../utils/offerUtils';

// Height of the peek bar that's always visible when drawer is closed
const PEEK_H = 64;

export default function Dashboard() {
  // --- UI state -----------------------------------------------
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSessionType, setSelectedSessionType] = useState('kuliah');
  const [filterByCourse, setFilterByCourse] = useState(false);
  const [filterForYou, setFilterForYou] = useState(false);
  const [filterByYou, setFilterByYou] = useState(false);
  const [modalOffer, setModalOffer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('accept');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Mobile drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const peekBarRef = useRef(null);
  // Ref mirror so touch handlers (attached once) always see current value
  const drawerOpenRef = useRef(false);
  const touchStartYRef = useRef(null);

  // Refs for mobile card centering
  const userCardRef = useRef(null);
  const cardScrollContainerRef = useRef(null);

  // --- Data ---------------------------------------------------
  const {
    users, parallelClasses,
    enrollments, setEnrollments,
    currentUser,
    apiOffers, setApiOffers,
    notifications, setNotifications,
    loading, usersRef, parallelClassesRef,
  } = useDashboardData();

  // --- Derived ------------------------------------------------
  const courses = useMemo(() => {
    return [...new Set(parallelClasses.map(pc => pc.courseCode))].map(code => {
      const group = parallelClasses.filter(pc => pc.courseCode === code);
      const type = group.some(c => c.classCode.startsWith('P')) ? 1
        : group.some(c => c.classCode.startsWith('R')) ? 2 : 0;
      return { code, name: group[0].courseName, type };
    });
  }, [parallelClasses]);

  const enrichedOffers = useMemo(() => {
    return apiOffers
      .map(offer => enrichOffer(offer, users, parallelClasses))
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [apiOffers, users, parallelClasses]);

  const myEnrollmentMap = useMemo(() => {
    if (!currentUser) return {};
    const map = {};
    enrollments
      .filter(e => e.nim === currentUser.nim)
      .forEach(e => {
        const pc = parallelClasses.find(c => c.id === e.parallelClassId);
        if (pc) map[pc.courseCode] = pc.classCode;
      });
    return map;
  }, [currentUser, enrollments, parallelClasses]);

  const shouldBeVisibleIds = useMemo(() => {
    return new Set(enrichedOffers.filter(offer => {
      if (filterByCourse && offer.seekingCourse !== selectedCourse?.code) return false;
      if (filterForYou && myEnrollmentMap[offer.seekingCourse] !== offer.seekingClass) return false;
      if (filterByYou && offer.nim !== currentUser?.nim) return false;
      return true;
    }).map(o => o.id));
  }, [enrichedOffers, filterByCourse, filterForYou, filterByYou, selectedCourse?.code, myEnrollmentMap, currentUser?.nim]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // --- Animations ---------------------------------------------
  const {
    exitingOfferIds, enteringOfferIds, offersToDisplay,
    exitingOffersCache, startExitAnimation, animationLockRef,
  } = useOfferAnimations({ shouldBeVisibleIds, enrichedOffers });

  // --- Socket -------------------------------------------------
  const { socketRef, isConnected, onlineCount, toasts, setToasts } = useSocket({
    currentUser, usersRef, parallelClassesRef,
    setApiOffers, setEnrollments, setNotifications,
    exitingOffersCache,
  });

  // --- Tooltip ------------------------------------------------
  const { tooltipContent, setTooltipContent, tooltipVisible, tooltipPos, handleMouseMove } = useTooltip();

  // --- Course selection ---------------------------------------
  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) setSelectedCourse(courses[0]);
  }, [courses, selectedCourse]);

  useEffect(() => {
    setSelectedSessionType('kuliah');
  }, [selectedCourse?.code]);

  // --- Center user's class card on mobile after card animations settle ---
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth >= 768) return;

    // Delay lets card enter-animations finish before scrolling
    const timeout = setTimeout(() => {
      const card = userCardRef.current;
      const container = cardScrollContainerRef.current;
      if (!card || !container) return;

      // getBoundingClientRect gives viewport-relative positions that are always
      // accurate regardless of offsetParent chain, padding, or intermediate wrappers.
      // We combine it with the container's current scrollLeft to get the true
      // document-relative position, then center from there.
      const containerRect = container.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      const targetScrollLeft =
        container.scrollLeft +               // current scroll offset
        cardRect.left - containerRect.left + // card's position within container
        cardRect.width / 2 -                 // move to card center
        containerRect.width / 2;             // subtract half container width

      container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
    }, 400);

    return () => clearTimeout(timeout);
  }, [selectedCourse?.code, selectedSessionType, myEnrollmentMap]);

  // --- Handlers -----------------------------------------------
  const handleExitClick = (offerId) => {
    if (animationLockRef.current) return;
    startExitAnimation([offerId]);
  };

  const handleOpenModal = (offer, mode = 'accept') => {
    setModalOffer({ ...offer });
    setModalMode(mode);
    setShowModal(true);
  };

  const handleCloseNotificationModal = async () => {
    setShowNotificationModal(false);
    if (unreadCount > 0) {
      try {
        await markAllNotificationsRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch (err) {
        console.error('Failed to mark notifications as read:', err);
      }
    }
  };

  // Keep ref in sync so the touch handlers (registered once) see the latest value
  useEffect(() => { drawerOpenRef.current = drawerOpen; }, [drawerOpen]);

  // --- Mobile drawer touch handlers ---------------------------
  // Attached via useEffect with passive:false so we can preventDefault on touchmove,
  // preventing the page from scrolling while the user drags the drawer.
  useEffect(() => {
    const bar = peekBarRef.current;
    if (!bar) return;

    const TRAVEL = () => window.innerHeight * 0.88 - PEEK_H;

    const onStart = (e) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const onMove = (e) => {
      if (touchStartYRef.current === null || !drawerRef.current) return;
      e.preventDefault(); // block page scroll while dragging drawer
      const travel = TRAVEL();
      const base = drawerOpenRef.current ? 0 : travel;
      const delta = e.touches[0].clientY - touchStartYRef.current;
      const clamped = Math.max(0, Math.min(travel, base + delta));
      // Direct DOM write — no React re-render per pixel
      drawerRef.current.style.transition = 'none';
      drawerRef.current.style.transform = `translateY(${clamped}px)`;
    };

    const onEnd = (e) => {
      if (touchStartYRef.current === null) return;
      const dy = touchStartYRef.current - e.changedTouches[0].clientY; // +ve = swipe up
      const newOpen = dy > 40 ? true : dy < -40 ? false : drawerOpenRef.current;
      // Clear inline styles so the CSS transition takes over for the snap
      if (drawerRef.current) {
        drawerRef.current.style.transition = '';
        drawerRef.current.style.transform = '';
      }
      touchStartYRef.current = null;
      drawerOpenRef.current = newOpen;
      setDrawerOpen(newOpen);
    };

    bar.addEventListener('touchstart', onStart, { passive: true });
    bar.addEventListener('touchmove',  onMove,  { passive: false }); // must be non-passive
    bar.addEventListener('touchend',   onEnd,   { passive: true });
    return () => {
      bar.removeEventListener('touchstart', onStart);
      bar.removeEventListener('touchmove',  onMove);
      bar.removeEventListener('touchend',   onEnd);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Render -------------------------------------------------
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!selectedCourse) return null;

  const filteredClasses = parallelClasses.filter(pc => {
    if (pc.courseCode !== selectedCourse.code) return false;
    const prefix = pc.classCode[0].toLowerCase();
    return (
      (selectedSessionType === 'kuliah' && prefix === 'k') ||
      (selectedSessionType === 'praktikum' && prefix === 'p') ||
      (selectedSessionType === 'responsi' && prefix === 'r')
    );
  });

  // Shared barter feed content (used in both desktop panel and mobile drawer)
  const barterFeedContent = (
    <>
      {offersToDisplay.length > 0 ? (
        offersToDisplay.map((offer, index) => {
          const isExiting = exitingOfferIds.has(offer.id);
          const isEntering = enteringOfferIds.has(offer.id);
          const incomingClass = parallelClasses.find(
            pc => pc.courseCode === offer.seekingCourse && pc.classCode === offer.offeringClass
          );
          const conflictsWithSchedule = offer.nim !== currentUser?.nim && incomingClass
            ? hasScheduleConflict(incomingClass.id, currentUser?.nim, enrollments, parallelClasses)
            : false;

          return (
            <BarterCard
              key={offer.id}
              offer={offer}
              index={index}
              exitIndex={isExiting ? exitingOfferIds.get(offer.id) : 0}
              shouldExit={isExiting}
              shouldEnter={isEntering}
              canAccept={myEnrollmentMap[offer.seekingCourse] === offer.seekingClass}
              conflictsWithSchedule={conflictsWithSchedule}
              isOwnOffer={offer.nim === currentUser?.nim}
              onAnimationComplete={() => {}}
              onExitClick={handleExitClick}
              onOpenModal={handleOpenModal}
            />
          );
        })
      ) : (
        <p className="text-center py-10 px-5 text-gray-500 text-sm">No active offers</p>
      )}
    </>
  );

  return (
    <div className="h-screen flex flex-col  bg-gray-50">
      <Header
        isConnected={isConnected}
        user={currentUser}
        onlineCount={onlineCount}
        unreadCount={unreadCount}
        onOpenNotifications={() => setShowNotificationModal(true)}
        onOpenSchedule={() => setShowScheduleModal(true)}
      />

      <CourseTabs
        courses={courses}
        selectedCourse={selectedCourse}
        onCourseSelect={setSelectedCourse}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* Class cards — full width on mobile (pb accounts for drawer peek bar) */}
        <div className="flex-1 min-w-0 md:border-r border-gray-200 flex flex-col overflow-hidden pb-16 md:pb-0">
          <SessionTypeTabs
            courseType={selectedCourse.type}
            selectedSessionType={selectedSessionType}
            onSessionTypeSelect={setSelectedSessionType}
          />
          <div ref={cardScrollContainerRef} className="flex-1 flex gap-1 overflow-x-auto overflow-y-hidden p-4 bg-gray-50">
            {filteredClasses.map((pc, index) => {
              const isUserClass = myEnrollmentMap[selectedCourse.code] === pc.classCode;
              const card = (
                <ClassCard
                  key={pc.id}
                  index={index}
                  classItem={{
                    code: pc.classCode,
                    day: pc.day,
                    time: `${pc.timeStart}-${pc.timeEnd}`,
                    room: pc.room,
                    students: getStudentsInClass(pc.id, enrollments, users),
                  }}
                  activeOffers={enrichedOffers.filter(o => o.myClassId === pc.id)}
                  currentUserNim={currentUser?.nim}
                  onTooltipChange={setTooltipContent}
                  onMouseMove={handleMouseMove}
                />
              );
              return isUserClass
                ? <div key={pc.id} ref={userCardRef}>{card}</div>
                : card;
            })}
          </div>
        </div>

        {/* Desktop barter panel — hidden on mobile */}
        <div className="hidden md:flex w-117.5 shrink-0 bg-white flex-col overflow-hidden border-l border-gray-200">
          <div className="flex flex-col items-left px-4 py-3 bg-gray-50 shrink-0 border-b border-gray-200">
            <div className="flex flex-row gap-1 items-center">
              <div className="mr-auto flex flex-col items-left">
                <h2 className="text-xs font-bold text-gray-900">LIVE BARTER FEED PANEL</h2>
                <h1 className="text-[11px] font-normal text-gray-600">Real Time: {offersToDisplay.length} Offers</h1>
              </div>
              <button onClick={() => setFilterByCourse(!filterByCourse)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
              </button>
              <p className="text-[11px] font-bold text-gray-600">:</p>
              <FilterButton label={selectedCourse.code} isActive={filterByCourse} onClick={() => setFilterByCourse(!filterByCourse)} />
              <FilterButton label="FOR YOU" isActive={filterForYou} onClick={() => setFilterForYou(!filterForYou)} />
              <FilterButton label="BY YOU" isActive={filterByYou} onClick={() => setFilterByYou(!filterByYou)} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {barterFeedContent}
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => setIsFormOpen(true)}
              className="w-full bg-green-600 text-white text-[11px] font-bold py-2 px-2.5 border-0 cursor-pointer hover:bg-green-700 active:bg-green-800 transition-colors rounded-sm"
            >
              CREATE BARTER OFFER
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile bottom drawer ─────────────────────────────── */}

      {/* Backdrop — dims content when drawer is fully open */}
      <div
        className="md:hidden fixed inset-0 z-30 bg-black/30 pointer-events-none"
        style={{
          opacity: drawerOpen ? 1 : 0,
          transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: drawerOpen ? 'auto' : 'none',
        }}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-[88vh] bg-white rounded-t-2xl shadow-2xl flex flex-col border-t border-gray-200"
        style={{
          transform: drawerOpen ? 'translateY(0)' : `translateY(calc(88vh - ${PEEK_H}px))`,
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Peek bar — always visible, tappable to toggle */}
        <div
          ref={peekBarRef}
          className="shrink-0 px-4 pt-2.5 pb-15 cursor-pointer select-none"
          style={{ height: PEEK_H, touchAction: 'manipulation' }}
          onClick={() => setDrawerOpen(prev => !prev)}
        >
          {/* Drag handle pill */}
          <div className="flex justify-center mb-2">
            <div className="w-8 h-1 rounded-full bg-gray-300" />
          </div>

          {/* Title + quick create */}
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-[12px] font-bold text-gray-900 ">LIVE BARTER FEED</h2>
              </div>
              <p className="text-[12px] text-gray-500 ">
                {offersToDisplay.length === 0 ? 'No active offers' : `${offersToDisplay.length} active offer${offersToDisplay.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setIsFormOpen(true); }}
              className="shrink-0 bg-green-600 text-white text-[11px] font-bold pb-1 pt-2 px-3 rounded-sm hover:bg-green-700 active:bg-green-800 transition-colors whitespace-nowrap"
            >
              CREATE OFFER
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 shrink-0" />

        {/* Drawer body — filters + scrollable offer list */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Filter row */}
          <div className="flex items-center gap-1 px-4 py-2 bg-gray-50 border-b border-gray-200 shrink-0 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setFilterByCourse(!filterByCourse)}
              className="shrink-0"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </button>
            <p className="text-[11px] font-bold text-gray-600 shrink-0">:</p>
            <FilterButton label={selectedCourse.code} isActive={filterByCourse} onClick={() => setFilterByCourse(!filterByCourse)} />
            <FilterButton label="FOR YOU" isActive={filterForYou} onClick={() => setFilterForYou(!filterForYou)} />
            <FilterButton label="BY YOU" isActive={filterByYou} onClick={() => setFilterByYou(!filterByYou)} />
          </div>

          {/* Offer list */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {barterFeedContent}
          </div>
        </div>
      </div>

      {/* ── Modals & overlays ────────────────────────────────── */}

      <TradeConfirmationModal
        offer={modalOffer || {}}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAccept={handleExitClick}
        onCancel={handleExitClick}
        currentUser={currentUser}
        mode={modalMode}
        socketRef={socketRef}
      />

      <NotificationModal
        isOpen={showNotificationModal}
        onClose={handleCloseNotificationModal}
        notifications={notifications}
        parallelClasses={parallelClasses}
      />

      <ScheduleGraphModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        enrollments={enrollments}
        parallelClasses={parallelClasses}
        currentUser={currentUser}
      />

      {isFormOpen && (
        <CreateOfferForm onSuccess={() => {}} onClose={() => setIsFormOpen(false)} />
      )}

      {/* Toasts — offset above the drawer peek bar on mobile */}
      {toasts.length > 0 && (
        <div className="fixed bottom-20 md:bottom-4 right-4 z-50 flex flex-col gap-2">
          {toasts.map(toast => (
            <div key={toast.id} className="bg-red-600 text-white text-xs font-bold px-4 py-3 rounded shadow-lg max-w-xs flex items-start gap-2">
              <span className="shrink-0">⚠</span>
              <span>{toast.message}</span>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="ml-auto shrink-0 opacity-75 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tooltip — desktop only, pointless on touch */}
      {tooltipContent && (
        <div
          id="custom-tooltip"
          className="hidden md:block fixed pointer-events-none z-[99999] transition-opacity duration-150"
          style={{
            transform: `translate(${tooltipPos.current.x + 15}px, ${tooltipPos.current.y + 15}px)`,
            opacity: tooltipVisible ? 1 : 0,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="bg-gray-900 text-white text-[10px] px-2.5 py-1.5 rounded shadow-xl whitespace-nowrap">
            <div className="font-bold mb-0.5">Penawaran Barter Aktif</div>
            <div className="text-gray-300">Menawarkan: <span className="text-red-600 font-semibold">{tooltipContent.offeringClass}</span></div>
            <div className="text-gray-300">Mencari: <span className="text-green-400 font-semibold">{tooltipContent.seekingClass}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}