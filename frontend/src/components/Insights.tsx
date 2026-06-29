import { Sparkles } from 'lucide-react';

interface InsightsProps {
  insights: string[];
}

export default function Insights({ insights }: InsightsProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-6 rounded-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles className="w-24 h-24 text-indigo-400" />
      </div>
      
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-indigo-300">
        <Sparkles className="w-5 h-5" />
        AI Financial Insights
      </h3>
      
      <ul className="space-y-4 relative z-10">
        {insights.map((insight, idx) => (
          <li key={idx} className="flex gap-3 items-start bg-slate-900/40 p-3 rounded-lg border border-slate-700/30">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
            <p className="text-slate-300 text-sm leading-relaxed">{insight}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
