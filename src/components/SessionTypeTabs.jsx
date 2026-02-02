export default function SessionTypeTabs({ courseType, selectedSessionType, onSessionTypeSelect }) {
  return (
    <div className="flex bg-gray-50 px-4 border-b border-gray-200 flex-shrink-0">
      <button 
        className={`min-w-[120px] bg-transparent border-0 border-b-2 cursor-pointer px-4 py-1.5 text-xs font-bold transition-all duration-150 ${
          selectedSessionType === 'kuliah'
            ? 'text-gray-900 bg-green-100 border-green-600'
            : 'text-gray-500 border-transparent hover:text-gray-900 hover:bg-gray-100'
        }`}
        onClick={() => onSessionTypeSelect('kuliah')}
      >
        KULIAH (K)
      </button>

      {courseType === 1 && (
        <button 
          className={`min-w-[120px] bg-transparent border-0 border-b-2 cursor-pointer px-4 py-1.5 text-xs font-bold transition-all duration-150 ${
            selectedSessionType === 'praktikum'
              ? 'text-gray-900 bg-green-100 border-green-600'
              : 'text-gray-500 border-transparent hover:text-gray-900 hover:bg-gray-100'
          }`}
          onClick={() => onSessionTypeSelect('praktikum')}
        >
          PRAKTIKUM (P)
        </button>
      )}

      {courseType === 2 && (
        <button 
          className={`min-w-[120px] bg-transparent border-0 border-b-2 cursor-pointer px-4 py-1.5 text-xs font-bold transition-all duration-150 ${
            selectedSessionType === 'responsi'
              ? 'text-gray-900 bg-green-100 border-green-600'
              : 'text-gray-500 border-transparent hover:text-gray-900 hover:bg-gray-100'
          }`}
          onClick={() => onSessionTypeSelect('responsi')}
        >
          RESPONSI (R)
        </button>
      )}
    </div>
  );
}