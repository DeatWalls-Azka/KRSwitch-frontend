// Dashboard.jsx
import './Dashboard.css';
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
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div pulse-dot className="pulse-dot"></div>
        <h1>KRSWITCH</h1>
      </header>
      
      <div className="course-tabs">
        {courses.map((course) => (
          <button 
            key={course.code} 
            className={`course-tab ${selectedCourse.code === course.code ? 'active' : ''}`}
            onClick={() => setSelectedCourse(course)}
          >
            <div className="course-code">{course.code}</div>
            <div className="course-name">{course.name}</div>
          </button>
        ))}
      </div>

      <div className="tabs-row">
        <div className="parallel-tabs">
          <button 
            className={`parallel-tab ${selectedSessionType === 'kuliah' ? 'active' : ''}`}
            onClick={() => setSelectedSessionType('kuliah')}
          >
            KULIAH (K)
          </button>

          {selectedCourse.type === 1 && (
            <button 
              className={`parallel-tab ${selectedSessionType === 'praktikum' ? 'active' : ''}`}
              onClick={() => setSelectedSessionType('praktikum')}
            >
              PRAKTIKUM (P)
            </button>
          )}

          {selectedCourse.type === 2 && (
            <button 
              className={`parallel-tab ${selectedSessionType === 'responsi' ? 'active' : ''}`}
              onClick={() => setSelectedSessionType('responsi')}
            >
              RESPONSI (R)
            </button>
          )}
        </div>

        <div className="barter-header">
          <h2>LIVE BARTER FEED</h2>
        </div>
      </div>
      
      <div className="dashboard-main">
        <div className="roster-panel">
          <div className="roster-view">
            {classes.map((classItem) => (
              <div key={classItem.code} className="class-card">
                <div className="class-header">
                  <div className="header-row">
                    <h3>{classItem.code}</h3>
                  </div>
                  <p className="schedule">{classItem.day} · {classItem.time}</p>
                </div>
                
                <div className="student-table-container">
                  <table className="student-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>STUDENT</th>
                        <th>NIM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classItem.students.map((student, index) => (
                        <tr key={student.nim + index}>
                          <td>{String(index + 1).padStart(2, '0')}</td>
                          <td>{student.name}</td>
                          <td>{student.nim}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="barter-panel">
          <div className="barter-content">
            <p className="empty-state">No active offers</p>
          </div>
        </div>
      </div>
    </div>
  )
}