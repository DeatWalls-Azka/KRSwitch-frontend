import './Dashboard.css';

export default function Dashboard() {
  // fake data for testitngs
  const courses = [
    { code: 'KOM201', name: 'Basis Data', type: 0}, // gada kelas praktukum
    { code: 'KOM202', name: 'Algoritma', type: 1},  // ada kelas praktikum
    { code: 'MAT203', name: 'Aljabar', type: 2}     // ada kelas responsi
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>KRS.SWITCH</h1>
      </header>
      
      <div className="dashboard-main">
        <div className="roster-panel">
          <div className="course-tabs">
            {courses.map((course) => (
              <button key={course.code} className="course-tab active">
                <h2>{course.code}</h2>
                <h3>{course.name}</h3>
              </button>
            ))}
          </div>  

          <div className="parallel-tabs">
            <button className="parallel-tab active">Kuliah (K)</button>
            <button className="parallel-tab active">Praktikum (P)</button>
            <button className="parallel-tab active">Responsi (R)</button>
          </div> 

          <div className="roster-view">
            <button className="course-tab active">Course 1</button>
          </div> 
        </div>
        
        <div className="barter-panel">
          <h2>Live Barter Feed</h2>
        </div>
      </div>
    </div>
  )
}