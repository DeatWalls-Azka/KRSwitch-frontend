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

// Check if two time ranges on the same day overlap
function timesOverlap(day1, start1, end1, day2, start2, end2) {
  if (day1 !== day2) return false;
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  return toMin(start1) < toMin(end2) && toMin(end1) > toMin(start2);
}

// Returns true if the class the user would RECEIVE conflicts with any of their enrolled classes
export function hasScheduleConflict(incomingClassId, currentUserNim, enrollments, parallelClasses) {
  const incoming = parallelClasses.find(pc => pc.id === incomingClassId);
  if (!incoming) return false;

  const userEnrolledIds = enrollments
    .filter(e => e.nim === currentUserNim)
    .map(e => e.parallelClassId);

  return userEnrolledIds.some(id => {
    if (id === incomingClassId) return false; // same class they're trading away, fine
    const enrolled = parallelClasses.find(pc => pc.id === id);
    if (!enrolled) return false;
    return timesOverlap(
      incoming.day,  incoming.timeStart,  incoming.timeEnd,
      enrolled.day, enrolled.timeStart, enrolled.timeEnd,
    );
  });
}