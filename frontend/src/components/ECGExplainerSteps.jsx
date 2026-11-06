import React from 'react';
import ECGAnnotated from './ECGAnnotated';

export default function ECGExplainerSteps() {
  const steps = [
    {
      step: '01',
      title: 'Bipolar Wrist Leads',
      badge: 'Single Channel vs 64 Scalp Electrodes',
      desc: 'ECG in this dataset is captured using a clean bipolar dry-electrode arrangement fastened at both wrists (Lead-I configuration). Unlike the 64 complex channels of EEG, this requires only 1 electrical differential channel to record systemic cardiac electrical pulses.',
      visual: (
        <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-around text-xs font-mono">
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-2xl">⌚</span>
            <span className="text-slate-300">Left Wrist (Electrode +)</span>
          </div>
          <div className="text-emerald-400 font-bold text-lg">⚡ Differential ⚡</div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-2xl">⌚</span>
            <span className="text-slate-300">Right Wrist (Electrode -)</span>
          </div>
        </div>
      ),
    },
    {
      step: '02',
      title: 'Morphology & Cardiac Cycle',
      badge: 'P - QRS - T Sequence',
      desc: 'Each heartbeat triggers depolarisation of the atria (P-wave), rapid ventricular contraction generating high-amplitude QRS spikes (~1.5 mV), followed by ventricular repolarisation (T-wave). Because cardiac voltage is substantially stronger than microvolt EEG, signal-to-noise ratio is significantly superior.',
      visual: <ECGAnnotated />,
    },
    {
      step: '03',
      title: 'R-R Interval & Pan-Tompkins Peak Detection',
      badge: 'Extracting Microsecond Heart Dynamics',
      desc: 'The Pan-Tompkins algorithm filters baseline drift, differentiates, squares, and moving-averages the ECG waveform to accurately identify R-peaks. The millisecond duration between consecutive beats forms the R-R Tachogram (~3,375 beat intervals over 45 minutes).',
      visual: (
        <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>Detected Heartbeats (Session):</span>
            <span className="text-emerald-400 font-bold">~3,375 beats</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Mean Normal R-R:</span>
            <span className="text-emerald-400 font-bold">~820 ms</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Resting Heart Rate:</span>
            <span className="text-emerald-400 font-bold">~73 bpm</span>
          </div>
        </div>
      ),
    },
    {
      step: '04',
      title: 'HRV Metrics: Vagal Tone & Autonomic Control',
      badge: '7 Time & Frequency Biomarkers',
      desc: 'From variations in consecutive beat intervals, we compute 7 Heart Rate Variability (HRV) metrics: RMSSD, SDNN, pNN50, Mean HR, LF Power, HF Power, and LF/HF ratio. Expert yogis exhibit significantly elevated RMSSD and HF power at baseline, demonstrating enhanced parasympathetic vagal regulation.',
      visual: (
        <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Baseline RMSSD (Parasympathetic Vagal Marker)</span>
            <span className="text-emerald-400 font-mono font-bold">+41% in Expert Cohort</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs">
              <span className="w-16 text-blue-400 font-mono">Expert:</span>
              <div className="flex-1 bg-slate-800 rounded-full h-4 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '82%' }} />
              </div>
              <span className="font-mono text-white text-xs">58.4 ms</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="w-16 text-amber-400 font-mono">Control:</span>
              <div className="flex-1 bg-slate-800 rounded-full h-4 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '58%' }} />
              </div>
              <span className="font-mono text-white text-xs">41.3 ms</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {steps.map(s => (
        <div
          key={s.step}
          className="p-6 md:p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4 hover:border-slate-700/80 transition-all"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/60">
                STEP {s.step}
              </span>
              <h4 className="text-lg font-bold text-white tracking-tight">{s.title}</h4>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full">
              {s.badge}
            </span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{s.desc}</p>
          <div className="pt-2">{s.visual}</div>
        </div>
      ))}
    </div>
  );
}
