'use client';

import { useState } from 'react';
import { Role } from '@/lib/types';
import { roles } from '@/lib/interviewPrompts';
import { ArrowRight, Briefcase, Check, Search, Settings2, Sparkles, Unplug, Home } from 'lucide-react';
import { AppBrand } from './AppBrand';
import { RoleDetailsModal } from './RoleDetailsModal';

interface RoleSelectorProps {
  onSelectRole: (role: Role) => void;
  onHome?: () => void;
  onChangeProvider?: () => void;
  onClearKey?: () => void;
  providerLabel?: string;
}

export function RoleSelector({ onSelectRole, onHome, onChangeProvider, onClearKey, providerLabel }: RoleSelectorProps) {
  const [selected, setSelected] = useState<Role | null>(null);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('all');
  const filtered = roles.filter(role => (level === 'all' || role.difficulty === level)
    && [role.title, role.department, role.description, ...role.skills].join(' ').toLowerCase().includes(query.trim().toLowerCase()));

  return <main className="min-h-dvh app-surface text-slate-100">
    <header className="app-header">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <AppBrand />
        <nav aria-label="AI provider settings" className="flex flex-wrap items-center gap-3 text-sm">
          {onHome && <button onClick={onHome} className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5"><Home className="h-4 w-4" />Home</button>}
          {providerLabel && <span className="hidden max-w-60 truncate rounded-full bg-violet-500/10 px-3 py-1.5 text-violet-200 sm:block"><span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-blue-400" />{providerLabel}</span>}
          {onChangeProvider && <button onClick={onChangeProvider} className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5"><Settings2 className="h-4 w-4" />AI settings</button>}
          {onClearKey && <button onClick={onClearKey} className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5"><Unplug className="h-4 w-4" />Disconnect</button>}
        </nav>
      </div>
    </header>
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <ol aria-label="Interview steps" className="mb-10 flex flex-wrap gap-5 text-xs font-medium text-slate-400 sm:gap-8">
        {['Connect AI', 'Choose a role', 'Practice interview', 'Get feedback'].map((step, index) => <li key={step} aria-current={index === 1 ? 'step' : undefined} className={`flex items-center gap-2 ${index === 1 ? 'text-violet-200' : ''}`}><span className={`flex h-6 w-6 items-center justify-center rounded-full ${index === 1 ? 'app-primary text-white' : 'bg-white/10 text-slate-300'}`}>{index === 0 ? <Check className="h-3 w-3" /> : index + 1}</span>{step}</li>)}
      </ol>
      <section className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div><p className="mb-3 text-xs font-bold uppercase tracking-widest text-violet-300">Your practice space</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">A little practice.<br />A lot more confidence.</h1><p className="mt-4 max-w-xl leading-relaxed text-slate-400">Choose a role, meet your AI interviewer, and turn every answer into a chance to improve.</p></div>
        <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 px-5 py-4 text-sm text-violet-100"><Sparkles className="mb-2 h-5 w-5" /><p className="font-semibold">Your pace. Your progress.</p><p className="mt-1 text-violet-300">Preview any role before you begin.</p></div>
      </section>
      <section aria-labelledby="role-list-title">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><div><h2 id="role-list-title" className="text-xl font-bold">Select a Role</h2><p aria-live="polite" className="mt-1 text-sm text-slate-400">{filtered.length} practice roles to explore</p></div>
          <label className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-[#172036] px-4 sm:w-80"><Search className="h-4 w-4 text-slate-400" /><span className="sr-only">Search roles</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search roles or skills" className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-400" /></label>
        </div>
        <div aria-label="Filter by experience level" className="mb-6 flex flex-wrap gap-2">{[['all', 'All levels'], ['entry', 'Entry level'], ['mid', 'Mid level'], ['senior', 'Senior level']].map(([value, label]) => <button key={value} onClick={() => setLevel(value)} aria-pressed={level === value} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${level === value ? 'app-primary text-white' : 'border border-white/10 bg-[#172036] text-slate-300 hover:border-violet-400'}`}>{label}</button>)}</div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(role => <button key={role.id} onClick={() => setSelected(role)} aria-haspopup="dialog" className="app-panel group flex flex-col rounded-2xl p-6 text-left transition-all hover:-translate-y-1 hover:border-violet-400/50 hover:shadow-lg hover:shadow-indigo-500/10 motion-reduce:transform-none">
          <div className="mb-5 flex items-center justify-between"><span className="rounded-xl bg-white/5 p-3 text-slate-200 transition-colors group-hover:bg-violet-500/10 group-hover:text-violet-300"><Briefcase className="h-5 w-5" /></span><span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium capitalize text-slate-300">{role.difficulty} level</span></div>
          <p className="mb-2 text-xs font-medium text-violet-300">{role.department}</p><h3 className="text-lg font-semibold tracking-tight">{role.title}</h3><p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{role.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">{role.skills.slice(0, 2).map(skill => <span key={skill} className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-300">{skill}</span>)}<span className="py-1 text-xs text-slate-400">+{role.skills.length - 2} skills</span></div>
          <span className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm font-semibold text-violet-300">View interview details<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
        </button>)}</div>
        {!filtered.length && <div className="rounded-2xl border border-dashed border-white/20 bg-[#172036] p-10 text-center"><p className="font-semibold">No roles match your search.</p><button onClick={() => { setQuery(''); setLevel('all'); }} className="mt-4 font-medium text-violet-300 underline">Reset filters</button></div>}
      </section>
      <footer className="mt-10 border-t border-white/10 pt-6 text-sm text-slate-400">Built for practice, not perfection. Use Chrome and allow microphone access when you start.</footer>
    </div>
    {selected && <RoleDetailsModal role={selected} onDismiss={() => setSelected(null)} onProceed={() => { const role = selected; setSelected(null); onSelectRole(role); }} />}
  </main>;
}
