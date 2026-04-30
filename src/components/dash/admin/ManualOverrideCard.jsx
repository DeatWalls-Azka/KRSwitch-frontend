import React, { useState } from 'react';

const ManualOverrideCard = () => {
    const [nim1, setNim1] = useState('');
    const [nim2, setNim2] = useState('');

    const handleForceSwap = () => {
        if (!nim1 || !nim2) {
            alert("Kedua NIM harus diisi!");
            return;
        }
        // Logika dummy untuk demo
        alert(`ADMIN ACTION: Memaksa pertukaran jadwal antara ${nim1} dan ${nim2}`);
        setNim1('');
        setNim2('');
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <h3 className="text-sm font-black text-slate-800 tracking-widest uppercase">Manual Override</h3>
            </div>
            
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Gunakan fitur ini untuk menukar jadwal dua mahasiswa secara paksa tanpa melalui mekanisme barter normal.
            </p>

            <div className="space-y-3">
                <input 
                    type="text" 
                    placeholder="Masukkan NIM Mahasiswa 1"
                    className="w-full p-2 text-xs border border-gray-200 rounded font-mono focus:ring-1 focus:ring-orange-400 outline-none"
                    value={nim1}
                    onChange={(e) => setNim1(e.target.value)}
                />
                <input 
                    type="text" 
                    placeholder="Masukkan NIM Mahasiswa 2"
                    className="w-full p-2 text-xs border border-gray-200 rounded font-mono focus:ring-1 focus:ring-orange-400 outline-none"
                    value={nim2}
                    onChange={(e) => setNim2(e.target.value)}
                />
                <button 
                    onClick={handleForceSwap}
                    className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black rounded transition-all tracking-tighter"
                >
                    EKSEKUSI PERTUKARAN PAKSA
                </button>
            </div>
        </div>
    );
};

export default ManualOverrideCard;