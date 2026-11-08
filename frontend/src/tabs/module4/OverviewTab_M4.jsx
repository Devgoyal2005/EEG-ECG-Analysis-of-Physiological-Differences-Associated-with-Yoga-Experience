import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { BookOpen, Sparkles, Info } from 'lucide-react';

const CLUSTER_COLORS = [
  '#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#a855f7', '#64748b'
];

const CLUSTER_NARRATIVES = [
  {
    id: 0,
    color: '#38bdf8',
    purity: '97.8% Yoga Experts',
    purityColor: 'text-sky-400',
    borderColor: 'border-sky-800/50',
    bgColor: 'bg-sky-950/20',
    narrative:
      "The algorithm's most remarkable finding. Among 14,764 segments, it found a tight group that turned out to be 97.8% yoga experts during deep internal concentration. Without any labels, the machine recognized that decades of meditation leave a consistent, unmistakable signature — slow frontal Theta oscillations and unusually high heart-brain synchrony that simply didn't exist in the control population. Nearly pure expert biology, discovered blindly.",
    signals: ['High Theta power', 'Elevated RMSSD', 'Peak Alpha coherence', 'High HF power'],
  },
  {
    id: 1,
    color: '#10b981',
    purity: '84.2% Yoga Experts',
    purityColor: 'text-emerald-400',
    borderColor: 'border-emerald-800/50',
    bgColor: 'bg-emerald-950/20',
    narrative:
      'A second yogic cluster, this time during external focus tasks. What makes this interesting: 84.2% of experts maintained high vagal tone even while mentally engaged. For most people, attention and calm are trade-offs. For long-term practitioners, they coexist — the nervous system stays regulated even under cognitive demand.',
    signals: ['High HF power during task', 'Elevated RMSSD under load', 'Controlled Alpha suppression', 'Moderate Beta'],
  },
  {
    id: 2,
    color: '#f59e0b',
    purity: '52.1% Mixed',
    purityColor: 'text-amber-400',
    borderColor: 'border-amber-800/50',
    bgColor: 'bg-amber-950/20',
    narrative:
      'The mixed baseline — roughly half experts, half controls — all during quiet eyes-closed resting. This cluster tells us that resting state alone is not distinctive enough to identify expertise. Without active meditation or cognitive challenge, even experts "look" neurologically similar to controls. Practice shows up most when the nervous system is challenged, not when it is idle.',
    signals: ['Moderate Alpha power', 'Baseline RMSSD', 'Low Beta', 'Standard LF/HF ratio'],
  },
  {
    id: 3,
    color: '#ec4899',
    purity: '31.4% Expert',
    purityColor: 'text-pink-400',
    borderColor: 'border-pink-800/50',
    bgColor: 'bg-pink-950/20',
    narrative:
      'Predominantly controls under cognitive load. Fast Beta waves (13–30 Hz) dominate, HRV drops sharply. This is the physiological signature of a brain bracing under effort — wide-bandwidth neural activation trying to manage a task without trained regulatory tools. The body is working hard, and the nervous system shows it.',
    signals: ['High Beta power', 'Suppressed HRV', 'Low HF power', 'Elevated LF/HF ratio'],
  },
  {
    id: 4,
    color: '#a855f7',
    purity: '44.8% Mixed',
    purityColor: 'text-purple-400',
    borderColor: 'border-purple-800/50',
    bgColor: 'bg-purple-950/20',
    narrative:
      'The default mode cluster — Alpha waves rebound (the classic Default Mode Network signature), attention drifts, heart rhythm gently destabilizes. This state mixes both groups because mind-wandering is universal; everyone daydreams. What differs is not their physiology here — it is how quickly experts re-enter focus states afterward.',
    signals: ['Alpha rebound', 'DMN activation', 'Drifting HRV', 'Low Beta engagement'],
  },
  {
    id: 5,
    color: '#64748b',
    purity: '18.6% Expert',
    purityColor: 'text-slate-400',
    borderColor: 'border-slate-700/50',
    bgColor: 'bg-slate-800/20',
    narrative:
      'Overwhelmingly controls during resting or wandering states. Characterized by rigid, low-variability heartbeats — the cardiovascular system stuck in one operating mode. Low RMSSD, low HF power. This inflexibility is not calm: a relaxed nervous system is an adaptive one. Adaptability and relaxation are biologically different things, and this cluster captures the absence of adaptability.',
    signals: ['Very low RMSSD', 'Low HF power', 'Rigid RR intervals', 'Flat LF/HF variability'],
  },
];

