import React, { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useAgentStore } from '@/store/useAgentStore';
import { useUIStore } from '@/store/useUIStore';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';
import { SyncStatusStrip } from './SyncStatusStrip';

export const AgentHomeHeader: React.FC = () => {
  const { getAgentName, getAgentInitials, getPhotoURL } = useAgentStore();
  const { setNotificationsOpen, setProfileMenuOpen } = useUIStore();
  const [greeting, setGreeting] = useState('');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning,');
    else if (hour < 17) setGreeting('Good afternoon,');
    else setGreeting('Good evening,');

    if (window.visualViewport) {
      const handleResize = () => {
        const isKeyboard = window.visualViewport!.height < window.innerHeight * 0.8;
        setIsKeyboardOpen(isKeyboard);
      };
      window.visualViewport.addEventListener('resize', handleResize);
      return () => window.visualViewport?.removeEventListener('resize', handleResize);
    }
  }, []);

  const firstName = getAgentName().split(' ')[0];
  const initials = getAgentInitials();
  const photoURL = getPhotoURL();

  const handleProfileClick = () => {
    haptics.light();
    setProfileMenuOpen(true);
  };

  const handleNotificationClick = () => {
    haptics.light();
    setNotificationsOpen(true);
  };

  if (isKeyboardOpen) return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0F172A] h-[calc(72px+env(safe-area-inset-top))] pt-[calc(env(safe-area-inset-top)+8px)] px-5 flex items-center justify-between border-b border-slate-800/50 shadow-2xl overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_-20%,#0D948815,transparent_50%)] pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <button 
            onClick={handleProfileClick}
            aria-label="Open profile menu"
            aria-haspopup="dialog"
            className="relative active:scale-95 transition-transform"
          >
            <div className="relative w-12 h-12 rounded-full bg-slate-900 ring-2 ring-teal-500/60 ring-offset-2 ring-offset-slate-900 flex items-center justify-center text-white overflow-hidden shadow-2xl">
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[15px] text-teal-400 font-black tracking-tighter">{initials}</span>
              )}
              <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            </div>
          </button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 leading-none">{greeting}</span>
              <div className="h-[1px] w-3 bg-slate-700" />
              <div className="bg-teal-500/10 px-2 py-0.5 rounded-full">
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-teal-500 leading-none">
                  {new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}
                </span>
              </div>
            </div>
            <h2 className="text-xl font-black text-white leading-none tracking-tight truncate max-w-[160px]">
              {firstName}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button 
            onClick={handleNotificationClick}
            aria-label="View notifications"
            className="relative h-12 w-12 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-300 active:bg-slate-800 transition-all hover:border-slate-600 group"
          >
            <BellIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#0F172A] shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
          </button>
        </div>
      </header>
      <SyncStatusStrip />
    </>
  );
};
