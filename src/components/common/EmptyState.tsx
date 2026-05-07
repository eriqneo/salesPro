import React from 'react';
import { GradientButton } from '@/components/ui/GradientButton';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  illustration: 'home' | 'inventory' | 'shops' | 'report' | 'error';
  ctaLabel?: string;
  onCtaClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  illustration,
  ctaLabel,
  onCtaClick
}) => {
  const Illustration = () => {
    switch (illustration) {
      case 'home':
        return (
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="50" fill="#F0FDFA" />
            <path d="M40 70L60 50L80 70" stroke="#0D9488" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="45" y="70" width="30" height="20" rx="2" fill="#0D9488" fillOpacity="0.2" />
          </svg>
        );
      case 'inventory':
        return (
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="40" width="60" height="50" rx="4" fill="#F0FDFA" stroke="#0D9488" strokeWidth="2" />
            <path d="M30 55H90" stroke="#0D9488" strokeWidth="2" />
            <circle cx="60" cy="72" r="8" fill="#0D9488" fillOpacity="0.2" />
          </svg>
        );
      case 'shops':
        return (
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 80V40L60 30L90 40V80" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
            <rect x="45" y="55" width="30" height="25" fill="#F0FDFA" stroke="#0D9488" strokeWidth="2" />
            <path d="M30 80H90" stroke="#0D9488" strokeWidth="2" />
          </svg>
        );
      case 'report':
        return (
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="35" y="30" width="50" height="65" rx="4" fill="#F0FDFA" stroke="#0D9488" strokeWidth="2" />
            <path d="M45 45H75" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
            <path d="M45 60H75" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
            <path d="M45 75H60" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'error':
        return (
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="50" fill="#FEF2F2" />
            <path d="M60 40V70" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
            <circle cx="60" cy="85" r="3" fill="#EF4444" />
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-6 min-h-[60vh]">
      <div className="animate-in fade-in zoom-in duration-500">
        <Illustration />
      </div>
      <div className="space-y-2 max-w-[280px]">
        <h3 className="text-[16px] text-[#0F172A] font-semibold tracking-tight">
          {title}
        </h3>
        <p className="text-[14px] text-[#64748B] font-medium leading-relaxed">
          {subtitle}
        </p>
      </div>
      {ctaLabel && onCtaClick && (
        <GradientButton 
          onClick={onCtaClick}
          className="h-12 px-8 rounded-xl font-bold text-sm shadow-lg shadow-primary/20"
        >
          {ctaLabel}
        </GradientButton>
      )}
    </div>
  );
};
