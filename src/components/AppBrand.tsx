import { Sparkles } from 'lucide-react';

export function AppBrand() {
  return <span className="flex items-center gap-3 text-white">
    <span className="app-primary flex h-10 w-10 items-center justify-center rounded-2xl"><Sparkles aria-hidden="true" className="h-5 w-5" /></span>
    <span className="font-bold tracking-tight">Interview<span className="text-violet-300"> Practice</span></span>
  </span>;
}
