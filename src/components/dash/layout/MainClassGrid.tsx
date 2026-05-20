import React, { useEffect, useRef } from 'react';
import SessionTypeFilterTabs from '../tabs/SessionTypeFilterTabs';
import CompactEnrollmentCard from '../cards/CompactEnrollmentCard';
import EnrollmentCard from '../cards/EnrollmentCard';
import { getStudentsInClass } from '../../../utils/offerUtils';
import type { ParallelClass, Enrollment, User, EnrichedOffer } from '../../../types';
import type { Course } from '../../../hooks/useTradingState';

interface MainClassGridProps {
  selectedCourse: Course;
  selectedSessionType: string;
  setSelectedSessionType: (val: string) => void;
  lastRealCourseTypeRef: React.MutableRefObject<number>;
  filteredClasses: ParallelClass[];
  myEnrollmentMap: Record<string, string>;
  enrollments: Enrollment[];
  users: User[];
  enrichedOffers: EnrichedOffer[];
  currentUserNim?: string;
  setTooltipContent: any;
  handleMouseMove: any;
  handleCompactCardClick: (pc: ParallelClass) => void;
}

export default function MainClassGrid({
  selectedCourse,
  selectedSessionType,
  setSelectedSessionType,
  lastRealCourseTypeRef,
  filteredClasses,
  myEnrollmentMap,
  enrollments,
  users,
  enrichedOffers,
  currentUserNim,
  setTooltipContent,
  handleMouseMove,
  handleCompactCardClick
}: MainClassGridProps) {
  const cardScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const userCardRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div className="flex-1 min-w-0 md:border-r border-gray-200 flex flex-col overflow-hidden pb-16 md:pb-0">
      <div
        className={`grid transition-[grid-template-rows,border-color] duration-300 ease-in-out shrink-0 border-b ${
          selectedCourse.type === -1 ? 'grid-rows-[0fr] border-transparent' : 'grid-rows-[1fr] border-gray-200'
        }`}
      >
        <div className="overflow-hidden">
          <SessionTypeFilterTabs
            courseType={selectedCourse.type === -1 ? lastRealCourseTypeRef.current : selectedCourse.type}
            selectedSessionType={selectedSessionType}
            onSessionTypeSelect={setSelectedSessionType}
          />
        </div>
      </div>
      <div 
        ref={cardScrollContainerRef} 
        className={`flex-1 overflow-x-auto overflow-y-auto p-2 md:p-4 bg-gray-50 ${selectedCourse.type === -1 ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[2px] md:gap-2 content-start' : 'flex gap-1 overflow-y-hidden'}`}
      >
        {filteredClasses.map((pc, index) => {
          if (selectedCourse.type === -1) {
            return (
              <CompactEnrollmentCard
                key={pc.id}
                index={index}
                classItem={{
                  code: pc.classCode,
                  courseCode: pc.courseCode,
                  courseName: pc.courseName,
                  day: pc.day,
                  time: `${pc.timeStart}-${pc.timeEnd}`,
                  room: pc.room,
                  students: getStudentsInClass(pc.id, enrollments, users),
                }}
                onClick={() => handleCompactCardClick(pc)}
              />
            );
          }

          const isUserClass = myEnrollmentMap[`${selectedCourse.code}-${pc.classCode[0]}`] === pc.classCode;
          const card = (
            <EnrollmentCard
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
              currentUserNim={currentUserNim || ''}
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
  );
}
