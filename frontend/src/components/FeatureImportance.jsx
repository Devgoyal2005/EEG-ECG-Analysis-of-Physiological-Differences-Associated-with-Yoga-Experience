import React from 'react';

const FEATURE_NAMES_MAP = {
  eeg_theta_alpha_ratio: 'Theta / Alpha Ratio (Meditation Depth)',
  eeg_theta_abs_mean: 'Theta Absolute Power (Deep Focus)',
  eeg_beta_abs_std: 'Beta Variance (Mental Fluctuations)',
  eeg_alpha_abs_std: 'Alpha Stability (Relaxed Alertness)',
  eeg_beta_abs_mean: 'Beta Power (Cognitive Workload)',
  eeg_alpha_abs_mean: 'Alpha Absolute Power (Mindfulness State)',
  eeg_alpha_rel_mean: 'Relative Alpha Ratio (Synchrony)',
  coupling_neuro_cardiac_index: 'Brain-Heart Coupling Index',
  ecg_rmssd: 'RMSSD (Parasympathetic Vagal Tone)',
  ecg_sdnn: 'SDNN (Overall Autonomic Spread)',
  ecg_hf_power: 'High Frequency HRV (Respiratory Sinus)',
  ecg_lf_hf_ratio: 'LF/HF Sympathovagal Balance',
};

export default function FeatureImportance({ features = [] }) {
  if (features.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-xs font-mono">
        No feature weights available.
      </div>
    );
  }

  const maxImp = Math.max(...features.map(f => f.importance || 0.01));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>TOP BIOMARKERS (SHAP / GINI IMPORTANCE)</span>
        <span>WEIGHT</span>
      </div>

      <div className="space-y-2.5">
        {features.slice(0, 8).map((f, idx) => {
          const readable = FEATURE_NAMES_MAP[f.feature] || f.feature;
          const pct = ((f.importance / maxImp) * 100).toFixed(0);
          const score = (f.importance * 100).toFixed(1);

          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium truncate max-w-[280px]" title={f.feature}>
                  {readable}
                </span>
                <span className="font-mono text-blue-400 font-bold">{score}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full transition-all duration-700 ease-out"
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
