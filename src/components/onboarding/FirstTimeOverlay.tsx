import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '@/store/useAuthStore';
import { GradientButton } from '@/components/ui/GradientButton';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';

export const FirstTimeOverlay: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after a short delay to ensure Home loads
    if (user?.firstLogin) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [user?.firstLogin]);

  const handleNext = () => {
    haptics.light();
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    haptics.success();
    setIsVisible(false);
    // In a real app, we'd update Firestore. Here we update the store.
    if (user) {
      await updateProfile({ ...user, firstLogin: false });
    }
  };

  if (!isVisible) return null;

  const steps = [
    {
      target: 'bottom-nav',
      title: 'Navigation',
      text: 'Navigate between your daily tasks here',
      position: 'bottom'
    },
    {
      target: 'fab',
      title: 'Record Sale',
      text: 'Tap here any time to quickly record a sale',
      position: 'center'
    },
    {
      target: 'avatar',
      title: 'Profile & Settings',
      text: 'Tap your avatar for profile, settings, and sign out',
      position: 'top'
    }
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Dark Overlay with Cutout */}
      <div className="absolute inset-0 bg-black/75 pointer-events-auto" />
      
      {/* Cutout Simulation (using box-shadow or clip-path is complex for dynamic targets, 
          so we'll use a simplified version or just highlight the area) */}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "absolute z-[110] w-[280px] bg-white rounded-2xl p-6 shadow-2xl pointer-events-auto",
            currentStep.position === 'bottom' && "bottom-[120px]",
            currentStep.position === 'center' && "bottom-[180px]",
            currentStep.position === 'top' && "top-[100px]"
          )}
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-black uppercase tracking-widest text-[#0EA5E9]">
                {currentStep.title}
              </h4>
              <p className="text-[15px] text-slate-900 font-bold leading-snug">
                {currentStep.text}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s} 
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-colors",
                      step === s ? "bg-[#0EA5E9]" : "bg-slate-200"
                    )} 
                  />
                ))}
              </div>
              <GradientButton 
                onClick={handleNext}
                className="h-10 px-6 rounded-xl text-xs font-black uppercase tracking-widest"
              >
                {step === 3 ? "Let's go!" : "Got it →"}
              </GradientButton>
            </div>
          </div>

          {/* Tooltip Arrow */}
          <div className={cn(
            "absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45",
            currentStep.position === 'bottom' ? "bottom-[-8px]" : "top-[-8px]"
          )} />
        </motion.div>
      </AnimatePresence>

      <button 
        onClick={handleComplete}
        className="absolute top-[env(safe-area-inset-top)] right-4 z-[120] p-4 text-white/60 text-xs font-bold uppercase tracking-widest pointer-events-auto active:text-white"
      >
        Skip
      </button>
    </div>
  );
};
