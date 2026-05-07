import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  ChartBarIcon, 
  UsersIcon, 
  ArchiveBoxIcon, 
  MapIcon, 
  BuildingOffice2Icon, 
  DocumentTextIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/useAuthStore';
import { useSalesStore } from '@/store/useSalesStore';
import { useAdminStore } from '@/store/useAdminStore';
import { cn } from '@/lib/utils';
import * as Tooltip from '@radix-ui/react-tooltip';
import { motion, AnimatePresence } from 'motion/react';

const navGroups = [
  {
    title: 'Intelligence',
    items: [
      { label: 'Overview',       sub: 'Central command',  icon: HomeIcon,            path: '/admin' },
      { label: 'Sales Reports',  sub: 'Revenue velocity', icon: ChartBarIcon,        path: '/admin/sales-reports' },
    ]
  },
  {
    title: 'Operations',
    items: [
      { label: 'Agents',         sub: 'Field management', icon: UsersIcon,           path: '/admin/agents' },
      { label: 'Inventory',      sub: 'Asset tracking',   icon: ArchiveBoxIcon,      path: '/admin/inventory' },
      { label: 'Routes & Shops', sub: 'Logistics',        icon: MapIcon,             path: '/admin/routes-shops' },
      { label: 'Distributors',   sub: 'Supply chain',     icon: BuildingOffice2Icon, path: '/admin/distributors' },
    ]
  },
  {
    title: 'Governance',
    items: [
      { label: 'Daily Reports',  sub: 'Monitoring',       icon: DocumentTextIcon,   path: '/admin/daily-reports' },
      { label: 'Settings',       sub: 'System config',    icon: Cog6ToothIcon,      path: '/admin/settings' },
    ]
  }
];

interface AdminSidebarProps {
  /** When true, always render labels (e.g. inside the mobile drawer) */
  forceShowLabels?: boolean;
}

