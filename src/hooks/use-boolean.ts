import { useState, useCallback } from 'react';

interface UseBooleanOutput {
  value: boolean;
  setValue: React.Dispatch<React.SetStateAction<boolean>>;
  setTrue: () => void;
  setFalse: () => void;
  toggle: () => void;
}

/**
 * Custom hook to handle boolean state with additional utility functions
 * @param initialValue - The initial boolean value
 * @returns Object containing the boolean value and functions to manipulate it
 */
export const useBoolean = (initialValue = false): UseBooleanOutput => {
  const [value, setValue] = useState<boolean>(initialValue);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue(prev => !prev), []);

  return {
    value,
    setValue,
    setTrue,
    setFalse,
    toggle,
  };
};

export default useBoolean;
