import { useState } from 'react';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import FileUpload from './components/FileUpload.tsx';
import Dashboard from './components/Dashboard.tsx';

function App() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-indigo-500/30">
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              RupeeRadar
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {!data ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-8 mt-12"
          >
            <h2 className="text-5xl font-extrabold tracking-tight leading-tight">
              Understand where your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">money</span> goes.
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              Upload your bank statement and let our AI categorize your expenses, detect recurring payments, and generate personalized financial insights.
            </p>
            <FileUpload onDataReceived={setData} isLoading={loading} setIsLoading={setLoading} />
          </motion.div>
        ) : (
          <Dashboard data={data} onReset={() => setData(null)} />
        )}
      </main>
    </div>
  );
}

export default App;
