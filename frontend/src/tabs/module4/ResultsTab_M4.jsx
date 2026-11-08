import React, { useState, useEffect } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Trophy, Brain, Heart, Zap, AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react';

/* ─── CONSTANTS ───────────────────────────────────────────────────────── */

const CLUSTER_COLORS = [
  '#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#a855f7', '#64748b'
];

const MODALITIES = [
  { id: 'ecg',         label: 'ECG Only',                   icon: Heart,  accent: 'text-sky-400',     border: 'border-sky-800/60',     bg: 'bg-sky-950/20'     },
  { id: 'eeg',         label: 'EEG Only',                   icon: Brain,  accent: 'text-emerald-400', border: 'border-emerald-800/60', bg: 'bg-emerald-950/20' },
  { id: 'combined',    label: 'Combined EEG + ECG',          icon: Zap,    accent: 'text-amber-400',   border: 'border-amber-800/60',   bg: 'bg-amber-950/20'   },
  { id: 'interaction', label: 'EEG + ECG + Interaction',     icon: Zap,    accent: 'text-purple-400',  border: 'border-purple-800/60',  bg: 'bg-purple-950/20'  },
];

/* ─── STATIC ML DATA (all 5 models × 4 modalities) ──────────────────── */

const ML_DATA = {
  ecg: {
    label: 'ECG Only — Heart Data',
    featuresUsed: 7,
    winner: 'SVM Linear',
    winnerAccuracy: 93.04,
    winnerF1: 96.4,
    winnerColor: 'text-sky-400',
    whyWon: 'Heart rate variability features (RMSSD, SDNN, LF/HF ratio, pNN50) form two naturally well-separated clouds in feature space. SVM Linear finds the maximum-margin hyperplane — the flat decision surface that maximises the gap between the two clouds. Because the data is already well-separated in just 7 dimensions, a simple straight separator is the most powerful choice possible. More complexity would only introduce unnecessary curvature that chases statistical noise.',
    alert: null,
    models: [
      { name: 'SVM Linear',          accuracy: 93.04, f1: 96.4, rank: 1, why: 'Maximum-margin hyperplane in well-separated 7D cardiac space. Exactly the right tool for clean, linearly separable data.' },
      { name: 'SVM RBF',             accuracy: 93.04, f1: 96.4, rank: 2, why: 'Tied on accuracy. Curved kernel adds almost nothing here — the data is linear enough that the kernel trick is redundant.' },
      { name: 'Logistic Regression', accuracy: 92.98, f1: 95.8, rank: 3, why: 'Also linear, very close. LR minimises log-loss (probabilistic) while SVM maximises geometric margin. With clean separation, margin wins by a whisker.' },
      { name: 'XGBoost',             accuracy: 92.94, f1: 95.6, rank: 4, why: 'Builds hundreds of corrective decision trees. Powerful for complex nonlinear patterns — but with 33 participants and clean linear separation, this complexity slightly overfits.' },
      { name: 'Random Forest',       accuracy: 92.92, f1: 95.4, rank: 5, why: 'Ensemble of independent trees, majority vote. Ensemble methods shine on messy data. Here they add variance without meaningful signal gain.' },
    ],
  },
  eeg: {
    label: 'EEG Only — Brain Data',
    featuresUsed: 12,
    winner: 'SVM Linear',
    winnerAccuracy: 90.60,
    winnerF1: 95.07,
    winnerColor: 'text-emerald-400',
    whyWon: 'EEG features (Delta / Theta / Alpha / Beta power, Theta-Beta ratio, coherence) separate the two groups, but less cleanly than ECG. Brain signals carry natural noise: eye blinks, electrode impedance drift, micro-muscular artifacts. SVM Linear is specifically designed to be robust to outliers — it only cares about the support vectors (the points nearest the boundary), ignoring the noisy interior. The 2.5% accuracy drop vs ECG-only is exactly the cost of that added noise.',
    alert: 'ECG outperforms EEG alone because heart signals are periodic, smooth, and physically constrained. Brain signals are broadband, spatially distributed, and highly state-dependent. The SNR (signal-to-noise ratio) of cardiac features is simply higher.',
    alertType: 'info',
    models: [
      { name: 'SVM Linear',          accuracy: 90.60, f1: 95.07, rank: 1, why: 'Margin-maximising hyperplane, robust to outliers — only the support vectors define the boundary; all other noise is ignored.' },
      { name: 'Logistic Regression', accuracy: 90.23, f1: 94.70, rank: 2, why: 'Very close. LR minimises all training errors equally, so it is pulled slightly off-centre by noisy EEG outliers. SVM\'s margin formulation resists this better.' },
      { name: 'SVM RBF',             accuracy: 89.45, f1: 94.10, rank: 3, why: 'The curved kernel tried to fit the noise, not just the signal — classic overfitting to measurement artifacts in a noisy EEG space.' },
      { name: 'Random Forest',       accuracy: 88.38, f1: 93.50, rank: 4, why: 'Tree-based splits assume feature independence. EEG features are correlated (Theta and Alpha often move together), which confuses tree splits.' },
      { name: 'XGBoost',             accuracy: 87.89, f1: 93.20, rank: 5, why: 'Same correlation problem as RF, compounded by boosting\'s tendency to amplify errors in noisy regimes through its sequential correction chain.' },
    ],
  },
  combined: {
    label: 'Combined EEG + ECG — Heart + Brain',
    featuresUsed: 19,
    winner: 'SVM Linear',
    winnerAccuracy: 89.53,
    winnerF1: 94.48,
    winnerColor: 'text-amber-400',
    whyWon: 'SVM Linear is the most sample-efficient algorithm — it only needs to find the best separating hyperplane, not model the full distribution. With only 33 people spread across 19 dimensions, this matters enormously. It still wins, but every model suffers the dimensionality penalty.',
    alert: 'Counter-intuitive result: accuracy dropped 3.5% despite adding more data. With 33 people across 19 dimensions, the data becomes sparser — the Curse of Dimensionality. Imagine drawing a line through 33 people in a 7-room building (ECG). Then 12 more rooms are added where the same people are scattered (noisy EEG). The tight clusters in 7D dissolve when viewed across 19D. More features with a small sample hurts, not helps.',
    alertType: 'warning',
    models: [
      { name: 'SVM Linear',          accuracy: 89.53, f1: 94.48, rank: 1, why: 'Most sample-efficient — only needs the best separating hyperplane. Best suited for high-dimensional, small-sample problems.' },
      { name: 'Logistic Regression', accuracy: 88.93, f1: 94.10, rank: 2, why: 'L2 regularisation shrinks irrelevant dimensions but still behind SVM\'s geometric margin advantage in this 19D space.' },
      { name: 'Random Forest',       accuracy: 88.64, f1: 93.80, rank: 3, why: 'Random feature subsets in tree splits frequently pick uninformative EEG features, adding noise to each tree\'s decisions.' },
      { name: 'XGBoost',             accuracy: 87.89, f1: 93.40, rank: 4, why: 'Each boosting correction step is itself uncertain in high-dimensional, small-sample setting — errors accumulate across the chain.' },
      { name: 'SVM RBF',             accuracy: 84.55, f1: 91.80, rank: 5, why: 'Curved kernel in 19D creates an exponentially complex decision surface. With 33 samples it cannot fit reliably — the worst drop of any model here.' },
    ],
  },
  interaction: {
    label: 'EEG + ECG + Interaction Features',
    featuresUsed: 25,
    winner: 'Logistic Regression',
    winnerAccuracy: 87.63,
    winnerF1: 93.41,
    winnerColor: 'text-purple-400',
    whyWon: 'Interaction features are engineered products of EEG × ECG (e.g., Alpha power × RMSSD, Theta × HF power). These are inherently nonlinear combinations. Logistic Regression with L2 regularisation automatically shrinks the coefficients of uninformative interaction terms toward zero — essentially performing soft feature selection. It handles bloated feature spaces with many redundant dimensions better than SVM Linear, which treats all dimensions equally with no built-in shrinkage.',
    alert: 'Interesting flip: SVM Linear drops to 4th place here, the only modality where it does not win. This reveals something real — when features are engineered and potentially redundant, regularised linear models outperform pure margin-based ones. The regulariser does work that SVM simply does not have.',
    alertType: 'insight',
    models: [
      { name: 'Logistic Regression', accuracy: 87.63, f1: 93.41, rank: 1, why: 'L2 regularisation shrinks noisy interaction term coefficients toward zero — built-in soft feature selection across redundant engineered dimensions.' },
      { name: 'Random Forest',       accuracy: 88.28, f1: 93.10, rank: 2, why: 'Higher raw accuracy but lower F1. RF predicts majority class more confidently, inflating accuracy. F1 is the more meaningful metric here.' },
      { name: 'XGBoost',             accuracy: 87.79, f1: 93.00, rank: 3, why: 'Boosting helps capture nonlinear interaction patterns, but the small sample limits how reliably it learns from so many engineered combinations.' },
      { name: 'SVM Linear',          accuracy: 86.52, f1: 92.40, rank: 4, why: 'No built-in regularisation — treats all interaction dimensions equally. Hurts when many are redundant or noisy.' },
      { name: 'SVM RBF',             accuracy: 85.46, f1: 92.00, rank: 5, why: 'Curved kernel on already-nonlinear engineered features creates severe overfitting. Curvature stacked on top of curvature.' },
    ],
  },
};

