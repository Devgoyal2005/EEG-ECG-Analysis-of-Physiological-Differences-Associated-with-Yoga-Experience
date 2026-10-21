import React, { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import { 
  Activity, 
  Layers, 
  GitCompare, 
  Cpu, 
  Users, 
  FileSpreadsheet, 
  ArrowRight,
  Brain,
  Heart
} from 'lucide-react';

export default function DashboardOverview({ setActiveTab }) {
  const [datasetInfo, setDatasetInfo] = useState(null);

  useEffect(() => {
    fetch('/api/dataset/info')
      .then(res => res.json())
      .then(data => setDatasetInfo(data))
      .catch(() => {});
  }, []);

  const modules = [
    {
      id: 'module1',
      title: 'Module 1: Modality Comparison',
      desc: 'Compares EEG-only, ECG-only, Combined, and Brain-Heart Interaction representations to determine which best distinguishes yoga experts.',
      obj: 'Obj 3 & 4',
      color: 'blue',
      icon: Layers
    },
    {
      id: 'module2',
      title: 'Module 2: Expert vs Control Differences',
      desc: 'Statistical tests (t-test, Mann-Whitney U, Cohen’s d effect size) on EEG band powers and ECG/HRV metrics across practitioner groups.',
      obj: 'Obj 1 & 2',
      color: 'green',
      icon: GitCompare
    },
    {
      id: 'module3',
      title: 'Module 3: 4 Physiological States',
      desc: 'Examines physiological dynamics across Resting, Internal Concentration, External Concentration, and Mind-Wandering states (ANOVA).',
      obj: 'Obj 8',
      color: 'purple',
      icon: Activity
    },
    {
      id: 'module4',
      title: 'Module 4: ML Benchmark & K-Means',
      desc: 'Subject-independent benchmark of LR, SVM, Random Forest, XGBoost and unsupervised K-Means clustering with silhouette scoring.',
      obj: 'Obj 5, 6, 7',
      color: 'amber',
      icon: Cpu
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-slate-900/40 border border-slate-800">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium mb-3">
            <span>🔬 Major Project MP2026CSE86</span>
            <span>•</span>
            <span>Graphic Era University</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            EEG-ECG Analysis of Physiological Differences Associated with Yoga Experience
          </h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            A comprehensive multimodal framework analyzing synchronized electroencephalography (EEG) and cardiac autonomic (ECG/HRV) signals across 4 distinct cognitive states.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Subject Cohort" 
          value={datasetInfo ? `${datasetInfo.total_recordings_found} Subjects` : "33 Subjects"} 
          subtitle="Yoga Practitioners vs Controls" 
          icon={Users} 
          color="blue" 
        />
        <MetricCard 
          title="EEG Modality" 
          value="64 Channels" 
          subtitle="BrainVision 10-10 System" 
          icon={Brain} 
          color="purple" 
        />
        <MetricCard 
          title="Cardiac Modality" 
          value="ECG / HRV" 
          subtitle="SDNN, RMSSD, LF/HF Ratio" 
          icon={Heart} 
          color="green" 
        />
        <MetricCard 
          title="Cognitive States" 
          value="4 States" 
          subtitle="Rest, Int/Ext Conc, Mind-Wander" 
          icon={Activity} 
          color="amber" 
        />
      </div>

      {/* Module Navigation Grid */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">Study Research Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div 
                key={m.id}
                onClick={() => setActiveTab(m.id)}
                className="group p-5 rounded-xl bg-cardbg border border-bordercol hover:border-slate-700 hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-lg bg-slate-800 text-blue-400 group-hover:bg-primaryblue group-hover:text-white transition">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {m.obj}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-400 group-hover:text-slate-200">
                  <span>Explore Module Results</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
