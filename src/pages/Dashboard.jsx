import { useState } from 'react';
import Header from '../components/Header';
import CourseTabs from '../components/CourseTabs';
import SessionTypeTabs from '../components/SessionTypeTabs';
import ClassCard from '../components/ClassCard';
import BarterCard from '../components/BarterCard';
import FilterButton from '../components/FilterButton';

export default function Dashboard() {
  // FAKE DATA FOR TESTING =============================================
  const courses = [
  { code: 'KOM201', name: 'Basis Data', type: 0},
  { code: 'KOM202', name: 'Algoritma dan Pemrograman', type: 1},
  { code: 'MAT203', name: 'Aljabar Linear', type: 2},
  { code: 'FIS204', name: 'Fisika Komputasi', type: 0},
  { code: 'STA205', name: 'Statistika', type: 1},
  { code: 'KOM301', name: 'Struktur Data', type: 2}
];

  const classes = [
    {
      code: 'K4',
      day: 'Kamis',
      time: '15:00-17:00',
      room: 'FMIPA 2.2',
      students: [
        { nim: 'G6401211026', name: 'Zahra Amelia' },
        { nim: 'G6401211027', name: 'Rizki Firmansyah' },
        { nim: 'G6401211028', name: 'Dina Marlina' },
        { nim: 'G6401211029', name: 'Bagus Pradana' }
      ]
    },
    {
      code: 'P1',
      day: 'Senin',
      time: '13:00-15:00',
      room: 'LAB 1',
      students: [
        { nim: 'G6401211030', name: 'Sinta Permata' },
        { nim: 'G6401211031', name: 'Arif Budiman' },
        { nim: 'G6401211032', name: 'Nurul Fatimah' }
      ]
    },
    {
      code: 'P2',
      day: 'Rabu',
      time: '08:00-10:00',
      room: 'LAB 2',
      students: [
        { nim: 'G6401211033', name: 'Rizal Ramadhan' },
        { nim: 'G6401211034', name: 'Ayu Lestari' }
      ]
    }
  ];

  const barterOffers = [
    {seekingCourse: 'KOM201', offeringClass: 'K1', seekingClass: 'K2', studentName: 'Ahmad Fauzi', nim: 'G6401211001', timestamp: '01 - 10:15'},
    {seekingCourse: 'KOM202', offeringClass: 'P1', seekingClass: 'P3', studentName: 'Budi Santoso', nim: 'G6401211002', timestamp: '01 - 11:20'},
    {seekingCourse: 'MAT203', offeringClass: 'R2', seekingClass: 'R1', studentName: 'Citra Dewi', nim: 'G6401211003', timestamp: '02 - 12:05'},
    {seekingCourse: 'KOM201', offeringClass: 'K3', seekingClass: 'K1', studentName: 'Dedi Hermawan', nim: 'G6401211004', timestamp: '02 - 14:30'},
    {seekingCourse: 'FIS204', offeringClass: 'K2', seekingClass: 'K4', studentName: 'Eka Putri', nim: 'G6401211005', timestamp: '02 - 15:45'},
    {seekingCourse: 'KOM202', offeringClass: 'P2', seekingClass: 'P1', studentName: 'Fajar Rahman', nim: 'G6401211006', timestamp: '02 - 16:20'},
    {seekingCourse: 'STA205', offeringClass: 'K1', seekingClass: 'K3', studentName: 'Gita Sari', nim: 'G6401211007', timestamp: '02 - 17:10'},
    {seekingCourse: 'KOM201', offeringClass: 'K2', seekingClass: 'K3', studentName: 'Hendra Wijaya', nim: 'G6401211008', timestamp: '02 - 18:00'},
    {seekingCourse: 'KOM301', offeringClass: 'R1', seekingClass: 'R3', studentName: 'Indah Lestari', nim: 'G6401211009', timestamp: '02 - 19:25'},
    {seekingCourse: 'MAT203', offeringClass: 'R3', seekingClass: 'R2', studentName: 'Joko Susilo', nim: 'G6401211010', timestamp: '02 - 20:15'},
    {seekingCourse: 'KOM201', offeringClass: 'K4', seekingClass: 'K2', studentName: 'Kartika Sari', nim: 'G6401211011', timestamp: '02 - 21:30'},
    {seekingCourse: 'FIS204', offeringClass: 'K3', seekingClass: 'K1', studentName: 'Lutfi Hakim', nim: 'G6401211012', timestamp: '02 - 22:00'},
    {seekingCourse: 'STA205', offeringClass: 'K2', seekingClass: 'K1', studentName: 'Maya Anggraini', nim: 'G6401211013', timestamp: '02 - 23:10'},
    {seekingCourse: 'KOM202', offeringClass: 'P3', seekingClass: 'P2', studentName: 'Nina Kartika', nim: 'G6401211014', timestamp: '03 - 08:45'},
  ];

  // fake user info
  const currentUser = {
    nim: 'M6401211022',
    name: 'Marbot Markibot',
    enrollments: {
      'KOM201': 'K2',
      'KOM202': 'P3', 
      'MAT203': 'R1' 
    }
  };

  // ====================================================================



  const [selectedCourse, setSelectedCourse] = useState(courses[0]);
  const [selectedSessionType, setSelectedSessionType] = useState('kuliah');
  const [filterByCourse, setFilterByCourse] = useState(false);
  const [filterForYou, setFilterForYou] = useState(false);

  const filteredBarterOffers = barterOffers.filter(offer => {
    
    // Filter by course code
    if (filterByCourse && offer.seekingCourse !== selectedCourse.code) {
      return false;
    }

    // Filter for relevant offers (offers where you can actually trade)
    if (filterForYou) {
      const userCurrentClass = currentUser.enrollments[offer.seekingCourse];
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
      
      <div className="flex-1 flex overflow-hidden shadow-lg">
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
        
        <div className="flex-[1] bg-white flex flex-col overflow-hidden">
          <div className="flex flex-col items-left px-4 py-3 bg-gray-50 flex-shrink-0 border-b border-gray-200">
            <h2 className="text-xs font-bold text-gray-900 m-0 mb-2">LIVE BARTER FEED</h2>
            
            <div className="flex gap-2">
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
              filteredBarterOffers.map((offer, index) => (
                <BarterCard key={index} offer={offer} />
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