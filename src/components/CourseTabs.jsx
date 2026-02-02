import { useRef, useEffect, useState } from 'react';

export default function CourseTabs({ courses, selectedCourse, onCourseSelect }) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [isReady, setIsReady] = useState(false);
  const tabsRef = useRef([]);

  useEffect(() => {
    const selectedIndex = courses.findIndex(c => c.code === selectedCourse.code);
    const selectedTab = tabsRef.current[selectedIndex];
    
    if (selectedTab) {
      setIndicatorStyle({
        left: selectedTab.offsetLeft,
        width: selectedTab.offsetWidth,
      });
      
      // Enable transition after first render
      if (!isReady) {
        setTimeout(() => setIsReady(true), 50);
      }
    }
  }, [selectedCourse, courses, isReady]);

  return (
    <div className="border-b border-gray-200 flex flex-row bg-white flex-shrink-0 px-4 relative">
      {courses.map((course, index) => (
        <button 
          key={course.code}
          ref={el => tabsRef.current[index] = el}
          className={`min-w-[120px] bg-transparent border-0 cursor-pointer px-4 py-2.5 transition-all duration-150 ${
            selectedCourse.code === course.code 
              ? 'bg-green-50' 
              : 'hover:bg-gray-100'
          }`}
          onClick={() => onCourseSelect(course)}
        >
          <div className="text-xs font-bold text-gray-900">{course.code}</div>
          <div className="text-[10px] font-normal text-gray-500 mt-0.5">{course.name}</div>
        </button>
      ))}
      
      {/* Sliding indicator line */}
      <div 
        className={`absolute bottom-0 h-0.5 bg-green-600 ${isReady ? 'transition-all duration-300 ease-out' : ''}`}
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
        }}
      />
    </div>
  );
}