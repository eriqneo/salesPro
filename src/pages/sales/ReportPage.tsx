import React, { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSalesStore } from '@/store/useSalesStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardDocumentCheckIcon as ClipboardCheck, 
  FlagIcon as Target, 
  ChartBarIcon as TrendingUp, 
  ExclamationTriangleIcon as AlertTriangle, 
  CalendarIcon as Calendar, 
  UserIcon as User, 
  MapPinIcon as MapPin, 
  ShareIcon as Share2, 
  CheckCircleIcon as CheckCircle2,
  ChevronRightIcon as ChevronRight,
  InformationCircleIcon as Info,
  ChatBubbleLeftRightIcon as MessageSquare
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { AgentPageHeader } from '@/components/navigation/AgentPageHeader';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import { db } from '@/lib/db';
import { haptics } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { ProgressRing } from '@/components/sales/ProgressRing';
import { motion, AnimatePresence } from 'motion/react';
import { TabSkeleton } from '@/components/navigation/TabSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { PullToRefresh } from '@/components/common/PullToRefresh';

const PACKETS_PER_CARTON = 24;

const MARKET_INSIGHT_TAGS = [
  "Good quality", "Light", "Pocket friendly", "High demand", "Low demand", "Strong competition"
];

const CHALLENGE_PRESETS = [
  "Product moves slow", "Low stock", "Shop closed", "Poor roads", "High competition"
];

const PLAN_PRESETS = [
  "Improve sales vs today", "Return to unsold shops", "Restock inventory", "Early start"
];

