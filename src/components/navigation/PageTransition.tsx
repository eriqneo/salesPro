import React from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const navigationType = useNavigationType();

  // Root tabs paths
  const rootTabs = ['/agent/home', '/agent/inventory', '/agent/shops', '/agent/report'];
  const isRootTab = rootTabs.includes(location.pathname);

  // Determine animation variants
  const variants = {
    initial: (type: string) => {
      if (isRootTab) return { opacity: 0 };
      return { x: type === 'PUSH' ? '100%' : '-100%', opacity: 0 };
    },
    animate: { x: 0, opacity: 1 },
    exit: (type: string) => {
      if (isRootTab) return { opacity: 0 };
      return { x: type === 'POP' ? '100%' : '-100%', opacity: 0 };
    }
  };

  return (
    <AnimatePresence mode="wait" custom={navigationType}>
      <motion.div
        key={location.pathname}
        custom={navigationType}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration: isRootTab ? 0.15 : 0.28,
          ease: [0.4, 0, 0.2, 1]
        }}
        className="flex-1 flex flex-col min-h-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
