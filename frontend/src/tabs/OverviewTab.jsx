import React, { useState, useEffect } from 'react';
import DonutChart from '../components/DonutChart';

export default function OverviewTab() {
  const [data, setData] = useState({
    verified_recordings: 52,
    unique_subjects: 33,
    expert_sessions: 24,
    control_sessions: 28,
  });

  useEffect(() => {
    fetch('/api/dataset/info')
      .then(res => res.json())
      .then(info => {
        if (info) {
          setData({
            verified_recordings: info.total_recordings || 52,
            unique_subjects: info.unique_participants || 33,
            expert_sessions: info.expert_count || 24,
            control_sessions: info.control_count || 28,
          });
        }
      })
      .catch(() => {});
  }, []);

  const total = data.expert_sessions + data.control_sessions;
  const expertPct = total ? Math.round((data.expert_sessions / total) * 100) : 46;
  const controlPct = total ? 100 - expertPct : 54;

  return (
    <div className="py-8 space-y-16">
      {/* Hero row: Left info + Right Donut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left column */}
        <div className="space-y-10">
          <div>
            <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">
              Research Objective 3 & 4
            </span>
            <h2 className="text-4xl font-bold text-white tracking-tight mt-1">
              Module 1
            </h2>
            <p className="text-xl text-slate-400 font-light mt-1">
              Modality Comparison
            </p>
          </div>

          {/* 3 Large Big Numbers */}
          <div className="grid grid-cols-3 gap-6 pt-2">
            <div>
              <div className="text-5xl font-extrabold text-white font-mono">
                {data.unique_subjects}
              </div>
              <div className="text-sm text-slate-400 font-medium mt-1">
                Subjects
              </div>
            </div>
            <div>
              <div className="text-5xl font-extrabold text-white font-mono">
                {data.verified_recordings}
              </div>
              <div className="text-sm text-slate-400 font-medium mt-1">
                Recordings
              </div>
            </div>
            <div>
              <div className="text-5xl font-extrabold text-white font-mono">
                3
              </div>
              <div className="text-sm text-slate-400 font-medium mt-1">
                Modalities
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Donut Chart */}
        <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80">
          <DonutChart expertPct={expertPct} controlPct={controlPct} size={280} />
          <p className="text-xs text-slate-500 font-medium tracking-wide mt-4">
            Cohort Class Segregation
          </p>
        </div>
      </div>

      {/* Minimal Footer Context Strip */}
      <div className="pt-8 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div>
          <span className="text-slate-300 font-medium">EEG:</span> 12 Spectral Features • <span className="text-slate-300 font-medium">ECG:</span> 7 HRV Metrics
        </div>
        <div>
          500 Hz Sampling • 64 Scalp Electrodes • ANT Neuro eego mylab
        </div>
      </div>
    </div>
  );
}
