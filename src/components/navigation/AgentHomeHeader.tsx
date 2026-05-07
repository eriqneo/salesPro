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
            className="relative group active:scale-95 transition-transform"
          >
            <div className="absolute -inset-1 bg-gradient-to-br from-teal-500 to-slate-500 rounded-full blur-[2px] opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-11 h-11 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-white overflow-hidden shadow-inner">
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[14px] text-teal-400 font-black tracking-tighter">{initials}</span>
              )}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-lg" />
            </div>
          </button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">{greeting}</span>
              <div className="h-[1px] w-4 bg-slate-700" />
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-teal-500/80 leading-none">
                {new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}
              </span>
            </div>
            <h2 className="text-lg font-black text-white leading-none tracking-tight truncate max-w-[160px]">
              {firstName}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button 
            onClick={handleNotificationClick}
            aria-label="View notifications"
            className="relative h-11 px-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-300 active:bg-slate-800 transition-all hover:border-slate-600 group"
          >
            <BellIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0F172A] shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
          </button>
        </div>
      </header>
      <SyncStatusStrip />
    </>
  );
};
