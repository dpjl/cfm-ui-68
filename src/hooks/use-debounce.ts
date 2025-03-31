
import { useState, useEffect } from 'react';

/**
 * Un hook qui retarde la mise à jour d'une valeur
 * @param value La valeur à débouncer
 * @param delay Le délai en millisecondes
 * @returns La valeur débounced
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Mettre à jour la valeur débounced après le délai
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Annuler le timeout si la valeur change à nouveau
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
