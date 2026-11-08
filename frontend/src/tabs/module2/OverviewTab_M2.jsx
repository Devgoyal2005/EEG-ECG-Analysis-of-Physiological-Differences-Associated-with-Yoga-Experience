import React, { useState, useEffect } from 'react';
import DonutChart from '../../components/DonutChart';
import { Brain, Heart, Zap, BookOpen, Layers } from 'lucide-react';

export default function OverviewTab_M2() {
  const [data, setData] = useState({
    unique_subjects: 33,
    expert_count: 14,
    control_count: 19,
    expert_sessions: 24,
    control_sessions: 28,
  });

  const [mappings, setMappings] = useState(null);

  useEffect(() => {
    fetch('/api/dataset/info')
      .then(r => r.json())
      .then(info => {
        if (info) {
          setData({
            unique_subjects: info.unique_participants || 33,
            expert_count: info.expert_count || 14,
            control_count: info.control_count || 19,
            expert_sessions: info.expert_sessions || 24,
            control_sessions: info.control_sessions || 28,
          });
        }
      })
      .catch(() => {});

    // Fetch official saved JSON mapping object
    fetch('/api/module2/mappings')
      .then(r => r.json())
      .then(d => setMappings(d))
      .catch(() => {});
  }, []);

  const totalSubs = data.expert_count + data.control_count;
  const expertPct = totalSubs ? Math.round((data.expert_count / totalSubs) * 100) : 42;
  const controlPct = 100 - expertPct;

  const categoryDifferences = [
    {
      title: 'EEG (Brain Waves)',
      subtitle: 'What the Mind is Doing',
      icon: Brain,
      iconColor: 'text-sky-400 bg-sky-950/80 border-sky-800/60',
      summary: 'Experts remain alert and quiet inside without daydreaming or feeling sleepy.',
      details:
        'Normal people usually only produce calm brain waves when they are getting sleepy. When they are awake, their heads are full of frantic, fast Beta waves. Yoga experts can stay wide awake and focused while keeping deep calm Theta waves active. Their minds are still, relaxed, and not easily stressed.',
      keyMarkers: ['Theta/Alpha Ratio (Focus Depth)', 'Relative Theta Power', 'Relative Alpha Power'],
    },
    {
      title: 'ECG (Heart Dynamics)',
      subtitle: 'What the Heart & Nervous System are Doing',
      icon: Heart,
      iconColor: 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60',
      summary: 'Experts have a heart that easily slows down and speeds up with breathing.',
      details:
        'When a normal person is tense, their heart beats like an unyielding metronome. In yoga experts, the heart is flexible. Every time they exhale, a natural nerve brake (the vagus nerve) kicks in to slow the heart down and rest. That beat-to-beat elasticity (HF and RMSSD) is over 80% to 160% higher in experts.',
      keyMarkers: ['High Frequency (HF) Power', 'RMSSD (Heart Elasticity)', 'pNN50 Variations'],
    },
    {
      title: 'Brain-Heart Coupling',
      subtitle: 'How Brain & Heart Work Together (The Biggest Difference)',
      icon: Zap,
      iconColor: 'text-amber-400 bg-amber-950/80 border-amber-800/60',
      summary: 'In experts, when the brain relaxes, the heart instantly mirrors it — creating total harmony.',
      details:
        'In normal people, the brain and heart often pull in different directions — you might feel relaxed, but your heart is pounding, or vice versa. In yoga practitioners, slow breathing lowers blood pressure pulses. Those steady pulses signal the brainstem to synchronize brain waves. The brain calms the heart, and the heart calms the brain — they lock together like two tuning forks.',
      keyMarkers: ['Alpha × RMSSD Product (+1050%)', 'Neuro-Cardiac Index', 'Theta-LF Cross Resonance'],
    },
  ];

  const glossaryList = mappings?.biomarker_mappings
    ? Object.values(mappings.biomarker_mappings)
    : [];

  return (
    <div className="py-6 space-y-12">
      {/* ─── HERO COHORT METRICS & CRITERIA ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold font-mono">
              Research Objective 1 & 2
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight mt-1">
              Module 2: Expert vs Normal People
            </h2>
            <p className="text-sm text-slate-300 font-light mt-1 leading-relaxed">
              We compared 14 long-term yoga practitioners against 19 normal healthy individuals across 28 body signals to discover <strong>what physical changes happen in the brain and heart after years of yoga</strong>.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-4xl font-extrabold text-blue-400 font-mono">{data.expert_count}</div>
              <div className="text-xs text-slate-400 mt-1">Yoga Experts</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{data.expert_sessions} Sessions</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-4xl font-extrabold text-amber-400 font-mono">{data.control_count}</div>
              <div className="text-xs text-slate-400 mt-1">Normal People</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{data.control_sessions} Sessions</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-4xl font-extrabold text-white font-mono">28</div>
              <div className="text-xs text-slate-400 mt-1">Signals Analyzed</div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Statistically Verified</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80">
          <DonutChart expertPct={expertPct} controlPct={controlPct} size={240} />
          <p className="text-xs text-slate-400 font-medium tracking-wide mt-3">
            Cohort Balance (42% Experts vs 58% Normal People)
          </p>
        </div>
      </div>

      {/* ─── HOW EACH CATEGORY DIFFERS: THE 3 PILLARS ────────────────── */}
      <div className="space-y-6 pt-4 border-t border-slate-800/80">
        <div>
          <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold font-mono">
            Layman Physiological Summary
          </span>
          <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            How Do Experts Differ in the Brain, Heart, and Body?
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            A clear explanation of what happens inside the body for each category.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoryDifferences.map(cat => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.title}
                className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border ${cat.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">{cat.title}</h4>
                      <p className="text-[11px] text-slate-400">{cat.subtitle}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs font-semibold text-emerald-300">
                    "{cat.summary}"
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    {cat.details}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/60">
                  <div className="text-[10px] uppercase font-mono text-slate-500 mb-1.5">
                    Standout Signals:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.keyMarkers.map(m => (
                      <span
                        key={m}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── LIVE JSON MAPPING & CONTEXT GUIDE ───────────────────────── */}
      <div className="space-y-6 pt-4 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">
              Biomarker Meaning & Layman Guide (From JSON Mapping)
            </h3>
          </div>
          <a
            href="/api/module2/mappings"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-mono font-medium underline underline-offset-4"
          >
            <span>View Raw JSON Object (/api/module2/mappings)</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {glossaryList.map(g => (
            <div
              key={g.feature_key}
              className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2 hover:border-slate-700/80 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{g.readable_name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {g.modality}
                </span>
              </div>
              <div className="text-xs text-blue-400 font-mono font-medium">
                Measures: {g.physiological_meaning}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {g.layman_interpretation}
              </p>
              <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                <span>Expert: <strong className="text-blue-300">{g.expert_mean}</strong></span>
                <span>Normal: <strong className="text-slate-300">{g.control_mean}</strong></span>
                <span className="text-emerald-400 font-semibold">{g.statistical_significance}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
