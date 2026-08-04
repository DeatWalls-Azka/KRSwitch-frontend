import React from 'react';
import { X } from 'lucide-react';

interface OfferModalHeaderProps {
  offerMode: 'swap' | 'pick_drop';
  setOfferMode: (mode: 'swap' | 'pick_drop') => void;
  onClose: () => void;
  loading: boolean;
  clearError: () => void;
}

export const OfferModalHeader: React.FC<OfferModalHeaderProps> = ({
  offerMode,
  setOfferMode,
  onClose,
  loading,
  clearError,
}) => {
  return (
    <div className="pt-5 px-4 md:px-8 pb-0">
      <button
        onClick={onClose}
        disabled={loading}
        aria-label="Close modal"
        className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
      >
        <X className="w-4 h-4" />
      </button>

      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 text-center">
        Buat Penawaran Baru
      </h3>

      {/* Primary Horizontal Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setOfferMode('swap');
            clearError();
          }}
          className={`pb-2.5 transition-colors relative ${
            offerMode === 'swap'
              ? 'text-gray-900 dark:text-gray-100 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-green-600 dark:after:bg-emerald-400'
              : 'text-gray-500 dark:text-gray-400 font-semibold hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Tukar Kelas
        </button>
        <button
          type="button"
          onClick={() => {
            setOfferMode('pick_drop');
            clearError();
          }}
          className={`pb-2.5 transition-colors relative ${
            offerMode === 'pick_drop'
              ? 'text-gray-900 dark:text-gray-100 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-green-600 dark:after:bg-emerald-400'
              : 'text-gray-500 dark:text-gray-400 font-semibold hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Drop Seat
        </button>
      </div>
    </div>
  );
};
