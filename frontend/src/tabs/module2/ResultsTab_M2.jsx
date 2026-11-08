import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Info, BarChart3, ListFilter } from 'lucide-react';

export default function ResultsTab_M2() {
  const [filter, setFilter] = useState('all'); // 'all' | 'EEG' | 'ECG' | 'Coupling'
  const [mappings, setMappings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/module2/mappings')
      .then(r => r.json())
      .then(d => {
        setMappings(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const allBiomarkers = mappings?.biomarker_mappings
    ? Object.values(mappings.biomarker_mappings)
    : [];

  const filteredMarkers =
    filter === 'all'
      ? allBiomarkers
      : allBiomarkers.filter(m => m.modality.toLowerCase() === filter.toLowerCase());

  // Prepare normalized combined chart data
  // For each marker, scale both expert and control values so the larger is 100
  const combinedChartData = filteredMarkers.map(m => {
    const exp = Math.abs(m.expert_mean);
    const ctrl = Math.abs(m.control_mean);
    const maxVal = Math.max(exp, ctrl, 0.0001);

    const isExpertHigher = exp >= ctrl;
    const basePct = Math.round((Math.min(exp, ctrl) / maxVal) * 100);
    const diffPct = Math.round((Math.abs(exp - ctrl) / maxVal) * 100);

    return {
      name: m.readable_name,
      modality: m.modality,
      // For stacked bar: base (blue), expertExtra (yellow if expert higher), normalExtra (yellow if normal higher)
      base: basePct,
      expertExtra: isExpertHigher ? diffPct : 0,
      normalExtra: !isExpertHigher ? diffPct : 0,
      rawExp: exp,
      rawCtrl: ctrl,
      unit: m.unit,
      isExpertHigher,
    };
  });

  return (
    <div className="py-6 space-y-10">
      {/* ─── HEADER & MODALITY FILTER ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold font-mono">
            Direct Cohort Comparison
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Standout Signals: Yoga Experts vs Normal People
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Blue represents the common baseline. Yellow highlights the exact difference for every single signal.
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/80">
          {[
            { id: 'all', label: 'All Signals' },
            { id: 'EEG', label: 'EEG Only' },
            { id: 'ECG', label: 'ECG Only' },
            { id: 'Coupling', label: 'Coupling (Standout)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── COMBINED MASTER GRAPH ──────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Combined Comparison Chart ({filter === 'all' ? 'All 14 Signals' : filter})
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Common Baseline
            </span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Yellow = Exact Difference Highlight
            </span>
          </div>
        </div>

        <div className="h-96 w-full pt-2">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
              Loading signals...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={combinedChartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 160, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={v => `${v}%`}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#e2e8f0', fontSize: 11 }}
                  width={150}
                  axisLine={{ stroke: '#334155' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono shadow-2xl space-y-1">
                        <div className="font-bold text-white text-sm">{d.name}</div>
                        <div className="text-slate-400">Modality: {d.modality}</div>
                        <div className="text-blue-400 pt-1">
                          Normal People: <strong>{d.rawCtrl < 0.01 ? d.rawCtrl.toFixed(4) : d.rawCtrl.toFixed(2)} {d.unit}</strong>
                        </div>
                        <div className="text-amber-400">
                          Yoga Experts: <strong>{d.rawExp < 0.01 ? d.rawExp.toFixed(4) : d.rawExp.toFixed(2)} {d.unit}</strong>
                        </div>
                        <div className="text-emerald-400 font-bold pt-1">
                          {d.isExpertHigher ? `+${d.expertExtra}% Higher in Experts` : `-${d.normalExtra}% Lower in Experts (More Disciplined)`}
                        </div>
                      </div>
                    );
                  }}
                />
                {/* Stacked Bars: Base in Blue, Yellow for the difference */}
                <Bar dataKey="base" stackId="a" fill="#3b82f6" name="Common Reading" />
                <Bar dataKey="expertExtra" stackId="a" fill="#f59e0b" name="Difference (Higher in Experts)" />
                <Bar dataKey="normalExtra" stackId="a" fill="#facc15" name="Difference (Lower in Experts)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ─── DETAILED INDIVIDUAL SIGNAL CARDS ───────────────────────── */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Detailed Breakdown & Layman Interpretations
          </h3>
        </div>

        {filteredMarkers.map(m => {
          const exp = Math.abs(m.expert_mean);
          const ctrl = Math.abs(m.control_mean);
          const maxVal = Math.max(exp, ctrl, 0.0001);

          const isExpertHigher = exp >= ctrl;
          const commonPct = (Math.min(exp, ctrl) / maxVal) * 100;
          const diffPct = (Math.abs(exp - ctrl) / maxVal) * 100;

          const ctrlPctTotal = (ctrl / maxVal) * 100;
          const expPctTotal = (exp / maxVal) * 100;

          const diffRatio = ctrl > 0 ? (((exp - ctrl) / ctrl) * 100).toFixed(0) : 'N/A';

          return (
            <div
              key={m.feature_key}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4 hover:border-slate-700/80 transition-all"
            >
              {/* Header info */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white">{m.readable_name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {m.modality}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5">
                    Measures: {m.physiological_meaning}
                  </p>
                </div>

                {/* Magnitude pill */}
                <div className="text-right font-mono text-xs">
                  <span className="text-slate-400">Difference: </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-md ${
                      isExpertHigher
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                    }`}
                  >
                    {isExpertHigher ? `+${diffRatio}% in Experts` : `${diffRatio}% in Experts (Calmer)`}
                  </span>
                </div>
              </div>

              {/* ─── DUAL BARS (ALWAYS HIGHLIGHTING DIFFERENCE IN YELLOW) ── */}
              <div className="space-y-3 pt-1">
                {/* CASE A: Yoga Experts is Higher */}
                {isExpertHigher ? (
                  <>
                    {/* Normal People (shorter, solid blue) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          <span>Normal People Baseline:</span>
                        </span>
                        <span className="text-slate-200 font-bold">
                          {ctrl < 0.01 ? ctrl.toFixed(4) : ctrl.toFixed(2)} {m.unit}
                        </span>
                      </div>
                      <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${ctrlPctTotal}%` }} />
                      </div>
                    </div>

                    {/* Yoga Experts (Blue till normal baseline, Yellow for the difference) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                          <span>Yoga Experts Reading:</span>
                        </span>
                        <span className="text-amber-400 font-bold">
                          {exp < 0.01 ? exp.toFixed(4) : exp.toFixed(2)} {m.unit}
                        </span>
                      </div>
                      <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex">
                        {/* Blue common part */}
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${commonPct}%` }}
                          title="Common reading (same as normal people)"
                        />
                        {/* Yellow highlight for difference */}
                        <div
                          className="h-full bg-amber-400 rounded-r-full animate-pulse"
                          style={{ width: `${diffPct}%` }}
                          title="Yellow shows how much Yoga Experts exceed normal baseline"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  /* CASE B: Normal People is Higher (e.g. Delta Power, Theta/Beta Ratio) */
                  <>
                    {/* Normal People (Blue till expert level, Yellow for excess in normal people) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          <span>Normal People Reading:</span>
                        </span>
                        <span className="text-slate-200 font-bold">
                          {ctrl < 0.01 ? ctrl.toFixed(4) : ctrl.toFixed(2)} {m.unit}
                        </span>
                      </div>
                      <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex">
                        {/* Blue common part */}
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${commonPct}%` }}
                          title="Common reading with Yoga Experts"
                        />
                        {/* Yellow highlight for the excess in normal people */}
                        <div
                          className="h-full bg-amber-400 rounded-r-full animate-pulse"
                          style={{ width: `${diffPct}%` }}
                          title="Yellow highlights excess in normal people (drowsiness/stress)"
                        />
                      </div>
                    </div>

                    {/* Yoga Experts (shorter, disciplined baseline in Blue) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-emerald-400 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                          <span>Yoga Experts Disciplined Baseline:</span>
                        </span>
                        <span className="text-emerald-400 font-bold">
                          {exp < 0.01 ? exp.toFixed(4) : exp.toFixed(2)} {m.unit}
                        </span>
                      </div>
                      <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${expPctTotal}%` }} />
                      </div>
                    </div>
                  </>
                )}

                {/* Legend indicator */}
                <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> Blue = Common reading
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> Yellow = Exact Difference Highlight
                  </span>
                </div>
              </div>

              {/* ─── LAYMAN EXPLANATION OF WHAT THIS MEANS ───────── */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5 mt-2">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">What this tells us: </span>
                  {m.layman_interpretation}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
