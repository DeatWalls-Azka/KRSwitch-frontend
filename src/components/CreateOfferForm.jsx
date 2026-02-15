import { useState, useEffect } from 'react';



export default function CreateOfferForm({ onSuccess, onClose }) {

  const dummyMyClasses = [
    { id: 101, courseCode: 'KOM201', courseName: 'Basis Data', classCode: 'K1', day: 'Senin', timeStart: '08:00' },
    { id: 102, courseCode: 'KOM202', courseName: 'Algoritma', classCode: 'P2', day: 'Rabu', timeStart: '13:00' },
  ];

  
  const dummyAllClasses = [
    // Basis Data
    { id: 101, courseCode: 'KOM201', classCode: 'K1', day: 'Senin', timeStart: '08:00', room: 'A1' },
    { id: 201, courseCode: 'KOM201', classCode: 'K2', day: 'Selasa', timeStart: '10:00', room: 'A2' },
    { id: 202, courseCode: 'KOM201', classCode: 'K3', day: 'Rabu', timeStart: '08:00', room: 'A3' },
    // Algoritma
    { id: 102, courseCode: 'KOM202', classCode: 'P2', day: 'Rabu', timeStart: '13:00', room: 'Lab1' },
    { id: 301, courseCode: 'KOM202', classCode: 'P1', day: 'Senin', timeStart: '13:00', room: 'Lab2' },
    { id: 302, courseCode: 'KOM202', classCode: 'P3', day: 'Jumat', timeStart: '08:00', room: 'Lab3' },
  ];

  const [myClasses, setMyClasses] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  
  const [selectedMyClass, setSelectedMyClass] = useState('');
  const [selectedTargetClass, setSelectedTargetClass] = useState('');
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    
    setTimeout(() => {
        setMyClasses(dummyMyClasses);
        setAllClasses(dummyAllClasses);
    }, 500);
  }, []);

  const availableTargets = allClasses.filter(c => {
    if (!selectedMyClass) return false;
    const current = myClasses.find(m => m.id === parseInt(selectedMyClass));
    if (!current) return false;
    return c.courseCode === current.courseCode && c.id !== current.id;
  });

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

   
    setTimeout(() => {
        alert('✅ Tawaran Barter Berhasil Dibuat!');
        if (onSuccess) onSuccess();
        if (onClose) onClose();
        setLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">💱 New Offer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-1 transition">✕</button>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Input 1: Kelas Saya */}
            <div>
              <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Kelas Saya</label>
              <select 
                className="w-full bg-gray-50 text-gray-900 text-sm p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedMyClass}
                onChange={(e) => setSelectedMyClass(e.target.value)}
                required
              >
                <option value="">-- Pilih Kelas --</option>
                {myClasses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.courseName} ({c.classCode}) - {c.day}
                  </option>
                ))}
              </select>
            </div>

            {/* Input 2: Tukar Ke */}
            <div>
              <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Tukar Ke</label>
              <select 
                className="w-full bg-gray-50 text-gray-900 text-sm p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                value={selectedTargetClass}
                onChange={(e) => setSelectedTargetClass(e.target.value)}
                required
                disabled={!selectedMyClass}
              >
                <option value="">-- Pilih Target --</option>
                {availableTargets.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.classCode} - {c.day}, {c.timeStart} ({c.room})
                  </option>
                ))}
              </select>
            </div>

            {/* Tombol */}
            <div className="pt-4 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Batal</button>
              <button 
                type="submit" 
                disabled={loading || !selectedTargetClass}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-lg shadow-green-500/30 transition disabled:opacity-50"
              >
                {loading ? 'Mengirim...' : 'Kirim Tawaran'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}