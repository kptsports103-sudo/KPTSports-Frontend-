import { useEffect, useRef } from 'react';

const useAutoSave = ({ enabled, dirty, isSaving, onSave }) => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (enabled && dirty.size > 0 && !isSaving) {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for auto-save (e.g., 2 seconds after last change)
      timeoutRef.current = setTimeout(() => {
        onSave();
      }, 2000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, dirty, isSaving, onSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
};

export { useAutoSave };