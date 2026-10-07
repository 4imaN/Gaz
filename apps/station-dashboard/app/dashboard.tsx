import Link from 'next/link';
import { BarChart3, ChevronDown, ClipboardList, Fuel, Gauge, LayoutDashboard, RefreshCw, Search, UsersRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Table, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const stationSections = ['overview', 'queue', 'pumps', 'inventory', 'workers', 'reports'] as const;
export type StationSection = (typeof stationSections)[number];

const navigation = [
  { id: 'overview', label: 'Operations', icon: LayoutDashboard },
  { id: 'queue', label: 'Queue monitor', icon: UsersRound },
  { id: 'pumps', label: 'Pumps', icon: Gauge },
  { id: 'inventory', label: 'Inventory', icon: Fuel },
  { id: 'workers', label: 'Workers', icon: ClipboardList },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
] as const;

const content: Record<StationSection, { label: string; title: string; description: string; columns: string[]; empty: string }> = {
  overview: { label: 'Station operations', title: 'Daily operations', description: 'Track queue flow, pump availability, and fuel availability throughout the day.', columns: ['Time', 'Event', 'Pump', 'Details'], empty: 'Operational activity appears after a station is assigned to this account.' },
  queue: { label: 'Queue operations', title: 'Queue monitor', description: 'Review active drivers by fuel type and manage exceptions without losing queue order.', columns: ['Driver', 'Fuel type', 'Queue state', 'Estimated service'], empty: 'No active queue entries are available.' },
  pumps: { label: 'Pump configuration', title: 'Pumps', description: 'Inspect capacity, compatible fuel types, and the current state of each pump.', columns: ['Pump', 'Fuel types', 'Capacity', 'Status'], empty: 'No pumps have been configured for this station.' },
  inventory: { label: 'Inventory management', title: 'Inventory ledger', description: 'Every estimated stock adjustment is retained as a ledger transaction.', columns: ['Fuel type', 'Estimated litres', 'Threshold', 'Status'], empty: 'Record initial stock to start tracking estimated inventory.' },
  workers: { label: 'Station access', title: 'Workers', description: 'Keep worker access scoped to the assigned station and current shift.', columns: ['Worker', 'Role', 'Status', 'Assigned at'], empty: 'No workers are assigned to this station.' },
  reports: { label: 'Station reporting', title: 'Operational reports', description: 'Review service volumes, recorded litres, wait times, cancellations, and no-shows.', columns: ['Report period', 'Vehicles served', 'Litres sold', 'Average wait'], empty: 'Reports appear after completed fuel services are recorded.' },
};

function sectionFrom(value?: string): StationSection { return stationSections.includes(value as StationSection) ? (value as StationSection) : 'overview'; }

export function StationDashboard({ section: value }: { section?: string }) {
  const section = sectionFrom(value); const view = content[section];
  return <main className="min-h-screen bg-[#f7faf8] text-stone-900"><div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[248px_minmax(0,1fr)]">
    <aside className="border-b border-emerald-950 bg-[#064e3b] px-4 py-5 text-emerald-50 lg:border-b-0 lg:border-r"><Link className="flex items-center gap-3 px-2" href="/"><span className="grid size-9 place-items-center rounded-md bg-[#f8c95e] text-xs font-black text-[#064e3b]">FQ</span><span><strong className="block text-sm tracking-wide text-white">Fuel Queue</strong><small className="text-xs text-emerald-200/70">Station workspace</small></span></Link><button className="mt-7 hidden w-full items-center justify-between rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-left text-sm lg:flex" type="button"><span><span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100/55">Selected station</span><strong className="mt-1 block font-medium">No station assigned</strong></span><ChevronDown size={16} /></button><nav className="mt-5 grid grid-cols-2 gap-1 lg:grid-cols-1" aria-label="Station operations">{navigation.map((item) => { const Icon = item.icon; const active = item.id === section; return <Link className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${active ? 'bg-white/12 text-white shadow-[inset_3px_0_0_#f8c95e]' : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'}`} href={item.id === 'overview' ? '/' : `/${item.id}`} key={item.id}><Icon aria-hidden="true" size={17} strokeWidth={1.8} /><span>{item.label}</span></Link>; })}</nav><div className="mt-8 hidden lg:block"><Separator className="bg-white/15" /><div className="mt-4 flex items-center gap-2 px-2 text-xs text-emerald-100/65"><span className="size-1.5 rounded-full bg-[#f8c95e]" /> Station assignment required</div></div></aside>
    <section className="min-w-0 px-5 py-7 sm:px-8 lg:px-10"><header className="flex flex-col justify-between gap-5 border-b border-stone-200 pb-6 sm:flex-row sm:items-start"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-500">{view.label}</p><h1 className="mt-2 font-serif text-3xl tracking-tight text-stone-950">{view.title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{view.description}</p></div><div className="flex items-center gap-3"><Badge variant="warning">Not configured</Badge><Button variant="outline"><RefreshCw size={15} />Refresh</Button></div></header>
      {section === 'overview' && <section className="my-7 grid divide-y divide-stone-200 border-y border-stone-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4" aria-label="Station metrics">{['Drivers waiting', 'Pumps available', 'Fuel alerts', 'Served today'].map((label) => <div className="px-4 py-4 first:pl-0 sm:first:pl-0 lg:last:pr-0" key={label}><p className="text-xs font-medium text-stone-500">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight">-</p><p className="mt-1 text-xs text-stone-400">No live data</p></div>)}</section>}
      <section className="mt-7 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-stone-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-medium text-stone-900">{section === 'overview' ? 'Recent activity' : view.title}</h2><p className="mt-0.5 text-xs text-stone-500">Results update after station access is configured.</p></div><div className="relative w-full sm:w-56"><Search className="pointer-events-none absolute left-3 top-2.5 text-stone-400" size={15} /><Input className="pl-9" aria-label={`Filter ${view.title}`} placeholder="Filter records" /></div></div><Table><TableHeader><TableRow>{view.columns.map((column) => <TableHead key={column}>{column}</TableHead>)}</TableRow></TableHeader></Table><div className="grid min-h-56 place-items-center px-6 text-center"><div><div className="mx-auto grid size-10 place-items-center rounded-full bg-emerald-50 text-emerald-700"><ChevronDown size={18} /></div><p className="mt-3 text-sm font-medium text-stone-800">Nothing to show</p><p className="mt-1 max-w-md text-sm leading-6 text-stone-500">{view.empty}</p></div></div></section>
    </section></div></main>;
}
