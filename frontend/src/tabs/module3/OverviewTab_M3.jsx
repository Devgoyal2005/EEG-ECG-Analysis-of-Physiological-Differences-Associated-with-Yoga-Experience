import React, { useState, useEffect } from 'react';
import { Compass, Eye, Heart, Brain, Zap, BookOpen } from 'lucide-react';

export default function OverviewTab_M3() {
  const [mappings, setMappings] = useState(null);

  useEffect(() => {
    fetch('/api/module3/mappings')
      .then(r => r.json())
      .then(d => setMappings(d))
      .catch(() => {});
  }, []);

  const stateCards = [
    {
      id: 'resting',
      title: '1. Resting State',
      tag: 'Baseline Calmness',
      tagColor: 'text-sky-400 bg-sky-950/80 border-sky-800/60',
      icon: Eye,
      iconColor: 'text-sky-400',
      summary: 'Eyes closed, quiet stabilization before cognitive engagement.',
      brainAction: 'Calm Alpha waves (8–13 Hz) form the background rhythm; low Beta tension.',
      heartAction: 'Heart rate sits at standard baseline (~78 bpm); baseline RMSSD (77.3 ms).',
      couplingAction: 'Balanced baseline coupling (0.34); mind and pulse are at rest.',
    },
    {
      id: 'internal',
      title: '2. Internal Concentration',
      tag: 'Inward Meditation & Breath',
      tagColor: 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60',
      icon: Brain,
      iconColor: 'text-emerald-400',
      summary: 'The signature meditative state: breath awareness, mantra, and inner stillness.',
      brainAction: 'Frontal Theta increases while disciplined Theta/Alpha ratio drops to its lowest (4.49).',
      heartAction: 'Vagus nerve brake fires actively: RMSSD rises to 87.9 ms as breathing smoothly regulates heartbeats.',
      couplingAction: 'Coherence peaks (Index: 1.4); breathing and cortical waves lock into harmony.',
    },
    {
      id: 'external',
      title: '3. External Concentration',
      tag: 'Active Sensory Task',
      tagColor: 'text-amber-400 bg-amber-950/80 border-amber-800/60',
      icon: Zap,
      iconColor: 'text-amber-400',
      summary: 'Focused attention directed at external audio-visual sensory demands.',
      brainAction: 'Alpha waves drop sharply by 50% (0.5%) as the cortex desynchronizes to process input.',
      heartAction: 'Heart elasticity reaches its absolute peak (RMSSD: 111.1 ms; SDNN: 74.1 ms) for maximum adaptability.',
      couplingAction: 'Decoupled state (Index: 0.7); brain focuses on outside inputs while heart maintains elasticity.',
    },
    {
      id: 'mind_wandering',
      title: '4. Mind Wandering',
      tag: 'Daydreaming / Thought Loops',
      tagColor: 'text-purple-400 bg-purple-950/80 border-purple-800/60',
      icon: Compass,
      iconColor: 'text-purple-400',
      summary: 'Spontaneous thought flow, daydreaming, and unfocused mental drifting.',
      brainAction: 'Alpha waves rebound strongly (1.0%) as the Default Mode Network (DMN) takes over.',
      heartAction: 'Vagal tone dips back to baseline (RMSSD: 77.8 ms); subtle heart rhythm instability.',
      couplingAction: 'High Alpha-RMSSD product (0.48), but lower overall structured phase coherence.',
    },
  ];

  const glossaryList = mappings?.biomarker_mappings
    ? Object.values(mappings.biomarker_mappings)
    : [];

  return (
    <div className="py-6 space-y-12">
      {/* ─── HERO COHORT METRICS & CORE QUESTION ────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold font-mono">
              Research Objective 2 & 3
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight mt-1">
              Module 3: 4 Physiological States
            </h2>
            <p className="text-sm text-slate-300 font-light mt-1 leading-relaxed">
              We tracked how brain waves, heart dynamics, and mind-body harmony change across 4 conditions: 
              <strong> Resting</strong>, <strong>Internal Meditation</strong>, <strong>External Focus</strong>, and <strong>Daydreaming</strong>.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-4xl font-extrabold text-amber-400 font-mono">4</div>
              <div className="text-xs text-slate-400 mt-1">Cognitive States</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-4xl font-extrabold text-white font-mono">27</div>
              <div className="text-xs text-slate-400 mt-1">Tested Biomarkers</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-4xl font-extrabold text-emerald-400 font-mono">100%</div>
              <div className="text-xs text-slate-400 mt-1">p &lt; 0.001 ANOVA</div>
            </div>
          </div>
        </div>

        {/* Cognitive Shift Timeline Visual */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Experimental Protocol Sequence
          </div>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-sky-950/30 border border-sky-900/40 text-sky-300">
              <span className="w-6 h-6 rounded-lg bg-sky-900/60 flex items-center justify-center font-bold">1</span>
              <span>Resting State: Eyes-closed quiet sitting</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-emerald-300">
              <span className="w-6 h-6 rounded-lg bg-emerald-900/60 flex items-center justify-center font-bold">2</span>
              <span>Internal Meditation: Deep breath & mantra focus</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-950/30 border border-amber-900/40 text-amber-300">
              <span className="w-6 h-6 rounded-lg bg-amber-900/60 flex items-center justify-center font-bold">3</span>
              <span>External Focus: Audio-visual task engagement</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-950/30 border border-purple-900/40 text-purple-300">
              <span className="w-6 h-6 rounded-lg bg-purple-900/60 flex items-center justify-center font-bold">4</span>
              <span>Mind Wandering: Spontaneous thought loops</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── THE 4 COGNITIVE STATE PILLARS ──────────────────────────── */}
      <div className="space-y-6 pt-4 border-t border-slate-800/80">
        <div>
          <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold font-mono">
            State Physiology
          </span>
          <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            What Happens to the Human Body in Each State?
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            How the brain, heart, and nervous system shift as focus transitions from inner stillness to active sensory processing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stateCards.map(s => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4 flex flex-col justify-between hover:border-slate-700/80 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${s.tagColor}`}>
                      {s.tag}
                    </span>
                    <Icon className={`w-4 h-4 ${s.iconColor}`} />
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-base">{s.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1 font-medium">
                      {s.summary}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/60 text-xs text-slate-300">
                    <div>
                      <span className="font-bold text-white">🧠 Brain: </span>
                      {s.brainAction}
                    </div>
                    <div>
                      <span className="font-bold text-white">❤️ Heart: </span>
                      {s.heartAction}
                    </div>
                    <div>
                      <span className="font-bold text-white">⚡ Sync: </span>
                      {s.couplingAction}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── LIVE JSON MAPPING GLOSSARY & DIRECT ACCESS ─────────────── */}
      <div className="space-y-6 pt-4 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">
              Biomarker Meaning & 4-State Behavior Guide
            </h3>
          </div>
          <a
            href="/api/module3/mappings"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-mono font-medium underline underline-offset-4"
          >
            <span>View Raw JSON Object (/api/module3/mappings)</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {glossaryList.map(g => (
            <div
              key={g.feature_key}
              className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2.5 hover:border-slate-700/80 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{g.readable_name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {g.modality}
                </span>
              </div>
              <div className="text-xs text-amber-400 font-mono font-medium">
                Measures: {g.physiological_meaning}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {g.layman_interpretation}
              </p>
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-center">
                <div className="p-1 rounded bg-slate-800/40">
                  <span className="text-slate-400 block">Resting</span>
                  <span className="text-sky-300 font-bold">{g.resting_mean}</span>
                </div>
                <div className="p-1 rounded bg-slate-800/40">
                  <span className="text-slate-400 block">Internal</span>
                  <span className="text-emerald-300 font-bold">{g.internal_mean}</span>
                </div>
                <div className="p-1 rounded bg-slate-800/40">
                  <span className="text-slate-400 block">External</span>
                  <span className="text-amber-300 font-bold">{g.external_mean}</span>
                </div>
                <div className="p-1 rounded bg-slate-800/40">
                  <span className="text-slate-400 block">Mind Wand.</span>
                  <span className="text-purple-300 font-bold">{g.mind_wandering_mean}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
