import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSalesStore } from '@/store/useSalesStore';
import { AgentPageHeader } from '@/components/navigation/AgentPageHeader';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  UserIcon, MapPinIcon, MapIcon as RouteIcon, UsersIcon, BellIcon, ArrowPathIcon, 
  CircleStackIcon, TrashIcon, GlobeAltIcon, AdjustmentsHorizontalIcon as TypeIcon, ArrowDownTrayIcon, 
  InformationCircleIcon, QuestionMarkCircleIcon, ChatBubbleLeftRightIcon, 
  ExclamationCircleIcon, ShieldCheckIcon, ArrowRightOnRectangleIcon, 
  ChevronRightIcon, CameraIcon, CheckIcon, ClockIcon, PhoneIcon, XMarkIcon, 
  StarIcon, DevicePhoneMobileIcon as SmartphoneIcon, ArrowTopRightOnSquareIcon, ShoppingBagIcon, 
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';
import { syncManager } from '@/services/syncManager';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function SettingsPage() {
  const { user, updateProfile, updatePreferences, logout } = useAuthStore();
  const { shops, dailyReports, sales } = useSalesStore();
  
  useSwipeBack();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPhotoOptionsOpen, setIsPhotoOptionsOpen] = useState(false);
  const [isRoutesModalOpen, setIsRoutesModalOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isTextSizeOpen, setIsTextSizeOpen] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);
  const [isReportProblemOpen, setIsReportProblemOpen] = useState(false);
  const [isWhatNewOpen, setIsWhatNewOpen] = useState(false);
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState<string | null>(null);

  const pendingCount = useLiveQuery(() => db.syncQueue.count()) || 0;
  
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, []);

  const showSaveIndicator = (key: string) => {
    setSaveIndicator(key);
    setTimeout(() => setSaveIndicator(null), 2000);
  };

  const handlePreferenceChange = (key: string, value: any) => {
    haptics.light();
    updatePreferences({ [key]: value });
    showSaveIndicator(key);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleSyncNow = () => {
    if (!navigator.onLine) {
      toast.error("You are offline. Connect to sync.");
      return;
    }
    haptics.medium();
    syncManager.processQueue();
  };

  const handleClearCache = async () => {
    if (pendingCount > 0) {
      toast.error("Please sync all items before clearing cache.");
      return;
    }
    haptics.medium();
    // In a real app, we'd clear specific caches
    toast.success("Offline cache cleared");
  };

  const handleSignOut = async () => {
    haptics.medium();
    await db.syncQueue.clear();
    await db.reportDrafts.clear();
    logout();
    window.location.href = '/login';
  };

  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phoneNumber?.replace('+254', '') || '');

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      toast.error("Name is required");
      return;
    }
    if (editPhone.length < 9) {
      toast.error("Valid phone number required");
      return;
    }
    haptics.medium();
    updateProfile({ 
      name: editName, 
      phoneNumber: `+254${editPhone}` 
    });
    setIsEditProfileOpen(false);
    toast.success("Profile updated");
  };

  if (!user) return null;

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="flex flex-col min-h-full pt-[calc(56px+env(safe-area-inset-top))]">
      <AgentPageHeader title="Settings" showBack />
      <div className="flex-1 overflow-y-auto">
        {/* Profile Header Card */}
        <div className="p-4">
          <Card className="bg-white border-none shadow-soft rounded-3xl overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <div 
                className="relative cursor-pointer group"
                onClick={() => setIsPhotoOptionsOpen(true)}
              >
                <div className="w-24 h-24 rounded-full bg-gradient-brand flex items-center justify-center text-white text-3xl font-black shadow-lg">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : initials}
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-primary border border-slate-100">
                  <CameraIcon className="w-4 h-4" />
                </div>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-xl font-black text-text-primary tracking-tight">{user.name}</h2>
                <p className="text-xs font-bold text-primary flex items-center justify-center gap-1">
                  <MapPinIcon className="w-3 h-3" /> {user.region} • {user.stockPoint}
                </p>
              </div>

              <Button 
                variant="ghost" 
                className="text-primary font-black uppercase tracking-widest text-[10px] h-8"
                onClick={() => setIsEditProfileOpen(true)}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Settings Groups */}
        <div className="space-y-6 pb-8">
          {/* Group 2: My Assignment */}
          <SettingsGroup title="My Assignment">
            <SettingsRow 
              icon={<MapPinIcon />} 
              label="Region" 
              value={user.region} 
              readOnly 
            />
            <SettingsRow 
              icon={<CircleStackIcon />} 
              label="Stock Point" 
              value={user.stockPoint} 
              readOnly 
            />
            <SettingsRow 
              icon={<RouteIcon />} 
              label="Assigned Routes" 
              value={user.assignedRoutes?.join(', ') || 'None'} 
              onClick={() => setIsRoutesModalOpen(true)}
            />
            <SettingsRow 
              icon={<UsersIcon />} 
              label="Team / Manager" 
              value="Admin" 
              readOnly 
            />
          </SettingsGroup>

          {/* Group 3: Notifications */}
          <SettingsGroup title="Notifications">
            <SettingsRow 
              icon={<BellIcon />} 
              label="EOD Report Reminder" 
              description="Remind me to submit my daily report"
              right={
                <div className="flex items-center gap-2">
                  {saveIndicator === 'eodReportReminder' && <CheckIcon className="w-3 h-3 text-success animate-in fade-in" />}
                  <Switch 
                    checked={user.preferences?.eodReportReminder} 
                    onCheckedChange={(val) => handlePreferenceChange('eodReportReminder', val)}
                  />
                </div>
              }
            />
            {user.preferences?.eodReportReminder && (
              <div className="px-4 py-2 bg-slate-50/50 flex items-center justify-between border-b border-border/50">
                <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-10">Reminder Time</span>
                <input 
                  type="time" 
                  value={user.preferences?.eodReportTime}
                  onChange={(e) => handlePreferenceChange('eodReportTime', e.target.value)}
                  className="bg-transparent text-sm font-bold text-primary outline-none"
                />
              </div>
            )}
            <SettingsRow 
              icon={<ShoppingBagIcon className="w-4 h-4" />} 
              label="Daily Target Alert" 
              description="Notify me when I reach 80% of my sales target"
              right={
                <div className="flex items-center gap-2">
                  {saveIndicator === 'dailyTargetAlert' && <CheckIcon className="w-3 h-3 text-success animate-in fade-in" />}
                  <Switch 
                    checked={user.preferences?.dailyTargetAlert} 
                    onCheckedChange={(val) => handlePreferenceChange('dailyTargetAlert', val)}
                  />
                </div>
              }
            />
            <SettingsRow 
              icon={<ArchiveBoxIcon className="w-4 h-4" />} 
              label="Low Stock Warning" 
              description="Alert me when my inventory drops below reorder level"
              right={
                <div className="flex items-center gap-2">
                  {saveIndicator === 'lowStockWarning' && <CheckIcon className="w-3 h-3 text-success animate-in fade-in" />}
                  <Switch 
                    checked={user.preferences?.lowStockWarning} 
                    onCheckedChange={(val) => handlePreferenceChange('lowStockWarning', val)}
                  />
                </div>
              }
            />
            <SettingsRow 
              icon={<ArrowPathIcon className="w-4 h-4" />} 
              label="Sync Alerts" 
              description="Notify me when offline data syncs successfully"
              right={
                <div className="flex items-center gap-2">
                  {saveIndicator === 'syncAlerts' && <CheckIcon className="w-3 h-3 text-success animate-in fade-in" />}
                  <Switch 
                    checked={user.preferences?.syncAlerts} 
                    onCheckedChange={(val) => handlePreferenceChange('syncAlerts', val)}
                  />
                </div>
              }
            />
            <SettingsRow 
              icon={<ShieldCheckIcon className="w-4 h-4" />} 
              label="Admin Messages" 
              description="Receive messages from admin"
              right={
                <div className="flex items-center gap-2">
                  <Switch checked={true} disabled />
                </div>
              }
            />
          </SettingsGroup>

          {/* Group 4: Offline & Sync */}
          <SettingsGroup title="Offline & Sync">
            <div className="px-4 pb-4">
              <Card className="bg-slate-50 border-none shadow-none rounded-2xl">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", pendingCount > 0 ? "bg-amber-500 animate-pulse" : "bg-success")} />
                      <span className="text-sm font-bold text-text-primary">
                        {pendingCount > 0 ? `${pendingCount} items pending` : 'All synced'}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-secondary font-medium">Last synced: Today at {format(new Date(), 'h:mm a')}</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="rounded-full h-8 px-4 text-[10px] font-black uppercase tracking-widest"
                    disabled={!navigator.onLine || pendingCount === 0}
                    onClick={handleSyncNow}
                  >
                    Sync Now
                  </Button>
                </CardContent>
              </Card>
            </div>
            <SettingsRow 
              icon={<ArrowPathIcon />} 
              label="Pending items" 
              right={pendingCount > 0 ? <Badge className="bg-amber-500 text-white border-none">{pendingCount}</Badge> : null}
              onClick={() => {}}
            />
            <SettingsRow 
              icon={<CircleStackIcon />} 
              label="Storage used" 
              value="12.4 MB" 
              onClick={() => {}}
            />
            <SettingsRow 
              icon={<TrashIcon className="text-red-500" />} 
              label="Clear offline cache" 
              description="Free up space"
              right={<span className="text-[10px] font-black uppercase text-primary tracking-widest">Free up space</span>}
              onClick={handleClearCache}
            />
          </SettingsGroup>

          {/* Group 5: Appearance */}
          <SettingsGroup title="Appearance">
            <SettingsRow 
              icon={<GlobeAltIcon />} 
              label="Language" 
              value={user.preferences?.language === 'en' ? 'English' : 'Swahili'} 
              onClick={() => setIsLanguageOpen(true)}
            />
            <SettingsRow 
              icon={<TypeIcon />} 
              label="Text size" 
              value={user.preferences?.textSize.charAt(0).toUpperCase() + user.preferences?.textSize.slice(1)} 
              onClick={() => setIsTextSizeOpen(true)}
            />
            <SettingsRow 
              icon={isInstalled ? <CheckIcon className="text-success" /> : <StarIcon className="text-amber-500" />} 
              label={isInstalled ? "App installed" : "Add to home screen"} 
              right={!isInstalled && <ChevronRightIcon className="w-4 h-4 text-slate-300" />}
              disabled={isInstalled}
              onClick={handleInstallClick}
            />
          </SettingsGroup>

          {/* Group 6: About & Support */}
          <SettingsGroup title="About & Support">
            <SettingsRow 
              icon={<InformationCircleIcon />} 
              label="App version" 
              value="v1.0.0 (build 42)" 
              readOnly 
            />
            <SettingsRow 
              icon={<SmartphoneIcon />} 
              label="What's new" 
              onClick={() => setIsWhatNewOpen(true)}
            />
            <SettingsRow 
              icon={<QuestionMarkCircleIcon />} 
              label="Help & FAQ" 
              onClick={() => setIsFAQOpen(true)}
            />
            <SettingsRow 
              icon={<ChatBubbleLeftRightIcon />} 
              label="Contact admin" 
              right={<ArrowTopRightOnSquareIcon className="w-4 h-4 text-slate-300" />}
              onClick={() => window.open('https://wa.me/254700000000', '_blank')}
            />
            <SettingsRow 
              icon={<ExclamationCircleIcon />} 
              label="Report a problem" 
              onClick={() => setIsReportProblemOpen(true)}
            />
            <SettingsRow 
              icon={<ShieldCheckIcon />} 
              label="Privacy policy" 
              right={<ArrowTopRightOnSquareIcon className="w-4 h-4 text-slate-300" />}
              onClick={() => window.open('https://example.com/privacy', '_blank')}
            />
          </SettingsGroup>

          {/* Sign Out Button */}
          <div className="px-4 pt-4">
            <Button 
              variant="outline" 
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-2xl h-14 font-black uppercase tracking-widest text-xs"
              onClick={() => setIsSignOutConfirmOpen(true)}
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Sheets */}
      
      {/* Edit Profile */}
      <BottomSheet 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Profile"
      >
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center relative">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : <UserIcon className="w-10 h-10 text-slate-400" />}
              <button 
                className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white shadow-md"
                onClick={() => setIsPhotoOptionsOpen(true)}
              >
                <CameraIcon className="w-3.5 h-3.5" />
              </button>
            </div>
            <button className="text-xs font-black uppercase text-primary tracking-widest">Change Photo</button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Full Name</Label>
              <Input 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)}
                className="h-12 rounded-xl bg-slate-50 border-none" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Phone Number</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">+254</span>
                <Input 
                  value={editPhone} 
                  onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  className="h-12 rounded-xl bg-slate-50 border-none pl-14" 
                  type="tel" 
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSaveProfile}
            className="w-full h-14 rounded-2xl bg-gradient-brand font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
          >
            Save Changes
          </Button>
        </div>
      </BottomSheet>

      {/* Photo Options */}
      <BottomSheet 
        isOpen={isPhotoOptionsOpen} 
        onClose={() => setIsPhotoOptionsOpen(false)}
      >
        <div className="space-y-2 py-4">
          <button className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 rounded-xl transition-colors">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <CameraIcon className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm">Take photo</span>
          </button>
          <button className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 rounded-xl transition-colors">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <GlobeAltIcon className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm">Choose from gallery</span>
          </button>
          <button className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 rounded-xl transition-colors text-red-600">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <TrashIcon className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm">Remove photo</span>
          </button>
        </div>
      </BottomSheet>

      {/* Language */}
      <BottomSheet 
        isOpen={isLanguageOpen} 
        onClose={() => setIsLanguageOpen(false)}
        title="Select Language"
      >
        <div className="space-y-2 py-4">
          <button 
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors"
            onClick={() => { handlePreferenceChange('language', 'en'); setIsLanguageOpen(false); }}
          >
            <span className="font-bold text-sm">English</span>
            {user.preferences?.language === 'en' && <CheckIcon className="w-5 h-5 text-primary" />}
          </button>
          <button 
            className="w-full p-4 flex items-center justify-between opacity-50 cursor-not-allowed"
            disabled
          >
            <div className="flex flex-col items-start">
              <span className="font-bold text-sm">Swahili</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Coming soon</span>
            </div>
          </button>
        </div>
      </BottomSheet>

      {/* Text Size */}
      <BottomSheet 
        isOpen={isTextSizeOpen} 
        onClose={() => setIsTextSizeOpen(false)}
        title="Text Size"
      >
        <div className="space-y-2 py-4">
          {['small', 'normal', 'large'].map((size) => (
            <button 
              key={size}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors"
              onClick={() => { handlePreferenceChange('textSize', size); setIsTextSizeOpen(false); }}
            >
              <span className={cn(
                "font-bold",
                size === 'small' ? "text-xs" : size === 'normal' ? "text-sm" : "text-lg"
              )}>
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </span>
              {user.preferences?.textSize === size && <CheckIcon className="w-5 h-5 text-primary" />}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Sign Out Confirm */}
      <BottomSheet 
        isOpen={isSignOutConfirmOpen} 
        onClose={() => setIsSignOutConfirmOpen(false)}
        title="Sign Out"
      >
        <div className="space-y-6 py-4">
          <div className="text-center space-y-2">
            <p className="text-sm font-bold text-text-primary">Sign out of {user.name}'s account?</p>
            {pendingCount > 0 && (
              <div className="bg-red-50 p-3 rounded-xl flex items-start gap-3 text-left">
                <ExclamationCircleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-red-700 leading-tight">
                  Warning: You have {pendingCount} unsynced items. Sign out anyway? Unsynced data may be lost.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 font-black uppercase tracking-widest text-xs shadow-lg shadow-red-200"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
            <Button 
              variant="ghost" 
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs text-text-secondary"
              onClick={() => setIsSignOutConfirmOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* FAQ */}
      <BottomSheet 
        isOpen={isFAQOpen} 
        onClose={() => setIsFAQOpen(false)}
        title="Help & FAQ"
      >
        <div className="space-y-4 py-4">
          <FAQItem 
            question="How do I record a sale offline?" 
            answer="Simply record the sale as usual. The app will automatically save it locally and sync it once you have a stable internet connection." 
          />
          <FAQItem 
            question="What happens if I forget to submit my report?" 
            answer="You will receive a reminder notification at your set time. It's important to submit daily to keep your performance metrics accurate." 
          />
          <FAQItem 
            question="How do I add stock to my inventory?" 
            answer="Go to the Stock tab and tap 'Add Stock'. You can scan barcodes or enter SKU details manually to update your local inventory." 
          />
          <FAQItem 
            question="Why is my sync showing pending?" 
            answer="Pending sync usually means you are offline or the connection is weak. The app will retry automatically when you're back online." 
          />
        </div>
      </BottomSheet>
    </div>
  );
}

function SettingsGroup({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h3 className="px-5 text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2">{title}</h3>
      <div className="bg-white border-y border-border/50">
        {children}
      </div>
    </div>
  );
}

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  value?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  readOnly?: boolean;
  disabled?: boolean;
}

function SettingsRow({ icon, label, description, value, right, onClick, readOnly, disabled }: SettingsRowProps) {
  const content = (
    <div className={cn(
      "flex items-center gap-4 px-5 py-4 min-h-[56px] transition-colors",
      onClick && !disabled && "active:bg-slate-50 cursor-pointer"
    )}>
      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-4 h-4" })}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-text-primary truncate">{label}</p>
        {description && <p className="text-[10px] text-text-secondary font-medium leading-tight">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-xs font-black text-primary truncate max-w-[120px]">{value}</span>}
        {right}
        {onClick && !right && !readOnly && !disabled && <ChevronRightIcon className="w-4 h-4 text-slate-300" />}
      </div>
    </div>
  );

  if (onClick && !disabled) {
    return (
      <div onClick={() => { haptics.light(); onClick(); }}>
        {content}
        <Separator className="ml-16" />
      </div>
    );
  }

  return (
    <div>
      {content}
      <Separator className="ml-16" />
    </div>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button 
        className="w-full p-4 flex items-center justify-between bg-white text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-bold text-text-primary">{question}</span>
        <ChevronRightIcon className={cn("w-4 h-4 text-slate-300 transition-transform", isOpen && "rotate-90")} />
      </button>
      {isOpen && (
        <div className="p-4 bg-slate-50 text-xs text-text-secondary font-medium leading-relaxed border-t border-border">
          {answer}
        </div>
      )}
    </div>
  );
}
