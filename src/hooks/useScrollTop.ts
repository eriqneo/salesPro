import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { haptics } from '@/lib/haptics';

export const useScrollTop = () => {
  const location = useLocation();

  const scrollToTop = useCallback((path: string) => {
    if (location.pathname === path) {
      haptics.light();
      const scrollContainer = document.querySelector('main');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
      return true;
    }
    return false;
  }, [location.pathname]);

  return scrollToTop;
};
