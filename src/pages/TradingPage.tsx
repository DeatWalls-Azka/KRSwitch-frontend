import React, { useEffect } from 'react';
import { markAllNotificationsRead } from '../api';

import DashboardHeader from '../components/dash/DashboardHeader';
import CourseFilterTabs from '../components/dash/tabs/CourseFilterTabs';
import BarterCard from '../components/dash/cards/BarterCard';
import CreateOfferModal from '../components/dash/modals/CreateOfferModal';
import TradeConfirmationModal from '../components/dash/modals/TradeConfirmationModal';
import NotificationModal from '../components/dash/modals/NotificationModal';
import ScheduleGraphModal from '../components/dash/modals/ScheduleGraphModal';

import MainClassGrid from '../components/dash/layout/MainClassGrid';
import DesktopBarterPanel from '../components/dash/layout/DesktopBarterPanel';
import MobileBarterDrawer from '../components/dash/layout/MobileBarterDrawer';

import { useDashboardData } from '../hooks/useDashboardData';
import { useSocket } from '../hooks/useSocket';
import { useOfferAnimations } from '../hooks/useOfferAnimations';
import { useTooltip } from '../hooks/useTooltip';
import { useTradingState } from '../hooks/useTradingState';
import { hasScheduleConflict } from '../utils/offerUtils';
import type { EnrichedOffer } from '../types';

