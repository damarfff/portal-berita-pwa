import { useContext } from 'react';
import { AccessibilityContext } from '../contexts/AccessibilityContextObject';

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility harus dipakai di dalam AccessibilityProvider');
  }
  return context;
};