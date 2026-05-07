import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ArrowRight, User, Lock, Chrome, Briefcase, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = (role: 'admin' | 'agent') => {
    const mockUser = {
      uid: '123',
      email: email || (role === 'admin' ? 'admin@test.com' : 'agent@test.com'),
      name: role === 'admin' ? 'Admin User' : 'Sales Agent',
      role,
      region: 'Central',
      stockPoint: 'Nairobi',
      phoneNumber: '0700000000',
      createdAt: Date.now(),
    };
    
    setUser(mockUser);
    toast.success(`Welcome back, ${mockUser.name}`);
    navigate(role === 'admin' ? '/admin' : '/agent/home');
  };

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Left Pane - Brand & Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 border-r border-white/5 overflow-hidden">
        {/* Background Decorative Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:32px_32px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-rose-500/10" />
        
        {/* Floating Glass Cards for Visual Interest */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="relative w-full max-w-lg">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10 space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-teal-500 flex items-center justify-center text-white shadow-2xl shadow-teal-500/20">
                  <LayoutDashboard className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
                  Sales<span className="text-teal-400">Pro</span>
                </h1>
              </div>

              <div className="space-y-4">
                <h2 className="text-5xl font-black text-white leading-[0.9] tracking-tighter italic">
                  COMMAND YOUR <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">SALES ENGINE.</span>
                </h2>
                <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md">
                  The ultimate distribution management system for high-performance sales teams.
                </p>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center gap-8 pt-8">
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-black text-white">24/7</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Inventory Monitoring</span>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-black text-white">Secure</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cloud Distribution</span>
                </div>
              </div>
            </motion.div>

            {/* Background Blur Elements */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-teal-500/20 blur-[100px] rounded-full animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-rose-500/10 blur-[100px] rounded-full delay-1000 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Right Pane - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 py-12 relative">
        <div className="w-full max-w-md mx-auto space-y-10">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <span className="font-black text-2xl text-slate-900 tracking-tighter">SalesPro</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Access Control</h3>
            <p className="text-slate-500 font-medium">Verify your identity to command the fleet.</p>
          </motion.div>

          {/* Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Operational ID (Email)</Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={18} />
                </div>
                <Input 
                  className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all font-bold text-slate-900"
                  placeholder="name@salespro.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Security Key (Password)</Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={18} />
                </div>
                <Input 
                  type="password"
                  className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all font-bold"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-teal-600 focus:ring-teal-500/20" />
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900">Remember Station</span>
              </label>
              <button className="text-xs font-black text-slate-400 hover:text-teal-600 transition-colors uppercase tracking-widest">Forgot Key?</button>
            </div>

            <div className="flex flex-col gap-4 pt-4">
              <Button 
                className="h-16 rounded-[22px] bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-slate-900/20 group transition-all active:scale-[0.98]"
                onClick={() => handleLogin('agent')}
              >
                Launch Sales Agent Terminal
                <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-300 bg-white px-4">Elevated Access</div>
              </div>

              <Button 
                variant="outline"
                className="h-14 rounded-2xl border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600 font-bold tracking-tight transition-all active:scale-[0.98]"
                onClick={() => handleLogin('admin')}
              >
                <ShieldCheck className="mr-3 w-5 h-5 text-teal-500" />
                Access Administrator Command
              </Button>
            </div>
          </motion.div>

          {/* Footer Meta */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-12 flex flex-col items-center gap-6"
          >
            <div className="flex items-center gap-6">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                    <User size={14} className="text-slate-400" />
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Protected by <span className="text-slate-900">Quantum Security</span>
              </p>
            </div>
            
            <p className="text-[10px] font-bold text-slate-300 text-center uppercase tracking-[0.3em]">
              SalesPro Enterprise © 2026 • Build v2.1.0-Release
            </p>
          </motion.div>
        </div>

        {/* Global Security Badge - Bottom Right */}
        <div className="absolute bottom-6 right-8 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Network Secure
        </div>
      </div>
    </div>
  );
}
