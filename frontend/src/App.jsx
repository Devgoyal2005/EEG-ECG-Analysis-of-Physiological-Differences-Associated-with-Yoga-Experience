import React, { useState } from 'react';
import PipelineProgressBar from './components/PipelineProgressBar';
import ModulePanel from './components/ModulePanel';
import OverviewTab from './tabs/OverviewTab';
import SignalsTab from './tabs/SignalsTab';
import ModelsTab from './tabs/ModelsTab';
import InsightsTab from './tabs/InsightsTab';
import OverviewTab_M2 from './tabs/module2/OverviewTab_M2';
import ResultsTab_M2 from './tabs/module2/ResultsTab_M2';
import { Download } from 'lucide-react';

export default function App() {
  // activeNav can be: 'signals' | 'insights' | 'module1' | 'module2'
  const [activeNav, setActiveNav] = useState('module1');
  // For modules with sub-tabs, activeTab can be 'overview' or 'models'
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePipelineCompleted = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleSelectNav = (navId) => {
    setActiveNav(navId);
    if (navId === 'module1' || navId === 'module2') {
      setActiveTab('overview');
    }
  };

  const isModule = activeNav === 'module1' || activeNav === 'module2';

  const moduleSubTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'models', label: activeNav === 'module1' ? 'ML Classifiers' : 'Standout Signals' },
  ];

  const excelDownloadUrl =
    activeNav === 'module2' ? '/api/module2/download' : '/api/module1/download';

  return (
    <div className="min-h-screen bg-darkbg text-slate-100 font-sans flex flex-col">
      {/* ─── SLEEK TOP NAVBAR ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-bordercol px-6 md:px-10 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧘</span>
            <div className="hidden sm:block">
              <h1 className="font-bold text-sm text-white tracking-wide">
                Yoga Bio-Signal Analysis
              </h1>
              <p className="text-[11px] text-slate-400 font-mono">
                {activeNav === 'signals' && 'Global: Interactive Waveform Viewer'}
                {activeNav === 'insights' && 'Global: Bio-Signal Explainer & Data Scale'}
                {activeNav === 'module1' && 'Module 1: Modality Comparison (EEG vs ECG)'}
                {activeNav === 'module2' && 'Module 2: Expert vs Normal Differentiation'}
              </p>
            </div>
          </div>

          {/* Module-specific subtabs only appear when in a Module view */}
          {isModule && (
            <nav className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
              {moduleSubTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          )}

          {/* Excel Download button */}
          <a
            href={excelDownloadUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700/80 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Excel</span>
          </a>
        </div>
      </header>

      {/* ─── MAIN APP CONTAINER (LEFT PANEL + MAIN CONTENT) ─────────────── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Left Side Navigation Panel */}
        <ModulePanel
          activeNav={activeNav}
          onSelectNav={handleSelectNav}
        />

        {/* Right Active View Content */}
        <main className="flex-1 min-w-0">
          <PipelineProgressBar onPipelineCompleted={handlePipelineCompleted} />

          <div key={`${activeNav}-${activeTab}-${refreshKey}`} className="mt-4">
            {/* GLOBAL VIEWS */}
            {activeNav === 'signals' && <SignalsTab />}
            {activeNav === 'insights' && <InsightsTab />}

            {/* MODULE 1 VIEWS */}
            {activeNav === 'module1' && (
              <>
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'models' && <ModelsTab />}
              </>
            )}

            {/* MODULE 2 VIEWS */}
            {activeNav === 'module2' && (
              <>
                {activeTab === 'overview' && <OverviewTab_M2 />}
                {activeTab === 'models' && <ResultsTab_M2 />}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
