import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  ChartBarIcon, 
  UsersIcon, 
  DocumentTextIcon, 
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useSalesStore } from '@/store/useSalesStore';
import { useAdminStore } from '@/store/useAdminStore';
import { motion, AnimatePresence } from 'motion/react';
import { AdminSidebar } from './AdminSidebar';

interface AdminBottomNavProps {
  className?: string;
}

export function AdminBottomNav({ className }: AdminBottomNavProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { dailyReports } = useSalesStore();
  const { agents } = useAdminStore();

  const today = new Date().toISOString().split('T')[0];
  const submittedAgentIds = dailyReports
    .filter(r => r.date === today)
    .map(r => r.agentId);
  const missingReportsCount = agents.filter(a => a.role === 'agent' && a.status === 'active' && !submittedAgentIds.includes(a.uid)).length;

  const tabs = [
    { label: 'Overview', path: '/admin', icon: HomeIcon },
    { label: 'Sales', path: '/admin/sales-reports', icon: ChartBarIcon },
    { label: 'Agents', path: '/admin/agents', icon: UsersIcon },
    { label: 'Reports', path: '/admin/daily-reports', icon: DocumentTextIcon, badge: missingReportsCount },
    { label: 'More', onClick: () => setIsMoreOpen(true), icon: Bars3Icon },
  ];

  return (
    <>
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E2E8F0] shadow-[0_-4px_16px_rgba(13,148,136,0.06)] rounded-t-[20px] px-2 pt-2 pb-[env(safe-area-inset-bottom,12px)]",
        className
      )}>
        <div className="flex items-center justify-around h-[60px]">
          {tabs.map((tab, idx) => {
            const isMore = tab.label === 'More';
            
            if (isMore) {
              return (
                <button 
                  key={idx} 
                  onClick={tab.onClick}
                  className="flex-1 flex flex-col items-center justify-center gap-1 relative h-full active:scale-90 transition-transform"
                >
                  <tab.icon className="w-6 h-6 text-[#94A3B8]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">
                    {tab.label}
                  </span>
                </button>
              );
            }

            return (
              <NavLink 
                key={tab.path} 
                to={tab.path!} 
                end={tab.path === '/admin'}
                className="flex-1"
              >
                {({ isActive }) => (
                  <div className="flex flex-col items-center justify-center gap-1 relative w-full h-full py-1">
                    <AnimatePresence>
                      {isActive && (
                        <motion.div 
                          layoutId="admin-nav-pill"
                          className="absolute -top-1 w-8 h-1 bg-[#0D9488] rounded-full"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                    </AnimatePresence>
                    <tab.icon className={cn(
                      "w-6 h-6 transition-colors duration-200",
                      isActive ? "text-[#0D9488]" : "text-[#94A3B8]"
                    )} />
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest transition-colors duration-200",
                      isActive ? "text-[#0D9488]" : "text-[#94A3B8]"
                    )}>
                      {tab.label}
                    </span>
                    {tab.badge && tab.badge > 0 && (
                      <span className="absolute top-0 right-1/2 translate-x-4 bg-[#EF4444] text-white text-[9px] font-black px-1 rounded-full min-w-[14px] flex items-center justify-center border-2 border-white shadow-sm">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* AdminDrawer - Full height slide up sheet */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
              className="fixed inset-0 z-[70] bg-white flex flex-col"
            >
              <div className="pt-[env(safe-area-inset-top)] flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between px-6 h-[56px] shrink-0 border-b border-slate-100">
                  <h2 className="text-xl font-black text-slate-900">Menu</h2>
                  <button 
                    onClick={() => setIsMoreOpen(false)}
                    className="p-2 -mr-2 bg-slate-100 rounded-full text-slate-500 active:scale-95 transition-transform"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto pb-10">
                  {/* Reuse Sidebar for content but make it full width */}
                  <div className="sidebar-mobile-reset lg:block">
                    <AdminSidebar forceShowLabels />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
