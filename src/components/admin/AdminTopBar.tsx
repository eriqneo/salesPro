import React, { useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { 
  Bars3Icon, 
  MagnifyingGlassIcon, 
  BellIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { AdminMobileDrawer } from './AdminMobileDrawer';
import { AdminProfileMenu } from './AdminProfileMenu';
import { Input } from '@/components/ui/input';
import { useNavigate, useLocation } from 'react-router-dom';

export function AdminTopBar() {
  const { currentPageTitle } = useAdminStore();
  const { user } = useAuthStore();
  const { isMobile } = useBreakpoint();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const isSubPage = location.pathname.split('/').length > 3; // e.g., /admin/agents/:id

  if (isMobile) {
    return (
      <header className="sticky top-0 z-40 flex flex-col pt-[env(safe-area-inset-top)] bg-white border-b border-slate-100 shadow-sm">
        <div className="h-16 flex items-center justify-between px-4">
          <div className="flex items-center">
            {isSubPage ? (
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-600 px-3 h-10 rounded-xl active:bg-slate-50 transition-all font-black text-[10px] uppercase tracking-widest"
              >
                <ChevronLeftIcon className="w-5 h-5 text-teal-600" />
                <span>Back</span>
              </button>
            ) : (
              <button 
                onClick={() => setDrawerOpen(true)}
                className="w-10 h-10 flex items-center justify-center text-slate-900 active:scale-95 transition-transform"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
            )}
          </div>
          
          <div className="flex flex-col items-center">
            <h1 className="text-[11px] font-black text-slate-900 truncate max-w-[150px] text-center tracking-[0.2em] uppercase leading-none">
              {currentPageTitle}
            </h1>
            <div className="h-1 w-4 bg-teal-500/20 rounded-full mt-2" />
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setSearchOpen(true)} className="w-10 h-10 flex items-center justify-center text-slate-400 active:opacity-70">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
            <AdminProfileMenu isMobile />
          </div>
        </div>

        <AdminMobileDrawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} />
      </header>
    );
  }

  return (
    <header className="h-20 flex items-center justify-between px-10 bg-white border-b border-slate-100 sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-8 flex-1">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight truncate">
            {currentPageTitle}
          </h2>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1 h-1 rounded-full bg-teal-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Management Console</span>
          </div>
        </div>
        
        <div className="relative max-w-md w-full ml-12 hidden xl:block group">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-teal-600 transition-colors" />
          <Input 
            placeholder="Search team, sales, or records..." 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-12 bg-slate-50 border-transparent focus:border-teal-500/20 focus:bg-white focus:ring-4 focus:ring-teal-500/5 rounded-2xl h-12 text-sm font-bold transition-all"
          />
          {searchValue && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 animate-in fade-in slide-in-from-top-2 duration-300 z-50">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4 py-3 border-b border-slate-50">Search Results</p>
              <div className="py-2">
                <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-sm font-black text-slate-700 transition-colors flex items-center justify-between group">
                  <span>Show all results for "{searchValue}"</span>
                  <ChevronLeftIcon className="w-4 h-4 rotate-180 text-slate-300 group-hover:text-teal-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-8">
        <button className="relative w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all group">
          <BellIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute top-3 right-3 w-3 h-3 bg-danger rounded-full border-2 border-white shadow-sm" />
        </button>
        
        <div className="w-[1px] h-8 bg-slate-100" />
        
        <AdminProfileMenu />
      </div>
    </header>
  );
}
