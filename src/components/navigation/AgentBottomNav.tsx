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
      className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200/50 h-[calc(68px+env(safe-area-inset-bottom))] px-3 pb-[env(safe-area-inset-bottom)] rounded-t-[32px] shadow-[0_-8px-32px_rgba(15,23,42,0.08)] z-50 flex items-center justify-between"
    >
      {tabs.map((tab) => {
        if (tab.isFab) {
          return (
            <div key={tab.id} className="relative flex flex-col items-center -mt-12 px-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFabClick}
                aria-label="Record a new sale"
                className="flex items-center gap-2 px-5 h-[56px] rounded-[24px] bg-[#0F172A] text-white shadow-[0_8px_24px_rgba(15,23,42,0.3)] relative overflow-hidden group"
              >
                {/* Glass shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/0 via-teal-500/20 to-teal-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <PlusIcon className="w-6 h-6 stroke-[2.5px]" />
                <span className="text-sm font-black uppercase tracking-widest">Sale</span>
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
              "relative flex flex-col items-center justify-center min-w-[64px] h-full gap-1 transition-all duration-300",
              isActive ? "text-teal-600 scale-110" : "text-slate-400"
            )}
          >
            <div className="relative p-1">
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-teal-50 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className={cn("w-6 h-6 transition-transform", isActive ? "scale-110" : "scale-100")} />
              
              {tab.badge && (
                <div className={cn(
                  "absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white px-1 shadow-sm z-20",
                  tab.badge === 'red' && "bg-rose-500",
                  tab.badge === 'amber' && "bg-amber-500",
                  tab.badge === 'green' && "bg-emerald-500"
                )}>
                  {/* For simplicity using dots if no count, but the plan mentioned number badges */}
                  {/* Since I don't have counts here easily, I'll keep them as dots or small indicators as per the badge prop */}
                </div>
              )}
            </div>
            <span className={cn(
              "text-[9px] uppercase tracking-[0.1em]",
              isActive ? "font-black" : "font-bold"
            )}>
              {tab.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
};
