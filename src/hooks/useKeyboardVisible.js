// src/hooks/useKeyboardVisible.js
import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the keyboard is visible on mobile devices
 * @returns {boolean} Whether the keyboard is likely visible
 */
export function useKeyboardVisible() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    // Only run this on mobile devices
    if (typeof window === 'undefined' || window.innerWidth > 768) return;

    const handleFocus = () => {
      setIsKeyboardVisible(true);
    };

    const handleBlur = () => {
      setIsKeyboardVisible(false);
    };

    // Check for input, textarea, and select elements
    const inputElements = document.querySelectorAll('input, textarea, select');
    
    inputElements.forEach(element => {
      element.addEventListener('focus', handleFocus);
      element.addEventListener('blur', handleBlur);
    });

    // Cleanup
    return () => {
      inputElements.forEach(element => {
        element.removeEventListener('focus', handleFocus);
        element.removeEventListener('blur', handleBlur);
      });
    };
  }, []);

  return isKeyboardVisible;
}

export default useKeyboardVisible;