export function AdminSidebar({ forceShowLabels }: AdminSidebarProps) {
  const { user, logout } = useAuthStore();
  const { dailyReports } = useSalesStore();
  const { agents } = useAdminStore();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Badge Logic
  const today = new Date().toISOString().split('T')[0];
  const submittedAgentIds = dailyReports.filter(r => r.date === today).map(r => r.agentId);
  const missingReportsCount = agents.filter(
    a => a.role === 'agent' && a.status === 'active' && !submittedAgentIds.includes(a.uid)
  ).length;

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Utility: show content when we're on the full-width sidebar (lg+) OR inside mobile drawer
  const showContent = (alwaysBlock = false) =>
    alwaysBlock
      ? 'block'
      : forceShowLabels
        ? 'block'
        : 'hidden lg:block';

  return (
    <div className="flex flex-col h-full bg-[#050505] w-full relative border-r border-white/[0.04] selection:bg-teal-500/30 font-sans overflow-hidden">
      {/* Mesh glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(20,184,166,0.07),transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-4 shrink-0 flex flex-col gap-5">
        {/* Brand */}
        <div className="flex items-center gap-3 group cursor-pointer">
          {/* Logo mark — always visible */}
          <div className="relative shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-900 border border-white/5 transition-all duration-300 group-hover:border-teal-500/40 group-hover:bg-zinc-800">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <SparklesIcon className="w-4.5 h-4.5 text-teal-400" />
          </div>

          {/* Wordmark — hidden on icon-only sidebar */}
          <div className={showContent()}>
            <h1 className="text-[15px] font-bold text-white tracking-tight leading-none flex items-center gap-2">
              Sales<span className="text-teal-400">Pro</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/[0.06] text-[9px] font-semibold text-zinc-400 border border-white/5 uppercase tracking-widest">v2.1</span>
            </h1>
          </div>
        </div>

        {/* Search bar */}
        <div className={showContent()}>
          <div className="relative flex items-center group">
            <MagnifyingGlassIcon className="absolute left-3 w-3.5 h-3.5 text-zinc-500 group-focus-within:text-teal-400 transition-colors" />
            <input
              readOnly
              type="text"
              placeholder="Quick Search..."
              className="w-full bg-zinc-900/60 border border-white/[0.04] rounded-lg pl-9 pr-10 py-2 text-[12px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-teal-500/30 transition-all cursor-default"
            />
            <div className="absolute right-2.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-white/[0.06] bg-white/[0.03] text-[9px] font-bold text-zinc-600 tracking-tight">
              ⌘K
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation ──────────────────────────────────────── */}
      <nav
        className="flex-1 overflow-y-auto px-3 py-3 space-y-6 scrollbar-hide"
        onMouseLeave={() => setHoveredItem(null)}
      >
        {navGroups.map((group) => (
          <div key={group.title}>
            {/* Section header */}
            <div className={cn('px-3 mb-2', showContent())}>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                {group.title}
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <Tooltip.Root key={item.path} delayDuration={0}>
                  <Tooltip.Trigger asChild>
                    <NavLink
                      to={item.path}
                      end={item.path === '/admin'}
                      onMouseEnter={() => setHoveredItem(item.path)}
                      className={({ isActive }) =>
                        cn(
                          'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 group',
                          isActive
                            ? 'text-white'
                            : 'text-zinc-400 hover:text-white'
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Hover ghost */}
                          <AnimatePresence>
                            {hoveredItem === item.path && !isActive && (
                              <motion.div
                                key="hover-bg"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="absolute inset-0 bg-white/[0.03] border border-white/[0.04] rounded-xl"
                              />
                            )}
                          </AnimatePresence>

                          {/* Active state */}
                          {isActive && (
                            <>
                              <motion.div
                                layoutId="active-pill"
                                className="absolute inset-0 bg-teal-500/[0.06] border border-teal-500/[0.12] rounded-xl"
                                initial={false}
                                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                              />
                              <motion.div
                                layoutId="active-beam"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-teal-400 rounded-r-full shadow-[0_0_12px_rgba(52,211,153,0.7)]"
                                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                              />
                            </>
                          )}

                          {/* Icon — always visible */}
                          <item.icon
                            className={cn(
                              'relative z-10 shrink-0 w-[18px] h-[18px] transition-all duration-200',
                              isActive
                                ? 'text-teal-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                                : 'text-zinc-500 group-hover:text-zinc-300'
                            )}
                          />

                          {/* Label — hidden on icon-only sidebar */}
                          <div className={cn('relative z-10 flex flex-col min-w-0 flex-1', showContent())}>
                            <span className={cn(
                              'text-[13px] font-semibold leading-tight truncate',
                              isActive ? 'text-white' : 'text-zinc-200'
                            )}>
                              {item.label}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">
                              {item.sub}
                            </span>
                          </div>

                          {/* Badge */}
                          {item.label === 'Daily Reports' && missingReportsCount > 0 && (
                            <div className={cn('relative z-10 ml-auto shrink-0', showContent())}>
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md bg-teal-500 text-white text-[10px] font-black shadow-[0_0_10px_rgba(20,184,166,0.4)]"
                              >
                                {missingReportsCount}
                              </motion.span>
                            </div>
                          )}
                        </>
                      )}
                    </NavLink>
                  </Tooltip.Trigger>

                  {/* Tooltip for icon-only mode */}
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="right"
                      sideOffset={14}
                      className={cn(
                        'z-[200] bg-zinc-900 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow-xl border border-white/10 animate-in fade-in zoom-in-95',
                        forceShowLabels ? 'hidden' : 'lg:hidden'
                      )}
                    >
                      {item.label}
                      <Tooltip.Arrow className="fill-zinc-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div className="px-4 py-4 shrink-0 border-t border-white/[0.04]">
        {/* Status pill */}
        <div className={cn('mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900/40 border border-white/[0.04]', showContent())}>
          <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_6px_rgba(20,184,166,0.7)] animate-pulse" />
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Network Operational</span>
        </div>

        {/* User row */}
        <div className="flex items-center gap-3">
          {/* Avatar — always visible */}
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#050505] bg-teal-500 shadow-[0_0_6px_rgba(20,184,166,0.6)]" />
          </div>

          {/* Name & role */}
          <div className={cn('flex flex-col min-w-0 flex-1', showContent())}>
            <span className="text-[13px] font-semibold text-white truncate leading-tight">
              {user?.name || 'Administrator'}
            </span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest truncate mt-0.5">
              Root Authority
            </span>
          </div>

          {/* Sign-out */}
          <button
            onClick={handleSignOut}
            title="Sign out"
            className={cn(
              'shrink-0 p-2 rounded-lg text-zinc-600 hover:text-white hover:bg-white/[0.05] transition-all duration-200',
              showContent()
            )}
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
