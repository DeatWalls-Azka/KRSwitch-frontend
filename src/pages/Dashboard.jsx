import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import Header from '../components/Header';
import CourseTabs from '../components/CourseTabs';
import SessionTypeTabs from '../components/SessionTypeTabs';
import ClassCard from '../components/ClassCard';
import BarterCard from '../components/BarterCard';
import FilterButton from '../components/FilterButton';
import { getOffers, getUsers, getClasses, getEnrollments, getCurrentUser } from '../api';

const STAGGER_DELAY = 30;
const ANIMATION_DURATION = 100;

export default function Dashboard() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSessionType, setSelectedSessionType] = useState('kuliah');
  const [filterByCourse, setFilterByCourse] = useState(false);
  const [filterForYou, setFilterForYou] = useState(false);
  const [apiOffers, setApiOffers] = useState([]);
  
  // Data from API
  const [users, setUsers] = useState([]);
  const [parallelClasses, setParallelClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [visibleOfferIds, setVisibleOfferIds] = useState(new Set());
  const [exitingOfferIds, setExitingOfferIds] = useState(new Map());
  const [enteringOfferIds, setEnteringOfferIds] = useState(new Set());
  
  // Prevents state updates during animations, queues changes for after animation completes
  const animationLockRef = useRef(false);
  const pendingChangesRef = useRef(null);
  const previousOfferIdsRef = useRef(new Set());
  const [animationVersion, setAnimationVersion] = useState(0);

  // Fetch all initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, classesRes, enrollmentsRes, currentUserRes, offersRes] = await Promise.all([
          getUsers(),
          getClasses(),
          getEnrollments(),
          getCurrentUser(),
          getOffers()
        ]);
        
        setUsers(usersRes.data);
        setParallelClasses(classesRes.data);
        setEnrollments(enrollmentsRes.data);
        setCurrentUser(currentUserRes.data);
        setApiOffers(offersRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

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
    // API response already includes related data
    const myClass = offer.myClass || parallelClasses.find(pc => pc.id === offer.myClassId);
    const wantedClass = offer.wantedClass || parallelClasses.find(pc => pc.id === offer.wantedClassId);
    const offerer = offer.offerer || users.find(u => u.nim === offer.offererNim);
    
    if (!myClass || !wantedClass || !offerer) return null;
    
    return {
      ...offer,
      myClass,
      wantedClass,
      offerer,
      seekingCourse: wantedClass.courseCode,
      seekingCourseName: wantedClass.courseName,
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

  const courses = useMemo(() => {
    return [...new Set(parallelClasses.map(pc => pc.courseCode))]
      .map(code => {
        const classesForCourse = parallelClasses.filter(pc => pc.courseCode === code);
        const firstClass = classesForCourse[0];
        
        const hasP = classesForCourse.some(c => c.classCode.startsWith('P'));
        const hasR = classesForCourse.some(c => c.classCode.startsWith('R'));
        const type = hasP ? 1 : hasR ? 2 : 0;
        
        return { code, name: firstClass.courseName, type };
      });
  }, [parallelClasses]);

  const myEnrollmentMap = useMemo(() => {
    if (!currentUser) return {};
    
    const myEnrollments = getUserEnrollments(currentUser.nim);
    const map = {};
    myEnrollments.forEach(pc => {
      map[pc.courseCode] = pc.classCode;
    });
    return map;
  }, [currentUser, enrollments]);

  const enrichedOffers = useMemo(() => {
    return apiOffers
      .map(enrichBarterOffer)
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [apiOffers, users, parallelClasses]);

  const shouldBeVisibleIds = useMemo(() => {
    const visible = enrichedOffers.filter(offer => {
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
    });
    return new Set(visible.map(o => o.id));
  }, [enrichedOffers, filterByCourse, filterForYou, selectedCourse?.code, myEnrollmentMap]);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    
    socket.on('connect', () => console.log('WebSocket connected'));
    socket.on('new-offer', (offer) => {
      console.log('New offer received:', offer);
      setApiOffers(prev => [offer, ...prev]);
    });
    socket.on('offer-taken', ({ offerId }) => {
      console.log('Offer taken:', offerId);
      setApiOffers(prev => prev.filter(o => o.id !== offerId));
    });
    
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0]);
    }
  }, [courses, selectedCourse]);

  useEffect(() => {
    setSelectedSessionType('kuliah');
  }, [selectedCourse?.code]);

  const startExitAnimation = useCallback((idsToRemove) => {
    const visibleArray = Array.from(visibleOfferIds);
    const exitMap = new Map();
    
    // Bottom items exit first (reverse index)
    idsToRemove.forEach(id => {
      const idx = visibleArray.indexOf(id);
      if (idx >= 0) {
        exitMap.set(id, visibleArray.length - 1 - idx);
      }
    });
    
    setExitingOfferIds(exitMap);
    animationLockRef.current = true;
    
    const maxExitIndex = Math.max(...Array.from(exitMap.values()));
    const totalTime = (maxExitIndex * STAGGER_DELAY) + ANIMATION_DURATION + 50;
    
    setTimeout(() => {
      setVisibleOfferIds(prev => {
        const next = new Set(prev);
        idsToRemove.forEach(id => next.delete(id));
        return next;
      });
      setExitingOfferIds(new Map());
      animationLockRef.current = false;
      setAnimationVersion(v => v + 1);
      
      // Process queued additions
      if (pendingChangesRef.current) {
        const pending = pendingChangesRef.current;
        pendingChangesRef.current = null;
        
        if (pending.toAdd.length > 0) {
          startEnterAnimation(pending.toAdd, pending.isWebSocket);
        }
      }
    }, totalTime);
  }, [visibleOfferIds]);

  const startEnterAnimation = useCallback((idsToAdd, isWebSocketAddition) => {
    setVisibleOfferIds(prev => {
      const next = new Set(prev);
      idsToAdd.forEach(id => next.add(id));
      return next;
    });
    
    // WebSocket offers get immediate animation
    if (isWebSocketAddition && idsToAdd.length > 0) {
      setEnteringOfferIds(new Set(idsToAdd));
      setTimeout(() => setEnteringOfferIds(new Set()), 200);
    }
    
    animationLockRef.current = false;
    setAnimationVersion(v => v + 1);
  }, []);

  // Sync visible offers with filtered results
  useEffect(() => {
    if (animationLockRef.current) return;

    const currentIds = visibleOfferIds;
    const targetIds = shouldBeVisibleIds;
    
    const idsToRemove = Array.from(currentIds).filter(id => !targetIds.has(id));
    const idsToAdd = Array.from(targetIds).filter(id => !currentIds.has(id));
    
    // Detect WebSocket additions
    const currentOfferIds = new Set(enrichedOffers.map(o => o.id));
    const newOfferIds = [...currentOfferIds].filter(id => !previousOfferIdsRef.current.has(id));
    const isWebSocket = idsToAdd.some(id => newOfferIds.includes(id));
    previousOfferIdsRef.current = currentOfferIds;
    
    // Exits take priority, queue additions for after
    if (idsToRemove.length > 0) {
      if (idsToAdd.length > 0) {
        pendingChangesRef.current = { toAdd: idsToAdd, isWebSocket };
      }
      startExitAnimation(idsToRemove);
    } else if (idsToAdd.length > 0) {
      startEnterAnimation(idsToAdd, isWebSocket);
    }
  }, [shouldBeVisibleIds, visibleOfferIds, enrichedOffers, startExitAnimation, startEnterAnimation, animationVersion]);

  const offersToDisplay = useMemo(() => {
    return enrichedOffers.filter(offer => visibleOfferIds.has(offer.id));
  }, [enrichedOffers, visibleOfferIds]);

  const handleExitClick = (offerId) => {
    if (animationLockRef.current) return;
    startExitAnimation([offerId]);
  };

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
            <div className="flex flex-row gap-1 items-center">
              <div className="mr-auto flex flex-col items-left">
                <h2 className="text-xs font-bold text-gray-900">LIVE BARTER FEED PANEL</h2>
                <h1 className="text-[11px] font-normal text-gray-600">Real Time: {offersToDisplay.length} Offers</h1>
              </div>

              <button onClick={() => setFilterByCourse(!filterByCourse)}>
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  className="text-gray-600"
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
              </button>
              <p className="text-[11px] font-bold text-gray-600">:</p>
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
                const isExiting = exitingOfferIds.has(offer.id);
                const isEntering = enteringOfferIds.has(offer.id);
                const exitIndex = isExiting ? exitingOfferIds.get(offer.id) : 0;
                
                return (
                  <BarterCard 
                    key={offer.id} 
                    offer={offer} 
                    index={index}
                    exitIndex={exitIndex}
                    shouldExit={isExiting}
                    shouldEnter={isEntering}
                    onAnimationComplete={() => {}}
                    onExitClick={handleExitClick}
                  />
                );
              })
            ) : (
              <p className="text-center py-10 px-5 text-gray-500 text-sm">No active offers</p>
            )}
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <button 
              onClick={() => {}}
              className="w-full bg-green-600 text-white text-[11px] font-bold py-2 px-2.5 border-0 cursor-pointer hover:bg-green-700 active:bg-green-800 transition-colors rounded-sm"
            >
              CREATE BARTER OFFER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}