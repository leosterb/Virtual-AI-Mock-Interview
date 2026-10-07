'use client';

import { ArrowRight, AudioLines, Check, Download, MessageCircle, Mic, ShieldCheck, Sparkles, User } from 'lucide-react';
import { AppBrand } from './AppBrand';

export function LandingPage({ onStart }: { onStart: () => void }) {
  return <main className="app-surface min-h-dvh text-slate-100">
    <header className="app-header"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
      <AppBrand />
      <nav aria-label="Main navigation" className="flex items-center gap-5 text-sm"><a href="#how-it-works" className="hidden text-slate-300 hover:text-white sm:inline">How it works</a><button onClick={onStart} className="app-secondary rounded-full px-5 py-2.5 font-semibold">Get started<ArrowRight className="ml-2 inline h-4 w-4" /></button></nav>
    </div></header>
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-12 sm:px-8 sm:pt-20 lg:grid-cols-2 lg:gap-14">
      <div>
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/10 px-4 py-2 text-sm font-medium text-violet-200"><Sparkles className="h-4 w-4" />A little practice. A lot more confidence.</p>
        <h1 className="text-4xl font-bold leading-[1.12] tracking-tight sm:text-6xl">Your next chapter<br />starts with <span className="app-gradient-text">a conversation.</span></h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-300">Meet Alex, your friendly AI interviewer. Practice real job questions, find your voice, and walk into your next interview feeling more like yourself.</p>
        <div className="mt-8 flex flex-wrap items-center gap-4"><button onClick={onStart} className="app-primary flex items-center gap-3 rounded-2xl px-6 py-4 font-semibold">Start practicing<ArrowRight className="h-5 w-5" /></button><a href="#how-it-works" className="px-2 py-3 font-medium text-slate-300 hover:text-white">See how it works</a></div>
        <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-400"><span><Check className="mr-1 inline h-4 w-4 text-blue-300" />Your own AI provider</span><span><Check className="mr-1 inline h-4 w-4 text-blue-300" />Practice at your pace</span></div>
      </div>
      <div aria-label="Preview of a practice session" className="relative">
        <div className="pointer-events-none absolute -inset-6 rounded-full bg-gradient-to-tr from-blue-600/20 to-purple-500/20 blur-3xl" />
        <div className="app-panel relative overflow-hidden rounded-3xl p-5 sm:p-7">
          <div className="mb-6 flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-semibold"><span className="h-2 w-2 rounded-full bg-blue-400" />Your practice room</span><span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">Session preview</span></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-violet-400/20 bg-gradient-to-br from-indigo-500/20 to-purple-500/15"><span className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-purple-500/20"><Sparkles className="h-8 w-8 text-white" /></span><span className="text-sm font-semibold">Alex</span><span className="mt-1 text-xs text-violet-200">Your AI interviewer</span></div>
            <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-blue-400/20 bg-gradient-to-br from-slate-700/40 to-blue-500/10"><span className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-600/50"><User className="h-8 w-8 text-blue-200" /></span><span className="text-sm font-semibold">You</span><span className="mt-1 text-xs text-slate-400">Ready for your next step</span></div>
          </div>
          <div className="mt-5 flex items-start gap-3"><span className="rounded-full bg-purple-500/20 p-2 text-violet-200"><MessageCircle className="h-4 w-4" /></span><p className="rounded-2xl rounded-tl-sm bg-white/5 px-4 py-3 text-sm leading-relaxed text-slate-200">Hi, I&apos;m Alex! Can you tell me a little about yourself?</p></div>
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3"><span className="flex items-center gap-2 text-xs text-blue-200"><AudioLines className="h-5 w-5" />A conversation, not a script</span><span className="app-primary rounded-full p-3"><Mic className="h-4 w-4" /></span></div>
        </div>
      </div>
    </section>
    <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-8 px-5 pb-16 sm:px-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-violet-300">From nervous to ready</p><h2 className="mb-8 text-2xl font-bold sm:text-3xl">Make progress, one answer at a time.</h2>
      <div className="grid gap-4 md:grid-cols-3">{[
        { icon: ShieldCheck, title: 'Bring your AI', text: 'Connect a Gemini key from Google AI Studio or use your preferred AI provider.' },
        { icon: Mic, title: 'Find your flow', text: 'Preview a role, take a breath, and practice a friendly voice conversation with Alex.' },
        { icon: Download, title: 'Keep your progress', text: 'Get star ratings and practical feedback for your answers. Save a PDF to revisit later.' },
      ].map(({ icon: Icon, title, text }, index) => <article key={title} className="app-panel rounded-2xl p-6"><div className="mb-5 flex items-center justify-between"><span className="rounded-xl bg-violet-400/10 p-3 text-violet-200"><Icon className="h-5 w-5" /></span><span className="text-sm text-slate-400">0{index + 1}</span></div><h3 className="mb-3 text-lg font-semibold">{title}</h3><p className="text-sm leading-relaxed text-slate-400">{text}</p></article>)}</div>
    </section>
    <footer className="border-t border-white/10 px-5 py-6 text-center text-sm text-slate-400">Built for practice, not perfection. Your next conversation could change everything.</footer>
  </main>;
}
