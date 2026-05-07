import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AgentHomeHeader } from './AgentHomeHeader';
import { AgentPageHeader } from './AgentPageHeader';
import { AgentBottomNav } from './AgentBottomNav';
import { ProfileMenuSheet } from './ProfileMenuSheet';
import { RecordSaleSheet } from './RecordSaleSheet';
import { FirstTimeOverlay } from '../onboarding/FirstTimeOverlay';
import { PageTransition } from './PageTransition';
import { useUIStore } from '@/store/useUIStore';
import { cn } from '@/lib/utils';

export const AgentShell: React.FC = () => {
  const location = useLocation();
  const { isRecordSaleOpen, setRecordSaleOpen } = useUIStore();

  // Root tabs paths
  const rootTabs = ['/agent/home', '/agent/inventory', '/agent/shops', '/agent/report'];
  const isRootTab = rootTabs.includes(location.pathname);

  // Determine title for sub-pages
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/inventory/add')) return 'Add Stock';
    if (path.includes('/inventory')) return 'Inventory';
    if (path.includes('/shops')) return 'My Shops';
    if (path.includes('/report/history')) return 'Report History';
    if (path.includes('/report')) return 'Evening Report';
    if (path.includes('/profile')) return 'My Profile';
    if (path.includes('/settings')) return 'Settings';
    if (path.includes('/help')) return 'Help & Support';
    if (path.includes('/record')) return 'Record Sale';
    return 'Details';
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {isRootTab && <AgentHomeHeader />}

      <main className={cn(
        "flex-1 overflow-y-auto pb-[calc(60px+env(safe-area-inset-bottom)+16px)]",
        isRootTab ? "pt-[calc(64px+env(safe-area-inset-top))]" : "pt-0"
      )}>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      <AgentBottomNav />
      <ProfileMenuSheet />
      <RecordSaleSheet />
      <FirstTimeOverlay />
    </div>
  );
};
