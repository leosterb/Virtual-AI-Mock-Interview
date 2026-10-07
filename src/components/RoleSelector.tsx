'use client';

import { useState } from 'react';
import { Role } from '@/lib/types';
import { roles } from '@/lib/interviewPrompts';
import { ArrowRight, Briefcase, Check, Search, Settings2, Sparkles, Unplug } from 'lucide-react';
import { RoleDetailsModal } from './RoleDetailsModal';

interface RoleSelectorProps {
  onSelectRole: (role: Role) => void;
  onChangeProvider?: () => void;
  onClearKey?: () => void;
  providerLabel?: string;
}

export function RoleSelector({ onSelectRole, onChangeProvider, onClearKey, providerLabel }: RoleSelectorProps) {
  const [selected, setSelected] = useState<Role | null>(null);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('all');
  const filtered = roles.filter(role => (level === 'all' || role.difficulty === level)
    && [role.title, role.department, role.description, ...role.skills].join(' ').toLowerCase().includes(query.trim().toLowerCase()));

  return <main className="min-h-dvh bg-[#f6f8fa] text-slate-900">
    <header className="border-b border-slate-200/80 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <div className="flex items-center gap-3"><span className="rounded-xl bg-teal-700 p-2 text-white"><Sparkles className="h-5 w-5" /></span><span className="font-bold tracking-tight">Interview Practice</span></div>
        <nav aria-label="AI provider settings" className="flex flex-wrap items-center gap-3 text-sm">
          {providerLabel && <span className="hidden max-w-60 truncate rounded-full bg-teal-50 px-3 py-1.5 text-teal-800 sm:block"><span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-teal-600" />{providerLabel}</span>}
          {onChangeProvider && <button onClick={onChangeProvider} className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100"><Settings2 className="h-4 w-4" />AI settings</button>}
          {onClearKey && <button onClick={onClearKey} className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100"><Unplug className="h-4 w-4" />Disconnect</button>}
        </nav>
      </div>
    </header>
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <ol aria-label="Interview steps" className="mb-10 flex flex-wrap gap-5 text-xs font-medium text-slate-500 sm:gap-8">
        {['Connect AI', 'Choose a role', 'Practice interview', 'Get feedback'].map((step, index) => <li key={step} aria-current={index === 1 ? 'step' : undefined} className={`flex items-center gap-2 ${index === 1 ? 'text-teal-800' : ''}`}><span className={`flex h-6 w-6 items-center justify-center rounded-full ${index === 1 ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'}`}>{index === 0 ? <Check className="h-3 w-3" /> : index + 1}</span>{step}</li>)}
      </ol>
      <section className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div><p className="mb-3 text-xs font-bold uppercase tracking-widest text-teal-700">Your practice space</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">A little practice.<br />A lot more confidence.</h1><p className="mt-4 max-w-xl leading-relaxed text-slate-500">Choose a role, meet your AI interviewer, and turn every answer into a chance to improve.</p></div>
        <div className="rounded-2xl border border-teal-100 bg-teal-50/70 px-5 py-4 text-sm text-teal-900"><Sparkles className="mb-2 h-5 w-5" /><p className="font-semibold">Your pace. Your progress.</p><p className="mt-1 text-teal-700">Preview any role before you begin.</p></div>
      </section>
      <section aria-labelledby="role-list-title">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><div><h2 id="role-list-title" className="text-xl font-bold">Select a Role</h2><p aria-live="polite" className="mt-1 text-sm text-slate-500">{filtered.length} practice roles to explore</p></div>
          <label className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 sm:w-80"><Search className="h-4 w-4 text-slate-400" /><span className="sr-only">Search roles</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search roles or skills" className="w-full bg-transparent py-3 text-sm outline-none" /></label>
        </div>
        <div aria-label="Filter by experience level" className="mb-6 flex flex-wrap gap-2">{[['all', 'All levels'], ['entry', 'Entry level'], ['mid', 'Mid level'], ['senior', 'Senior level']].map(([value, label]) => <button key={value} onClick={() => setLevel(value)} aria-pressed={level === value} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${level === value ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-400'}`}>{label}</button>)}</div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(role => <button key={role.id} onClick={() => setSelected(role)} aria-haspopup="dialog" className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-900/5 motion-reduce:transform-none">
          <div className="mb-5 flex items-center justify-between"><span className="rounded-xl bg-slate-100 p-3 text-slate-700 transition-colors group-hover:bg-teal-50 group-hover:text-teal-700"><Briefcase className="h-5 w-5" /></span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">{role.difficulty} level</span></div>
          <p className="mb-2 text-xs font-medium text-teal-700">{role.department}</p><h3 className="text-lg font-semibold tracking-tight">{role.title}</h3><p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500">{role.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">{role.skills.slice(0, 2).map(skill => <span key={skill} className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600">{skill}</span>)}<span className="py-1 text-xs text-slate-400">+{role.skills.length - 2} skills</span></div>
          <span className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-teal-700">View interview details<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
        </button>)}</div>
        {!filtered.length && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="font-semibold">No roles match your search.</p><button onClick={() => { setQuery(''); setLevel('all'); }} className="mt-4 font-medium text-teal-700 underline">Reset filters</button></div>}
      </section>
      <footer className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500">Built for practice, not perfection. Use Chrome and allow microphone access when you start.</footer>
    </div>
    {selected && <RoleDetailsModal role={selected} onDismiss={() => setSelected(null)} onProceed={() => { const role = selected; setSelected(null); onSelectRole(role); }} />}
  </main>;
}
