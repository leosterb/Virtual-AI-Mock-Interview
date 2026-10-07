'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight, Briefcase, Check, Clock, Mic, X } from 'lucide-react';
import { Role } from '@/lib/types';

export function RoleDetailsModal({ role, onDismiss, onProceed }: { role: Role; onDismiss: () => void; onProceed: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return <dialog ref={dialogRef} aria-labelledby="role-details-title"
    onCancel={event => { event.preventDefault(); onDismiss(); }}
    onClick={event => { if (event.target === event.currentTarget) onDismiss(); }}
    className="m-auto max-h-[90dvh] w-[min(94vw,38rem)] overflow-y-auto rounded-3xl border border-white/10 bg-[#172036] p-0 text-slate-100 shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm">
    <div className="p-6 sm:p-8">
      <div className="mb-5 flex items-center justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300"><Briefcase aria-hidden="true" className="h-6 w-6" /></span>
        <button autoFocus aria-label="Close role details" onClick={onDismiss} className="rounded-full p-2 text-slate-400 hover:bg-white/5"><X className="h-5 w-5" /></button>
      </div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-300">Interview preview</p>
      <h2 id="role-details-title" className="text-2xl font-bold tracking-tight sm:text-3xl">{role.title}</h2>
      <div className="mt-3 flex gap-2 text-sm"><span className="rounded-full bg-white/5 px-3 py-1 capitalize">{role.difficulty} level</span><span className="rounded-full bg-white/5 px-3 py-1">{role.department}</span></div>
      <p className="mt-5 leading-relaxed text-slate-300">{role.description}</p>
      <h3 className="mt-6 font-semibold">What you&apos;ll practice</h3>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">{role.skills.map(skill => <li key={skill} className="flex items-center gap-2 text-sm text-slate-300"><Check className="h-4 w-4 text-violet-300" />{skill}</li>)}</ul>
      <div className="mt-6 space-y-3 rounded-2xl bg-white/5 p-4 text-sm text-slate-300">
        <p className="flex items-start gap-3"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" /><span>Self-paced conversation: an introduction, 4–6 role questions, and follow-ups. End whenever you&apos;re ready.</span></p>
        <p className="flex items-start gap-3"><Mic className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" /><span>Allow microphone access; camera is optional. Chrome is recommended. Alex begins after a 3-second pause.</span></p>
        <p>Afterward, get feedback and 1–10 star ratings for your answers. This is a practice interview, not a job application.</p>
      </div>
    </div>
    <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-white/10 bg-[#172036] p-5 sm:px-8">
      <button onClick={onDismiss} className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/5">Back to roles</button>
      <button onClick={onProceed} className="flex items-center gap-2 rounded-xl app-primary px-5 py-3 text-sm font-semibold text-white hover:brightness-110">Proceed with interview<ArrowRight className="h-4 w-4" /></button>
    </div>
  </dialog>;
}
