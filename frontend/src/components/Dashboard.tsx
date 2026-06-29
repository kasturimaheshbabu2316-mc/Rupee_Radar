import { motion } from 'framer-motion';
import { ArrowLeft, ArrowDownRight, ArrowUpRight, Target, CreditCard, RefreshCw } from 'lucide-react';
import TransactionTable from './TransactionTable';
import Insights from './Insights';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Cell } from 'recharts';

interface DashboardProps {
  data: any;
  onReset: () => void;
}

const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981'];

export default function Dashboard({ data, onReset }: DashboardProps) {
  const { metrics, insights, data: transactions, total_transactions } = data;

  // Prepare chart data
  const chartData = metrics?.top_categories 
    ? Object.entries(metrics.top_categories)
        .map(([name, value]) => ({ name, value: value as number }))
        .sort((a, b) => b.value - a.value)
    : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num || 0);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Overview</h2>
          <p className="text-slate-400 mt-1">Based on {total_transactions} analyzed transactions</p>
        </div>
        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm font-medium text-slate-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Upload New Statement
        </button>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Total Income</p>
              <h3 className="text-2xl font-bold text-emerald-400">{formatCurrency(metrics?.total_income)}</h3>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <ArrowDownRight className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Total Spend</p>
              <h3 className="text-2xl font-bold text-rose-400">{formatCurrency(metrics?.total_spend)}</h3>
            </div>
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <ArrowUpRight className="w-5 h-5 text-rose-400" />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Net Savings</p>
              <h3 className="text-2xl font-bold text-indigo-400">{formatCurrency(metrics?.savings)}</h3>
            </div>
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Target className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Recurring Spend</p>
              <h3 className="text-2xl font-bold text-amber-400">{formatCurrency(metrics?.total_recurring_spend)}</h3>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <RefreshCw className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Charts & Insights */}
        <div className="lg:col-span-1 space-y-8">
          {/* Insights Panel */}
          <motion.div variants={itemVariants}>
            <Insights insights={insights} />
          </motion.div>

          {/* Spend Category Chart */}
          <motion.div variants={itemVariants} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              Top Spending Categories
            </h3>
            {chartData.length > 0 ? (
              <div className="h-72 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} opacity={0.5} />
                    <XAxis 
                      type="number" 
                      tickFormatter={(value) => value >= 1000 ? `₹${(value/1000).toFixed(0)}k` : `₹${value}`}
                      stroke="#94a3b8"
                      fontSize={12}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="#94a3b8"
                      fontSize={12}
                      width={80}
                      tick={{ fill: '#cbd5e1' }}
                    />
                    <RechartsTooltip 
                      formatter={(value: any) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }}
                      cursor={{ fill: '#334155', opacity: 0.4 }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                Not enough data to display chart.
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column: Transaction Table */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <TransactionTable transactions={transactions} />
        </motion.div>
      </div>

    </motion.div>
  );
}
