import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAgentStore } from '@/store/useAgentStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  BriefcaseIcon,
  CameraIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { haptics } from '@/lib/haptics';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { GradientButton } from '@/components/ui/GradientButton';

import { AgentPageHeader } from '@/components/navigation/AgentPageHeader';
import { useSwipeBack } from '@/hooks/useSwipeBack';

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const { getAgentInitials } = useAgentStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    stockPoint: user?.stockPoint || '',
    region: user?.region || ''
  });

  useSwipeBack();

  const handleSave = async () => {
    haptics.medium();
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-full pb-24 pt-[calc(56px+env(safe-area-inset-top))]">
      <AgentPageHeader title="My Profile" showBack />
      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center space-y-4 py-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0EA5E9] to-[#0D9488] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-primary/20">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                getAgentInitials()
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-primary border border-slate-100 active:scale-90 transition-transform">
              <CameraIcon className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h2>
            <p className="text-sm font-bold text-primary uppercase tracking-widest">{user.role} Agent</p>
          </div>
        </div>

        {/* Profile Info */}
        <Card className="bg-white border-border rounded-3xl shadow-soft overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Personal Information</h3>
              <button 
                onClick={() => { haptics.light(); setIsEditing(!isEditing); }}
                className="text-xs font-bold text-primary"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="space-y-4">
              <InfoRow 
                icon={<UserIcon />} 
                label="Full Name" 
                value={formData.name} 
                isEditing={isEditing}
                onChange={(val) => setFormData({...formData, name: val})}
              />
              <InfoRow 
                icon={<EnvelopeIcon />} 
                label="Email Address" 
                value={formData.email} 
                isEditing={isEditing}
                onChange={(val) => setFormData({...formData, email: val})}
                disabled
              />
              <InfoRow 
                icon={<PhoneIcon />} 
                label="Phone Number" 
                value={formData.phone} 
                isEditing={isEditing}
                onChange={(val) => setFormData({...formData, phone: val})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Assignment Info */}
        <Card className="bg-white border-border rounded-3xl shadow-soft overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Work Assignment</h3>
            <div className="space-y-4">
              <InfoRow 
                icon={<MapPinIcon />} 
                label="Region" 
                value={formData.region} 
                isEditing={isEditing}
                onChange={(val) => setFormData({...formData, region: val})}
              />
              <InfoRow 
                icon={<BriefcaseIcon />} 
                label="Stock Point" 
                value={formData.stockPoint} 
                isEditing={isEditing}
                onChange={(val) => setFormData({...formData, stockPoint: val})}
              />
            </div>
          </CardContent>
        </Card>

        {isEditing && (
          <GradientButton onClick={handleSave} className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
            <CheckIcon className="w-5 h-5 mr-2" /> Save Changes
          </GradientButton>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, isEditing, onChange, disabled }: { 
  icon: React.ReactNode, 
  label: string, 
  value: string, 
  isEditing: boolean,
  onChange: (val: string) => void,
  disabled?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
        <div className="w-3.5 h-3.5">{icon}</div>
        {label}
      </div>
      {isEditing && !disabled ? (
        <Input 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="bg-slate-50 border-none rounded-xl h-12 font-bold"
        />
      ) : (
        <div className={cn(
          "p-4 bg-slate-50 rounded-xl border border-transparent font-bold text-slate-900",
          disabled && "opacity-60"
        )}>
          {value || 'Not set'}
        </div>
      )}
    </div>
  );
}
