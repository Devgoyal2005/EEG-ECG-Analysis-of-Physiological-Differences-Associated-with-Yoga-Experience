import React from 'react';

const COLORS = {
  expert: '#3B82F6',   // blue
  control: '#f59e0b',  // amber
  expertFill: 'rgba(59,130,246,0.15)',
  controlFill: 'rgba(245,158,11,0.12)',
  expertBoundary: 'rgba(59,130,246,0.08)',
  controlBoundary: 'rgba(245,158,11,0.08)',
};

export default function ConfusionMatrix({ tp = 0, tn = 0, fp = 0, fn = 0, precision = 0, recall = 0, specificity = 0, modelName = '' }) {
  const total = tp + tn + fp + fn;

  const cells = [
    { label: 'TN', value: tn, desc: 'True Negative\n(Correctly identified as Control)', bg: 'bg-emerald-950/60 border-emerald-800/50', text: 'text-emerald-300' },
    { label: 'FP', value: fp, desc: 'False Positive\n(Control predicted as Expert)', bg: 'bg-red-950/50 border-red-800/40', text: 'text-red-400' },
    { label: 'FN', value: fn, desc: 'False Negative\n(Expert predicted as Control)', bg: 'bg-red-950/50 border-red-800/40', text: 'text-red-400' },
    { label: 'TP', value: tp, desc: 'True Positive\n(Correctly identified as Expert)', bg: 'bg-emerald-950/60 border-emerald-800/50', text: 'text-emerald-300' },
  ];

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-slate-400 font-mono text-center">
        Confusion Matrix — {modelName}
      </p>

      {/* Axis labels */}
      <div className="flex items-center gap-2">
        <div className="w-16 shrink-0" />
        <div className="flex-1 grid grid-cols-2 text-center">
          <span className="text-[10px] text-slate-400 font-medium">Predicted: Control</span>
          <span className="text-[10px] text-slate-400 font-medium">Predicted: Expert</span>
        </div>
      </div>

      <div className="flex items-stretch gap-2">
        {/* Row label */}
        <div className="w-16 shrink-0 flex flex-col items-center justify-center">
          <span className="text-[10px] text-slate-500 [writing-mode:vertical-lr] rotate-180 tracking-wide">
            Actual
          </span>
        </div>

        {/* 2×2 Grid */}
        <div className="flex-1 grid grid-cols-2 gap-1.5">
          {cells.map((cell, i) => (
            <div
              key={i}
              className={`border rounded-lg p-3 flex flex-col items-center justify-center gap-1 ${cell.bg}`}
              title={cell.desc}
            >
              <span className={`text-xl font-bold ${cell.text} font-mono`}>
                {cell.value.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{cell.label}</span>
              <span className="text-[9px] text-slate-500 text-center leading-tight">
                {(cell.value / (total || 1) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Row label for actual classes */}
      <div className="flex gap-2 pl-[4.5rem]">
        <span className="text-[9px] text-slate-500 w-1/2 text-center">← Actual: Control</span>
        <span className="text-[9px] text-slate-500 w-1/2 text-center">Actual: Expert →</span>
      </div>

      {/* Metric pills */}
      <div className="flex gap-2 flex-wrap justify-center pt-1">
        {[
          { label: 'Precision', value: precision, color: 'text-blue-300 bg-blue-950/60 border-blue-800/40' },
          { label: 'Recall',    value: recall,    color: 'text-emerald-300 bg-emerald-950/60 border-emerald-800/40' },
          { label: 'Specificity', value: specificity, color: 'text-amber-300 bg-amber-950/50 border-amber-800/40' },
        ].map(m => (
          <div key={m.label} className={`border rounded-full px-3 py-0.5 text-[10px] font-mono font-semibold ${m.color}`}>
            {m.label}: {m.value.toFixed(1)}%
          </div>
        ))}
      </div>
    </div>
  );
}
