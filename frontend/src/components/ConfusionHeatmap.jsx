import React from 'react';

export default function ConfusionHeatmap({ cm, modelName = 'Model' }) {
  if (!cm) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-xs font-mono">
        Loading confusion matrix...
      </div>
    );
  }

  const { tp = 0, tn = 0, fp = 0, fn = 0, precision = 0, recall = 0, specificity = 0 } = cm;
  const total = tp + tn + fp + fn || 1;

  const getPct = val => ((val / total) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>CONFUSION MATRIX (TEST COHORT)</span>
        <span className="text-slate-300 font-semibold">{modelName}</span>
      </div>

      {/* 2x2 Matrix */}
      <div className="grid grid-cols-2 gap-2 text-center font-mono">
        {/* True Negative */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">True Negative</span>
          <span className="text-xl font-bold text-white mt-1">{tn.toLocaleString()}</span>
          <span className="text-[11px] text-slate-400 mt-0.5">{getPct(tn)}%</span>
        </div>

        {/* False Positive */}
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 flex flex-col justify-center">
          <span className="text-[10px] text-rose-400 uppercase tracking-wider">False Positive</span>
          <span className="text-xl font-bold text-rose-300 mt-1">{fp.toLocaleString()}</span>
          <span className="text-[11px] text-rose-400/80 mt-0.5">{getPct(fp)}%</span>
        </div>

        {/* False Negative */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 flex flex-col justify-center">
          <span className="text-[10px] text-amber-400 uppercase tracking-wider">False Negative</span>
          <span className="text-xl font-bold text-amber-300 mt-1">{fn.toLocaleString()}</span>
          <span className="text-[11px] text-amber-400/80 mt-0.5">{getPct(fn)}%</span>
        </div>

        {/* True Positive */}
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex flex-col justify-center">
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider">True Positive</span>
          <span className="text-xl font-bold text-emerald-300 mt-1">{tp.toLocaleString()}</span>
          <span className="text-[11px] text-emerald-400 mt-0.5">{getPct(tp)}%</span>
        </div>
      </div>

      {/* Pill Metrics */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-500 block">Precision</span>
          <span className="text-white font-bold">{precision}%</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-500 block">Recall</span>
          <span className="text-emerald-400 font-bold">{recall}%</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-500 block">Specificity</span>
          <span className="text-blue-400 font-bold">{specificity}%</span>
        </div>
      </div>
    </div>
  );
}
