// --- Helpers --------------------------------------------------

const TIMESTAMP_FORMAT = { day: '2-digit', hour: '2-digit', minute: '2-digit' };

export function enrichOffer(offer, users, parallelClasses) {
  const myClass = offer.myClass || parallelClasses.find(pc => pc.id === offer.myClassId);
  const wantedClass = offer.wantedClass || parallelClasses.find(pc => pc.id === offer.wantedClassId);
  const offerer = offer.offerer || users.find(u => u.nim === offer.offererNim);

  if (!myClass || !wantedClass || !offerer) return null;

  return {
    ...offer,
    myClass,
    wantedClass,
    offerer,
    seekingCourse: wantedClass.courseCode,
    seekingCourseName: wantedClass.courseName,
    offeringClass: myClass.classCode,
    seekingClass: wantedClass.classCode,
    studentName: offerer.name,
    nim: offerer.nim,
    timestamp: new Date(offer.createdAt)
      .toLocaleString('id-ID', TIMESTAMP_FORMAT)
      .replace(',', ' -'),
  };
}

export function getStudentsInClass(parallelClassId, enrollments, users) {
  return enrollments
    .filter(e => e.parallelClassId === parallelClassId)
    .map(e => users.find(u => u.nim === e.nim))
    .filter(Boolean);
}