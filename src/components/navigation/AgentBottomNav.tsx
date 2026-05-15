import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  ArchiveBoxIcon, 
  BuildingStorefrontIcon, 
  DocumentTextIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  ArchiveBoxIcon as ArchiveBoxIconSolid, 
  BuildingStorefrontIcon as BuildingStorefrontIconSolid, 
  DocumentTextIcon as DocumentTextIconSolid 
} from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';
import { useAgentStore } from '@/store/useAgentStore';
import { useUIStore } from '@/store/useUIStore';
import { useSalesStore } from '@/store/useSalesStore';
import { motion } from 'motion/react';
import { haptics } from '@/lib/haptics';

export const AgentBottomNav: React.FC = () => {
  const location = useLocation();
  const { getTodayStats, isLowStock, hasUnvisitedShops } = useAgentStore();
  const { setRecordSaleOpen } = useUIStore();
  const { dailyReports } = useSalesStore();
  
  const stats = getTodayStats();

  const reportBadge = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const report = dailyReports.find(r => r.date === today);
    
    if (report) return 'green'; // Submitted
    // Check for draft in local storage/indexedDB (simplified here)
    const hasDraft = localStorage.getItem(`report_draft_${today}`);
    if (hasDraft) return 'amber'; // Draft exists
    return 'red'; // Urgent
  }, [dailyReports]);

  const tabs = [
    { id: 'home', label: 'Home', path: '/agent/home', icon: HomeIcon, activeIcon: HomeIconSolid },
    { id: 'stock', label: 'Stock', path: '/agent/inventory', icon: ArchiveBoxIcon, activeIcon: ArchiveBoxIconSolid, badge: isLowStock() ? 'amber' : null },
    { id: 'fab', label: 'Sale', isFab: true },
    { id: 'shops', label: 'Shops', path: '/agent/shops', icon: BuildingStorefrontIcon, activeIcon: BuildingStorefrontIconSolid, badge: hasUnvisitedShops() ? 'red' : null },
    { id: 'report', label: 'Report', path: '/agent/report', icon: DocumentTextIcon, activeIcon: DocumentTextIconSolid, badge: reportBadge },
  ];

  const handleTabClick = (path: string) => {
    haptics.light();
    if (location.pathname === path) {
      const scrollContainer = document.querySelector('main');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleFabClick = () => {
    haptics.medium();
    setRecordSaleOpen(true);
  };

  return (
    <nav 
      role="navigation" 
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-slate-200/50 h-[calc(76px+env(safe-area-inset-bottom))] px-4 pb-[env(safe-area-inset-bottom)] rounded-t-[36px] shadow-[0_-8px-40px_rgba(15,23,42,0.12)] z-50 flex items-center justify-between"
    >
      {tabs.map((tab) => {
        if (tab.isFab) {
          return (
            <div key={tab.id} className="relative flex flex-col items-center -mt-14 px-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFabClick}
                aria-label="Record a new sale"
                className="flex items-center gap-2 px-6 h-[60px] rounded-[24px] bg-[#0F172A] text-white shadow-[0_12px_32px_rgba(13,148,136,0.35)] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/0 via-teal-500/20 to-teal-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <PlusIcon className="w-6 h-6 stroke-[3px] text-teal-400" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Sale</span>
              </motion.button>
            </div>
          );
        }

        const isActive = location.pathname === tab.path;
        const Icon = isActive ? tab.activeIcon! : tab.icon!;

        return (
          <NavLink
            key={tab.id}
            to={tab.path!}
            role="tab"
            aria-selected={isActive}
            aria-label={tab.label}
            onClick={() => handleTabClick(tab.path!)}
            className={({ isActive }) => cn(
              "relative flex flex-col items-center justify-center min-w-[68px] h-full transition-all duration-300 px-2",
              isActive ? "text-teal-600" : "text-slate-400"
            )}
          >
            <div className="relative flex flex-col items-center gap-1.5 z-10">
              <div className="relative p-1">
                <Icon className={cn(
                  "w-6 h-6 transition-transform", 
                  isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(13,148,136,0.5)]" : "scale-100"
                )} />
                
                {tab.badge && (
                  <div className={cn(
                    "absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white px-1 shadow-md z-20",
                    tab.badge === 'red' && "bg-rose-500",
                    tab.badge === 'amber' && "bg-amber-500",
                    tab.badge === 'green' && "bg-emerald-500"
                  )}>
                  </div>
                )}
              </div>
              <span className={cn(
                "text-[10px] uppercase tracking-[0.12em] transition-all",
                isActive ? "font-black" : "font-bold"
              )}>
                {tab.label}
              </span>
            </div>

            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-x-1 inset-y-2 bg-teal-500/5 border border-teal-500/10 rounded-2xl -z-0"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
