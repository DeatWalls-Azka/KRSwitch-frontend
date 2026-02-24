import { useState, useEffect } from 'react';
import { getCurrentUser, getEnrollments, getClasses, createOffer } from '../../api';

function hasScheduleConflict(classA, classB) {
  if (classA.day !== classB.day) return false;
  return classA.timeStart < classB.timeEnd && classB.timeStart < classA.timeEnd;
}

export default function CreateOfferForm({ onSuccess, onClose }) {
  const [myClasses, setMyClasses] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [selectedMyClass, setSelectedMyClass] = useState('');
  const [selectedTargetClass, setSelectedTargetClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (error || successMessage) setShowMessage(true);
  }, [error, successMessage]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');

      const [userRes, enrollmentsRes, classesRes] = await Promise.all([
        getCurrentUser(),
        getEnrollments(),
        getClasses()
      ]);

      const userData = userRes.data;
      const enrollments = enrollmentsRes.data;
      const classes = classesRes.data;

      setCurrentUser(userData);
      setAllClasses(classes);

      const userEnrollments = enrollments.filter(e => e.nim === userData.nim);
      const enrichedClasses = userEnrollments.map(enrollment => {
        const classDetails = classes.find(c => c.id === enrollment.parallelClassId);
        return {
          id: classDetails.id,
          courseCode: classDetails.courseCode,
          courseName: classDetails.courseName || classDetails.courseCode,
          classCode: classDetails.classCode,
          day: classDetails.day,
          timeStart: classDetails.timeStart,
          timeEnd: classDetails.timeEnd,
          room: classDetails.room,
        };
      });
      setMyClasses(enrichedClasses);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentClass = myClasses.find(m => m.id === parseInt(selectedMyClass));
  const otherOwnClasses = currentClass ? myClasses.filter(m => m.id !== currentClass.id) : [];

  const availableTargets = allClasses
    .filter(c => {
      if (!currentClass) return false;
      return (
        c.courseCode === currentClass.courseCode &&
        c.classCode[0] === currentClass.classCode[0] &&
        c.id !== currentClass.id
      );
    })
    .map(c => ({
      ...c,
      conflictWith: otherOwnClasses.find(own => hasScheduleConflict(own, c)) || null
    }));

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    setShowMessage(false);

    try {
      const res = await createOffer({
        myClassId: parseInt(selectedMyClass),
        wantedClassId: parseInt(selectedTargetClass),
      });
      if (onSuccess) onSuccess();
      setSuccessMessage(res.data.autoMatched
        ? 'Auto-match! Pertukaran otomatis oleh sistem.'
        : 'Offer created successfully!'
      );
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 150);
  };

  const handleBackdropClick = () => { if (!loading) handleClose(); };
  const handleKeyDown = (e) => { if (e.key === 'Escape' && !loading) handleClose(); };

  const selectedTarget = availableTargets.find(c => c.id === parseInt(selectedTargetClass));
  const selectedTargetHasConflict = selectedTarget?.conflictWith;

  return (
    <div
      className={`fixed inset-0 bg-gray-900/60 z-50 p-4 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
        <div
          className={`bg-white rounded-lg shadow-2xl relative ${isClosing ? 'animate-popDown' : 'animate-popUp'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            disabled={loading}
            aria-label="Close modal"
            style={{ fontFamily: '"JetBrains Mono", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            className="absolute -top-6.5 -right-6 z-10 w-8 h-8 flex items-center justify-center text-white active:scale-50 hover:scale-120 transition-transform duration-60 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-2xl leading-none font-light">✕</span>
          </button>

          <div className="space-y-4 mx-8 pt-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 text-center">Create New Offer</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-gray-500 font-bold mb-1">
                  Kelas Saya
                </label>
                <select
                  className="w-full bg-gray-50 text-gray-900 text-sm p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                  value={selectedMyClass}
                  onChange={(e) => {
                    setSelectedMyClass(e.target.value);
                    setSelectedTargetClass('');
                    setError('');
                  }}
                  required
                  disabled={loading || myClasses.length === 0}
                >
                  <option value="">
                    {myClasses.length === 0 ? '-- Loading...' : '-- Pilih Kelas --'}
                  </option>
                  {myClasses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.courseName} ({c.classCode}) - {c.day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase text-gray-500 font-bold mb-1">
                  Tukar Ke
                </label>
                <select
                  className={`w-full bg-gray-50 text-gray-900 text-sm p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 ${
                    selectedTargetHasConflict ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  }`}
                  value={selectedTargetClass}
                  onChange={(e) => {
                    setSelectedTargetClass(e.target.value);
                    setError('');
                  }}
                  required
                  disabled={!selectedMyClass || loading}
                >
                  <option value="">
                    {!selectedMyClass
                      ? '-- Pilih kelas sumber dulu --'
                      : availableTargets.length === 0
                      ? '-- Tidak ada kelas lain --'
                      : '-- Pilih Target --'}
                  </option>
                  {availableTargets.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.conflictWith
                        ? `<!> ${c.classCode} - ${c.day}, ${c.timeStart} [bentrok dengan ${c.conflictWith.courseCode}-${c.conflictWith.classCode}]`
                        : `${c.classCode} - ${c.day}, ${c.timeStart} (${c.room})`}
                    </option>
                  ))}
                </select>

                {selectedTargetHasConflict && (
                  <p className="mt-1.5 text-xs text-red-600 font-bold">
                    &lt;!&gt; Kelas ini bentrok dengan {selectedTargetHasConflict.courseCode}-{selectedTargetHasConflict.classCode} ({selectedTargetHasConflict.day} {selectedTargetHasConflict.timeStart}–{selectedTargetHasConflict.timeEnd}). Penawaran akan ditolak server.
                  </p>
                )}

                {selectedMyClass && availableTargets.length === 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Tidak ada kelas paralel lain untuk mata kuliah ini
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="px-8 py-5 rounded-b-lg flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 text-sm font-bold py-3 px-4 border border-gray-300 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {successMessage ? 'CLOSE' : 'BATAL'}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !selectedTargetClass || !!successMessage}
              className="flex-1 bg-green-600 text-white text-sm font-bold py-3 px-4 rounded hover:bg-green-700 active:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'MENGIRIM...' : successMessage ? 'COMPLETED' : 'KIRIM TAWARAN'}
            </button>
          </div>
        </div>

        <div className="h-12 flex items-start justify-center pt-3">
          {error && (
            <div
              className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded shadow-lg"
              style={showMessage ? { animation: 'shake 0.25s ease-in-out' } : {}}
            >
              &lt;!&gt; {error} &lt;!&gt;
            </div>
          )}
          {successMessage && (
            <div
              className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded shadow-lg"
              style={showMessage ? { animation: 'shake 0.25s ease-in-out' } : {}}
            >
              &lt;✔&gt; {successMessage} &lt;✔&gt;
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes popUp { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes popDown { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(0.95); opacity: 0; } }
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes fadeOut { 0% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
        .animate-popUp { animation: popUp 0.15s ease-out; }
        .animate-popDown { animation: popDown 0.15s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.15s ease-out; }
        .animate-fadeOut { animation: fadeOut 0.15s ease-out; }
      `}</style>
    </div>
  );
}