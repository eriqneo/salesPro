import React from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Outlet } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

import { useAuthStore } from '@/store/useAuthStore';
import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function AdminLayout() {
  const { user } = useAuthStore();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AdminSidebar />
          <main className="flex-1 flex flex-col min-h-0">
            {/* Top Navbar */}
            <header className="h-16 border-b border-border bg-white sticky top-0 z-40 px-8 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4 flex-1">
                <div className="md:hidden">
                  <SidebarTrigger />
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-text-primary font-bold">Hello, {user?.name.split(' ')[0]}</span>
                  <span className="text-text-secondary text-sm">— Welcome back to SalesPro</span>
                </div>
                <div className="relative max-w-md w-full ml-8 hidden lg:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <Input 
                    placeholder="Search analytics, agents, or reports..." 
                    className="pl-10 bg-slate-100 border-none rounded-xl h-10 text-sm focus-visible:ring-primary"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-xl text-text-secondary">
                  <Bell className="w-5 h-5" />
                </Button>
                <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.[0]}
                </div>
              </div>
            </header>
            
            <div className="flex-1 overflow-y-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
