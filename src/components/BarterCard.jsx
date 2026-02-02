export default function BarterCard({ offer }) {
  return (
    <div className="border border-gray-200 rounded-md bg-white p-3 mb-3 hover:border-green-600 transition-all duration-150">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="text-[10px] text-gray-500 font-mono mb-1">{offer.nim}</div>
          <div className="text-xs font-bold text-gray-900">{offer.studentName}</div>
        </div>
        <div className="text-[10px] text-gray-500">{offer.timestamp}</div>
      </div>
      
      <div className="flex items-center gap-2 my-2">
        <div className="flex-1 bg-red-50 border border-red-200 rounded px-2 py-1.5">
          <div className="text-[9px] text-red-600 font-bold mb-0.5">OFFERING</div>
          <div className="text-[11px] font-bold text-red-900">{offer.offeringClass}</div>
        </div>
        
        <div className="text-gray-400">⇄</div>
        
        <div className="flex-1 bg-green-50 border border-green-200 rounded px-2 py-1.5">
          <div className="text-[9px] text-green-600 font-bold mb-0.5">SEEKING</div>
          <div className="text-[11px] font-bold text-green-900">{offer.seekingClass}</div>
        </div>
      </div>
      
      {offer.message && (
        <div className="text-[10px] text-gray-600 mt-2 p-2 bg-gray-50 rounded">
          {offer.message}
        </div>
      )}
      
      <div className="flex gap-2 mt-3">
        <button className="flex-1 bg-green-600 text-white text-[10px] font-bold py-1.5 px-3 rounded border-0 cursor-pointer hover:bg-green-700 transition-colors">
          ACCEPT
        </button>
        <button className="bg-gray-100 text-gray-700 text-[10px] font-bold py-1.5 px-3 rounded border-0 cursor-pointer hover:bg-gray-200 transition-colors">
          CONTACT
        </button>
      </div>
    </div>
  );
}