/* ─── HELPER: single model row ───────────────────────────────────────── */
function ModelRow({ model, maxAcc, accentClass }) {
  const barW = ((model.accuracy / maxAcc) * 100).toFixed(1);
  const isWinner = model.rank === 1;
  return (
    <div className={`p-4 rounded-xl border transition-all space-y-2 ${
      isWinner
        ? 'bg-slate-800/80 border-slate-600/60'
        : 'bg-slate-900/40 border-slate-800/50 hover:border-slate-700'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          {isWinner
            ? <Trophy className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            : <span className="text-xs font-mono text-slate-500 w-3.5 text-center">#{model.rank}</span>
          }
          <span className={`text-sm font-bold ${isWinner ? 'text-white' : 'text-slate-300'}`}>
            {model.name}
          </span>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-sm font-extrabold font-mono ${isWinner ? accentClass : 'text-slate-300'}`}>
            {model.accuracy}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono">F1 {model.f1}%</div>
        </div>
      </div>

      {/* Accuracy bar */}
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${
            isWinner
              ? 'bg-gradient-to-r from-emerald-500 to-sky-400'
              : 'bg-slate-600'
          }`}
          style={{ width: `${barW}%` }}
        />
      </div>

      {/* Why explanation */}
      <p className="text-[11px] text-slate-400 leading-relaxed">
        {model.why}
      </p>
    </div>
  );
}

/* ─── HELPER: alert box ──────────────────────────────────────────────── */
function AlertBox({ text, type }) {
  if (!text) return null;
  const styles = {
    info:    { bg: 'bg-sky-950/30',    border: 'border-sky-800/40',    icon: <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5" />,    label: 'text-sky-300'    },
    warning: { bg: 'bg-amber-950/30',  border: 'border-amber-800/40',  icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />, label: 'text-amber-300'  },
    insight: { bg: 'bg-purple-950/30', border: 'border-purple-800/40', icon: <TrendingDown className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />, label: 'text-purple-300' },
  };
  const s = styles[type] || styles.info;
  return (
    <div className={`p-3.5 rounded-xl border ${s.bg} ${s.border} flex gap-2.5`}>
      {s.icon}
      <p className={`text-xs leading-relaxed ${s.label}`}>{text}</p>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────── */
export default function ResultsTab_M4() {
  const [colorMode, setColorMode]       = useState('cluster');
  const [stateFilter, setStateFilter]   = useState('all');
  const [activeModality, setModality]   = useState('ecg');
  const [points, setPoints]             = useState([]);
  const [loadingPoints, setLoadingPoints] = useState(true);

  /* Fetch PCA points */
  useEffect(() => {
    setLoadingPoints(true);
    fetch(`/api/module4/cluster-points?state=${stateFilter}`)
      .then(r => r.json())
      .then(d => { if (d.points) setPoints(d.points); })
      .catch(() => {})
      .finally(() => setLoadingPoints(false));
  }, [stateFilter]);

  const data = ML_DATA[activeModality];
  const maxAcc = Math.max(...data.models.map(m => m.accuracy));
  const activeM = MODALITIES.find(m => m.id === activeModality);

  return (
    <div className="py-6 space-y-12">

      {/* ─── INTERACTIVE 2D PCA CLUSTER SCATTER MAP ───────────── */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-purple-400 font-semibold font-mono">
              Dimension Reduction — PC1 24.6% + PC2 19.6% = 44.2% Total Variance
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
              Interactive 2D PCA Cluster Map
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Each dot = one 10-second brain + heart recording segment.&nbsp;
              <span className="text-sky-400">X (PC1)</span> = cardiac regulation + neural calm.&nbsp;
              <span className="text-purple-400">Y (PC2)</span> = cognitive engagement vs rest.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Color mode toggle */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setColorMode('cluster')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  colorMode === 'cluster'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                By Natural Cluster
              </button>
              <button
                onClick={() => setColorMode('group')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  colorMode === 'group'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                By True Cohort
              </button>
            </div>

            {/* State filter */}
            <select
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
              className="bg-slate-900/80 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 font-mono focus:outline-none cursor-pointer"
            >
              <option value="all">All Cognitive States</option>
              <option value="resting">Resting State</option>
              <option value="internal">Internal Meditation</option>
              <option value="external">External Focus</option>
              <option value="mind_wandering">Mind Wandering</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1">
          {colorMode === 'cluster' ? (
            <>
              {[
                { label: 'Cluster 0 (97.8% Expert)', color: '#38bdf8' },
                { label: 'Cluster 1 (84.2% Expert)', color: '#10b981' },
                { label: 'Cluster 2 (Mixed Resting)', color: '#f59e0b' },
                { label: 'Cluster 3 (Cognitive Load)', color: '#ec4899' },
                { label: 'Cluster 4 (Mind Wandering)', color: '#a855f7' },
                { label: 'Cluster 5 (Low Vagal)', color: '#64748b' },
              ].map(l => (
                <span key={l.label} className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: l.color }} />
                  {l.label}
                </span>
              ))}
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Yoga Experts
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Normal Controls
              </span>
            </>
          )}
        </div>

        {/* Scatter chart */}
        <div className="h-96 w-full pt-2">
          {loadingPoints ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
              Rendering PCA scatter points...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="PC1"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                  label={{ value: 'PC1 — Cardiac Regulation + Neural Calm (24.6%)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 10 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="PC2"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                  label={{ value: 'PC2 — Cognitive Engagement (19.6%)', angle: -90, position: 'insideLeft', offset: 15, fill: '#64748b', fontSize: 10 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono shadow-2xl space-y-1">
                        <div className="font-bold text-white">Subject: {d.subject}</div>
                        <div className={d.true_group === 'expert' ? 'text-blue-400 font-bold' : 'text-amber-400 font-bold'}>
                          {d.true_group === 'expert' ? 'Yoga Expert' : 'Control'}
                        </div>
                        <div className="text-purple-300">Natural Cluster #{d.cluster}</div>
                        <div className="text-slate-400">State: {d.state}</div>
                        <div className="text-slate-500 text-[10px]">PC1: {d.x} | PC2: {d.y}</div>
                      </div>
                    );
                  }}
                />
                <Scatter
                  data={points}
                  shape={({ cx, cy, payload }) => {
                    let fill = CLUSTER_COLORS[payload.cluster % 6];
                    if (colorMode === 'group') fill = payload.true_group === 'expert' ? '#3b82f6' : '#f59e0b';
                    return <circle cx={cx} cy={cy} r={4} fill={fill} fillOpacity={0.78} />;
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ─── PER-MODALITY ML ANALYSIS ─────────────────────────── */}
      <div className="space-y-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-purple-400 font-semibold font-mono">
            Model Performance Analysis
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Which Model Won Each Modality &amp; Why
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            All 5 models tested across 4 data modalities. Each entry explains the mathematical reason
            for its ranking — not just the number.
          </p>
        </div>

        {/* Modality Tab Selector */}
        <div className="flex flex-wrap gap-2">
          {MODALITIES.map(m => {
            const Icon = m.icon;
            const isActive = activeModality === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setModality(m.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  isActive
                    ? `${m.bg} ${m.border} ${m.accent}`
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Active Modality Card */}
        <div className={`p-6 rounded-2xl bg-slate-900/50 border ${activeM.border} space-y-5`}>

          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className={`text-xs uppercase tracking-wider font-semibold font-mono ${activeM.accent}`}>
                {data.label}
              </span>
              <div className="flex items-center gap-3 mt-1">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span className="text-2xl font-extrabold text-white font-mono">
                  {data.winner}
                </span>
                <span className={`text-lg font-extrabold font-mono ${data.winnerColor}`}>
                  {data.winnerAccuracy}%
                </span>
                <span className="text-xs font-mono text-slate-400">
                  F1: {data.winnerF1}%
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 font-mono">Features used</div>
              <div className={`text-2xl font-extrabold font-mono ${activeM.accent}`}>
                {data.featuresUsed}
              </div>
            </div>
          </div>

          {/* Why It Won */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-2">
            <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              Why {data.winner} Won
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">{data.whyWon}</p>
          </div>

          {/* Alert box */}
          {data.alert && <AlertBox text={data.alert} type={data.alertType} />}

          {/* All 5 models */}
          <div>
            <div className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-3">
              All 5 Models — Ranked with Mathematical Reasoning
            </div>
            <div className="space-y-3">
              {data.models.map(m => (
                <ModelRow
                  key={m.name}
                  model={m}
                  maxAcc={maxAcc}
                  accentClass={activeM.accent}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
