export default function FilterButton({ label, isActive, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`text-[11px] font-bold py-1 px-2.5 border-0 cursor-pointer transition-colors rounded-md ${
        isActive 
          ? 'border-1 border-green-600 bg-white text-green-600 hover:bg-green-50 shadow-sm' 
          : 'border-1 border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}