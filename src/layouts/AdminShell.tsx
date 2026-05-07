import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { AdminBottomNav } from '@/components/admin/AdminBottomNav';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

export default function AdminShell() {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
        {/* Sidebar — hidden on mobile, icon-only on tablet, full on desktop */}
        <aside className={cn(
          "hidden md:flex transition-all duration-250 ease-in-out relative z-30 shadow-2xl shadow-slate-900/10 shrink-0",
          "md:w-16 lg:w-60"
        )}>
          <AdminSidebar />
        </aside>

        {/* Right column */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <AdminTopBar />
          
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            <div className="min-h-full">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Mobile bottom nav — only on small screens */}
        <AdminBottomNav className="md:hidden" />
      </div>
    </TooltipProvider>
  );
}
