import React from 'react';
import { Loader2 } from 'lucide-react';

interface OfferModalFooterProps {
  submitDisabledReason: string;
  isSubmitDisabled: boolean;
  error: string;
  successMessage: string;
  showMessage: boolean;
  loading: boolean;
  offerMode: 'swap' | 'pick_drop';
  swapType: 'single' | 'batch';
  batchRowCount: number;
  handleClose: () => void;
  handleSubmit: () => void;
}

export const OfferModalFooter: React.FC<OfferModalFooterProps> = ({
  submitDisabledReason,
  isSubmitDisabled,
  error,
  successMessage,
  showMessage,
  loading,
  offerMode,
  swapType,
  batchRowCount,
  handleClose,
  handleSubmit,
}) => {
  return (
    <>
      {/* Footer Actions */}
      <div className="px-4 md:px-8 pb-4 md:pb-5 pt-3 md:pt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleClose}
          disabled={loading}
          className="flex-1 text-sm font-black py-2.5 md:py-3 px-4 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {successMessage ? 'TUTUP' : 'BATAL'}
        </button>
        <div className="flex-1 min-w-0" title={submitDisabledReason || undefined}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`w-full text-white text-sm font-black py-2.5 md:py-3 px-4 rounded transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-800 dark:disabled:text-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              offerMode === 'pick_drop'
                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 text-white" />
                <span>MENGIRIM...</span>
              </>
            ) : successMessage ? (
              'SELESAI'
            ) : (
              <span>
                KIRIM {offerMode === 'swap' && swapType === 'batch' ? `(${batchRowCount})` : ''}
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