export default function OverviewTab_M4() {
  const [mappings, setMappings] = useState(null);
  const [sweepData, setSweepData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/module4/mappings')
      .then(r => r.json())
      .then(d => setMappings(d))
      .catch(() => {});

    fetch('/api/module4/silhouette-sweep')
      .then(r => r.json())
      .then(d => {
        if (d.sweep) {
          const formatted = d.sweep.map(item => ({
            k: `k=${item.k}`,
            rawK: item.k,
            silhouette: Number((item.silhouette_score || 0).toFixed(4)),
            inertia: Math.round(item.inertia || 0),
          }));
          setSweepData(formatted);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const glossaryItems = mappings?.glossary ? Object.values(mappings.glossary) : [];

  return (
    <div className="py-6 space-y-12">

      {/* ─── HERO NUMBERS & BLIND TEST ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold font-mono">
              Research Objective 4 · Capstone Module
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight mt-1">
              Module 4: ML Benchmark &amp; Unsupervised Clustering
            </h2>
            <p className="text-sm text-slate-300 font-light mt-2 leading-relaxed">
              We fed all <strong>14,764 recording segments</strong> into an unsupervised clustering algorithm{' '}
              <em>without telling it who was a yoga expert and who was a control</em>. The algorithm
              independently rediscovered the yogic biomarker with <strong>97.8% cluster purity</strong>.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl font-extrabold text-white font-mono">14,764</div>
              <div className="text-xs text-slate-400 mt-1">Segments Clustered</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">97.8%</div>
              <div className="text-xs text-slate-400 mt-1">Cluster 0 Purity</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl font-extrabold text-purple-400 font-mono">k = 6</div>
              <div className="text-xs text-slate-400 mt-1">Optimal Modes</div>
            </div>
          </div>
        </div>

        {/* Blind Test Card */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              The "Blind Test" Discovery
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            In standard machine learning, algorithms are trained with cheat sheets (labels). In unsupervised
            clustering, the computer was given zero hint. It examined brain waves and heartbeats in the dark
            and naturally segregated human bodies into clusters — biology doing the grouping, not us.
          </p>
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/40 text-xs font-mono text-purple-300">
            "In the primary meditative cluster, 97.8 out of 100 points belonged to long-term yogis.
            Their biology was too distinctive to blend with normal baselines."
          </div>
        </div>
      </div>

      {/* ─── K-MEANS OPTIMIZATION: SILHOUETTE + ELBOW ───────────────── */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-purple-400 font-semibold font-mono">
            Choosing k — Cluster Optimization
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Silhouette Score + Elbow Method: Why k = 6
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            We used two independent methods to find the right number of clusters. Each answers a different question.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Silhouette Chart */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-purple-300 font-mono uppercase tracking-wider">
                  Method 1 — Silhouette Score
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Measures how well each data point fits its cluster vs the nearest neighbor cluster.
                  Ranges -1 to +1. Higher = cleaner separation.
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-900/60 whitespace-nowrap">
                Peak 0.3925 @ k=6
              </span>
            </div>
            <div className="h-56 w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
                  Loading...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sweepData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="k" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} />
                    <YAxis
                      domain={[0.25, 0.42]}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={v => v.toFixed(2)}
                      axisLine={{ stroke: '#334155' }}
                      width={42}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono shadow-xl space-y-1">
                            <div className="font-bold text-white">{d.k} clusters</div>
                            <div className="text-purple-400 font-bold">Silhouette: {d.silhouette}</div>
                            <div className="text-slate-400 text-[10px]">
                              {d.rawK === 6 ? '✅ Chosen — peak score' : d.rawK === 5 ? '⚠ Dip before peak' : 'Candidate'}
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="silhouette"
                      stroke="#a855f7"
                      strokeWidth={3}
                      dot={({ cx, cy, payload }) => (
                        <circle
                          key={`sil-dot-${payload.rawK}`}
                          cx={cx}
                          cy={cy}
                          r={payload.rawK === 6 ? 7 : 5}
                          fill={payload.rawK === 6 ? '#10b981' : '#a855f7'}
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      )}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Elbow (Inertia) Chart */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-amber-300 font-mono uppercase tracking-wider">
                  Method 2 — Elbow Method (Inertia)
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Plots total internal spread (sum of squared distances to cluster centers).
                  Look for the bend where gains start diminishing.
                </div>
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-900/60 whitespace-nowrap">
                Elbow ~k=4
              </span>
            </div>
            <div className="h-56 w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
                  Loading...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sweepData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="k" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} />
                    <YAxis
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                      axisLine={{ stroke: '#334155' }}
                      width={42}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono shadow-xl space-y-1">
                            <div className="font-bold text-white">{d.k} clusters</div>
                            <div className="text-amber-400 font-bold">Inertia: {d.inertia.toLocaleString()}</div>
                            <div className="text-slate-400 text-[10px]">
                              {d.rawK === 4 ? '📐 Approximate elbow point' : 'Lower inertia = tighter clusters'}
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="inertia"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={({ cx, cy, payload }) => (
                        <circle
                          key={`elb-dot-${payload.rawK}`}
                          cx={cx}
                          cy={cy}
                          r={payload.rawK === 4 ? 7 : 5}
                          fill={payload.rawK === 4 ? '#f59e0b' : '#78350f'}
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      )}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Combined reasoning */}
        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/40 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
            <span className="text-xs font-bold text-purple-300 font-mono uppercase tracking-wider">
              Why We Chose k = 6
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The <span className="text-amber-400 font-semibold">Elbow Method</span> suggested{' '}
            <strong className="text-white">k=4 or k=5</strong> as candidates — the inertia curve bends
            and flattens noticeably after k=4, meaning adding more clusters starts giving diminishing returns.
            The <span className="text-purple-400 font-semibold">Silhouette Score</span> broke the tie: it{' '}
            <strong className="text-white">peaked at k=6 (0.3925)</strong>, meaning the 6-cluster solution
            produces the most self-consistent, cleanly separated groups. Using both methods together is standard
            practice — Elbow narrows the range, Silhouette picks the winner.
          </p>
        </div>
      </div>

      {/* ─── PCA AXES EXPLAINED ──────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-purple-400 font-semibold font-mono">
            Reading the Cluster Map
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
            What Do the X and Y Axes Mean?
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-blue-800/40 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-900/60">
                X-Axis — PC1 (24.6% Variance)
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              The single most informative dimension across all 28 EEG + ECG features. It is a weighted
              combination of features like <span className="text-blue-300 font-mono">RMSSD</span>,{' '}
              <span className="text-blue-300 font-mono">Theta power</span>,{' '}
              <span className="text-blue-300 font-mono">HF power</span>, and{' '}
              <span className="text-blue-300 font-mono">Alpha coherence</span>.
            </p>
            <div className="text-[11px] font-mono text-slate-400">
              <span className="text-sky-400">→ Right</span> = higher cardiac regulation + calmer brainwaves
              <br />
              <span className="text-pink-400">← Left</span> = lower vagal tone + noisier neural activity
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-purple-800/40 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-900/60">
                Y-Axis — PC2 (19.6% Variance)
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              The second-largest pattern, independent from PC1. It mainly reflects cognitive
              engagement vs. passive rest — capturing how "active" the brain-body system is at
              any given moment.
            </p>
            <div className="text-[11px] font-mono text-slate-400">
              <span className="text-emerald-400">↑ Up</span> = more active, task-engaged states
              <br />
              <span className="text-slate-500">↓ Down</span> = resting or mind-wandering states
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-[11px] text-slate-400 font-mono">
          Together, PC1 + PC2 explain <span className="text-white font-bold">44.2%</span> of all variation across
          28 original measurements — preserving nearly half the complexity of the original data in a flat 2D map.
          Each dot on the scatter plot = one 10-second brain + heart recording segment.
        </div>
      </div>

      {/* ─── ALL 6 CLUSTER NARRATIVES ──────────────────────────── */}
      <div className="space-y-5">
        <div>
          <span className="text-xs uppercase tracking-wider text-purple-400 font-semibold font-mono">
            What the Machine Found
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
            The 6 Natural Physiological Modes
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Discovered blindly — no labels given. Numbers are the machine's output; stories are what the biology reveals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CLUSTER_NARRATIVES.map(c => (
            <div
              key={c.id}
              className={`p-5 rounded-2xl bg-slate-900/50 border ${c.borderColor} space-y-3 hover:border-slate-600/60 transition-all`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                    Cluster {c.id}
                  </span>
                </div>
                <span className={`text-xs font-mono font-bold ${c.purityColor}`}>
                  {c.purity}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {c.narrative}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {c.signals.map(s => (
                  <span
                    key={s}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── GLOSSARY ────────────────────────────────────────────── */}
      <div className="space-y-5 pt-4 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">
              Concepts &amp; Glossary
            </h3>
          </div>
          <a
            href="/api/module4/mappings"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-mono font-medium underline underline-offset-4"
          >
            View Raw JSON (/api/module4/mappings)
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {glossaryItems.map(g => (
            <div
              key={g.term}
              className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2 hover:border-slate-700/80 transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-white">{g.term}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60 whitespace-nowrap">
                  {g.plain_meaning}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {g.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
