import { useState, useEffect } from 'react';
import Header from '../components/Header';
import CourseTabs from '../components/CourseTabs';
import SessionTypeTabs from '../components/SessionTypeTabs';
import ClassCard from '../components/ClassCard';
import BarterCard from '../components/BarterCard';
import FilterButton from '../components/FilterButton';
import { users, parallelClasses, enrollments, barterOffers, currentUser } from '../testData';

export default function Dashboard() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSessionType, setSelectedSessionType] = useState('kuliah');
  const [filterByCourse, setFilterByCourse] = useState(false);
  const [filterForYou, setFilterForYou] = useState(false);
  const [displayedOffers, setDisplayedOffers] = useState(new Map());
  const [exitingOffers, setExitingOffers] = useState(new Map());
  const [animationState, setAnimationState] = useState('stable');

  const getStudentsInClass = (parallelClassId) => {
    return enrollments
      .filter(e => e.parallelClassId === parallelClassId)
      .map(e => users.find(u => u.nim === e.nim))
      .filter(Boolean);
  };

  const getUserEnrollments = (nim) => {
    return enrollments
      .filter(e => e.nim === nim)
      .map(e => parallelClasses.find(pc => pc.id === e.parallelClassId))
      .filter(Boolean);
  };

  const enrichBarterOffer = (offer) => {
    const myClass = parallelClasses.find(pc => pc.id === offer.myClassId);
    const wantedClass = parallelClasses.find(pc => pc.id === offer.wantedClassId);
    const offerer = users.find(u => u.nim === offer.offererNim);
    
    return {
      ...offer,
      myClass,
      wantedClass,
      offerer,
      seekingCourse: wantedClass.courseCode,
      offeringClass: myClass.classCode,
      seekingClass: wantedClass.classCode,
      studentName: offerer.name,
      nim: offerer.nim,
      timestamp: new Date(offer.createdAt).toLocaleString('id-ID', { 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      }).replace(',', ' -')
    };
  };

  const courses = [...new Set(parallelClasses.map(pc => pc.courseCode))]
    .map(code => {
      const classesForCourse = parallelClasses.filter(pc => pc.courseCode === code);
      const firstClass = classesForCourse[0];
      
      const hasP = classesForCourse.some(c => c.classCode.startsWith('P'));
      const hasR = classesForCourse.some(c => c.classCode.startsWith('R'));
      const type = hasP ? 1 : hasR ? 2 : 0;
      
      return {
        code: code,
        name: firstClass.courseName,
        type: type
      };
    });

  const myEnrollments = getUserEnrollments(currentUser.nim);
  const myEnrollmentMap = {};
  myEnrollments.forEach(pc => {
    myEnrollmentMap[pc.courseCode] = pc.classCode;
  });

  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0]);
    }
  }, [courses, selectedCourse]);

  useEffect(() => {
    setSelectedSessionType('kuliah');
  }, [selectedCourse?.code]);

  const enrichedOffers = barterOffers.map(enrichBarterOffer);

  const shouldShowOffer = (offer) => {
    if (filterByCourse && offer.seekingCourse !== selectedCourse?.code) {
      return false;
    }

    if (filterForYou) {
      const userCurrentClass = myEnrollmentMap[offer.seekingCourse];
      if (userCurrentClass !== offer.seekingClass) {
        return false;
      }
    }

    return true;
  };

  useEffect(() => {
    const currentIds = new Set(displayedOffers.keys());
    const shouldShowIds = new Set();
    
    enrichedOffers.forEach(offer => {
      if (shouldShowOffer(offer)) {
        shouldShowIds.add(offer.id);
      }
    });

    const idsToRemove = Array.from(currentIds).filter(id => !shouldShowIds.has(id));
    const idsToAdd = Array.from(shouldShowIds).filter(id => !currentIds.has(id));

    if (idsToRemove.length > 0) {
      const newExiting = new Map();
      const displayedArray = Array.from(displayedOffers.values());
      idsToRemove.forEach(id => {
        const idx = displayedArray.findIndex(o => o.id === id);
        if (idx >= 0) {
          const exitIdx = displayedArray.length - 1 - idx;
          newExiting.set(id, exitIdx);
        }
      });
      setExitingOffers(newExiting);
      setAnimationState('exiting');
    } else if (idsToAdd.length > 0) {
      const newDisplayed = new Map(displayedOffers);
      enrichedOffers.forEach(offer => {
        if (idsToAdd.includes(offer.id)) {
          newDisplayed.set(offer.id, offer);
        }
      });
      setDisplayedOffers(newDisplayed);
      setAnimationState('entering');
    }
  }, [filterByCourse, filterForYou, selectedCourse?.code]);

  useEffect(() => {
    if (animationState === 'exiting' && exitingOffers.size === 0) {
      const currentIds = new Set(displayedOffers.keys());
      const shouldShowIds = new Set();
      
      enrichedOffers.forEach(offer => {
        if (shouldShowOffer(offer)) {
          shouldShowIds.add(offer.id);
        }
      });

      const idsToAdd = Array.from(shouldShowIds).filter(id => !currentIds.has(id));

      if (idsToAdd.length > 0) {
        const newDisplayed = new Map();
        enrichedOffers.forEach(offer => {
          if (shouldShowIds.has(offer.id)) {
            newDisplayed.set(offer.id, offer);
          }
        });
        setDisplayedOffers(newDisplayed);
        setAnimationState('entering');
      } else {
        setAnimationState('stable');
      }
    } else if (animationState === 'entering') {
      const maxDelay = offersToDisplay.length * 30 + 200;
      const timer = setTimeout(() => {
        setAnimationState('stable');
      }, maxDelay);
      return () => clearTimeout(timer);
    }
  }, [animationState, exitingOffers.size]);

  const offersToDisplay = Array.from(displayedOffers.values());

  const handleExitClick = (offerId) => {
    const currentIndex = offersToDisplay.findIndex(o => o.id === offerId);
    if (currentIndex >= 0) {
      const exitIdx = offersToDisplay.length - 1 - currentIndex;
      setExitingOffers(prev => new Map([...prev, [offerId, exitIdx]]));
      if (animationState === 'stable') {
        setAnimationState('exiting');
      }
    }
  };

  const handleAnimationComplete = (offerId) => {
    setDisplayedOffers(prev => {
      const next = new Map(prev);
      next.delete(offerId);
      return next;
    });
    setExitingOffers(prev => {
      const next = new Map(prev);
      next.delete(offerId);
      return next;
    });
  };

  if (!selectedCourse) return null;

  const filteredClasses = parallelClasses.filter(pc => {
    if (pc.courseCode !== selectedCourse.code) return false;
    
    const prefix = pc.classCode[0].toLowerCase();
    if (selectedSessionType === 'kuliah') return prefix === 'k';
    if (selectedSessionType === 'praktikum') return prefix === 'p';
    if (selectedSessionType === 'responsi') return prefix === 'r';
    return false;
  });

  return (
    <div className="h-screen flex flex-col font-mono bg-gray-50">
      <Header />
      
      <CourseTabs 
        courses={courses}
        selectedCourse={selectedCourse}
        onCourseSelect={setSelectedCourse}
      />
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
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
                  students: getStudentsInClass(pc.id)
                }} 
              />
            ))}
          </div>
        </div>
        
        <div className="w-full md:w-[470px] shrink-0 bg-white flex flex-col overflow-hidden order-1 md:order-2 border-b md:border-b-0 md:border-l border-gray-200 h-[40%] md:h-auto">
          <div className="flex flex-col items-left px-4 py-3 bg-gray-50 flex-shrink-0 border-b border-gray-200">
            <h2 className="text-xs font-bold text-gray-900 m-0 mb-2">LIVE BARTER FEED</h2>
            
            <div className="flex gap-2 items-center">
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                className="text-gray-600"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              
              <FilterButton 
                label={selectedCourse.code}
                isActive={filterByCourse}
                onClick={() => setFilterByCourse(!filterByCourse)}
              />
              <FilterButton 
                label="FOR YOU"
                isActive={filterForYou}
                onClick={() => setFilterForYou(!filterForYou)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {offersToDisplay.length > 0 ? (
              offersToDisplay.map((offer, index) => {
                const isExiting = exitingOffers.has(offer.id);
                const exitIndex = isExiting ? exitingOffers.get(offer.id) : 0;
                const shouldAnimate = animationState !== 'exiting' || isExiting;
                return (
                  <BarterCard 
                    key={offer.id} 
                    offer={offer} 
                    index={shouldAnimate ? index : 0}
                    exitIndex={exitIndex}
                    shouldExit={isExiting}
                    onAnimationComplete={handleAnimationComplete}
                    onExitClick={handleExitClick}
                  />
                );
              })
            ) : (
              <p className="text-center py-10 px-5 text-gray-500 text-sm">No active offers</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}