import { useState, useRef } from 'react';
import { Upload, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FileUploadProps {
  onDataReceived: (data: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function FileUpload({ onDataReceived, isLoading, setIsLoading }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.pdf')) {
      setError("Please upload a valid CSV or PDF bank statement.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // In production, point to real backend URL
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.detail || result.error || "Failed to process statement");
      }

      onDataReceived(result);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div 
        className={cn(
          "relative group rounded-2xl border-2 border-dashed transition-all duration-300 ease-out overflow-hidden",
          dragActive ? "border-indigo-500 bg-indigo-500/10" : "border-slate-700 hover:border-slate-500 bg-slate-800/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input 
          ref={inputRef}
          type="file" 
          accept=".csv,.pdf"
          className="hidden" 
          onChange={handleChange}
          disabled={isLoading}
          aria-label="Upload bank statement file"
        />
        
        <div className="p-10 flex flex-col items-center justify-center space-y-4 text-center cursor-pointer">
          <div className="p-4 rounded-full bg-slate-800 shadow-inner group-hover:scale-110 transition-transform duration-300">
            {isLoading ? (
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-slate-200">
              {isLoading ? "Analyzing your statement..." : "Click to upload or drag and drop"}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Supports CSV and PDF bank statements
            </p>
          </div>
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-indigo-500/0 via-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-500" />
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-left"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
