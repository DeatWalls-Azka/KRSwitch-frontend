import React, { useState, useEffect, useRef } from 'react';

const PEEK_H = 75;

interface MobileBarterDrawerProps {
  drawerY: number | null;
  setDrawerY: (y: number | null) => void;
  offersCount: number;
  selectedCourseCode?: string;
  isKelasSaya: boolean;
  filterByCourse: boolean;
  setFilterByCourse: (val: boolean) => void;
  filterForYou: boolean;
  setFilterForYou: (val: boolean) => void;
  filterByYou: boolean;
  setFilterByYou: (val: boolean) => void;
  onOpenCreateOffer: () => void;
  children: React.ReactNode;
}

export default function MobileBarterDrawer({
  drawerY,
  setDrawerY,
  offersCount,
  selectedCourseCode,
  isKelasSaya,
  filterByCourse,
  setFilterByCourse,
  filterForYou,
  setFilterForYou,
  filterByYou,
  setFilterByYou,
  onOpenCreateOffer,
  children
}: MobileBarterDrawerProps) {
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

  const dragRef = useRef<{ 
      startY: number; 
      initialDrawerY: number;
      history: { y: number; t: number }[];
      timeoutId?: ReturnType<typeof setTimeout>;
  } | null>(null);

  const handleDragStart = (clientY: number) => {
    const TRAVEL = window.innerHeight * 0.88 - PEEK_H;
    let initialDrawerY = drawerY !== null ? drawerY : TRAVEL;

    if (dragRef.current?.timeoutId) {
        clearTimeout(dragRef.current.timeoutId);
    }

    if (drawerRef.current) {
        const style = window.getComputedStyle(drawerRef.current);
        if (style.transform && style.transform !== 'none') {
            const matrix = new DOMMatrix(style.transform);
            initialDrawerY = matrix.m42;
        }
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

      drawerRef.current.style.transition = 'none';
      drawerRef.current.style.transform = `translateY(${clampedY}px)`;
      const progress = 1 - (clampedY / TRAVEL);
      drawerRef.current.style.filter = `drop-shadow(0 -6px 24px rgba(0,0,0,${0.25 + 0.25 * progress}))`;

      const distancePulled = TRAVEL - clampedY;
      let rawBtn = Math.min(1, Math.max(0, distancePulled / 150));
      const btnProgress = rawBtn * rawBtn * (3 - 2 * rawBtn);

      if (backdropRef.current) {
        backdropRef.current.style.transition = 'none';
        backdropRef.current.style.opacity = String(btnProgress);
        backdropRef.current.style.backdropFilter = `blur(${5 * btnProgress}px)`;
      }

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
      const VELOCITY_THRESHOLD = 0.4;

      if (velocity < -VELOCITY_THRESHOLD) {
          targetY = 0; 
      } else if (velocity > VELOCITY_THRESHOLD) {
          targetY = TRAVEL;
          isClosing = true;
      } else {
          const SNAP_THRESHOLD = 150;
          if (TRAVEL - finalY < SNAP_THRESHOLD) {
             targetY = TRAVEL;
             isClosing = true;
          }
      }

      cleanup();
      void drawerRef.current.offsetHeight;

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

      const timeoutId = setTimeout(() => {
          if (dragRef.current) dragRef.current.timeoutId = undefined;
          setDrawerY(isClosing ? null : targetY);
      }, 400);

      if (dragRef.current) dragRef.current.timeoutId = timeoutId;
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

  return (
    <>
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

      <div
        ref={drawerRef}
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 rounded-t-2xl flex flex-col"
        style={{
          height: `${windowHeight * 0.88}px`,
          transform: `translateY(${currentY}px)`,
          filter: `drop-shadow(0 -6px 24px rgba(0,0,0,${0.25 + 0.25 * drawerProgress}))`,
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), filter 0.35s ease',
        }}
      >
        <div className="absolute left-1/2 -translate-x-1/2 top-[-100px] w-[140px] h-[150px] pointer-events-none z-20">
          <button 
             ref={realButtonRef}
             onClick={(e) => { e.stopPropagation(); setDrawerY(null); }}
             className="absolute left-1/2 -translate-x-1/2 w-[48px] h-[48px] bg-transparent rounded-full flex items-center justify-center border-0 cursor-pointer pointer-events-auto text-gray-600 dark:text-gray-400"
             style={{
                transform: `translateY(${svgY}px)`,
                transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: 'none',
                pointerEvents: btnProgVal > 0.8 ? 'auto' : 'none'
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

        <div className="absolute left-1/2 -translate-x-1/2 top-[-100px] w-[140px] h-[150px] pointer-events-none -z-10">
          <div className="absolute inset-0 pointer-events-none" style={{ filter: 'url(#goo)' }}>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80px] h-[30px] bg-white dark:bg-gray-900 rounded-t-full" />
            <div
              ref={liquidDropletRef}
              className="absolute left-1/2 -translate-x-1/2 w-[40px] h-[40px] bg-white dark:bg-gray-900 rounded-full"
              style={{
                transform: `translateY(${dropY}px) scale(${dropScale})`,
                filter: `blur(${10 * (1 - btnProgVal)}px)`,
                transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), filter 0.35s ease'
              }}
            />
          </div>
        </div>

        <div
          ref={peekBarRef}
          className="h-[75px] shrink-0 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-5 relative z-10 cursor-grab active:cursor-grabbing bg-white dark:bg-gray-900 rounded-t-2xl pt-2"
          onMouseDown={(e) => handleDragStart(e.clientY)}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
        >
          <div className="flex flex-col items-left">
            <h2 className="text-xs font-bold text-gray-900 dark:text-gray-100 tracking-wide">LIVE BARTER FEED PANEL</h2>
            <h1 className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Real Time: {offersCount} Offers</h1>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenCreateOffer();
            }}
            className="bg-green-600 text-white text-[10px] font-bold py-1.5 px-3 rounded-md border border-solid border-green-600 cursor-pointer hover:bg-green-700 active:bg-green-800 transition-colors shadow-sm"
          >
            CREATE OFFER
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 relative z-10 overscroll-contain">
          {/* Row 2: Justified Filters (stretched pills) - Sticky under header when expanded */}
          <div className="sticky top-0 bg-gray-50 dark:bg-gray-950 px-4 py-3 z-20 border-b border-gray-200 dark:border-gray-800 flex flex-row w-full gap-1 items-center">
            <button
              onClick={() => {
                setFilterByCourse(false);
                setFilterForYou(false);
                setFilterByYou(false);
              }}
              className={`flex-1 text-center py-1 px-2 text-[11px] font-bold rounded-md border border-solid cursor-pointer transition-colors ${
                (!filterByCourse && !filterForYou && !filterByYou)
                  ? 'border-green-600 bg-white dark:bg-emerald-950/20 text-green-600 dark:text-emerald-400 hover:bg-green-50 dark:hover:bg-emerald-900/10 shadow-sm'
                  : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              ALL
            </button>
            {!isKelasSaya && (
              <button
                onClick={() => setFilterByCourse(!filterByCourse)}
                className={`flex-1 text-center py-1 px-2 text-[11px] font-bold rounded-md border border-solid cursor-pointer transition-colors ${
                  filterByCourse
                    ? 'border-green-600 bg-white dark:bg-emerald-950/20 text-green-600 dark:text-emerald-400 hover:bg-green-50 dark:hover:bg-emerald-900/10 shadow-sm'
                    : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                {selectedCourseCode || 'MATKUL'}
              </button>
            )}
            <button
              onClick={() => {
                const newVal = !filterByYou;
                setFilterByYou(newVal);
                if (newVal) setFilterForYou(false);
              }}
              className={`flex-1 text-center py-1 px-2 text-[11px] font-bold rounded-md border border-solid cursor-pointer transition-colors ${
                filterByYou
                  ? 'border-green-600 bg-white dark:bg-emerald-950/20 text-green-600 dark:text-emerald-400 hover:bg-green-50 dark:hover:bg-emerald-900/10 shadow-sm'
                  : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              BY YOU
            </button>
            <button
              onClick={() => {
                const newVal = !filterForYou;
                setFilterForYou(newVal);
                if (newVal) setFilterByYou(false);
              }}
              className={`flex-1 text-center py-1 px-2 text-[11px] font-bold rounded-md border border-solid cursor-pointer transition-colors ${
                filterForYou
                  ? 'border-green-600 bg-white dark:bg-emerald-950/20 text-green-600 dark:text-emerald-400 hover:bg-green-50 dark:hover:bg-emerald-900/10 shadow-sm'
                  : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              FOR YOU
            </button>
          </div>

          <div className="px-4 pb-24 pt-2">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
