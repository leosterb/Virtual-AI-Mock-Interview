import { Star } from 'lucide-react';

export function StarRating({ score, label }: { score: number; label: string }) {
  return <div role="img" aria-label={`${label}: ${score} out of 10 stars`} className="flex items-center gap-1">
    {Array.from({ length: 10 }, (_, index) => <Star key={index} aria-hidden="true"
      className={`h-3 w-3 sm:h-4 sm:w-4 ${index < score ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />)}
    <span aria-hidden="true" className="ml-2 text-sm font-semibold">{score}/10</span>
  </div>;
}
