import React, { useState, useMemo } from 'react';
import { useSalesStore } from '@/store/useSalesStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  MessageSquare, 
  Download, 
  Share2, 
  CheckCircle2, 
  XCircle,
  Clock,
  Send
} from 'lucide-react';
import { format } from 'date-fns';
import { exportToPDF, shareToWhatsApp } from '@/lib/exportUtils';
import { usePageTitle } from '@/hooks/usePageTitle';
import { toast } from 'sonner';

export default function AdminReportsPage() {
  usePageTitle('Evening Reports');
  const { dailyReports, addReportComment } = useSalesStore();
  const { user } = useAuthStore();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const selectedReport = useMemo(() => 
    dailyReports.find(r => r.id === selectedReportId),
    [dailyReports, selectedReportId]
  );

  const handleAddComment = () => {
    if (!selectedReportId || !commentText.trim() || !user) return;
    
    addReportComment(selectedReportId, {
      text: commentText,
      adminName: user.name,
      timestamp: Date.now()
    });
    
    setCommentText('');
    toast.success('Comment added to report');
  };

  const getPerformanceColor = (achieved: number, target: number) => {
    const percent = (achieved / target) * 100;
    if (percent >= 100) return 'text-green-600 bg-green-50';
    if (percent >= 75) return 'text-blue-600 bg-blue-50';
    if (percent >= 50) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Reports</h1>
          <p className="text-muted-foreground">Review and provide feedback on agent EOD reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reports List */}
        <Card className="lg:col-span-1 border-none shadow-sm h-[calc(100vh-200px)] flex flex-col">
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-3">
            {dailyReports.map((report) => (
              <div 
                key={report.id}
                onClick={() => setSelectedReportId(report.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                  selectedReportId === report.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-transparent bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="font-bold text-slate-900">{report.agentName}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{report.date}</p>
                </div>
                <p className="text-xs text-slate-500 mb-2">{report.route}</p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {report.achievedCartons} / {report.targetCartons} Ctn
                  </Badge>
                  {report.adminComments && (
                    <Badge className="bg-blue-500 text-[10px]">Commented</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Report Detail */}
        <Card className="lg:col-span-2 border-none shadow-sm h-[calc(100vh-200px)] flex flex-col">
          {selectedReport ? (
            <>
              <CardHeader className="flex flex-row items-center justify-between border-b">
                <div>
                  <CardTitle>{selectedReport.agentName}'s Report</CardTitle>
                  <CardDescription>{selectedReport.date} • {selectedReport.route}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportToPDF('report-content', `Report_${selectedReport.agentName}_${selectedReport.date}`)}>
                    <Download className="w-4 h-4 mr-2" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => shareToWhatsApp(selectedReport)}>
                    <Share2 className="w-4 h-4 mr-2" /> WhatsApp
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-0">
                <div id="report-content" className="p-8 space-y-8 bg-white">
                  {/* WhatsApp Style Header */}
                  <div className="border-l-4 border-primary pl-4 py-2 bg-slate-50 rounded-r-lg">
                    <h2 className="text-xl font-black text-primary uppercase tracking-tighter">FS Daily Evening Report</h2>
                    <p className="text-sm text-slate-500">Generated on {format(selectedReport.submittedAt, 'PPP p')}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Coverage</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Target Calls</p>
                          <p className="text-2xl font-black">{selectedReport.targetCalls}</p>
                        </div>
                        <div className={`p-4 rounded-2xl ${getPerformanceColor(selectedReport.achievedCalls, selectedReport.targetCalls)}`}>
                          <p className="text-[10px] font-bold uppercase mb-1 opacity-70">Achieved</p>
                          <p className="text-2xl font-black">{selectedReport.achievedCalls}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sales Performance</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Target Ctn</p>
                          <p className="text-2xl font-black">{selectedReport.targetCartons}</p>
                        </div>
                        <div className={`p-4 rounded-2xl ${getPerformanceColor(selectedReport.achievedCartons, selectedReport.targetCartons)}`}>
                          <p className="text-[10px] font-bold uppercase mb-1 opacity-70">Achieved</p>
                          <p className="text-2xl font-black">{selectedReport.achievedCartons}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Market Insights & Challenges</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-slate-700">Insights</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedReport.marketInsights.map((insight, i) => (
                            <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">{insight}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-slate-700">Challenges</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedReport.challenges.map((challenge, i) => (
                            <Badge key={i} variant="destructive" className="bg-red-50 text-red-700 border-red-100">{challenge}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-900 text-white rounded-3xl">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Plan for Tomorrow</h3>
                    <ul className="space-y-2">
                      {selectedReport.planForTomorrow.map((plan, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-primary">{i+1}</span>
                          </div>
                          {plan}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Admin Comments Section */}
                  <div className="pt-8 border-t space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Feedback</h3>
                    {selectedReport.adminComments ? (
                      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-bold text-blue-900">{selectedReport.adminComments.adminName}</p>
                          <p className="text-[10px] text-blue-500">{format(selectedReport.adminComments.timestamp, 'PPp')}</p>
                        </div>
                        <p className="text-sm text-blue-800 italic">"{selectedReport.adminComments.text}"</p>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Add feedback for the agent..." 
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="bg-slate-50 border-none rounded-xl"
                        />
                        <Button onClick={handleAddComment}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
              <FileText className="w-16 h-16 opacity-10" />
              <p>Select a report to view details</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
