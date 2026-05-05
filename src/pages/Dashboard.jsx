import { useState, useEffect, useMemo } from 'react';
import { markAllNotificationsRead } from '../api';

import Header from '../components/dash/Header';
import CourseTabs from '../components/dash/CourseTabs';
import SessionTypeTabs from '../components/dash/SessionTypeTabs';
import ClassCard from '../components/dash/ClassCard';
import BarterCard from '../components/dash/BarterCard';
import TradeConfirmationModal from '../components/dash/TradeConfirmationModal';
import NotificationModal from '../components/dash/NotificationModal';
import FilterButton from '../components/dash/FilterButton';
import CreateOfferForm from '../components/dash/CreateOfferForm';
import ScheduleGraphModal from '../components/dash/ScheduleGraphModal';

import { useDashboardData } from '../hooks/useDashboardData';
import { useSocket } from '../hooks/useSocket';
import { useOfferAnimations } from '../hooks/useOfferAnimations';
import { useTooltip } from '../hooks/useTooltip';
import { enrichOffer, getStudentsInClass } from '../utils/offerUtils';

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
    currentUser,
    usersRef,
    parallelClassesRef,
    setApiOffers,
    setEnrollments,
    setNotifications,
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

  return (
    <div className="h-screen flex flex-col font-mono bg-gray-50">
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

        {/* Kiri: class cards */}
        <div className="flex-1 min-w-0 border-r border-gray-200 flex flex-col order-2 md:order-1 h-full">
          <SessionTypeTabs
            courseType={selectedCourse.type}
            selectedSessionType={selectedSessionType}
            onSessionTypeSelect={setSelectedSessionType}
          />
          <div className="flex-1 flex gap-3 overflow-x-auto overflow-y-hidden p-4 bg-gray-50">
            {filteredClasses.map((pc, index) => (
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
            ))}
          </div>
        </div>

        {/* Kanan: barter feed */}
        <div className="w-full md:w-117.5 shrink-0 bg-white flex flex-col overflow-hidden order-1 md:order-2 border-b md:border-b-0 md:border-l border-gray-200 h-[40%] md:h-auto">
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
            {offersToDisplay.length > 0 ? (
              offersToDisplay.map((offer, index) => {
                const isExiting = exitingOfferIds.has(offer.id);
                const isEntering = enteringOfferIds.has(offer.id);
                return (
                  <BarterCard
                    key={offer.id}
                    offer={offer}
                    index={index}
                    exitIndex={isExiting ? exitingOfferIds.get(offer.id) : 0}
                    shouldExit={isExiting}
                    shouldEnter={isEntering}
                    canAccept={myEnrollmentMap[offer.seekingCourse] === offer.seekingClass}
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

      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
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

      {tooltipContent && (
        <div
          id="custom-tooltip"
          className="fixed pointer-events-none z-99999 transition-opacity duration-150"
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