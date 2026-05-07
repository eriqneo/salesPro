import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Drawer } from 'vaul';
import { 
  UserIcon, 
  Cog6ToothIcon, 
  BellIcon, 
  QuestionMarkCircleIcon, 
  ArrowRightOnRectangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AdminProfileMenuProps {
  isMobile?: boolean;
}

export function AdminProfileMenu({ isMobile }: AdminProfileMenuProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = user?.name?.[0] || 'A';

  if (isMobile) {
    return (
      <Drawer.Root>
        <Drawer.Trigger asChild>
          <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs active:scale-95 transition-transform border border-white/20">
            {initials}
          </button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
          <Drawer.Content className="bg-[#F8FAFC] flex flex-col rounded-t-[32px] mt-24 fixed bottom-0 left-0 right-0 z-[101] max-h-[90vh] pb-10">
            <div className="p-4 bg-white rounded-t-[32px] flex-1">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-200 mb-8" />
              
              <div className="flex items-center gap-4 px-2 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#0D9488] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-slate-200">
                  {initials}
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-900 leading-tight">{user?.name}</h3>
                  <p className="text-sm text-slate-500 font-medium">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <MenuButton icon={UserIcon} label="My profile" onClick={() => navigate('/admin/profile')} />
                <MenuButton icon={Cog6ToothIcon} label="Settings" onClick={() => navigate('/admin/settings')} />
                <MenuButton icon={BellIcon} label="Notification preferences" />
                <MenuButton icon={QuestionMarkCircleIcon} label="Help & Support" />
                <div className="h-[1px] bg-slate-100 my-4 mx-2" />
                <MenuButton icon={ArrowRightOnRectangleIcon} label="Sign out" variant="danger" onClick={() => setShowSignOutConfirm(true)} />
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>

        {/* Confirmation Overlay handled inside or as separate Drawer.Root */}
        <SignOutConfirmDialog 
          isOpen={showSignOutConfirm} 
          onClose={() => setShowSignOutConfirm(false)} 
          onConfirm={handleSignOut} 
        />
      </Drawer.Root>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0F172A] to-[#0D9488] flex items-center justify-center text-white font-black text-sm active:scale-95 transition-transform shadow-lg shadow-slate-200">
          {initials}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          align="end" 
          sideOffset={8}
          className="min-w-[240px] bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] p-2 z-50 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="px-3 py-4 flex items-center gap-3 border-b border-slate-50 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F172A] to-[#0D9488] flex items-center justify-center text-white font-black">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black text-slate-900 truncate">{user?.name}</span>
              <span className="text-[10px] text-slate-500 truncate font-medium">{user?.email}</span>
            </div>
          </div>

          <DropdownMenu.Item className="outline-none">
            <MenuButton icon={UserIcon} label="My profile" onClick={() => navigate('/admin/profile')} isDropdown />
          </DropdownMenu.Item>
          <DropdownMenu.Item className="outline-none">
            <MenuButton icon={BellIcon} label="Notifications" isDropdown />
          </DropdownMenu.Item>
          <DropdownMenu.Item className="outline-none">
            <MenuButton icon={Cog6ToothIcon} label="Settings" onClick={() => navigate('/admin/settings')} isDropdown />
          </DropdownMenu.Item>
          
          <DropdownMenu.Separator className="h-[1px] bg-slate-100 my-2 mx-1" />
          
          <DropdownMenu.Item className="outline-none" onSelect={(e) => { e.preventDefault(); setShowSignOutConfirm(true); }}>
            <MenuButton icon={ArrowRightOnRectangleIcon} label="Sign out" variant="danger" isDropdown />
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>

      <SignOutConfirmDialog 
        isOpen={showSignOutConfirm} 
        onClose={() => setShowSignOutConfirm(false)} 
        onConfirm={handleSignOut} 
      />
    </DropdownMenu.Root>
  );
}

function MenuButton({ icon: Icon, label, onClick, variant = 'default', isDropdown }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center w-full px-3 py-2.5 rounded-xl transition-colors text-sm font-semibold",
        variant === 'danger' ? "text-[#EF4444] hover:bg-red-50" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        isDropdown && "py-2 px-3 hover:bg-[#F1F5F9]"
      )}
    >
      <Icon className={cn("w-5 h-5 mr-3", variant === 'danger' ? "text-[#EF4444]" : "text-slate-400 group-hover:text-slate-900")} />
      {label}
    </button>
  );
}

function SignOutConfirmDialog({ isOpen, onClose, onConfirm }: any) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[110]" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-[111] max-h-[40vh] p-8">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-200 mb-8" />
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-[#EF4444] mb-2">
              <ArrowRightOnRectangleIcon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Sign out of admin portal?</h2>
            <p className="text-sm text-slate-500 font-medium">You'll need to log in again to access the dashboard.</p>
            
            <div className="flex gap-4 w-full pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1 h-14 rounded-2xl font-bold">Cancel</Button>
              <Button onClick={onConfirm} className="flex-1 h-14 rounded-2xl bg-[#EF4444] hover:bg-[#DC2626] font-bold text-white shadow-lg shadow-red-200">
                Sign out
              </Button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
