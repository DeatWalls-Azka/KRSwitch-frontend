import './Dashboard.css';
import { useState } from 'react';

export default function Dashboard() {

  // fake data for testitngs
  const courses = [
    { code: 'KOM201', name: 'Basis Data', type: 0}, // gada kelas praktukum
    { code: 'KOM202', name: 'Algoritma', type: 1},  // ada kelas praktikum
    { code: 'MAT203', name: 'Aljabar', type: 2}     // ada kelas responsi
  ];

  // Fake class data
  const classes = [
    {
      code: 'K1',
      day: 'Senin',
      time: '08:00-10:00',
      room: 'FMIPA 1.1',
      students: [
        { nim: 'G6401211001', name: 'Ahmad Fauzi' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211002', name: 'Budi Santoso' },
        { nim: 'G6401211003', name: 'Citra Dewi' }
      ]
    },
    {
      code: 'K2',
      day: 'Selasa',
      time: '10:00-12:00',
      room: 'FMIPA 1.2',
      students: [
        { nim: 'G6401211004', name: 'Dedi Hermawan' },
        { nim: 'G6401211005', name: 'Eka Putri' }
      ]
    }
  ];

  const [selectedCourse, setSelectedCourse] = useState(courses[0]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>KRSWITCH</h1>
      </header>
      
      <div className="dashboard-main">
        <div className="roster-panel">
          <div className="course-tabs">
            {courses.map((course) => (
              <button 
                key={course.code} 
                className="course-tab active"
                onClick={() => setSelectedCourse(course)}
              >
                <h2>{course.code}</h2>
                <h3>{course.name}</h3>
              </button>
            ))}
          </div>  

          <div className="parallel-tabs">
            <button className="parallel-tab active">KULIAH (K)</button>

            {selectedCourse.type === 1 && (
              <button className="parallel-tab">PRAKTIKUM (P)</button>
            )}
            

            {selectedCourse.type === 2 && (
              <button className="parallel-tab">RESPONSI (R)</button>
            )}
          </div> 

          <div className="roster-view">
            {classes.map((classItem) => (
              <div key={classItem.code} className="class-card">
                <div className="class-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>{classItem.code}</h3>
                    <p style={{ margin: 0 }}>{classItem.day} · {classItem.time}</p>
                  </div>
                </div>
                
                {/* Wrap table in container */}
                <div className="student-table-container">
                  <table className="student-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>STUDENT NAME</th>
                        <th>NIM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classItem.students.map((student, index) => (
                        <tr key={student.nim}>
                          <td>{index + 1}</td>
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
          <h2>Live Barter Feed</h2>
        </div>
      </div>
    </div>
  )
}