export default function CourseTabs({ courses, selectedCourse, onCourseSelect }) {
  return (
    <div className="border-b border-gray-200 flex flex-row bg-white flex-shrink-0 px-4">
      {courses.map((course) => (
        <button 
          key={course.code} 
          className={`min-w-[120px] bg-transparent border-0 border-b-2 cursor-pointer px-4 py-2.5 transition-all duration-150 ${
            selectedCourse.code === course.code 
              ? 'border-green-600 bg-green-100' 
              : 'border-transparent hover:bg-gray-100'
          }`}
          onClick={() => onCourseSelect(course)}
        >
          <div className="text-xs font-bold text-gray-900">{course.code}</div>
          <div className="text-[10px] font-normal text-gray-500 mt-0.5">{course.name}</div>
        </button>
      ))}
    </div>
  );
}