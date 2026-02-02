import { useState, useEffect } from 'react';
import Header from '../components/Header';
import CourseTabs from '../components/CourseTabs';
import SessionTypeTabs from '../components/SessionTypeTabs';
import ClassCard from '../components/ClassCard';
import BarterCard from '../components/BarterCard';
import FilterButton from '../components/FilterButton';
import { users, parallelClasses, enrollments, barterOffers, currentUser } from '../testData';

export default function Dashboard() {
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

  const [selectedCourse, setSelectedCourse] = useState(courses[0]);
  const [selectedSessionType, setSelectedSessionType] = useState('kuliah');
  const [filterByCourse, setFilterByCourse] = useState(false);
  const [filterForYou, setFilterForYou] = useState(false);

  // Reset to kuliah tab kalo course changes
  useEffect(() => {
    setSelectedSessionType('kuliah');
  }, [selectedCourse.code]);

  const filteredClasses = parallelClasses.filter(pc => {
    if (pc.courseCode !== selectedCourse.code) return false;
    
    const prefix = pc.classCode[0].toLowerCase();
    if (selectedSessionType === 'kuliah') return prefix === 'k';
    if (selectedSessionType === 'praktikum') return prefix === 'p';
    if (selectedSessionType === 'responsi') return prefix === 'r';
    return false;
  });

  const enrichedOffers = barterOffers.map(enrichBarterOffer);
  const filteredBarterOffers = enrichedOffers.filter(offer => {
    if (filterByCourse && offer.seekingCourse !== selectedCourse.code) {
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

  return (
    <div className="h-screen flex flex-col font-mono bg-gray-50">
      <Header />
      
      <CourseTabs 
        courses={courses}
        selectedCourse={selectedCourse}
        onCourseSelect={setSelectedCourse}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-[3] border-r border-gray-200 flex flex-col">
          <SessionTypeTabs
            courseType={selectedCourse.type}
            selectedSessionType={selectedSessionType}
            onSessionTypeSelect={setSelectedSessionType}
          />

          <div className="flex-1 flex gap-3 overflow-x-auto overflow-y-hidden p-4 bg-gray-50">
            {filteredClasses.map((pc) => (
              <ClassCard 
                key={pc.id} 
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
        
        <div className="flex-[1] bg-white flex flex-col overflow-hidden">
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
            {filteredBarterOffers.length > 0 ? (
              filteredBarterOffers.map((offer) => (
                <BarterCard key={offer.id} offer={offer} />
              ))
            ) : (
              <p className="text-center py-10 px-5 text-gray-500 text-sm">No active offers</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}