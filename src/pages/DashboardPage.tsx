import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import type { EnrichedOffer } from '../types';

// Tinggi peek bar yang selalu keliatan pas drawer tertutup
const PEEK_H = 80;

interface Course {
  code: string;
  name: string;
  type: number;
}

// --- Komponen Utama -------------------------------------------

export default function DashboardPage() {
  useEffect(() => {
    document.title = 'KRSwitch | Trading Floor';
  }, []);

  // --- State UI -----------------------------------------------
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSessionType, setSelectedSessionType] = useState('kuliah');
  const [filterByCourse, setFilterByCourse] = useState(false);
  const [filterForYou, setFilterForYou] = useState(true);
  const [filterByYou, setFilterByYou] = useState(false);
  const [modalOffer, setModalOffer] = useState<EnrichedOffer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'accept' | 'cancel'>('accept');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Dynamic empty state message depending on active filters
  const emptyStateText = useMemo(() => {
    const courseCode = selectedCourse?.code || 'this course';
    if (filterByYou) {
      if (filterByCourse) {
        return `You haven't created any barter offers for course ${courseCode}`;
      }
      return "You haven't created any barter offers";
    }
    if (filterForYou) {
      if (filterByCourse) {
        return `No active barter offers for course ${courseCode} matching your schedule`;
      }
      return "No active barter offers matching your schedule";
    }
    if (filterByCourse) {
      return `No active barter offers for course ${courseCode}`;
    }
    return "No active barter offers on the trading floor";
  }, [filterByCourse, filterForYou, filterByYou, selectedCourse?.code]);

  // State drawer mobile
  // null berarti ditutup (ada di bawah), number berarti posisi Y dalam pixel dari atas saat di-drag
  const [drawerY, setDrawerY] = useState<number | null>(null);
  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const drawerRef = useRef<HTMLDivElement | null>(null);
  const peekBarRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const liquidDropletRef = useRef<HTMLDivElement | null>(null);
  const realButtonRef = useRef<HTMLButtonElement | null>(null);
  const svgPathRef = useRef<SVGPathElement | null>(null);

  // Track info saat drag dimulai
  const dragRef = useRef<{ 
      startY: number; 
      initialDrawerY: number;
      history: { y: number; t: number }[];
      timeoutId?: NodeJS.Timeout;
  } | null>(null);

  // Ref buat nengahin kartu di mobile
  const userCardRef = useRef<HTMLDivElement | null>(null);
  const cardScrollContainerRef = useRef<HTMLDivElement | null>(null);

  // --- Data ---------------------------------------------------
  const {
    users, parallelClasses,
    enrollments, setEnrollments,
    currentUser,
    apiOffers, setApiOffers,
    notifications, setNotifications,
    loading, usersRef, parallelClassesRef,
  } = useDashboardData();

  // --- Derived / Komputasi ------------------------------------
  const courses = useMemo<Course[]>(() => {
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
      .filter((o): o is EnrichedOffer => o !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [apiOffers, users, parallelClasses]);

  const myEnrollmentMap = useMemo<Record<string, string>>(() => {
    if (!currentUser) return {};
    const map: Record<string, string> = {};
    enrollments
      .filter(e => e.nim === currentUser.nim)
      .forEach(e => {
        const pc = parallelClasses.find(c => c.id === e.parallelClassId);
        if (pc) {
          const type = pc.classCode[0]; // 'K', 'P', atau 'R'
          const key = `${pc.courseCode}-${type}`;
          map[key] = pc.classCode;
        }
      });
    return map;
  }, [currentUser, enrollments, parallelClasses]);

  const shouldBeVisibleIds = useMemo(() => {
    return new Set(enrichedOffers.filter(offer => {
      // 1. Filter berdasarkan mata kuliah
      if (filterByCourse && offer.seekingCourse !== selectedCourse?.code) return false;

      // 2. Filter bikinan kamu sendiri
      if (filterByYou && offer.nim !== currentUser?.nim) return false;

      // 3. Filter buat kamu (bisa kamu ambil sekarang)
      if (filterForYou) {
        // Gak bisa ngambil tawaran barter sendiri
        if (offer.nim === currentUser?.nim) return false;

        // Harus punya kelas yang mereka cari
        const type = offer.seekingClass[0]; // 'K', 'P', atau 'R'
        const key = `${offer.seekingCourse}-${type}`;
        if (myEnrollmentMap[key] !== offer.seekingClass) return false;

        // Gak boleh bentrok sama jadwal kamu
        const incomingClass = parallelClasses.find(
          pc => pc.courseCode === offer.seekingCourse && pc.classCode === offer.offeringClass
        );
        if (incomingClass) {
          const hasConflict = hasScheduleConflict(incomingClass.id, currentUser?.nim || '', enrollments, parallelClasses);
          if (hasConflict) return false;
        }
      }

      return true;
    }).map(o => o.id));
  }, [enrichedOffers, filterByCourse, filterForYou, filterByYou, selectedCourse?.code, myEnrollmentMap, currentUser?.nim, enrollments, parallelClasses]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // --- Animasi ------------------------------------------------
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

  // --- Pemilihan mata kuliah ----------------------------------
  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) setSelectedCourse(courses[0]);
  }, [courses, selectedCourse]);

  useEffect(() => {
    setSelectedSessionType('kuliah');
  }, [selectedCourse?.code]);

  // --- Tengahkan kartu kelas user di mobile abis animasi kartu beres ---
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth >= 768) return;

    const timeout = setTimeout(() => {
      const card = userCardRef.current;
      const container = cardScrollContainerRef.current;
      if (!card || !container) return;

      const containerRect = container.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      const targetScrollLeft =
        container.scrollLeft +
        cardRect.left - containerRect.left +
        cardRect.width / 2 -
        containerRect.width / 2;

      container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
    }, 400);

    return () => clearTimeout(timeout);
  }, [selectedCourse?.code, selectedSessionType, myEnrollmentMap]);

  // --- Handler ------------------------------------------------
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

  // --- Touch handler buat drawer mobile -----------------------
  const handleDragStart = (clientY: number) => {
    const TRAVEL = window.innerHeight * 0.88 - PEEK_H;
    let initialDrawerY = drawerY !== null ? drawerY : TRAVEL;

    if (dragRef.current?.timeoutId) {
        clearTimeout(dragRef.current.timeoutId);
    }

    // Tangkap posisi drawer secara real-time jika sedang di tengah animasi lemparan
    if (drawerRef.current) {
        const style = window.getComputedStyle(drawerRef.current);
        if (style.transform && style.transform !== 'none') {
            const matrix = new DOMMatrix(style.transform);
            initialDrawerY = matrix.m42;
        }
        // Hentikan CSS transition seketika agar drawer menempel di jari
        drawerRef.current.style.transition = 'none';
        drawerRef.current.style.transform = `translateY(${initialDrawerY}px)`;
    }

    dragRef.current = { 
        startY: clientY, 
        initialDrawerY,
        history: [{ y: clientY, t: Date.now() }]
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current || !drawerRef.current) return;

      if (e.cancelable) e.preventDefault();

      const currentClientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
      const delta = currentClientY - dragRef.current.startY;
      const clampedY = Math.max(0, Math.min(TRAVEL, dragRef.current.initialDrawerY + delta));
      
      const now = Date.now();
      dragRef.current.history.push({ y: currentClientY, t: now });
      if (dragRef.current.history.length > 5) dragRef.current.history.shift();

      // Manipulasi DOM langsung biar 60fps
      drawerRef.current.style.transition = 'none';
      drawerRef.current.style.transform = `translateY(${clampedY}px)`;
      const progress = 1 - (clampedY / TRAVEL);
      drawerRef.current.style.filter = `drop-shadow(0 -6px 24px rgba(0,0,0,${0.25 + 0.25 * progress}))`;

      const distancePulled = TRAVEL - clampedY;
      let rawBtn = Math.min(1, Math.max(0, distancePulled / 150));
      const btnProgress = rawBtn * rawBtn * (3 - 2 * rawBtn); // ease-in-out

      if (backdropRef.current) {
        backdropRef.current.style.transition = 'none';
        backdropRef.current.style.opacity = String(btnProgress);
        backdropRef.current.style.backdropFilter = `blur(${5 * btnProgress}px)`;
      }

      // Animasi gooey button mengikuti tarikan drawer
      const p = btnProgress;
      const dropY = 110 - (60 * p);
      const dropScale = 0.4 + (0.6 * p);
      const svgY = 88 - (42 * p);

      if (liquidDropletRef.current) {
        liquidDropletRef.current.style.transition = 'none';
        liquidDropletRef.current.style.transform = `translateY(${dropY}px) scale(${dropScale})`;
        liquidDropletRef.current.style.filter = `blur(${10 * (1 - p)}px)`;
      }
      if (realButtonRef.current && svgPathRef.current) {
        realButtonRef.current.style.transition = 'none';
        realButtonRef.current.style.transform = `translateY(${svgY}px)`;
        realButtonRef.current.style.boxShadow = 'none';
        realButtonRef.current.style.pointerEvents = p > 0.8 ? 'auto' : 'none';
        
        const lx = -20 + (13 * p);
        const ly = 0 + (-3.5 * p);
        const mx = 0;
        const my = 0 + (3.5 * p);
        const rx = 20 + (-13 * p);
        const ry = 0 + (-3.5 * p);
        const sw = 4 + (-1.5 * p);
        svgPathRef.current.style.transition = 'none';
        svgPathRef.current.setAttribute('d', `M ${lx} ${ly} L ${mx} ${my} L ${rx} ${ry}`);
        svgPathRef.current.setAttribute('stroke-width', String(sw));
      }
    };

    const handleEnd = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current || !drawerRef.current) return;

      const currentClientY = 'changedTouches' in e ? (e as TouchEvent).changedTouches[0].clientY : (e as MouseEvent).clientY;
      const delta = currentClientY - dragRef.current.startY;

      const TRAVEL = window.innerHeight * 0.88 - PEEK_H;
      const finalY = Math.max(0, Math.min(TRAVEL, dragRef.current.initialDrawerY + delta));

      const now = Date.now();
      const history = dragRef.current.history;
      let velocity = 0;
      if (history.length > 1) {
          const oldest = history[0];
          const dt = now - oldest.t;
          if (dt > 0) velocity = (currentClientY - oldest.y) / dt;
      }

      let isClosing = false;
      let targetY = finalY;
      
      const VELOCITY_THRESHOLD = 0.4; // px per ms

      if (velocity < -VELOCITY_THRESHOLD) {
          targetY = 0; // Terlempar ke atas
      } else if (velocity > VELOCITY_THRESHOLD) {
          targetY = TRAVEL; // Terlempar ke bawah
          isClosing = true;
      } else {
          const SNAP_THRESHOLD = 150;
          if (TRAVEL - finalY < SNAP_THRESHOLD) {
             targetY = TRAVEL;
             isClosing = true;
          }
      }

      // Bersihkan event listener
      cleanup();

      // Force browser reflow to ensure transitions apply correctly
      void drawerRef.current.offsetHeight;

      // Set transform secara manual untuk transisi CSS
      const targetProgress = 1 - (targetY / TRAVEL);
      if (drawerRef.current) {
        drawerRef.current.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), filter 0.35s ease';
        drawerRef.current.style.transform = `translateY(${targetY}px)`;
        drawerRef.current.style.filter = `drop-shadow(0 -6px 24px rgba(0,0,0,${0.25 + 0.25 * targetProgress}))`;
      }

      const distancePulledEnd = TRAVEL - targetY;
      let rawBtnEnd = Math.min(1, Math.max(0, distancePulledEnd / 150));
      const btnProgressEnd = rawBtnEnd * rawBtnEnd * (3 - 2 * rawBtnEnd);

      if (backdropRef.current) {
        backdropRef.current.style.transition = 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), backdrop-filter 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
        backdropRef.current.style.opacity = isClosing ? '0' : String(btnProgressEnd);
        backdropRef.current.style.backdropFilter = isClosing ? 'blur(0px)' : `blur(${5 * btnProgressEnd}px)`;
      }

      const p = btnProgressEnd;
      const dropY = 110 - (60 * p);
      const dropScale = 0.4 + (0.6 * p);
      const svgY = 88 - (42 * p);

      if (liquidDropletRef.current) {
        liquidDropletRef.current.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), filter 0.35s ease';
        liquidDropletRef.current.style.transform = `translateY(${dropY}px) scale(${dropScale})`;
        liquidDropletRef.current.style.filter = `blur(${10 * (1 - p)}px)`;
      }
      if (realButtonRef.current && svgPathRef.current) {
        realButtonRef.current.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
        realButtonRef.current.style.transform = `translateY(${svgY}px)`;
        realButtonRef.current.style.boxShadow = 'none';
        realButtonRef.current.style.pointerEvents = p > 0.8 ? 'auto' : 'none';

        const lx = -20 + (13 * p);
        const ly = 0 + (-3.5 * p);
        const mx = 0;
        const my = 0 + (3.5 * p);
        const rx = 20 + (-13 * p);
        const ry = 0 + (-3.5 * p);
        const sw = 4 + (-1.5 * p);
        
        svgPathRef.current.style.transition = 'd 0.35s cubic-bezier(0.16, 1, 0.3, 1), stroke-width 0.35s ease';
        svgPathRef.current.setAttribute('d', `M ${lx} ${ly} L ${mx} ${my} L ${rx} ${ry}`);
        svgPathRef.current.setAttribute('stroke-width', String(sw));
      }

      // Sinkronisasi state React SETELAH CSS animation benar-benar selesai dan menetap (400ms)
      const timeoutId = setTimeout(() => {
          if (dragRef.current) {
              dragRef.current.timeoutId = undefined;
          }
          if (isClosing) {
            setDrawerY(null);
          } else {
            setDrawerY(targetY);
          }
      }, 400);

      if (dragRef.current) {
          dragRef.current.timeoutId = timeoutId;
      }
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e);
    const onTouchMove = (e: TouchEvent) => handleMove(e);
    const onMouseUp = (e: MouseEvent) => handleEnd(e);
    const onTouchEnd = (e: TouchEvent) => handleEnd(e);

    const cleanup = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchend', onTouchEnd);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onTouchEnd);
  };

  // Derived state untuk sinkronisasi render React
  const TRAVEL_VAL = windowHeight * 0.88 - PEEK_H;
  const currentY = drawerY !== null ? drawerY : TRAVEL_VAL;
  const drawerProgress = 1 - (currentY / TRAVEL_VAL);
  const distancePulledVal = TRAVEL_VAL - currentY;
  const rawBtnVal = Math.min(1, Math.max(0, distancePulledVal / 150));
  const btnProgVal = rawBtnVal * rawBtnVal * (3 - 2 * rawBtnVal);
  const dropY = 110 - (60 * btnProgVal);
  const dropScale = 0.4 + (0.6 * btnProgVal);
  const svgY = 88 - (42 * btnProgVal);
  const lxVal = -20 + (13 * btnProgVal);
  const lyVal = 0 + (-3.5 * btnProgVal);
  const mxVal = 0;
  const myVal = 0 + (3.5 * btnProgVal);
  const rxVal = 20 + (-13 * btnProgVal);
  const ryVal = 0 + (-3.5 * btnProgVal);
  const swVal = 4 + (-1.5 * btnProgVal);

  // --- Render -------------------------------------------------
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!selectedCourse || !currentUser) return null;

  const filteredClasses = parallelClasses.filter(pc => {
    if (pc.courseCode !== selectedCourse.code) return false;
    const prefix = pc.classCode[0].toLowerCase();
    return (
      (selectedSessionType === 'kuliah' && prefix === 'k') ||
      (selectedSessionType === 'praktikum' && prefix === 'p') ||
      (selectedSessionType === 'responsi' && prefix === 'r')
    );
  });



  // Konten live barter feed bersama (dipakai di panel desktop & drawer mobile)
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
      {/* SVG Filters for Gooey Effect */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

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
        onCourseSelect={(c) => setSelectedCourse(c as any)}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* Kelas paralel */}
        <div className="flex-1 min-w-0 md:border-r border-gray-200 flex flex-col overflow-hidden pb-16 md:pb-0">
          <SessionTypeTabs
            courseType={selectedCourse.type}
            selectedSessionType={selectedSessionType}
            onSessionTypeSelect={setSelectedSessionType}
          />
          <div ref={cardScrollContainerRef} className="flex-1 flex gap-1 overflow-x-auto overflow-y-hidden p-2 md:p-4 bg-gray-50">
            {filteredClasses.map((pc, index) => {
              const isUserClass = myEnrollmentMap[`${selectedCourse.code}-${pc.classCode[0]}`] === pc.classCode;
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

        {/* Panel barter versi desktop */}
        <div className="hidden md:flex w-[470px] shrink-0 bg-white flex-col overflow-hidden border-l border-gray-200">
          <div className="flex flex-col items-left px-4 py-3 bg-gray-50 shrink-0 border-b border-gray-200">
            <div className="flex flex-row gap-1 items-center">
              <div className="mr-auto flex flex-col items-left">
                <h2 className="text-xs font-bold text-gray-900">LIVE BARTER FEED PANEL</h2>
                <h1 className="text-[11px] font-medium text-gray-600">Real Time: {offersToDisplay.length} Offers</h1>
              </div>
              <FilterButton
                label="ALL"
                isActive={!filterByCourse && !filterForYou && !filterByYou}
                onClick={() => {
                  setFilterByCourse(false);
                  setFilterForYou(false);
                  setFilterByYou(false);
                }}
              />
              <FilterButton
                label={selectedCourse?.code || 'MATKUL'}
                isActive={filterByCourse}
                onClick={() => setFilterByCourse(!filterByCourse)}
              />
              <FilterButton
                label="BY YOU"
                isActive={filterByYou}
                onClick={() => {
                  const newVal = !filterByYou;
                  setFilterByYou(newVal);
                  if (newVal) setFilterForYou(false);
                }}
              />
              <FilterButton
                label="FOR YOU"
                isActive={filterForYou}
                onClick={() => {
                  const newVal = !filterForYou;
                  setFilterForYou(newVal);
                  if (newVal) setFilterByYou(false);
                }}
              />
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

      {/* Drawer bawah versi mobile */}

      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="md:hidden fixed inset-0 z-30 bg-[#0f2930]/20 pointer-events-none"
        style={{
          opacity: btnProgVal,
          backdropFilter: `blur(${5 * btnProgVal}px)`,
          transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), backdrop-filter 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: drawerY !== null ? 'auto' : 'none',
        }}
        onClick={() => setDrawerY(null)}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-[88vh] bg-white rounded-t-2xl flex flex-col"
        style={{
          transform: `translateY(${currentY}px)`,
          filter: `drop-shadow(0 -6px 24px rgba(0,0,0,${0.25 + 0.25 * drawerProgress}))`,
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), filter 0.35s ease',
        }}
      >
        {/* SVG Morphing Handle (In front of drawer) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[-100px] w-[140px] h-[150px] pointer-events-none z-20">
          <button 
             ref={realButtonRef}
             onClick={(e) => { e.stopPropagation(); setDrawerY(null); }}
             className="absolute left-1/2 -translate-x-1/2 w-[48px] h-[48px] bg-transparent rounded-full flex items-center justify-center border-0 cursor-pointer pointer-events-auto"
             style={{
                transform: `translateY(${svgY}px)`,
                transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: 'none',
                pointerEvents: btnProgVal > 0.8 ? 'auto' : 'none',
                color: '#4b5563' // text-gray-600
             }}
          >
             <svg width="48" height="48" viewBox="-24 -24 48 48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <path 
                   ref={svgPathRef} 
                   d={`M ${lxVal} ${lyVal} L ${mxVal} ${myVal} L ${rxVal} ${ryVal}`} 
                   strokeWidth={swVal}
                   style={{ transition: 'd 0.35s cubic-bezier(0.16, 1, 0.3, 1), stroke-width 0.35s ease' }}
                />
             </svg>
          </button>
        </div>

        {/* Gooey Close Button Container (Behind the drawer) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[-100px] w-[140px] h-[150px] pointer-events-none -z-10">

          {/* Gooey Blob Layer */}
          <div className="absolute inset-0 pointer-events-none" style={{ filter: 'url(#goo)' }}>
            {/* Base attached to drawer top (but hidden behind it) */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80px] h-[30px] bg-white rounded-t-full" />
            {/* Liquid Droplet */}
            <div
              ref={liquidDropletRef}
              className="absolute left-1/2 -translate-x-1/2 w-[40px] h-[40px] bg-white rounded-full"
              style={{
                transform: `translateY(${dropY}px) scale(${dropScale})`,
                filter: `blur(${10 * (1 - btnProgVal)}px)`,
                transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), filter 0.35s ease'
              }}
            />
          </div>
        </div>

        {/* Peek bar */}
        <div
          ref={peekBarRef}
          className="shrink-0 px-4 pt-2.5 pb-4 cursor-pointer select-none"
          style={{ height: PEEK_H, touchAction: 'none' }}
          onMouseDown={(e) => handleDragStart(e.clientY)}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
        >
          {/* Pill pegangan buat drag dihapus, karena digantikan oleh SVG Morphing Handle di atas */}
          <div className="h-1 mb-2" /> {/* Spacer untuk mempertahankan posisi title */}

          {/* Judul + bikin instan */}
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
              className="shrink-0 bg-green-600 text-white text-[11px] font-bold py-2 px-3 rounded-sm hover:bg-green-700 active:bg-green-800 transition-colors whitespace-nowrap border-0"
            >
              CREATE OFFER
            </button>
          </div>
        </div>

        {/* Pembatas */}
        <div className="h-px bg-gray-200 shrink-0" />

        {/* Isi drawer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Filter row */}
          <div className="flex items-center gap-1 px-4 py-2 bg-gray-50 border-b border-gray-200 shrink-0 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            <FilterButton
              label="ALL"
              isActive={!filterByCourse && !filterForYou && !filterByYou}
              onClick={() => {
                setFilterByCourse(false);
                setFilterForYou(false);
                setFilterByYou(false);
              }}
            />
            <FilterButton
              label={selectedCourse?.code || 'MATKUL'}
              isActive={filterByCourse}
              onClick={() => setFilterByCourse(!filterByCourse)}
            />
            <FilterButton
              label="BY YOU"
              isActive={filterByYou}
              onClick={() => {
                const newVal = !filterByYou;
                setFilterByYou(newVal);
                if (newVal) setFilterForYou(false);
              }}
            />
            <FilterButton
              label="FOR YOU"
              isActive={filterForYou}
              onClick={() => {
                const newVal = !filterForYou;
                setFilterForYou(newVal);
                if (newVal) setFilterByYou(false);
              }}
            />
          </div>

          {/* Offer list */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {barterFeedContent}
          </div>
        </div>
      </div>

      {/* Modal & overlay */}

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
        <CreateOfferForm onSuccess={() => { }} onClose={() => setIsFormOpen(false)} />
      )}

      {/* Toast */}
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

      {/* Tooltip */}
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
