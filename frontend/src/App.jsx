import React, { useState } from 'react';
import PipelineProgressBar from './components/PipelineProgressBar';
import OverviewTab from './tabs/OverviewTab';
import SignalsTab from './tabs/SignalsTab';
import ModelsTab from './tabs/ModelsTab';
import InsightsTab from './tabs/InsightsTab';
import { Download } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'signals' | 'models' | 'insights'
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePipelineCompleted = () => {
    setRefreshKey(prev => prev + 1);
  };

  const navTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'signals', label: 'Signals' },
    { id: 'models', label: 'Models' },
    { id: 'insights', label: 'Insights' },
  ];

  return (
    <div className="min-h-screen bg-darkbg text-slate-100 font-sans flex flex-col">
      {/* ─── SLEEK TOP NAVBAR ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-bordercol px-6 md:px-12 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧘</span>
            <div className="hidden sm:block">
              <h1 className="font-bold text-sm text-white tracking-wide">
                Yoga Bio-Signal Analysis
              </h1>
            </div>
          </div>

          {/* 4 Center Tabs */}
          <nav className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            {navTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Excel Download button */}
          <a
            href="/api/module1/download"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700/80 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Excel</span>
          </a>
        </div>
      </header>

      {/* ─── MAIN CONTENT CONTAINER (NARROWER MAX-W FOR BREATHING ROOM) ─── */}
      <main className="flex-1 px-6 md:px-12 py-8 max-w-5xl mx-auto w-full">
        {/* Pipeline engine state tracker */}
        <PipelineProgressBar onPipelineCompleted={handlePipelineCompleted} />

        {/* Tab Content */}
        <div key={refreshKey} className="mt-4">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'signals' && <SignalsTab />}
          {activeTab === 'models' && <ModelsTab />}
          {activeTab === 'insights' && <InsightsTab />}
        </div>
      </main>
    </div>
  );
}
