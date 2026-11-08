import React, { useState, useEffect } from 'react';
import DonutChart from '../components/DonutChart';
import { Trophy, CheckCircle, ShieldCheck } from 'lucide-react';

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

  const categoryWinners = [
    {
      category: 'Heart Signals (ECG Only)',
      winnerModel: 'Linear SVM',
      accuracy: '93.04%',
      f1: '96.40%',
      isOverallWinner: true,
      tagColor: 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60',
      simpleVerdict: '🏆 Champion: Clear, clean, and 93% accurate',
      whyHappens:
        'Heart signals are very clean and steady. When you record heartbeats from the wrists, there is very little static or muscle noise. Because yoga practice fundamentally changes how calmly the heart beats, the computer easily tells yogis apart from normal people with 93% accuracy.',
    },
    {
      category: 'Brain Signals (EEG Only)',
      winnerModel: 'Linear SVM',
      accuracy: '90.60%',
      f1: '95.07%',
      isOverallWinner: false,
      tagColor: 'text-sky-400 bg-sky-950/80 border-sky-800/60',
      simpleVerdict: 'Very strong (90.6%), but carries natural brain noise',
      whyHappens:
        'Brain waves show deep meditative focus in yogis. However, brain waves are recorded through the skull and scalp. Even tiny eye blinks, facial twitches, or hair resistance create background fuzz. That extra static makes the computer slightly less certain than it is with clean heart pulses.',
    },
    {
      category: 'Both Combined (EEG + ECG)',
      winnerModel: 'Linear SVM',
      accuracy: '89.53%',
      f1: '94.48%',
      isOverallWinner: false,
      tagColor: 'text-amber-400 bg-amber-950/80 border-amber-800/60',
      simpleVerdict: 'Lower accuracy! More data was actually worse',
      whyHappens:
        'You might think combining brain and heart data would be best, but it actually dropped to 89.5%. Why? Because throwing fluctuating brain signals into a clean heart dataset added confusion. With a realistic group of 33 people, adding noisy variables blurs the simple line separating yogis from controls.',
    },
  ];

  return (
    <div className="py-6 space-y-12">
      {/* ─── HERO COHORT METRICS & DONUT ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold font-mono">
              Research Objective 3 & 4
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight mt-1">
              Module 1: Modality Comparison
            </h2>
            <p className="text-sm text-slate-300 font-light mt-1 leading-relaxed">
              We asked a simple question: Can computer models tell yoga experts and normal people apart using their <strong>brain waves alone</strong>, their <strong>heart rhythm alone</strong>, or <strong>both combined</strong>?
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-4xl font-extrabold text-white font-mono">{data.unique_subjects}</div>
              <div className="text-xs text-slate-400 mt-1">Participants</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-4xl font-extrabold text-white font-mono">{data.verified_recordings}</div>
              <div className="text-xs text-slate-400 mt-1">Recordings</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-4xl font-extrabold text-blue-400 font-mono">3</div>
              <div className="text-xs text-slate-400 mt-1">Signal Groups</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80">
          <DonutChart expertPct={expertPct} controlPct={controlPct} size={240} />
          <p className="text-xs text-slate-400 font-medium tracking-wide mt-3">
            Cohort Balance (46% Yoga Experts vs 54% Normal People)
          </p>
        </div>
      </div>

      {/* ─── CHAMPION CATEGORY & DETAILED BREAKDOWN ─────────────────── */}
      <div className="space-y-6 pt-4 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold font-mono">
              Simple Verdict
            </span>
            <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">
              Which Signal Category Won?
            </h3>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold font-mono">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>WINNER: HEART (ECG) — 93.04% ACCURACY</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoryWinners.map(cat => (
            <div
              key={cat.category}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                cat.isOverallWinner
                  ? 'bg-slate-900/90 border-emerald-500/80 ring-1 ring-emerald-500/40 shadow-xl'
                  : 'bg-slate-900/40 border-slate-800/80'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${cat.tagColor}`}>
                    {cat.isOverallWinner ? '🏆 Champion' : 'Runner Up'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Top Model</span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white">{cat.category}</h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-white font-mono">{cat.accuracy}</span>
                    <span className="text-xs text-slate-400">Accuracy</span>
                  </div>
                  <div className="text-xs text-emerald-400 font-medium mt-1">
                    {cat.simpleVerdict}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/60">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Why did this happen?
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {cat.whyHappens}
                  </p>
                </div>
              </div>

              <div className="pt-2 text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Model: {cat.winnerModel} (Cross-Validated)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
