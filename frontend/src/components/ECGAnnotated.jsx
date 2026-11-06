import React from 'react';

export default function ECGAnnotated({ size = 320 }) {
  return (
    <div className="w-full flex flex-col items-center p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
      <svg viewBox="0 0 500 220" className="w-full max-w-lg h-auto">
        <defs>
          <linearGradient id="ecgGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1="20" y1="130" x2="480" y2="130" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="20" y1="50" x2="480" y2="50" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />

        {/* Synthetic ECG Cycle Waveform */}
        {/* Baseline -> P wave -> PR segment -> Q -> R peak -> S -> ST segment -> T wave -> Baseline */}
        <path
          d="
            M 20 130 
            L 70 130 
            Q 90 90, 110 130 
            L 145 130 
            L 160 148 
            L 180 30 
            L 200 175 
            L 215 130 
            L 260 130 
            Q 295 70, 330 130 
            L 400 130 
            L 415 148 
            L 435 30 
            L 455 175 
            L 470 130
          "
          fill="none"
          stroke="url(#ecgGlow)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Annotations: P Wave */}
        <circle cx="90" cy="110" r="4" fill="#38bdf8" />
        <text x="90" y="85" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="bold">P Wave</text>
        <text x="90" y="98" textAnchor="middle" fill="#94a3b8" fontSize="9">Atrial Depol.</text>

        {/* Annotations: QRS Complex */}
        <circle cx="180" cy="30" r="5" fill="#10b981" />
        <text x="180" y="16" textAnchor="middle" fill="#10b981" fontSize="13" fontWeight="bold">R Peak</text>
        <rect x="150" y="180" width="60" height="20" rx="4" fill="#1e293b" />
        <text x="180" y="194" textAnchor="middle" fill="#a7f3d0" fontSize="10" fontWeight="bold">QRS Complex</text>

        {/* Annotations: T Wave */}
        <circle cx="295" cy="100" r="4" fill="#f59e0b" />
        <text x="295" y="75" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold">T Wave</text>
        <text x="295" y="88" textAnchor="middle" fill="#94a3b8" fontSize="9">Ventricle Reset</text>

        {/* R-R Interval Bracket */}
        <path d="M 180 25 L 180 10 L 435 10 L 435 25" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
        <text x="307" y="6" textAnchor="middle" fill="#f1f5f9" fontSize="10" fontFamily="monospace" fontWeight="bold">
          R-R Interval (~820 ms)
        </text>
      </svg>
      <div className="text-[11px] text-slate-400 font-mono mt-2">
        Heart Rate Variability (HRV) is calculated strictly from time delta variances between consecutive R peaks.
      </div>
    </div>
  );
}
