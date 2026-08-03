import { useEffect, useState, useRef } from 'react';
import type { EnrichedOffer } from '../../../types';
import StudentAvatar from '../../ui/StudentAvatar';

// --- Types ----------------------------------------------------

interface BarterCardProps {
  offer: EnrichedOffer;
  index?: number;
  exitIndex?: number;
  shouldExit?: boolean;
  shouldEnter?: boolean;
  canAccept?: boolean;
  conflictsWithSchedule?: boolean;
  isOwnOffer?: boolean;
  tooltipText?: string;
  onAnimationComplete?: (id: number) => void;
  onExitClick?: (id: number) => void;
  onOpenModal?: (offer: EnrichedOffer, mode: 'accept' | 'cancel') => void;
}

// --- Komponen Utama -------------------------------------------

export default function BarterCard({
  offer,
  index = 0,
  exitIndex = 0,
  shouldExit = false,
  shouldEnter = false,
  canAccept = true,
  conflictsWithSchedule = false,
  isOwnOffer = false,
  tooltipText,
  onAnimationComplete,
  onOpenModal
}: BarterCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [height, setHeight] = useState<number | string>('auto');
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let timer: any;
    if (shouldEnter) {
      setIsVisible(false);
      timer = setTimeout(() => setIsVisible(true), 50);
    } else {
      // Snappy Dynamic Stagger: Hitung berapa kartu yang muat di viewport untuk menstagger semua yang keliatan
      const visibleCount = typeof window !== 'undefined'
        ? Math.max(6, Math.ceil(window.innerHeight / 76))
        : 8;
      const delay = index < visibleCount ? index * 30 : visibleCount * 30;
      timer = setTimeout(() => setIsVisible(true), delay);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [index, shouldEnter]);

  useEffect(() => {
    let timer: any;
    if (shouldExit && isVisible && !isExiting) {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        setHeight(rect.height);
      }

      timer = setTimeout(() => {
        setIsExiting(true);
        requestAnimationFrame(() => {
          setHeight(0);
        });
      }, exitIndex * 30);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [shouldExit, isVisible, exitIndex, isExiting]);

  useEffect(() => {
    let timer: any;
    if (isExiting) {
      timer = setTimeout(() => {
        if (onAnimationComplete) {
          onAnimationComplete(offer.id);
        }
      }, 100);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isExiting, offer.id, onAnimationComplete]);

  const handleButtonClick = () => {
    if (isOwnOffer) {
      if (onOpenModal) onOpenModal(offer, 'cancel');
    } else {
      if (canAccept && !conflictsWithSchedule && onOpenModal) onOpenModal(offer, 'accept');
    }
  };

  const isPickDrop = offer.type === 'pick_drop';

  const isUnavailable = !isOwnOffer && (!canAccept || conflictsWithSchedule);

  const animationClasses = (isVisible && !isExiting)
    ? 'opacity-100 translate-x-0 scale-100'
    : 'opacity-0 translate-x-8 scale-y-0';

  const buttonDisabled = shouldExit || (!isOwnOffer && (!canAccept || conflictsWithSchedule));

  const handleCardClick = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLButtonElement || (e.target as HTMLElement).closest('button')) {
      return;
    }
    if (!buttonDisabled) {
      handleButtonClick();
    }
  };

  return (
    <div
      data-offer-id={offer.id}
      style={{
        height: isExiting ? `${height}px` : 'auto'
      }}
      className="transition-all duration-100 ease-out overflow-hidden"
    >
      <div 
        ref={wrapperRef} 
        className="mb-1" 
        onClick={handleCardClick}
        title={buttonDisabled && !isOwnOffer && tooltipText ? tooltipText : undefined}
      >
        <div className={`border p-2 flex items-center rounded-md shadow-xs transition-all duration-150 ease-out ${
          isUnavailable 
            ? 'border-gray-200/40 dark:border-gray-800/40 opacity-50 grayscale cursor-default' 
            : `border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 ${buttonDisabled ? 'cursor-default' : 'cursor-pointer hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xs'}`
        } ${animationClasses}`}>
          
          {/* Grid 3 kolom: 1.2fr kiri (Course), auto tengah (Badge), 1.2fr kanan (Partner Avatar + Info) */}
          <div className="grid w-full items-center gap-2" style={{ gridTemplateColumns: '1.2fr auto 1.2fr' }}>

            {/* Left Column: Seeking Course Info */}
            <div className="min-w-0 pr-4 text-left">
              <div 
                className={`truncate font-bold text-[12px] leading-tight ${isUnavailable ? 'text-gray-400 dark:text-gray-600 font-medium' : 'text-gray-900 dark:text-gray-100'}`} 
                title={offer.seekingCourseName}
              >
                {offer.seekingCourseName}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`font-semibold font-mono text-[10px] tracking-wider ${isUnavailable ? 'text-gray-300 dark:text-gray-700' : 'text-gray-400 dark:text-gray-500'}`}>
                  {offer.seekingCourse}
                </span>
                {isPickDrop && (
                  <span className={`text-[9px] font-extrabold px-1 rounded ${
                    offer.reservedForNim ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300' : 'bg-red-100 text-red-900 dark:bg-red-950/60 dark:text-red-300'
                  }`}>
                    {offer.reservedForNim ? 'TARGET' : 'DROP'}
                  </span>
                )}
              </div>
            </div>

            {/* Middle Column: Swap or Drop Badge */}
            <div className="flex flex-col items-center justify-center leading-none">
              <div className={`flex items-center justify-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
                isUnavailable 
                  ? 'bg-gray-100/50 dark:bg-gray-800/30 border-gray-200/40 dark:border-gray-800/40' 
                  : isPickDrop
                    ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200/60 dark:border-red-900/40 hover:bg-red-100/60'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}>
                {isPickDrop ? (
                  <span className={`font-black text-[11px] uppercase ${isUnavailable ? 'text-red-400/70 dark:text-red-500/50' : 'text-red-600 dark:text-red-500'}`}>
                    {offer.seekingCourse}
                  </span>
                ) : (
                  <>
                    <span className={`font-black text-[11px] ${isUnavailable ? 'text-red-400/70 dark:text-red-500/50' : 'text-red-600 dark:text-red-500'}`}>{offer.offeringClass}</span>
                    <span className="text-gray-400 dark:text-gray-500 font-bold text-[10px]">⇌</span>
                    <span className={`font-black text-[11px] ${isUnavailable ? 'text-green-400/70 dark:text-green-500/50' : 'text-green-600 dark:text-green-500'}`}>{offer.seekingClass}</span>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Student Details + Avatar */}
            <div className="flex items-center justify-end gap-2 min-w-0 pl-4">
              {/* Partner identity */}
              <div className="text-right min-w-0">
                <div 
                  className={`truncate font-bold text-[11px] leading-tight ${isUnavailable ? 'text-gray-400 dark:text-gray-600 font-medium' : 'text-gray-800 dark:text-gray-200'}`} 
                  title={offer.studentName}
                >
                  {offer.studentName}
                </div>
                <div className={`font-mono text-[10px] mt-0.5 tracking-wider truncate ${isUnavailable ? 'text-gray-300 dark:text-gray-700' : 'text-gray-400 dark:text-gray-500'}`}>
                  {offer.nim}
                </div>
              </div>

              {/* Avatar Circle */}
              <div className="shrink-0">
                <StudentAvatar
                  nim={offer.nim}
                  name={offer.studentName}
                  picture={offer.offerer?.picture}
                  sizeClassName="w-7 h-7"
                  borderClassName={`border transition-all ${
                    isUnavailable ? 'border-gray-200/50 dark:border-gray-800/50 opacity-60' : 'border-gray-200 dark:border-gray-700 shadow-xs'
                  }`}
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
