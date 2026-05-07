import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { AdminSidebar } from './AdminSidebar';
import { useAuthStore } from '@/store/useAuthStore';

interface AdminMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminMobileDrawer({ isOpen, onClose }: AdminMobileDrawerProps) {
  const { user } = useAuthStore();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          {/* Drawer Content */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.1, right: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -100) onClose();
            }}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 33 }}
            className="absolute top-0 left-0 bottom-0 w-[min(85vw,340px)] bg-[#0D1117] shadow-[20px_0_60px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden"
          >
            {/* Header / Brand */}
            <div className="relative px-6 pt-10 pb-4 shrink-0">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2.5 bg-white/5 text-slate-400 rounded-2xl active:scale-90 transition-all hover:bg-white/10"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Menu - AdminSidebar handles the rest */}
            <div className="flex-1 overflow-y-auto sidebar-mobile-reset">
              <AdminSidebar forceShowLabels />
            </div>

            {/* Support Info */}
            <div className="p-8 bg-black/20 flex flex-col items-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">SalesPro v2.1.0 • Secure</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
