import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  GitCompare, 
  Activity, 
  Cpu, 
  FileSpreadsheet, 
  Database,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'module1', label: 'Module 1: Modality Comparison', icon: Layers, badge: 'Obj 3-4' },
    { id: 'module2', label: 'Module 2: Expert vs Control', icon: GitCompare, badge: 'Obj 1-2' },
    { id: 'module3', label: 'Module 3: 4 Physiological States', icon: Activity, badge: 'Obj 8' },
    { id: 'module4', label: 'Module 4: ML & K-Means', icon: Cpu, badge: 'Obj 5-7' },
    { id: 'excel-viewer', label: 'Excel Sheet Viewer', icon: FileSpreadsheet, badge: 'Sheets' },
    { id: 'dataset', label: 'Dataset & Files', icon: Database, badge: 'Raw' },
    { id: 'faq', label: 'FAQ & Knowledge Base', icon: HelpCircle, badge: 'Docs' },
  ];

  return (
    <aside className="w-64 bg-cardbg border-r border-bordercol flex flex-col justify-between p-4 shrink-0">
      <div>
        {/* Header / Logo */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-bordercol">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primaryblue to-accentpurple flex items-center justify-center font-bold text-lg shadow-lg">
            🧘
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide text-white">YOGA BIO-SIGNAL</h1>
            <p className="text-[11px] text-slate-400 font-mono">MP2026CSE86</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primaryblue/20 text-blue-400 border border-primaryblue/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-primaryblue text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Dataset & Storage Meta Box */}
      <div className="pt-4 border-t border-bordercol space-y-3">
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-secondarygreen" /> Data Source
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/40">
              Hugging Face
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono truncate" title="alexeykashevnik/EEGMeditation">
            alexeykashevnik/EEGMeditation
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <FileSpreadsheet className="w-3 h-3 text-goldamber" /> Storage
            </span>
            <span className="text-slate-300 font-medium">Excel (.xlsx)</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 text-center">
          Supervised by Dr. Parul Madan<br />Graphic Era University
        </div>
      </div>
    </aside>
  );
}