export default function ReportPage() {
  const { user } = useAuthStore();
  const { sales, routes, submitReport, dailyReports } = useSalesStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    stockPoint: user?.stockPoint || '',
    region: user?.region || '',
    date: format(new Date(), 'yyyy-MM-dd'),
    route: '',
    targetCalls: 20,
    achievedCalls: 0,
    successfulCalls: 0,
    targetCartons: 10,
    achievedPackets: 0,
    targetSalesKsh: 50000,
    actualSalesKsh: 0,
    marketInsights: [] as string[],
    customInsights: '',
    challenges: '',
    planForTomorrow: ''
  });

  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useSwipeBack();

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  useEffect(() => {
    const loadDraft = async () => {
      if (!user) return;
      const draft = await db.reportDrafts.get(user.uid);
      if (draft) {
        setFormData(prev => ({ ...prev, ...draft.data }));
        toast.info('Draft loaded');
      }
    };
    loadDraft();
  }, [user]);

  useEffect(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todaySales = sales.filter(s => s.timestamp >= today);
    
    const totalKsh = todaySales.reduce((sum, s) => sum + s.totalKsh, 0);
    const totalPackets = todaySales.reduce((sum, s) => 
      sum + s.items.reduce((iSum, item) => iSum + (item.quantityCartons * PACKETS_PER_CARTON) + item.quantityPackets, 0), 0
    );

    setFormData(prev => ({
      ...prev,
      achievedCalls: todaySales.length,
      actualSalesKsh: totalKsh,
      achievedPackets: totalPackets
    }));
  }, [sales]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const saveDraft = async () => {
    if (!user) return;
    haptics.light();
    await db.reportDrafts.put({
      id: user.uid,
      data: formData,
      updatedAt: Date.now()
    });
    setIsDirty(false);
    toast.success('Draft saved successfully');
  };

  const callRate = useMemo(() => 
    formData.targetCalls > 0 ? (formData.achievedCalls / formData.targetCalls) * 100 : 0
  , [formData.achievedCalls, formData.targetCalls]);

  const cartonAchievedRate = useMemo(() => {
    const targetPackets = formData.targetCartons * PACKETS_PER_CARTON;
    return targetPackets > 0 ? (formData.achievedPackets / targetPackets) * 100 : 0;
  }, [formData.achievedPackets, formData.targetCartons]);

  const salesValueRate = useMemo(() => 
    formData.targetSalesKsh > 0 ? (formData.actualSalesKsh / formData.targetSalesKsh) * 100 : 0
  , [formData.actualSalesKsh, formData.targetSalesKsh]);

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      marketInsights: prev.marketInsights.includes(tag)
        ? prev.marketInsights.filter(t => t !== tag)
        : [...prev.marketInsights, tag]
    }));
    setIsDirty(true);
  };

  const addPreset = (field: 'challenges' | 'planForTomorrow', preset: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field] ? `${prev[field]}, ${preset}` : preset
    }));
    setIsDirty(true);
  };

  const generateWhatsAppSummary = () => {
    const insights = [...formData.marketInsights, formData.customInsights].filter(Boolean).join(', ');
    return `*FS Daily Evening Report*
📅 Date: ${formData.date}
👤 Agent: ${formData.name}
📍 Stock Point: ${formData.stockPoint}
🗺️ Route: ${formData.route}

*1. Coverage*
- Target Calls: ${formData.targetCalls}
- Achieved Calls: ${formData.achievedCalls}
- Successful Calls: ${formData.successfulCalls}
- Rate: ${callRate.toFixed(1)}%

*2. Sales (Cartons)*
- Target: ${formData.targetCartons} ctns
- Achieved: ${formData.achievedPackets} pkts (${(formData.achievedPackets / PACKETS_PER_CARTON).toFixed(1)} ctns)
- Rate: ${cartonAchievedRate.toFixed(1)}%

*3. Sales (Value)*
- Target: Ksh ${formData.targetSalesKsh.toLocaleString()}
- Actual: Ksh ${formData.actualSalesKsh.toLocaleString()}
- Rate: ${salesValueRate.toFixed(1)}%

*4. Insights*
${insights || 'None'}

*5. Challenges*
${formData.challenges || 'None'}

*6. Plan for Tomorrow*
${formData.planForTomorrow || 'None'}`;
  };

  const handleFinalSubmit = async () => {
    const report = {
      id: Math.random().toString(36).substr(2, 9),
      agentId: user?.uid || 'unknown',
      agentName: formData.name,
      stockPoint: formData.stockPoint,
      region: formData.region,
      date: formData.date,
      route: formData.route,
      targetCalls: formData.targetCalls,
      achievedCalls: formData.achievedCalls,
      successfulCalls: formData.successfulCalls,
      targetCartons: formData.targetCartons,
      achievedCartons: Math.floor(formData.achievedPackets / PACKETS_PER_CARTON),
      achievedPackets: formData.achievedPackets % PACKETS_PER_CARTON,
      targetSalesKsh: formData.targetSalesKsh,
      actualSalesKsh: formData.actualSalesKsh,
      percentageAchieved: salesValueRate,
      marketInsights: [...formData.marketInsights, formData.customInsights].filter(Boolean),
      challenges: formData.challenges.split(',').map(c => c.trim()).filter(Boolean),
      planForTomorrow: formData.planForTomorrow.split(',').map(p => p.trim()).filter(Boolean),
      submittedAt: Date.now()
    };

    submitReport(report);
    if (user) await db.reportDrafts.delete(user.uid);

    toast.success('Report submitted successfully!');
    const summary = generateWhatsAppSummary();
    if (navigator.share) {
      navigator.share({ title: 'Daily Report', text: summary }).catch(() => {
        navigator.clipboard.writeText(summary);
        toast.info('Summary copied');
      });
    } else {
      navigator.clipboard.writeText(summary);
      toast.info('Summary copied');
    }
    navigate('/agent/home');
  };

  const isReportSubmitted = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return dailyReports.some(r => r.date === today);
  }, [dailyReports]);

  if (isLoading) return <TabSkeleton variant="report" />;
  if (isReportSubmitted) {
    return (
      <EmptyState 
        title="Report Already Submitted"
        subtitle="Great job! You've already submitted your report for today. You can view it in history."
        illustration="report"
        ctaLabel="View History"
        onCtaClick={() => navigate('/agent/report/history')}
      />
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="flex flex-col min-h-full pb-32 bg-slate-50">
        <AgentPageHeader 
          title="Evening Report" 
          showBack 
          isDirty={isDirty}
          rightAction={
            <button 
              onClick={saveDraft}
              className="text-[13px] font-black text-teal-400 hover:text-teal-300 active:scale-90 transition-all px-2"
            >
              SAVE DRAFT
            </button>
          }
        />
        
        <div className="pt-[calc(64px+env(safe-area-inset-top)+24px)] p-5 space-y-10">
          {/* Step 1: Agent Context */}
          <div className="space-y-6">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-[#0F172A] text-teal-400 flex items-center justify-center shadow-xl shadow-slate-900/10 shrink-0 border border-white/10 group">
                <MapPin className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <div className="pt-1">
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Territory Context</h2>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Select Route & Dispatch Point</p>
              </div>
            </div>
            
            <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white rounded-[32px] overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 px-1">Route</Label>
                    <Input 
                      list="routes-list" 
                      value={formData.route} 
                      onChange={e => updateField('route', e.target.value)} 
                      placeholder="Select Route" 
                      required 
                      className="bg-slate-50 border-2 border-transparent rounded-xl h-14 font-black text-slate-900 focus-visible:ring-0 focus-visible:border-teal-500/30 focus-visible:bg-white transition-all shadow-inner"
                    />
                    <datalist id="routes-list">
                      {routes.map(r => <option key={r.id} value={r.name} />)}
                    </datalist>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 px-1">Stock Point</Label>
                    <Input 
                      value={formData.stockPoint} 
                      onChange={e => updateField('stockPoint', e.target.value)} 
                      required 
                      className="bg-slate-50 border-2 border-transparent rounded-xl h-14 font-black text-slate-900 focus-visible:ring-0 focus-visible:border-teal-500/30 focus-visible:bg-white transition-all shadow-inner"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 2: Performance */}
          <div className="space-y-6">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-[#0F172A] text-teal-400 flex items-center justify-center shadow-xl shadow-slate-900/10 shrink-0 border border-white/10 group">
                <TrendingUp className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <div className="pt-1">
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Daily Performance</h2>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Achievement Against Targets</p>
              </div>
            </div>
            
            <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white rounded-[32px] overflow-hidden">
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Target Achievement</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">
                      {Math.round(salesValueRate)}%
                    </p>
                  </div>
                  <div className="relative hidden sm:block shrink-0">
                    <div className="absolute inset-0 bg-teal-500/10 blur-xl rounded-full" />
                    <ProgressRing 
                      current={formData.actualSalesKsh} 
                      target={formData.targetSalesKsh} 
                      size={80} 
                      strokeWidth={8}
                      color="#0D9488"
                    />
                  </div>
                  <div className="sm:hidden text-4xl font-black text-teal-600 shrink-0">
                    {Math.round(salesValueRate)}%
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(salesValueRate, 100)}%` }}
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        salesValueRate >= 80 ? "bg-teal-500" : "bg-amber-500"
                      )}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>Ksh {formData.actualSalesKsh.toLocaleString()}</span>
                    <span>Target: Ksh {formData.targetSalesKsh.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Calls (Visits)</p>
                      <p className="text-lg font-black text-slate-900">{formData.achievedCalls} / {formData.targetCalls}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Cartons Sold</p>
                      <p className="text-lg font-black text-slate-900">{(formData.achievedPackets / PACKETS_PER_CARTON).toFixed(1)}</p>
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 3: Market Insights */}
          <div className="space-y-6">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-[#0F172A] text-teal-400 flex items-center justify-center shadow-xl shadow-slate-900/10 shrink-0 border border-white/10 group">
                <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <div className="pt-1">
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Market Intelligence</h2>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Customer & Competitor Insights</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {MARKET_INSIGHT_TAGS.map(tag => (
                <motion.button
                  key={tag}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border-2 transition-all duration-300",
                    formData.marketInsights.includes(tag)
                      ? "bg-[#0F172A] border-[#0F172A] text-white shadow-xl shadow-slate-900/20"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 active:bg-slate-50"
                  )}
                >
                  {tag}
                </motion.button>
              ))}
            </div>
            <Textarea 
              placeholder="Any additional feedback from shops?"
              className="min-h-[120px] rounded-[28px] border-2 border-transparent bg-slate-50 p-6 text-sm font-bold text-slate-900 focus-visible:ring-0 focus-visible:border-teal-500/30 focus-visible:bg-white transition-all shadow-inner"
              value={formData.customInsights}
              onChange={(e) => updateField('customInsights', e.target.value)}
            />
          </div>

          {/* Step 4: Challenges & Plans */}
          <div className="space-y-10">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-[#0F172A] text-teal-400 flex items-center justify-center shadow-xl shadow-slate-900/10 shrink-0 border border-white/10 group">
                <AlertTriangle className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <div className="pt-1">
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Field Feedback</h2>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Challenges & Action Strategy</p>
              </div>
            </div>

            {/* Challenges */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Top Challenges</h4>
              <div className="relative">
                <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide [mask-image:linear-gradient(to_right,black_85%,transparent)]">
                  {CHALLENGE_PRESETS.map(preset => (
                    <button
                      key={preset}
                      onClick={() => addPreset('challenges', preset)}
                      className="shrink-0 px-4 py-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-wider active:scale-95 transition-transform"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
              <Textarea 
                placeholder="What hurdles did you face today?"
                className="min-h-[140px] rounded-[32px] border-2 border-transparent bg-slate-50 p-6 text-sm font-bold text-slate-900 focus-visible:ring-0 focus-visible:border-teal-500/30 focus-visible:bg-white transition-all shadow-inner"
                value={formData.challenges}
                onChange={(e) => updateField('challenges', e.target.value)}
              />
            </div>

            {/* Tomorrow's Plan */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Tomorrow's Strategy</h4>
              <div className="relative">
                <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide [mask-image:linear-gradient(to_right,black_85%,transparent)]">
                  {PLAN_PRESETS.map(preset => (
                    <button
                      key={preset}
                      onClick={() => addPreset('planForTomorrow', preset)}
                      className="shrink-0 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-wider active:scale-95 transition-transform"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
              <Textarea 
                placeholder="How will you win tomorrow?"
                className="min-h-[140px] rounded-[32px] border-2 border-transparent bg-slate-50 p-6 text-sm font-bold text-slate-900 focus-visible:ring-0 focus-visible:border-teal-500/30 focus-visible:bg-white transition-all shadow-inner"
                value={formData.planForTomorrow}
                onChange={(e) => updateField('planForTomorrow', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={() => setShowConfirmation(true)}
              disabled={!formData.challenges || !formData.planForTomorrow}
              className={cn(
                "w-full h-22 rounded-[40px] bg-[#0F172A] hover:bg-slate-900 border border-white/5 text-xl font-black shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all flex items-center justify-center gap-4 disabled:opacity-20 relative group overflow-hidden",
                formData.challenges && formData.planForTomorrow ? "active:scale-95 shadow-teal-900/40" : ""
              )}
            >
              <AnimatePresence>
                {formData.challenges && formData.planForTomorrow && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-teal-500/5 animate-pulse"
                  />
                )}
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center relative z-10 border border-white/10 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6 text-teal-400" />
              </div>
              <span className="relative z-10 tracking-tight">Review & Submit</span>
            </Button>
          </div>
        </div>

        {/* World-class Bottom Sheet Summary */}
        <AnimatePresence>
          {showConfirmation && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setShowConfirmation(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              />

              {/* Sheet */}
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                className="fixed bottom-0 left-0 right-0 z-50 max-h-[92vh] flex flex-col rounded-t-[44px] overflow-hidden shadow-[0_-20px_80px_rgba(0,0,0,0.4)]"
              >
                {/* Dark header */}
                <div className="bg-[#0C1220] px-8 pt-8 pb-6 relative overflow-hidden shrink-0">
                  {/* Ambient glows */}
                  <div className="absolute -top-10 -right-10 w-48 h-48 bg-teal-500/20 rounded-full blur-[60px] pointer-events-none" />
                  <div className="absolute -bottom-8 -left-6 w-36 h-36 bg-indigo-500/10 rounded-full blur-[50px] pointer-events-none" />

                  {/* Drag pill */}
                  <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />

                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-teal-400 uppercase tracking-[0.3em] mb-1">Summary Overview</p>
                    <h2 className="text-[28px] font-black text-white tracking-tighter leading-none">Daily Report</h2>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <div className="px-3 py-1.5 rounded-xl bg-white/8 border border-white/10">
                        <p className="text-[11px] font-bold text-white/70">{format(new Date(), 'MMM d, yyyy')}</p>
                      </div>
                      <div className={cn(
                        "px-3 py-1.5 rounded-xl border flex items-center gap-1.5",
                        salesValueRate >= 80
                          ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-400"
                          : "bg-amber-500/15 border-amber-500/25 text-amber-400"
                      )}>
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full animate-pulse",
                          salesValueRate >= 80 ? "bg-emerald-400" : "bg-amber-400"
                        )} />
                        <p className="text-[10px] font-black uppercase tracking-wider">
                          {salesValueRate >= 80 ? 'On Track' : 'Below Target'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scrollable body */}
                <div className="bg-[#F8FAFC] flex-1 overflow-y-auto scrollbar-hide px-6 py-6 space-y-6">
                  
                  {/* KPI row — 4 compact tiles */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Sales Value', value: `Ksh ${formData.actualSalesKsh.toLocaleString()}`, icon: <TrendingUp className="w-4 h-4" />, color: 'bg-slate-100 text-slate-500' },
                      { label: 'Efficiency', value: `${Math.round(salesValueRate)}%`, icon: <Target className="w-4 h-4" />, color: 'bg-teal-50 text-teal-600' },
                      { label: 'Calls Made', value: `${formData.achievedCalls} / ${formData.targetCalls}`, icon: <ClipboardCheck className="w-4 h-4" />, color: 'bg-indigo-50 text-indigo-500' },
                      { label: 'Cartons Sold', value: (formData.achievedPackets / PACKETS_PER_CARTON).toFixed(1), icon: <Calendar className="w-4 h-4" />, color: 'bg-amber-50 text-amber-500' },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.08 * i, type: 'spring', stiffness: 260, damping: 20 }}
                        className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm"
                      >
                        <div className={cn("w-9 h-9 rounded-2xl flex items-center justify-center mb-3", item.color)}>
                          {item.icon}
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-0.5">{item.label}</p>
                        <p className="text-[17px] font-black text-slate-900 tracking-tighter leading-none">{item.value}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Qualitative cards */}
                  <div className="space-y-3">
                    {[
                      { label: 'Challenges Today', text: formData.challenges, accent: 'bg-rose-500', bg: 'bg-white', textColor: 'text-rose-900/60' },
                      { label: "Tomorrow's Strategy", text: formData.planForTomorrow, accent: 'bg-emerald-500', bg: 'bg-white', textColor: 'text-emerald-900/60' },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + 0.1 * i }}
                        className={cn("rounded-[28px] p-5 border border-slate-100 shadow-sm space-y-2.5", item.bg)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("w-1 h-5 rounded-full shrink-0", item.accent)} />
                          <p className={cn("text-[9px] font-black uppercase tracking-[0.2em]", item.textColor)}>{item.label}</p>
                        </div>
                        <p className="text-[13px] font-semibold text-slate-700 leading-relaxed pl-4">{item.text}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Sticky action footer */}
                <div className="bg-white border-t border-slate-100 px-6 py-5 pb-[calc(20px+env(safe-area-inset-bottom))] shrink-0 flex gap-3">
                  <Button
                    onClick={handleFinalSubmit}
                    className="flex-1 h-16 rounded-[22px] bg-[#0C1220] hover:bg-slate-900 text-white text-[15px] font-black tracking-tight shadow-xl shadow-slate-900/25 active:scale-[0.97] transition-all border border-white/5 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative z-10 flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-teal-400" />
                      Confirm Submission
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      haptics.medium();
                      const summary = generateWhatsAppSummary();
                      window.open(`https://wa.me/?text=${encodeURIComponent(summary)}`, '_blank');
                    }}
                    className="h-16 w-16 rounded-[22px] border-slate-200 bg-slate-50 text-slate-500 p-0 active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="text-[8px] font-black uppercase tracking-wider">Share</span>
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
          <AlertDialogContent className="rounded-[32px] border-none shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black tracking-tight">Discard changes?</AlertDialogTitle>
              <AlertDialogDescription className="font-medium text-slate-500">
                You have unsaved changes in your report. Are you sure you want to discard them?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row gap-3 pt-4">
              <AlertDialogCancel className="flex-1 rounded-2xl h-12 mt-0 font-bold border-slate-100">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => navigate('/agent/home')}
                className="flex-1 rounded-2xl h-12 bg-rose-500 hover:bg-rose-600 font-bold"
              >
                Discard
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PullToRefresh>
  );
}
