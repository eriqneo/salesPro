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
      <div className="flex flex-col min-h-full pb-32">
        <AgentPageHeader title="Evening Report" showBack />
        
        <div className="p-5 space-y-10">
          {/* Step 1: Agent Context */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#0F172A] text-teal-400 flex items-center justify-center text-sm font-black shadow-lg">1</div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Context</h2>
            </div>
            
            <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white rounded-[32px] overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 px-1">Route</Label>
                    <Input 
                      list="routes-list" 
                      value={formData.route} 
                      onChange={e => updateField('route', e.target.value)} 
                      placeholder="Select Route" 
                      required 
                      className="bg-slate-50 border-none rounded-xl h-12 font-bold focus-visible:ring-teal-500/30"
                    />
                    <datalist id="routes-list">
                      {routes.map(r => <option key={r.id} value={r.name} />)}
                    </datalist>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 px-1">Stock Point</Label>
                    <Input 
                      value={formData.stockPoint} 
                      onChange={e => updateField('stockPoint', e.target.value)} 
                      required 
                      className="bg-slate-50 border-none rounded-xl h-12 font-bold focus-visible:ring-teal-500/30"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 2: Performance */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#0F172A] text-teal-400 flex items-center justify-center text-sm font-black shadow-lg">2</div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Daily Performance</h2>
            </div>
            
            <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white rounded-[32px] overflow-hidden">
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Target Achievement</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">
                      {Math.round(salesValueRate)}%
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-teal-500/10 blur-xl rounded-full" />
                    <ProgressRing 
                      current={formData.actualSalesKsh} 
                      target={formData.targetSalesKsh} 
                      size={80} 
                      strokeWidth={8}
                      color="#0D9488"
                    />
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
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Ksh {formData.actualSalesKsh.toLocaleString()}</span>
                    <span>Target: Ksh {formData.targetSalesKsh.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Calls (Visits)</p>
                      <p className="text-lg font-black text-slate-900">{formData.achievedCalls} / {formData.targetCalls}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cartons Sold</p>
                      <p className="text-lg font-black text-slate-900">{(formData.achievedPackets / PACKETS_PER_CARTON).toFixed(1)}</p>
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 3: Market Insights */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#0F172A] text-teal-400 flex items-center justify-center text-sm font-black shadow-lg">3</div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Market Insights</h2>
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
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                  )}
                >
                  {tag}
                </motion.button>
              ))}
            </div>
            <Textarea 
              placeholder="Any additional feedback from shops?"
              className="min-h-[100px] rounded-[24px] border-slate-100 bg-white p-6 text-sm font-medium focus-visible:ring-teal-500/30"
              value={formData.customInsights}
              onChange={(e) => updateField('customInsights', e.target.value)}
            />
          </div>

          {/* Step 4: Challenges & Plans */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#0F172A] text-teal-400 flex items-center justify-center text-sm font-black shadow-lg">4</div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Feedback Loop</h2>
            </div>

            {/* Challenges */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Top Challenges</h4>
              <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
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
              <Textarea 
                placeholder="What hurdles did you face today?"
                className="min-h-[120px] rounded-[24px] border-slate-100 bg-white p-6 text-sm font-medium focus-visible:ring-teal-500/30"
                value={formData.challenges}
                onChange={(e) => updateField('challenges', e.target.value)}
              />
            </div>

            {/* Tomorrow's Plan */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Tomorrow's Strategy</h4>
              <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
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
              <Textarea 
                placeholder="How will you win tomorrow?"
                className="min-h-[120px] rounded-[24px] border-slate-100 bg-white p-6 text-sm font-medium focus-visible:ring-teal-500/30"
                value={formData.planForTomorrow}
                onChange={(e) => updateField('planForTomorrow', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={() => setShowConfirmation(true)}
              disabled={!formData.challenges || !formData.planForTomorrow}
              className="w-full h-18 rounded-[28px] bg-[#0F172A] hover:bg-slate-900 border-none text-lg font-black shadow-2xl shadow-slate-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <CheckCircle2 className="w-6 h-6 text-teal-400" />
              <span>Review & Submit</span>
            </Button>
            
            <Button 
              onClick={saveDraft}
              variant="outline"
              className="w-full h-14 rounded-2xl border-slate-200 text-slate-500 font-bold hover:bg-slate-50"
            >
              Save as Draft
            </Button>
          </div>
        </div>

        {/* Confirmation Sheet Style Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none rounded-[40px] bg-white">
            <div className="bg-[#0F172A] p-8 text-white relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#0D948830,transparent_70%)]" />
              <h2 className="text-2xl font-black tracking-tight relative z-10">Report Summary</h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 relative z-10">
                Performance for {format(new Date(), 'MMMM d, yyyy')}
              </p>
            </div>
            
            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-[24px] border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Value</p>
                  <p className="text-sm font-black text-slate-900 tracking-tight">Ksh {formData.actualSalesKsh.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-teal-50 rounded-[24px] border border-teal-100">
                  <p className="text-[8px] font-black text-teal-600 uppercase tracking-widest mb-1">Rate</p>
                  <p className="text-sm font-black text-teal-700 tracking-tight">{Math.round(salesValueRate)}%</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-[24px] border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Visits</p>
                  <p className="text-sm font-black text-slate-900 tracking-tight">{formData.achievedCalls}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Challenges
                  </p>
                  <p className="text-sm font-medium text-slate-600 pl-3.5 leading-relaxed">{formData.challenges}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Tomorrow's Strategy
                  </p>
                  <p className="text-sm font-medium text-slate-600 pl-3.5 leading-relaxed">{formData.planForTomorrow}</p>
                </div>
              </div>
            </div>

            <div className="p-8 pt-0 flex gap-4">
              <Button 
                onClick={handleFinalSubmit}
                className="flex-1 h-16 rounded-[24px] bg-[#0F172A] hover:bg-slate-900 border-none text-sm font-black shadow-2xl shadow-slate-900/20 active:scale-95 transition-all"
              >
                Confirm Submission
              </Button>
              <Button 
                variant="outline"
                className="h-16 w-16 rounded-[24px] border-slate-100 bg-emerald-50 text-emerald-600 p-0 active:scale-95 transition-all"
              >
                <Share2 className="w-6 h-6" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
