import React, { useState } from 'react';
import EEGExplainerSteps from '../components/EEGExplainerSteps';
import ECGExplainerSteps from '../components/ECGExplainerSteps';

export default function InsightsTab() {
  const [activeSignal, setActiveSignal] = useState('eeg'); // 'eeg' | 'ecg'

  const insights = [
    {
      icon: '✅',
      title: 'ECG Alone Beats EEG in Binary Classification',
      desc: 'Heart rate variability metrics alone classify yoga experts better than brainwave data (93.04% vs 90.60%). HRV produces clean, robust autonomic signal dynamics, whereas EEG carries eye-blink, scalp-impedance, and micro-movement artifacts.',
      border: 'border-emerald-900/40 bg-emerald-950/10',
    },
    {
      icon: '⚠️',
      title: "Feature Stacking Doesn't Always Enhance Precision",
      desc: 'Combining 12 EEG spectral features with 7 ECG HRV metrics expands input dimensionality without proportional gain. In finite cohorts, noisy spectral parameters slightly degrade the clear hyperplane separation achieved by ECG alone.',
      border: 'border-amber-900/40 bg-amber-950/10',
    },
    {
      icon: '💡',
      title: 'The Enduring Autonomic Signature',
      desc: 'Long-term yogic training fundamentally reprograms parasympathetic (vagal) tone. Expert yogis maintain higher baseline RMSSD and lower heart rates, providing an objective physiological biomarker for meditative practice.',
      border: 'border-blue-900/40 bg-blue-950/10',
    },
  ];

  return (
    <div className="py-6 space-y-16 max-w-4xl mx-auto">
      {/* ─── PART 1: SIGNAL EXPLAINER SECTION ──────────────────────── */}
      <div className="space-y-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold font-mono">
            Bio-Signal Architecture
          </span>
          <h2 className="text-3xl font-bold text-white tracking-tight mt-1">
            Understanding the Raw Bio-Signals
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Explore step-by-step how electrical potentials are captured, digitized, and transformed into machine learning matrices.
          </p>
        </div>

        {/* Signal Mode Toggle */}
        <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/80 w-fit">
          <button
            onClick={() => setActiveSignal('eeg')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSignal === 'eeg'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🧠</span>
            <span>EEG (64 Channels, Brain Waves)</span>
          </button>
          <button
            onClick={() => setActiveSignal('ecg')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSignal === 'ecg'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>❤️</span>
            <span>ECG (1 Bipolar Lead, Heart Rhythm)</span>
          </button>
        </div>

        {/* Step-by-Step Container */}
        <div>
          {activeSignal === 'eeg' ? <EEGExplainerSteps /> : <ECGExplainerSteps />}
        </div>
      </div>

      {/* ─── PART 2: RESEARCH TAKEAWAY CARDS ──────────────────────── */}
      <div className="space-y-8 pt-8 border-t border-slate-800/80">
        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold font-mono">
            Scientific Conclusions
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Core Academic Findings
          </h2>
        </div>

        <div className="space-y-6">
          {insights.map((card, idx) => (
            <div
              key={idx}
              className={`p-7 rounded-2xl border ${card.border} space-y-2 transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{card.icon}</span>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {card.title}
                </h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed pl-9">
                {card.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-4 text-center">
          <a
            href="/api/module1/download"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 font-medium underline underline-offset-4"
          >
            Download Full Module 1 Excel Report (.xlsx)
          </a>
        </div>
      </div>
    </div>
  );
}
