import { useState } from 'react';
import Header from '../components/Header';
import CourseTabs from '../components/CourseTabs';
import SessionTypeTabs from '../components/SessionTypeTabs';
import ClassCard from '../components/ClassCard';
import BarterCard from '../components/BarterCard';

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

  const barterOffers = [
    {course: 'KOM201', offeringClass: 'K1', seekingClass: 'K2', studentName: 'Ahmad Fauzi', nim: 'G6401211001', timestamp: '2024-06-01 10:15'},
    {course: 'KOM202', offeringClass: 'P1', seekingClass: 'P3', studentName: 'Budi Santoso', nim: 'G6401211002', timestamp: '2024-06-01 11:20'},
    {course: 'MAT203', offeringClass: 'R2', seekingClass: 'R1', studentName: 'Citra Dewi', nim: 'G6401211003', timestamp: '2024-06-01 12:05'}
  ];

  const [selectedCourse, setSelectedCourse] = useState(courses[0]);
  const [selectedSessionType, setSelectedSessionType] = useState('kuliah');

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
            {classes.map((classItem) => (
              <ClassCard key={classItem.code} classItem={classItem} />
            ))}
          </div>
        </div>
        
        <div className="flex-[2] bg-white flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 flex-shrink-0">
            <h2 className="text-xs font-bold text-gray-900 m-0">LIVE BARTER FEED</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {barterOffers.length > 0 ? (
              barterOffers.map((offer, index) => (
                <BarterCard key={index} offer={offer} />
              ))
            ) : (
              <p className="text-center py-10 px-5 text-gray-500 text-xs">No active offers</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}