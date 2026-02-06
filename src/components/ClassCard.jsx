import { useEffect, useState } from 'react';

export default function ClassCard({ classItem, index = 0 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 50);

    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div 
      className={`min-w-[300px] max-w-[300px] border-2 border-green-600 rounded-md bg-white flex flex-col h-fit max-h-full flex-shrink-0 shadow-md transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      <div className="bg-green-100 p-3 border-b border-gray-200 rounded-t flex-shrink-0">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-green-600 m-0">{classItem.code}</h3>
        </div>
        <p className="text-[10px] text-gray-500">{classItem.day} · {classItem.time}</p>
      </div>
      
      <div className="overflow-y-auto flex-1 overscroll-y-contain">
        {classItem.students.length === 0 ? (
          <div className="flex items-center justify-center py-2 text-gray-400 text-[11px] font-bold">
            No students enrolled
          </div>
        ) : (
          <table className="w-full text-[11px]">
            <thead>
              <tr>
                <th className="sticky top-0 z-10 bg-white text-green-600 px-3 py-2 text-left font-bold border-b border-gray-200 text-[11px]">#</th>
                <th className="sticky top-0 z-10 bg-white text-green-600 px-3 py-2 text-left font-bold border-b border-gray-200 text-[11px]">STUDENT</th>
                <th className="sticky top-0 z-10 bg-white text-green-600 px-3 py-2 text-left font-bold border-b border-gray-200 text-[11px]">NIM</th>
              </tr>
            </thead>
            <tbody>
              {classItem.students.map((student, index) => (
                <tr key={student.nim + index} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border-t border-gray-100 text-gray-500 font-mono text-[11px]">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td className="px-3 py-2 border-t border-gray-100 text-gray-900 text-[11px]">
                    {student.name}
                  </td>
                  <td className="px-3 py-2 border-t border-gray-100 text-gray-500 font-mono text-[11px]">
                    {student.nim}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}