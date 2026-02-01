// Dashboard.jsx
import { useState } from 'react';

export default function Dashboard() {
  const courses = [
    { code: 'KOM201', name: 'Basis Data', type: 0},
    { code: 'KOM202', name: 'Algoritma', type: 1},
    { code: 'MAT203', name: 'Aljabar', type: 2}
  ];

  const classes = [
    {
      code: 'K1',
      day: 'Senin',
      time: '08:00-10:00',
      room: 'FMIPA 1.1',
      students: [
        { nim: 'G6401211001', name: 'Ahmad Fauzi' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211003', name: 'Citra Dewi' },
        { nim: 'G6401211004', name: 'Dedi Hermawan' },
        { nim: 'G6401211005', name: 'Eka Putri' },
        { nim: 'G6401211006', name: 'Fajar Rahman' },
        { nim: 'G6401211007', name: 'Gita Sari' },
        { nim: 'G6401211008', name: 'Hendra Wijaya' },
        { nim: 'G6401211009', name: 'Indah Lestari' },
        { nim: 'G6401211010', name: 'Joko Susilo' },
        { nim: 'G6401211011', name: 'Kartika Sari' },
        { nim: 'G6401211012', name: 'Lutfi Hakim' },
        { nim: 'G6401211013', name: 'Maya Anggraini' },
        { nim: 'G6401211014', name: 'Nanda Pratama' },
        { nim: 'G6401211015', name: 'Oki Setiawan' },
        { nim: 'G6401211016', name: 'Putri Ayu' },
        { nim: 'G6401211017', name: 'Qori Hidayat' },
        { nim: 'G6401211018', name: 'Rina Melati' },
        { nim: 'G6401211019', name: 'Siti Nurhaliza' },
        { nim: 'G6401211020', name: 'Taufik Rahman' }
      ]
    },
    {
      code: 'K2',
      day: 'Selasa',
      time: '10:00-12:00',
      room: 'FMIPA 1.2',
      students: [
        { nim: 'G6401211021', name: 'Usman Hakim' },
        { nim: 'G6401211022', name: 'Vina Amalia' }
      ]
    },
    {
      code: 'K3',
      day: 'Rabu',
      time: '13:00-15:00',
      room: 'FMIPA 2.1',
      students: [
        { nim: 'G6401211023', name: 'Wahyu Pratama' },
        { nim: 'G6401211024', name: 'Xena Putri' },
        { nim: 'G6401211025', name: 'Yusuf Ibrahim' }
      ]
    }
  ];

  const [selectedCourse, setSelectedCourse] = useState(courses[0]);
  const [selectedSessionType, setSelectedSessionType] = useState('kuliah');

  return (
    <div className="h-screen flex flex-col font-mono bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0 flex flex-row gap-1.5 items-center">
        <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div>
        <h1 className="m-0 text-lg font-bold text-gray-900">KRSWITCH</h1>
      </header>
      
      <div className="border-b border-gray-200 flex flex-row bg-white flex-shrink-0 px-4">
        {courses.map((course) => (
          <button 
            key={course.code} 
            className={`min-w-[120px] bg-transparent border-0 border-b-2 cursor-pointer px-4 py-2.5 transition-all duration-150 ${
              selectedCourse.code === course.code 
                ? 'border-green-600 bg-green-100' 
                : 'border-transparent hover:bg-gray-100'
            }`}
            onClick={() => setSelectedCourse(course)}
          >
            <div className="text-xs font-bold text-gray-900">{course.code}</div>
            <div className="text-[10px] font-normal text-gray-500 mt-0.5">{course.name}</div>
          </button>
        ))}
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-[3] border-r border-gray-200 flex flex-col">
          <div className="flex bg-gray-50 px-4 border-b border-gray-200 flex-shrink-0">
            <button 
              className={`min-w-[120px] bg-transparent border-0 border-b-2 cursor-pointer px-4 py-1.5 text-xs font-bold transition-all duration-150 ${
                selectedSessionType === 'kuliah'
                  ? 'text-gray-900 bg-green-100 border-green-600'
                  : 'text-gray-500 border-transparent hover:text-gray-900 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedSessionType('kuliah')}
            >
              KULIAH (K)
            </button>

            {selectedCourse.type === 1 && (
              <button 
                className={`min-w-[120px] bg-transparent border-0 border-b-2 cursor-pointer px-4 py-1.5 text-xs font-bold transition-all duration-150 ${
                  selectedSessionType === 'praktikum'
                    ? 'text-gray-900 bg-green-100 border-green-600'
                    : 'text-gray-500 border-transparent hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedSessionType('praktikum')}
              >
                PRAKTIKUM (P)
              </button>
            )}

            {selectedCourse.type === 2 && (
              <button 
                className={`min-w-[120px] bg-transparent border-0 border-b-2 cursor-pointer px-4 py-1.5 text-xs font-bold transition-all duration-150 ${
                  selectedSessionType === 'responsi'
                    ? 'text-gray-900 bg-green-100 border-green-600'
                    : 'text-gray-500 border-transparent hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedSessionType('responsi')}
              >
                RESPONSI (R)
              </button>
            )}
          </div>

          <div className="flex-1 flex gap-3 overflow-x-auto overflow-y-hidden p-4 bg-gray-50">
            {classes.map((classItem) => (
              <div key={classItem.code} className="min-w-[300px] max-w-[300px] border-2 border-green-600 rounded-md bg-white flex flex-col h-full flex-shrink-0">
                <div className="bg-green-100 p-3 border-b border-gray-200 rounded-t flex-shrink-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold text-green-600 m-0">{classItem.code}</h3>
                  </div>
                  <p className="text-[10px] text-gray-500 my-1">{classItem.day} · {classItem.time}</p>
                </div>
                
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-[11px]">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr>
                        <th className="bg-white text-green-600 px-3 py-2 text-left font-bold border-b border-gray-200 text-[11px]">#</th>
                        <th className="bg-white text-green-600 px-3 py-2 text-left font-bold border-b border-gray-200 text-[11px]">STUDENT</th>
                        <th className="bg-white text-green-600 px-3 py-2 text-left font-bold border-b border-gray-200 text-[11px]">NIM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classItem.students.map((student, index) => (
                        <tr key={student.nim + index} className="hover:bg-gray-50">
                          <td className="px-3 py-2 border-b border-gray-100 text-gray-500 font-mono text-[11px]">
                            {String(index + 1).padStart(2, '0')}
                          </td>
                          <td className="px-3 py-2 border-b border-gray-100 text-gray-900 text-[11px]">
                            {student.name}
                          </td>
                          <td className="px-3 py-2 border-b border-gray-100 text-gray-500 font-mono text-[11px]">
                            {student.nim}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-[2] bg-white flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 flex-shrink-0">
            <h2 className="text-xs font-bold text-gray-900 m-0">LIVE BARTER FEED</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <p className="text-center py-10 px-5 text-gray-500 text-xs">No active offers</p>
          </div>
        </div>
      </div>
    </div>
  )
}