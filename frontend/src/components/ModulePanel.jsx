import React from 'react';
import { Layers, Activity, Radio, Lightbulb, Compass, Award } from 'lucide-react';

export default function ModulePanel({ activeNav, onSelectNav }) {
  const commonNavs = [
    {
      id: 'signals',
      title: 'Raw Bio-Signals',
      subtitle: 'Waveform Viewer (EEG & ECG)',
      badge: 'Interactive',
      badgeColor: 'text-sky-400 bg-sky-950/80 border-sky-800/60',
      icon: Radio,
    },
    {
      id: 'insights',
      title: 'Bio-Signal Guide',
      subtitle: '64 Channels & Data Volume',
      badge: 'Explainer',
      badgeColor: 'text-purple-400 bg-purple-950/80 border-purple-800/60',
      icon: Lightbulb,
    },
  ];

  const moduleNavs = [
    {
      id: 'module1',
      title: 'Module 1',
      subtitle: 'Modality Comparison',
      badge: 'EEG vs ECG',
      badgeColor: 'text-blue-400 bg-blue-950/80 border-blue-800/60',
      icon: Layers,
    },
    {
      id: 'module2',
      title: 'Module 2',
      subtitle: 'Expert vs Normal People',
      badge: 'Standout Signals',
      badgeColor: 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60',
      icon: Activity,
    },
    {
      id: 'module3',
      title: 'Module 3',
      subtitle: '4 Physiological States',
      badge: 'Cognitive Shift',
      badgeColor: 'text-amber-400 bg-amber-950/80 border-amber-800/60',
      icon: Compass,
    },
    {
      id: 'module4',
      title: 'Module 4',
      subtitle: 'ML Benchmark & Clustering',
      badge: 'Capstone',
      badgeColor: 'text-purple-400 bg-purple-950/80 border-purple-800/60',
      icon: Award,
    },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0 space-y-6">
      {/* COMMON BIO-SIGNAL TOOLS */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2">
          Global Explorers
        </div>
        <nav className="space-y-2">
          {commonNavs.map(item => {
            const isActive = activeNav === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSelectNav(item.id)}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                  isActive
                    ? 'bg-slate-800/90 border-sky-500/80 shadow-lg ring-1 ring-sky-500/40 text-white'
                    : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`p-2 rounded-xl mt-0.5 ${
                    isActive ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs truncate">{item.title}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* CORE RESEARCH MODULES */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2">
          Research Modules
        </div>
        <nav className="space-y-2">
          {moduleNavs.map(mod => {
            const isActive = activeNav === mod.id;
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => onSelectNav(mod.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isActive
                    ? 'bg-slate-800/90 border-blue-500/80 shadow-lg ring-1 ring-blue-500/40 text-white'
                    : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`p-2 rounded-xl mt-0.5 ${
                    isActive ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-sm truncate">{mod.title}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${mod.badgeColor}`}>
                      {mod.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5 font-medium">{mod.subtitle}</p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* SUPERVISION BADGE */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-1.5 text-xs font-mono text-slate-400 hidden md:block">
        <div className="text-[10px] uppercase text-slate-500 tracking-wider">Graphic Era University</div>
        <div className="text-slate-300 font-semibold">Project MP2026CSE86</div>
        <div>Supervised by Dr. Parul Madan</div>
      </div>
    </aside>
  );
}
