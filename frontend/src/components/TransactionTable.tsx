import { useState } from 'react';
import { RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';

interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
  is_recurring: boolean;
}

interface TransactionTableProps {
  transactions: Transaction[];
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const [filter, setFilter] = useState<'all' | 'debit' | 'credit'>('all');
  
  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num || 0);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Food': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Travel': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Shopping': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'Bills': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'EMI': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Subscriptions': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Salary': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'Rent': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'Investments': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      'Other': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    };
    return colors[category] || colors['Other'];
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl flex flex-col h-[600px] overflow-hidden">
      <div className="p-6 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        
        <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-700/50">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'all' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('credit')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'credit' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Income
          </button>
          <button 
            onClick={() => setFilter('debit')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'debit' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Spends
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-900/50 text-slate-400 sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Description</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {filteredTransactions.map((t, i) => (
              <tr key={i} className="hover:bg-slate-800/80 transition-colors group">
                <td className="px-6 py-4 text-slate-300">{t.date}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <p className="text-slate-200 truncate max-w-[200px] sm:max-w-xs">{t.description}</p>
                    {t.is_recurring && (
                      <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-amber-400/80 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20" title="Recurring Payment">
                        <RefreshCw className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getCategoryColor(t.category)}`}>
                    {t.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {t.type === 'credit' ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-rose-400" />
                    )}
                    <span className={t.type === 'credit' ? 'text-emerald-400 font-medium' : 'text-slate-200'}>
                      {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
