import Link from 'next/link';
import { Activity, Building2, ChevronDown, ClipboardList, LayoutDashboard, MessageSquareWarning, RefreshCw, Search, UsersRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Table, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const adminSections = ['overview', 'stations', 'users', 'complaints', 'audit', 'health'] as const;
export type AdminSection = (typeof adminSections)[number];

const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'stations', label: 'Station approvals', icon: Building2 },
  { id: 'users', label: 'Users', icon: UsersRound },
  { id: 'complaints', label: 'Complaints', icon: MessageSquareWarning },
  { id: 'audit', label: 'Audit history', icon: ClipboardList },
  { id: 'health', label: 'System health', icon: Activity },
] as const;

const content: Record<AdminSection, { label: string; title: string; description: string; columns: string[]; empty: string }> = {
  overview: { label: 'Platform administration', title: 'Control room', description: 'The operational picture across every station, queue, and service dependency.', columns: ['When', 'Activity', 'Station', 'Outcome'], empty: 'Activity will appear when stations begin processing queues.' },
  stations: { label: 'Station administration', title: 'Station approvals', description: 'Review station applications and keep operating status current.', columns: ['Station', 'Submitted', 'Location', 'Decision'], empty: 'There are no station applications awaiting review.' },
  users: { label: 'Account administration', title: 'Users', description: 'Find platform accounts, inspect roles, and apply restrictions when required.', columns: ['Phone number', 'Roles', 'Status', 'Last activity'], empty: 'No user records match the current filter.' },
  complaints: { label: 'Support operations', title: 'Complaints', description: 'Review reported issues with the context needed for a quick resolution.', columns: ['Reference', 'Category', 'Submitted', 'Status'], empty: 'There are no open complaints.' },
  audit: { label: 'Accountability', title: 'Audit history', description: 'Review manual overrides, account changes, and administrative actions.', columns: ['Time', 'Actor', 'Action', 'Entity'], empty: 'No audit events are available for this filter.' },
  health: { label: 'Platform reliability', title: 'System health', description: 'Check API dependencies before carrying out an operational action.', columns: ['Dependency', 'State', 'Last checked', 'Notes'], empty: 'Live health results appear when the dashboard API connection is configured.' },
};

function sectionFrom(value?: string): AdminSection { return adminSections.includes(value as AdminSection) ? (value as AdminSection) : 'overview'; }

export function AdminDashboard({ section: value }: { section?: string }) {
  const section = sectionFrom(value);
  const view = content[section];
  return <main className="min-h-screen bg-[#f8faf9] text-stone-900">
    <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="border-b border-stone-800 bg-[#18201e] px-4 py-5 text-stone-200 lg:border-b-0 lg:border-r">
        <Link className="flex items-center gap-3 px-2" href="/"><span className="grid size-9 place-items-center rounded-md bg-[#d5ff4f] text-xs font-black text-[#18201e]">FQ</span><span><strong className="block text-sm tracking-wide text-white">Fuel Queue</strong><small className="text-xs text-stone-400">Platform control</small></span></Link>
        <div className="mt-7 hidden lg:block"><p className="px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Workspace</p></div>
        <nav className="mt-3 grid grid-cols-2 gap-1 lg:grid-cols-1" aria-label="Platform administration">
          {navigation.map((item) => { const Icon = item.icon; const active = item.id === section; return <Link className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${active ? 'bg-white/10 text-white shadow-[inset_3px_0_0_#d5ff4f]' : 'text-stone-400 hover:bg-white/5 hover:text-stone-100'}`} href={item.id === 'overview' ? '/' : `/${item.id}`} key={item.id}><Icon aria-hidden="true" size={17} strokeWidth={1.8} /><span>{item.label}</span></Link>; })}
        </nav>
        <div className="mt-8 hidden lg:block"><Separator className="bg-white/10" /><div className="mt-4 flex items-center gap-2 px-2 text-xs text-stone-400"><span className="size-1.5 rounded-full bg-amber-400" /> Dashboard API not connected</div></div>
      </aside>
      <section className="min-w-0 px-5 py-7 sm:px-8 lg:px-10">
        <header className="flex flex-col justify-between gap-5 border-b border-stone-200 pb-6 sm:flex-row sm:items-start"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-500">{view.label}</p><h1 className="mt-2 font-serif text-3xl tracking-tight text-stone-950">{view.title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{view.description}</p></div><div className="flex items-center gap-3"><Badge variant="warning">Configuration needed</Badge><Button variant="outline"><RefreshCw size={15} />Refresh</Button></div></header>
        {section === 'overview' && <section className="my-7 grid divide-y divide-stone-200 border-y border-stone-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4" aria-label="Platform metrics">{['Approved stations', 'Drivers in queue', 'Vehicles served today', 'Open complaints'].map((label) => <div className="px-4 py-4 first:pl-0 sm:first:pl-0 lg:last:pr-0" key={label}><p className="text-xs font-medium text-stone-500">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight">-</p><p className="mt-1 text-xs text-stone-400">No live data</p></div>)}</section>}
        <section className="mt-7 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-stone-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-medium text-stone-900">{section === 'overview' ? 'Recent activity' : view.title}</h2><p className="mt-0.5 text-xs text-stone-500">Results update after a secure API connection is configured.</p></div><div className="relative w-full sm:w-56"><Search className="pointer-events-none absolute left-3 top-2.5 text-stone-400" size={15} /><Input className="pl-9" aria-label={`Filter ${view.title}`} placeholder="Filter records" /></div></div><Table><TableHeader><TableRow>{view.columns.map((column) => <TableHead key={column}>{column}</TableHead>)}</TableRow></TableHeader></Table><div className="grid min-h-56 place-items-center px-6 text-center"><div><div className="mx-auto grid size-10 place-items-center rounded-full bg-stone-100 text-stone-500"><ChevronDown size={18} /></div><p className="mt-3 text-sm font-medium text-stone-800">Nothing to show</p><p className="mt-1 max-w-md text-sm leading-6 text-stone-500">{view.empty}</p></div></div></section>
      </section>
    </div>
  </main>;
}
