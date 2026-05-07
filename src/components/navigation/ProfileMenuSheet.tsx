import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  Cog6ToothIcon, 
  BellIcon, 
  QuestionMarkCircleIcon, 
  InformationCircleIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { useAgentStore } from '@/store/useAgentStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export const ProfileMenuSheet: React.FC = () => {
  const navigate = useNavigate();
  const { isProfileMenuOpen, setProfileMenuOpen } = useUIStore();
  const { getAgentName, getAgentInitials, getPhotoURL } = useAgentStore();
  const { user, logout } = useAuthStore();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  
  const pendingSyncs = useLiveQuery(() => db.syncQueue.count()) || 0;
  const isOnline = navigator.onLine;

  const handleSignOut = async () => {
    try {
      logout();
      if (pendingSyncs === 0) {
        await db.syncQueue.clear();
        await db.reportDrafts.clear();
      }
      setProfileMenuOpen(false);
      setShowSignOutConfirm(false);
      navigate('/login', { replace: true });
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const menuItems = [
    { icon: UserIcon, label: 'My Profile', secondary: 'Account details & stats', path: '/agent/profile' },
    { icon: Cog6ToothIcon, label: 'Settings', secondary: 'App preferences', path: '/agent/settings' },
    { icon: BellIcon, label: 'Notifications', secondary: 'Alerts & updates', path: '/agent/settings#notifications', badge: 3 },
    { icon: QuestionMarkCircleIcon, label: 'Help & Support', secondary: 'FAQs & contact', path: '/agent/help' },
    { 
      icon: InformationCircleIcon, 
      label: 'About App', 
      secondary: 'v1.0.0 (build 42)',
      onClick: () => toast.info("Version 1.0.0 (build 42)", { duration: 2000 }) 
    },
  ];

  const initials = getAgentInitials();
  const photoURL = getPhotoURL();

  return (
    <>
      <BottomSheet
        isOpen={isProfileMenuOpen}
        onClose={() => setProfileMenuOpen(false)}
      >
        <div className="flex flex-col pb-8">
          {/* Premium Profile Header */}
          <div className="px-4 pt-2 mb-6">
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => { navigate('/agent/profile'); setProfileMenuOpen(false); }}
              className="w-full relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-brand opacity-5 rounded-2xl group-active:opacity-10 transition-opacity" />
              <div className="relative flex items-center gap-4 p-5 rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center text-white overflow-hidden shadow-lg shadow-primary/20">
                    {photoURL ? (
                      <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-black">{initials}</span>
                    )}
                  </div>
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-colors",
                    isOnline ? "bg-success" : "bg-slate-400"
                  )} />
                </div>
                
                <div className="flex-1 text-left min-w-0">
                  <span className="text-sm font-black text-slate-900 tracking-tight block truncate">{getAgentName()}</span>
                  <div className="flex flex-col mt-0.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">
                      {user?.region || 'Central'} Agency
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[11px] font-bold text-slate-500">{user?.stockPoint || 'Nairobi Hub'}</span>
                      <span className="text-slate-300">·</span>
                      <span className={cn("text-[11px] font-black uppercase tracking-tighter", isOnline ? "text-success" : "text-slate-400")}>
                        {isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <ChevronRightIcon className="w-5 h-5 text-slate-300 shrink-0" />
              </div>
            </motion.button>
          </div>

          {/* Quick Stats Strip */}
          <div className="px-4 mb-8">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <ShieldCheckIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Verified</span>
                  <span className="text-xs font-bold text-slate-700 mt-1">Active Agent</span>
                </div>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <DevicePhoneMobileIcon className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Status</span>
                  <span className="text-xs font-bold text-slate-700 mt-1">{pendingSyncs > 0 ? 'Syncing...' : 'System Ready'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 mb-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2 mb-2">Menu</h3>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col px-2">
            {menuItems.map((item, idx) => (
              <motion.button
                key={idx}
                whileTap={{ x: 4, backgroundColor: 'rgba(248, 250, 252, 1)' }}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  else if (item.path) {
                    navigate(item.path);
                    setProfileMenuOpen(false);
                  }
                }}
                className="group flex items-center justify-between p-4 rounded-xl transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 group-active:bg-white flex items-center justify-center transition-colors shadow-sm group-active:shadow-md">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-sm font-bold text-slate-800 tracking-tight">{item.label}</span>
                    <span className="text-[11px] text-slate-400 font-medium">{item.secondary}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {item.badge && (
                    <span className="bg-danger text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-danger/20">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                </div>
              </motion.button>
            ))}
          </div>

          <div className="px-6 py-8 mt-4 border-t border-slate-50">
            <Button
              onClick={() => setShowSignOutConfirm(true)}
              variant="ghost"
              className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-danger font-black uppercase tracking-widest bg-danger/5 hover:bg-danger/10 border-none group transition-all"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              Sign out Account
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Sign Out Confirm Sheet with Premium Styling */}
      <BottomSheet
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        title="Signing out?"
      >
        <div className="flex flex-col items-center text-center space-y-8 py-6">
          <div className="w-20 h-20 rounded-3xl bg-danger/5 flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center relative">
              <ArrowRightOnRectangleIcon className="w-8 h-8 text-danger" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-danger rounded-2xl -z-10 blur-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Are you sure?</h3>
            <p className="text-sm text-slate-400 font-medium px-4">
              You'll be logged out of your session. Make sure all your daily sales are recorded before leaving.
            </p>
          </div>

          {pendingSyncs > 0 && (
            <div className="w-full bg-amber-50 border-2 border-amber-100 rounded-2xl p-4 flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Pending Sync</span>
                <p className="text-[13px] text-amber-900 font-bold leading-tight mt-0.5">
                  You have {pendingSyncs} unsynced sale(s). These may be lost if you sign out now.
                </p>
              </div>
            </div>
          )}
          
          <div className="w-full flex gap-3 pt-2">
            <Button 
              variant="outline"
              className="flex-1 h-16 rounded-2xl border-slate-200 text-slate-500 font-black uppercase tracking-widest"
              onClick={() => setShowSignOutConfirm(false)}
            >
              Stay
            </Button>
            <Button 
              className="flex-[2] h-16 rounded-2xl bg-danger hover:bg-danger/90 text-white font-black uppercase tracking-widest shadow-xl shadow-danger/20"
              onClick={handleSignOut}
            >
              Yes, Sign out
            </Button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
};
