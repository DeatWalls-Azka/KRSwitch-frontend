export default function BarterCard({ offer }) {
  return (
    <div className="border border-gray-200 bg-white p-2 mb-2 flex items-center gap-3 text-[10px] border-radius-2 rounded-md">
      <div className="flex-dir col">
        <div className="text-gray-900 min-w-[100px] truncate font-bold">{offer.studentName}</div>
        <div className="font-mono text-gray-500 min-w-[90px]">{offer.nim}</div>
      </div>
      <div className="flex items-center">
        <span className="text-red-600 font-bold">{offer.offeringClass}</span>
        <span className="text-gray-400 text-[9px]">{offer.offeringCourse}</span>
      </div>

      <div className="text-gray-400">⇌</div>

      <div className="flex items-center gap-1.5">
        <span className="text-green-600 font-bold">{offer.seekingClass}</span>
        <span className="text-gray-400 text-[9px]">{offer.seekingCourse}</span>
      </div>

      <div className="ml-auto flex gap-1.5">
        <button className="bg-green-600 text-white text-[9px] font-bold py-1 px-2.5 border-0 cursor-pointer hover:bg-green-700 transition-colors rounded-sm">
          TRADE
        </button>
      </div>
    </div>
  );
}