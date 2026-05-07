import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useSwipeBack(enabled: boolean = true) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled) return;

    let touchStartX = 0;
    let touchStartY = 0;
    const swipeThreshold = 50;
    const edgeThreshold = 30; // Only trigger from the left edge

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = Math.abs(touchEndY - touchStartY);

      // If swipe starts near the left edge and moves right significantly
      // and doesn't move vertically too much
      if (
        touchStartX <= edgeThreshold && 
        deltaX > swipeThreshold && 
        deltaY < swipeThreshold
      ) {
        navigate(-1);
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, navigate]);
}
