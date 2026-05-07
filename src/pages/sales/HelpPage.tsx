import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  QuestionMarkCircleIcon, 
  ChatBubbleLeftRightIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { haptics } from '@/lib/haptics';
import { cn } from '@/lib/utils';

const FAQS = [
  {
    q: "How do I record a sale offline?",
    a: "The app automatically detects when you are offline. Simply record the sale as usual, and it will be saved to the sync queue. Once you are back online, tap 'Sync Now' in Settings or wait for the auto-sync."
  },
  {
    q: "What if a shop is not in my list?",
    a: "Contact your administrator to add the shop to your assigned route. You can also use the 'New Shop' request in the Shops menu if enabled."
  },
  {
    q: "How do I update my stock levels?",
    a: "Go to the Stock tab and tap the '+' button. Select the distributor and product to add stock. Sales are automatically deducted from your inventory."
  },
  {
    q: "My data isn't syncing, what should I do?",
    a: "Check your internet connection. If connected, go to Settings > Offline & Sync and check the status. You can try clearing the cache if the problem persists."
  }
];

import { AgentPageHeader } from '@/components/navigation/AgentPageHeader';
import { useSwipeBack } from '@/hooks/useSwipeBack';

export default function HelpPage() {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useSwipeBack();

  const filteredFaqs = FAQS.filter(f => 
    f.q.toLowerCase().includes(search.toLowerCase()) || 
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-full pb-24 pt-[calc(56px+env(safe-area-inset-top))]">
      <AgentPageHeader title="Help & Support" showBack />
      <div className="p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search help articles..." 
            className="pl-10 bg-white border-none shadow-soft h-12 rounded-xl text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-2 gap-4">
          <ContactCard 
            icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />}
            label="Live Chat"
            sub="Average wait: 5m"
            color="text-blue-600 bg-blue-50"
          />
          <ContactCard 
            icon={<PhoneIcon className="w-6 h-6" />}
            label="Call Support"
            sub="Mon-Fri, 8am-6pm"
            color="text-emerald-600 bg-emerald-50"
          />
        </div>

        {/* FAQ Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <QuestionMarkCircleIcon className="w-5 h-5 text-primary" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Frequently Asked Questions</h3>
          </div>
          
          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <button 
                  onClick={() => { haptics.light(); setOpenFaq(openFaq === idx ? null : idx); }}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <span className="text-sm font-bold text-slate-900">{faq.q}</span>
                  <ChevronRightIcon className={cn(
                    "w-4 h-4 text-slate-300 transition-transform duration-300",
                    openFaq === idx && "rotate-90"
                  )} />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Learning Resources</h3>
          <Card className="bg-white border-border rounded-2xl shadow-soft overflow-hidden">
            <CardContent className="p-0">
              <ResourceRow 
                icon={<BookOpenIcon className="w-5 h-5" />}
                label="Agent Training Manual"
                sub="PDF • 2.4 MB"
              />
              <Separator />
              <ResourceRow 
                icon={<EnvelopeIcon className="w-5 h-5" />}
                label="Email Support"
                sub="support@faidapoint.com"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ icon, label, sub, color }: { icon: React.ReactNode, label: string, sub: string, color: string }) {
  return (
    <button className="flex flex-col items-center text-center p-5 bg-white rounded-3xl border border-slate-100 shadow-sm active:scale-95 transition-transform">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-3", color)}>
        {icon}
      </div>
      <p className="text-sm font-bold text-slate-900">{label}</p>
      <p className="text-[10px] text-slate-400 font-medium mt-1">{sub}</p>
    </button>
  );
}

function ResourceRow({ icon, label, sub }: { icon: React.ReactNode, label: string, sub: string }) {
  return (
    <button className="w-full p-4 flex items-center gap-4 active:bg-slate-50 transition-colors text-left">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-900">{label}</p>
        <p className="text-[10px] text-slate-400 font-medium">{sub}</p>
      </div>
      <ChevronRightIcon className="w-4 h-4 text-slate-300" />
    </button>
  );
}
