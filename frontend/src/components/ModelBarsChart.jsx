import React from 'react';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function ModelBarsChart({ models = [], selectedModel, onSelectModel }) {
  const maxAcc = 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>CLASSIFIER COMPARISON</span>
        <span>ACCURACY / F1</span>
      </div>

      <div className="space-y-3">
        {models.map((m, idx) => {
          const isSelected = selectedModel === m.model;
          const pct = Math.min(100, Math.max(0, m.accuracy || 0));

          return (
            <div
              key={m.model}
              onClick={() => onSelectModel(m.model)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-800/90 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{MEDALS[idx] || '🔹'}</span>
                  <span className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {m.model}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-white font-bold">{m.accuracy}%</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-emerald-400 font-medium">{m.f1_score || m.accuracy}% F1</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    idx === 0
                      ? 'bg-gradient-to-r from-blue-500 to-emerald-400'
                      : isSelected
                      ? 'bg-blue-500'
                      : 'bg-slate-600'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
