import { useEffect } from 'react';

/**
 * Custom hook to enable arrow key navigation (Left/Right) for paginated tables.
 * Safely ignores keydown events if the active element is an input, textarea, or similar editable field.
 *
 * @param currentPage Current active page index (1-based)
 * @param totalPages Total count of available pages
 * @param onPageChange Callback function to handle page switching
 */
export function useTableKeyboardPagination(
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Safeguard against firing when writing inside editable elements
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName.toUpperCase();
        if (
          tagName === 'INPUT' ||
          tagName === 'TEXTAREA' ||
          tagName === 'SELECT' ||
          activeEl.getAttribute('contenteditable') === 'true'
        ) {
          return;
        }
      }

      if (e.key === 'ArrowLeft') {
        if (currentPage > 1) {
          e.preventDefault();
          onPageChange(currentPage - 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (currentPage < totalPages) {
          e.preventDefault();
          onPageChange(currentPage + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, onPageChange]);
}
