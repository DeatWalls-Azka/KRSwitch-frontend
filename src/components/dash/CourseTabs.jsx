import { useRef, useLayoutEffect, useState, useEffect } from 'react';

export default function CourseTabs({ courses, selectedCourse, onCourseSelect }) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [isReady, setIsReady] = useState(false);
  const tabsRef = useRef([]);
  const containerRef = useRef(null);

  // Enable transition after initial render
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Update indicator + auto-scroll to selected tab
  useLayoutEffect(() => {
    const selectedIndex = courses.findIndex(c => c.code === selectedCourse?.code);
    const selectedTab = tabsRef.current[selectedIndex];

    if (selectedTab) {
      setIndicatorStyle({
        left: selectedTab.offsetLeft,
        width: selectedTab.offsetWidth,
      });

      // Center the selected tab in the scroll container if possible
      if (containerRef.current) {
        const targetScroll = selectedTab.offsetLeft - (containerRef.current.clientWidth / 2) + (selectedTab.offsetWidth / 2);
        containerRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
      }
    }
  }, [selectedCourse, courses]);

  return (
    <div
      ref={containerRef}
      className="border-b border-gray-200 flex flex-row bg-white flex-shrink-0 px-4 relative overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      {courses.map((course, index) => (
        <button
          key={course.code}
          ref={el => tabsRef.current[index] = el}
          className={`min-w-[120px] bg-transparent border-0 cursor-pointer px-4 py-2.5 transition-colors duration-150 flex-shrink-0 ${
            selectedCourse?.code === course.code
              ? 'bg-green-50'
              : 'hover:bg-gray-100 active:bg-gray-100'
          }`}
          onClick={() => onCourseSelect(course)}
        >
          <div className="text-xs font-bold text-gray-900">{course.code}</div>
          <div className="text-[10px] font-normal text-gray-500 mt-0.5 whitespace-nowrap">{course.name}</div>
        </button>
      ))}

      {/* Sliding indicator line */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 bg-green-600 will-change-transform ${isReady ? 'transition-all duration-300 ease-out' : ''}`}
        style={{
          width: `${indicatorStyle.width}px`,
          transform: `translateX(${indicatorStyle.left}px)`,
        }}
      />
    </div>
  );
}