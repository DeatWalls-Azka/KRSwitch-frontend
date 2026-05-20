interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export default function FilterButton({ label, isActive, onClick }: FilterButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`text-[11px] font-bold py-1 px-2.5 cursor-pointer transition-colors rounded-md ${
        isActive 
          ? 'border border-green-600 dark:border-emerald-500 bg-white dark:bg-emerald-950/20 text-green-600 dark:text-emerald-400 hover:bg-green-50 dark:hover:bg-emerald-900/10 shadow-sm' 
          : 'border border-gray-300 dark:border-gray-700 bg-white dark:bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}
    >
      {label}
    </button>
  );
}
