import React, { useState } from 'react';
import PipelineProgressBar from './components/PipelineProgressBar';
import Module1Page from './pages/Module1Page';
import { Layers, Database, Activity, Zap, BarChart2, Download } from 'lucide-react';

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePipelineCompleted = () => {
    setRefreshKey(prev => prev + 1);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-darkbg text-slate-100 font-sans flex flex-col">
      {/* ─── SLEEK TOP NAVBAR ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-bordercol px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-lg shadow-lg">
              🧘
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm tracking-wide text-white">YOGA BIO-SIGNAL</h1>
                <span className="text-[10px] text-blue-400 bg-blue-950/80 border border-blue-800/60 px-2 py-0.5 rounded-full font-mono font-semibold">
                  Module 1 Only
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                MP2026CSE86 • Supervised by Dr. Parul Madan • Graphic Era University
              </p>
            </div>
          </div>

          {/* Quick-Jump Section Anchors */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => scrollToSection('dataset')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition whitespace-nowrap"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dataset</span>
            </button>

            <button
              onClick={() => scrollToSection('waveforms')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition whitespace-nowrap"
            >
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span>Waveforms</span>
            </button>

            <button
              onClick={() => scrollToSection('ml-benchmark')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>ML &amp; Decision</span>
            </button>

            <button
              onClick={() => scrollToSection('findings')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition whitespace-nowrap"
            >
              <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Findings</span>
            </button>

            <a
              href="/api/module1/download"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium transition whitespace-nowrap shadow-sm ml-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel</span>
            </a>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT AREA (FULL WIDTH, ZERO CLUTTER) ────────────────── */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Global Pipeline Execution Engine */}
        <PipelineProgressBar onPipelineCompleted={handlePipelineCompleted} />

        {/* Dedicated Module 1 Interface */}
        <div key={refreshKey}>
          <Module1Page />
        </div>
      </main>
    </div>
  );
}
