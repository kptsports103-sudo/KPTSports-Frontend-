import { useState, useEffect, useCallback, useRef } from 'react';

const useEditableTable = ({ storageKey, initialRow }) => {
  const [rows, setRows] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [dirty, setDirty] = useState(false);
  const isFirstRender = useRef(true);

  // Mark as dirty when rows change (skip first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setDirty(true);
  }, [rows]);

  const updateRow = useCallback((index, field, value) => {
    setRows(prev => prev.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    ));
  }, []);

  const addRow = useCallback(() => {
    setRows(prev => {
      const newSlNo = prev.length > 0 ? Math.max(...prev.map(r => r.slNo)) + 1 : 1;
      return [...prev, { ...initialRow, slNo: newSlNo }];
    });
  }, [initialRow]);

  const deleteRow = useCallback((index) => {
    setRows(prev =>
      prev
        .filter((_, i) => i !== index)
        .map((row, i) => ({ ...row, slNo: i + 1 }))
    );
  }, []);

  const save = useCallback(async () => {
    setSaveStatus("saving");
    try {
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.setItem(storageKey, JSON.stringify(rows));
      setLastSavedAt(new Date());
      setDirty(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      setSaveStatus("error");
      console.error("Save failed:", error);
    }
  }, [rows, storageKey]);

  return {
    rows,
    isEditMode,
    setIsEditMode,
    saveStatus,
    lastSavedAt,
    dirty,
    updateRow,
    addRow,
    deleteRow,
    save,
  };
};

export { useEditableTable };