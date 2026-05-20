import { useEffect, useState } from 'react';
import type { EnrichedOffer } from '../../types';

// --- Types ----------------------------------------------------

interface Student {
  nim: string;
  name: string;
}

interface ClassItem {
  code: string;
  day: string;
  time: string;
  room?: string;
  students: Student[];
}

interface ClassCardProps {
  classItem: ClassItem;
  index?: number;
  activeOffers?: EnrichedOffer[];
  currentUserNim: string;
  onTooltipChange: (offer: EnrichedOffer | null) => void;
  onMouseMove: (e: React.MouseEvent) => void;
}

// --- Komponen Utama -------------------------------------------

export default function ClassCard({
  classItem,
  index = 0,
  activeOffers = [],
  currentUserNim,
  onTooltipChange,
  onMouseMove
}: ClassCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 50);

    return () => clearTimeout(timer);
  }, [index]);

  const getStudentOffer = (nim: string) => {
    return activeOffers.find(offer => offer.nim === nim);
  };

  const isCurrentUserInClass = classItem.students.some(s => s.nim === currentUserNim);

  return (
    <div
      className={`min-w-[300px] max-w-[300px] border rounded-md bg-white flex flex-col h-fit max-h-full flex-shrink-0 transition-all duration-300 ${isCurrentUserInClass
          ? 'border-2 border-green-600 shadow-md ring-1 ring-green-600/10'
          : 'border-gray-200 shadow-sm hover:border-gray-300'
        } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
    >
      <div className={`p-3 border-b border-gray-200 rounded-t flex-shrink-0 transition-colors duration-300 ${isCurrentUserInClass ? 'bg-green-100' : 'bg-gray-50'
        }`}>
        <div className="flex justify-between items-center">
          <h3 className={`text-sm font-bold m-0 transition-colors duration-300 ${isCurrentUserInClass ? 'text-green-600' : 'text-gray-800'
            }`}>{classItem.code}</h3>
          {isCurrentUserInClass && (
            <span className="text-[9px] font-bold text-white bg-green-600 px-2 pt-1 pb-0.5 rounded-sm">
              YOU
            </span>
          )}
        </div>
        <p className="text-[10px] text-gray-500">{classItem.day} · {classItem.time}{classItem.room ? ` · ${classItem.room}` : ''}</p>
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
                <th className="sticky top-0 z-10 bg-white text-gray-400 px-3 py-2 text-left font-semibold border-b border-gray-200 text-[9px] uppercase tracking-wider">#</th>
                <th className="sticky top-0 z-10 bg-white text-gray-400 px-3 py-2 text-left font-semibold border-b border-gray-200 text-[9px] uppercase tracking-wider">STUDENT</th>
                <th className="sticky top-0 z-10 bg-white text-gray-400 px-3 py-2 text-left font-semibold border-b border-gray-200 text-[9px] uppercase tracking-wider">NIM</th>
              </tr>
            </thead>
            <tbody>
              {classItem.students.map((student, idx) => {
                const offer = getStudentOffer(student.nim);
                const hasOffer = !!offer;
                const isCurrentUser = student.nim === currentUserNim;

                return (
                  <tr
                    key={student.nim + idx}
                    className="hover:bg-gray-50/50 transition-colors duration-150"
                    onMouseEnter={() => hasOffer && onTooltipChange(offer)}
                    onMouseMove={hasOffer ? onMouseMove : undefined}
                    onMouseLeave={() => hasOffer && onTooltipChange(null)}
                  >
                    <td className={`px-3 py-2 border-t border-gray-100 font-mono text-[11px] ${isCurrentUser ? 'text-gray-900 font-bold' : 'text-gray-400'}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="px-3 py-2 border-t border-gray-100 text-[11px]">
                      <span className="relative flex items-center gap-1">
                        {/* nama - potong jadi ... kalo kepanjangan */}
                        <span
                          className="relative shrink-0"
                          style={{ maxWidth: '120px' }}
                        >
                          <span
                            className={`truncate block ${isCurrentUser ? 'font-bold text-gray-900' : 'text-gray-700'}`}
                            title={student.name}
                          >
                            {student.name}
                          </span>
                          {hasOffer && (
                            <span className="absolute -top-0.5 -right-1.5 flex h-1 w-1">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1 w-1 bg-red-600"></span>
                            </span>
                          )}
                        </span>
                      </span>
                    </td>
                    <td className={`px-3 py-2 border-t border-gray-100 font-mono text-[11px] ${isCurrentUser ? 'text-gray-900 font-bold' : 'text-gray-400'}`}>
                      {student.nim}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