export default function TradingPage() {
  useEffect(() => {
    document.title = 'KRSwitch | Trading Floor';
  }, []);

  // --- Data ---
  const dashboardData = useDashboardData();
  const {
    users, parallelClasses, enrollments, setEnrollments,
    currentUser, setApiOffers, notifications, setNotifications,
    loading, usersRef, parallelClassesRef,
  } = dashboardData;

  // --- State ---
  const state = useTradingState(dashboardData);
  const {
    courses, selectedCourse, setSelectedCourse,
    selectedSessionType, setSelectedSessionType,
    filterByCourse, setFilterByCourse,
    filterForYou, setFilterForYou,
    filterByYou, setFilterByYou,
    enrichedOffers, myEnrollmentMap, shouldBeVisibleIds,
    emptyStateText, unreadCount, lastRealCourseTypeRef,
  } = state;

  // --- Modals State ---
  const [modalOffer, setModalOffer] = React.useState<EnrichedOffer | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<'accept' | 'cancel'>('accept');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [showNotificationModal, setShowNotificationModal] = React.useState(false);
  const [showScheduleModal, setShowScheduleModal] = React.useState(false);
  const [drawerY, setDrawerY] = React.useState<number | null>(null);

  // --- Animasi ---
  const {
    exitingOfferIds, enteringOfferIds, offersToDisplay,
    exitingOffersCache, startExitAnimation, animationLockRef,
  } = useOfferAnimations({ shouldBeVisibleIds, enrichedOffers });

  // --- Socket ---
  const { socketRef, isConnected, onlineCount, toasts, setToasts } = useSocket({
    currentUser, usersRef, parallelClassesRef,
    setApiOffers, setEnrollments, setNotifications,
    exitingOffersCache,
  });

  // --- Tooltip ---
  const { tooltipContent, setTooltipContent, tooltipVisible, tooltipPos, handleMouseMove } = useTooltip();

  // --- Handlers ---
  const handleCompactCardClick = (pc: any) => {
    const targetCourse = courses.find(c => c.code === pc.courseCode);
    if (targetCourse) {
      setSelectedCourse(targetCourse);
      const prefix = pc.classCode[0].toLowerCase();
      if (prefix === 'k') setSelectedSessionType('kuliah');
      else if (prefix === 'p') setSelectedSessionType('praktikum');
      else if (prefix === 'r') setSelectedSessionType('responsi');
      
      setFilterByCourse(true);
      setFilterForYou(false);
      setFilterByYou(false);
      setDrawerY(null);
    }
  };

  const handleExitClick = (offerId: number) => {
    if (animationLockRef.current) return;
    startExitAnimation([offerId]);
  };

  const handleOpenModal = (offer: EnrichedOffer, mode: 'accept' | 'cancel' = 'accept') => {
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!selectedCourse || !currentUser) return null;

  const filteredClasses = parallelClasses.filter(pc => {
    if (selectedCourse.type === -1) {
      return enrollments.some(e => e.nim === currentUser?.nim && e.parallelClassId === pc.id);
    }
    if (pc.courseCode !== selectedCourse.code) return false;
    const prefix = pc.classCode[0].toLowerCase();
    return (
      (selectedSessionType === 'kuliah' && prefix === 'k') ||
      (selectedSessionType === 'praktikum' && prefix === 'p') ||
      (selectedSessionType === 'responsi' && prefix === 'r')
    );
  });

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
            ? hasScheduleConflict(incomingClass.id, currentUser?.nim || '', enrollments, parallelClasses)
            : false;

          return (
            <BarterCard
              key={offer.id}
              offer={offer}
              index={index}
              exitIndex={isExiting ? exitingOfferIds.get(offer.id) : 0}
              shouldExit={isExiting}
              shouldEnter={isEntering}
              canAccept={myEnrollmentMap[`${offer.seekingCourse}-${offer.seekingClass[0]}`] === offer.seekingClass}
              conflictsWithSchedule={conflictsWithSchedule}
              isOwnOffer={offer.nim === currentUser?.nim}
              onAnimationComplete={() => { }}
              onOpenModal={handleOpenModal}
            />
          );
        })
      ) : (
        <p className="text-center py-10 px-5 text-gray-400 text-xs italic font-medium tracking-wide">{emptyStateText}</p>
      )}
    </>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <DashboardHeader
        isConnected={isConnected}
        user={currentUser}
        onlineCount={onlineCount}
        unreadCount={unreadCount}
        onOpenNotifications={() => setShowNotificationModal(true)}
        onOpenSchedule={() => setShowScheduleModal(true)}
      />

      <CourseFilterTabs
        courses={courses}
        selectedCourse={selectedCourse}
        onCourseSelect={(c) => setSelectedCourse(c as any)}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <MainClassGrid
          selectedCourse={selectedCourse}
          selectedSessionType={selectedSessionType}
          setSelectedSessionType={setSelectedSessionType}
          lastRealCourseTypeRef={lastRealCourseTypeRef}
          filteredClasses={filteredClasses}
          myEnrollmentMap={myEnrollmentMap}
          enrollments={enrollments}
          users={users}
          enrichedOffers={enrichedOffers}
          currentUserNim={currentUser.nim}
          setTooltipContent={setTooltipContent}
          handleMouseMove={handleMouseMove}
          handleCompactCardClick={handleCompactCardClick}
        />

        <DesktopBarterPanel
          offersCount={offersToDisplay.length}
          selectedCourseCode={selectedCourse.code}
          isKelasSaya={selectedCourse.type === -1}
          filterByCourse={filterByCourse}
          setFilterByCourse={setFilterByCourse}
          filterForYou={filterForYou}
          setFilterForYou={setFilterForYou}
          filterByYou={filterByYou}
          setFilterByYou={setFilterByYou}
          onOpenCreateOffer={() => setIsFormOpen(true)}
        >
          {barterFeedContent}
        </DesktopBarterPanel>
      </div>

      <MobileBarterDrawer
        drawerY={drawerY}
        setDrawerY={setDrawerY}
        offersCount={offersToDisplay.length}
        selectedCourseCode={selectedCourse.code}
        isKelasSaya={selectedCourse.type === -1}
        filterByCourse={filterByCourse}
        setFilterByCourse={setFilterByCourse}
        filterForYou={filterForYou}
        setFilterForYou={setFilterForYou}
        filterByYou={filterByYou}
        setFilterByYou={setFilterByYou}
        onOpenCreateOffer={() => setIsFormOpen(true)}
      >
        {barterFeedContent}
      </MobileBarterDrawer>

      <TradeConfirmationModal
        offer={modalOffer}
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
        <CreateOfferModal onSuccess={() => { }} onClose={() => setIsFormOpen(false)} />
      )}

      {toasts.length > 0 && (
        <div className="fixed bottom-20 md:bottom-4 right-4 z-50 flex flex-col gap-2">
          {toasts.map(toast => (
            <div key={toast.id} className="bg-red-600 text-white text-xs font-bold px-4 py-3 rounded shadow-lg max-w-xs flex items-start gap-2">
              <span className="shrink-0"></span>
              <span>{toast.message}</span>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="ml-auto shrink-0 opacity-75 hover:opacity-100 bg-transparent border-0 cursor-pointer text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {tooltipContent && (
        <div
          id="custom-tooltip"
          className="hidden md:block fixed pointer-events-none z-[99999] transition-opacity duration-150"
          style={{
            transform: `translate(${tooltipPos.current.x + 15}px, ${tooltipPos.current.y + 15}px)`,
            opacity: tooltipVisible ? 1 : 0,
            willChange: 'transform',
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
