import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Info, BarChart3, ListFilter, Compass } from 'lucide-react';

export default function ResultsTab_M3() {
  const [filter, setFilter] = useState('all'); // 'all' | 'EEG' | 'ECG' | 'Coupling'
  const [mappings, setMappings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/module3/mappings')
      .then(r => r.json())
      .then(d => setMappings(d))
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

  // Prepare normalized master comparison data across the 4 states
  const masterChartData = filteredMarkers.map(m => {
    const r = Math.abs(m.resting_mean);
    const i = Math.abs(m.internal_mean);
    const e = Math.abs(m.external_mean);
    const mw = Math.abs(m.mind_wandering_mean);
    const maxVal = Math.max(r, i, e, mw, 0.0001);

    return {
      name: m.readable_name,
      modality: m.modality,
      restingPct: Math.round((r / maxVal) * 100),
      internalPct: Math.round((i / maxVal) * 100),
      externalPct: Math.round((e / maxVal) * 100),
      mwPct: Math.round((mw / maxVal) * 100),
      rawResting: r,
      rawInternal: i,
      rawExternal: e,
      rawMW: mw,
      unit: m.unit,
      peakState: m.peak_state,
    };
  });

  return (
    <div className="py-6 space-y-10">
      {/* ─── HEADER & MODALITY FILTER ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold font-mono">
            4-State Physiological Shift
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            State Dynamics: Resting vs Meditation vs External Focus vs Daydreaming
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track how each signal dynamically shifts across all 4 cognitive and meditative states.
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/80">
          {[
            { id: 'all', label: 'All Signals' },
            { id: 'EEG', label: 'EEG Only' },
            { id: 'ECG', label: 'ECG Only' },
            { id: 'Coupling', label: 'Coupling' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── MASTER 4-STATE GROUPED GRAPH ───────────────────────────── */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Master 4-State Comparison ({filter === 'all' ? 'All Biomarkers' : filter})
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-sky-400">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Resting
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Internal (Meditation)
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> External (Focus)
            </span>
            <span className="flex items-center gap-1 text-purple-400">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Mind Wandering
            </span>
          </div>
        </div>

        <div className="h-96 w-full pt-2">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
              Loading 4-state data...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={masterChartData}
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
                      <div className="bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs font-mono shadow-2xl space-y-1.5">
                        <div className="font-bold text-white text-sm">{d.name}</div>
                        <div className="text-slate-400">Category: {d.modality}</div>
                        <div className="space-y-0.5 pt-1 border-t border-slate-800 text-[11px]">
                          <div className="text-sky-300">
                            Resting: <strong>{d.rawResting < 0.01 ? d.rawResting.toFixed(4) : d.rawResting.toFixed(2)} {d.unit}</strong>
                          </div>
                          <div className="text-emerald-300">
                            Internal Focus: <strong>{d.rawInternal < 0.01 ? d.rawInternal.toFixed(4) : d.rawInternal.toFixed(2)} {d.unit}</strong>
                          </div>
                          <div className="text-amber-300">
                            External Focus: <strong>{d.rawExternal < 0.01 ? d.rawExternal.toFixed(4) : d.rawExternal.toFixed(2)} {d.unit}</strong>
                          </div>
                          <div className="text-purple-300">
                            Mind Wandering: <strong>{d.rawMW < 0.01 ? d.rawMW.toFixed(4) : d.rawMW.toFixed(2)} {d.unit}</strong>
                          </div>
                        </div>
                        <div className="text-emerald-400 font-bold pt-1 border-t border-slate-800">
                          🏆 Peak: {d.peakState}
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="restingPct" fill="#38bdf8" name="Resting" radius={[0, 2, 2, 0]} />
                <Bar dataKey="internalPct" fill="#10b981" name="Internal Focus" radius={[0, 2, 2, 0]} />
                <Bar dataKey="externalPct" fill="#f59e0b" name="External Focus" radius={[0, 2, 2, 0]} />
                <Bar dataKey="mwPct" fill="#a855f7" name="Mind Wandering" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ─── DETAILED INDIVIDUAL BIOMARKER CARDS ────────────────────── */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Individual Signal Breakdown Across the 4 States
          </h3>
        </div>

        {filteredMarkers.map(m => {
          const r = Math.abs(m.resting_mean);
          const i = Math.abs(m.internal_mean);
          const e = Math.abs(m.external_mean);
          const mw = Math.abs(m.mind_wandering_mean);
          const maxVal = Math.max(r, i, e, mw, 0.0001);

          const rPct = (r / maxVal) * 100;
          const iPct = (i / maxVal) * 100;
          const ePct = (e / maxVal) * 100;
          const mwPct = (mw / maxVal) * 100;

          return (
            <div
              key={m.feature_key}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4 hover:border-slate-700/80 transition-all"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white">{m.readable_name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {m.modality}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/60">
                      {m.significance}
                    </span>
                  </div>
                  <p className="text-xs text-amber-400 font-medium mt-0.5">
                    Measures: {m.physiological_meaning}
                  </p>
                </div>

                <div className="text-right font-mono text-xs">
                  <span className="text-slate-400">Peak State: </span>
                  <span className="font-bold px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800/60">
                    {m.peak_state}
                  </span>
                </div>
              </div>

              {/* 4 Comparative Horizontal State Bars */}
              <div className="space-y-2.5 pt-1">
                {/* Resting State Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                      <span>1. Resting State:</span>
                    </span>
                    <span className="text-sky-300 font-bold">
                      {r < 0.01 ? r.toFixed(4) : r.toFixed(2)} {m.unit}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400 rounded-full" style={{ width: `${rPct}%` }} />
                  </div>
                </div>

                {/* Internal Concentration Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>2. Internal Concentration (Meditation):</span>
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {i < 0.01 ? i.toFixed(4) : i.toFixed(2)} {m.unit}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${iPct}%` }} />
                  </div>
                </div>

                {/* External Concentration Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span>3. External Concentration (Task Focus):</span>
                    </span>
                    <span className="text-amber-400 font-bold">
                      {e < 0.01 ? e.toFixed(4) : e.toFixed(2)} {m.unit}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${ePct}%` }} />
                  </div>
                </div>

                {/* Mind Wandering Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                      <span>4. Mind Wandering (Daydreaming):</span>
                    </span>
                    <span className="text-purple-300 font-bold">
                      {mw < 0.01 ? mw.toFixed(4) : mw.toFixed(2)} {m.unit}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: `${mwPct}%` }} />
                  </div>
                </div>
              </div>

              {/* Layman Explanation */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5 mt-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
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
