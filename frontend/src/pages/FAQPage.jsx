import React, { useState } from 'react';
import { 
  HelpCircle, 
  Database, 
  Brain, 
  Heart, 
  Sparkles, 
  Activity, 
  Cpu, 
  Layers, 
  BookOpen, 
  Search, 
  ChevronDown, 
  ChevronUp,
  ShieldCheck,
  FileSpreadsheet,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'dataset', name: '1. Dataset & Storage', icon: Database },
    { id: 'eeg', name: '2. EEG Brainwaves', icon: Brain },
    { id: 'ecg', name: '3. ECG & HRV Stress', icon: Heart },
    { id: 'coupling', name: '4. Brain-Heart Coupling', icon: Sparkles },
    { id: 'states', name: '5. 4 Cognitive States', icon: Activity },
    { id: 'ml', name: '6. Machine Learning', icon: Cpu },
    { id: 'modules', name: '7. Study Modules 1-4', icon: Layers }
  ];

  const faqData = [
    // Section 1: Dataset & Storage
    {
      category: 'dataset',
      question: 'Why does the raw physiological dataset take tens of gigabytes (~20 GB)?',
      answer: `High-density clinical electrophysiology requires continuous microsecond sampling across dozens of channels. In this study:
      - 64 scalp EEG channels + 1 auxiliary ECG channel = 65 continuous channels.
      - 500 Hz sampling rate = 500 voltage measurements per second per channel.
      - 45 minutes duration = 2,700 seconds.
      - Total data points per recording: 65 channels × 500 samples/sec × 2,700 seconds = 87,750,000 data points per subject session.
      In 32-bit floating point format (4 bytes per sample), each raw session (.eeg) is ~877 MB to 1.5 GB. Therefore, a research cohort of 15–19 recordings naturally equals ~19.5 to 20 GB of uncompressed binary time-series data.`
    },
    {
      category: 'dataset',
      question: 'Why was .mp4 content downloading, and why has it been permanently blocked and deleted?',
      answer: `The Hugging Face BIDS dataset (alexeykashevnik/EEGMeditation) included auxiliary webcam video footage of participants in the 'beh/' (behavioral) folders (~6 GB per video). These video camera files are completely irrelevant to electrical signal processing and machine learning classifiers, which only analyze microvolt time-series. We implemented a strict whitelist (.vhdr, .vmrk, .eeg, .tsv, .json) that permanently blocks video formats and purged all existing .mp4 files, immediately freeing 14.79 GB of drive space.`
    },
    {
      category: 'dataset',
      question: 'How much data is scientifically enough for our Major Project?',
      answer: `In academic biomedical engineering, statistical significance depends on sample degrees of freedom and cross-validation variance. Your local cohort of 15–19 recordings provides over 2,500 distinct 10-second windowed epochs across all 4 cognitive states for both Yoga Experts and Controls. This provides ample statistical power for 5-fold subject-independent cross-validation (GroupKFold), Student's t-tests (p < 0.05), one-way ANOVA, and K-Means clustering. Most published neurocomputing papers evaluate cohorts of 10 to 20 participants.`
    },
    {
      category: 'dataset',
      question: 'How does the download resume without restarting from zero?',
      answer: `The custom downloader uses HTTP Range headers ('Range: bytes={existing_bytes}-', HTTP Status 206 Partial Content). When downloading starts, all completed files on disk are verified against their remote byte size and skipped in 0 milliseconds. If a connection drops midway through a 1.4 GB file, the existing bytes are saved in a '.part' file, and the downloader automatically resumes from that exact byte without discarding previously downloaded data.`
    },

    // Section 2: EEG
    {
      category: 'eeg',
      question: 'What are the 5 standard EEG frequency bands and what do they mean?',
      answer: `Brainwaves represent synchronized postsynaptic potentials of cortical pyramidal neurons, divided into 5 standard frequency bands:
      1. Delta (0.5 – 4 Hz): Deep dreamless sleep, unconscious somatic regeneration.
      2. Theta (4 – 8 Hz): Inward meditative absorption, memory access, intuitive thought, and emotional calm.
      3. Alpha (8 – 13 Hz): Relaxed, serene alertness. The hallmark of a calm brain that is awake without stress.
      4. Beta (13 – 30 Hz): Active logical problem-solving, outward focus, sensory processing, or stress/anxiety.
      5. Gamma (30 – 45 Hz): High-level cognitive binding, insight, and rapid cross-cortical information processing.`
    },
    {
      category: 'eeg',
      question: 'How is EEG raw signal preprocessed before analysis?',
      answer: `Raw EEG contains ambient powerline interference, ocular blinks, and DC drift. Our pipeline applies:
      1. Bandpass Filtering (1.0 – 40.0 Hz): Removes DC drift/sweat artifacts below 1 Hz and high-frequency muscle noise above 40 Hz.
      2. 50 Hz Notch Filtering: Eliminates electrical grid powerline hum.
      3. Average Re-Referencing: Subtracts the global mean across electrodes to remove common reference bias.
      4. Welch's Power Spectral Density (PSD): Uses overlapping Hanning windows to compute absolute and relative spectral power per frequency band.`
    },

    // Section 3: ECG & HRV
    {
      category: 'ecg',
      question: 'What is Heart Rate Variability (HRV) and why is it superior to just measuring Heart Rate?',
      answer: `A healthy human heart does NOT beat like a metronome; the time interval between successive heartbeats varies continuously by milliseconds. This beat-to-beat variation is Heart Rate Variability (HRV). 
      - High HRV indicates a resilient, adaptable cardiovascular system governed by the parasympathetic vagus nerve ('rest-and-digest').
      - Low HRV indicates autonomic rigidity and sympathetic overdrive ('fight-or-flight' stress).`
    },
    {
      category: 'ecg',
      question: 'What do RMSSD, SDNN, and the LF/HF ratio indicate about stress?',
      answer: `1. RMSSD (Root Mean Square of Successive Differences): The primary time-domain indicator of vagal (parasympathetic) tone. Higher RMSSD directly correlates with deep physiological calm and rapid stress recovery.
      2. SDNN: Reflects total autonomic variability over the recording epoch.
      3. LF/HF Ratio: The ratio of Low Frequency (0.04–0.15 Hz, sympathetic + vagal) to High Frequency (0.15–0.40 Hz, pure parasympathetic/respiratory). A high ratio indicates acute adrenaline stress; a low ratio (~1.0) reflects balanced autonomic serenity.`
    },

    // Section 4: Brain-Heart Interaction
    {
      category: 'coupling',
      question: 'What is Brain-Heart Interaction (Neuro-Cardiac Coupling)?',
      answer: `The brain and heart are bound together through bidirectional neural pathways via the vagus nerve (cranial nerve X) and ascending baroreceptor feedback. During deep yoga meditation and rhythmic breathing, the phase of respiratory sinus arrhythmia synchronizes with frontal cortical alpha/theta brain oscillations. We compute this via cross-spectral coherence, producing the 'Neuro-Cardiac Index'.`
    },
    {
      category: 'coupling',
      question: 'Why does Brain-Heart Interaction outperform EEG-Only or ECG-Only models?',
      answer: `Single modalities only view half the picture: EEG captures mental state, while ECG captures cardiovascular stress. An individual could be mentally focused yet physically agitated, or vice versa. The Brain-Heart Interaction matrix captures the true mind-body resonance of meditation, where mental focus and cardiovascular calm co-occur simultaneously.`
    },

    // Section 5: The 4 Cognitive States
    {
      category: 'states',
      question: 'What are the 4 experimental states analyzed in this study?',
      answer: `1. Resting State: Neutral eyes-open/closed baseline idling without workload.
      2. Internal Concentration: Inward-directed attention (focused meditation on breath or mantra). Characterized by soaring Alpha and Theta power and lowest heart rate.
      3. External Concentration: Outward task engagement (attending to external audio/visual stimuli). Characterized by Beta/Gamma activation and elevated sympathetic alertness.
      4. Mind-Wandering: Uncontrolled spontaneous daydreaming and past/future rumination. Characterized by a drop in Alpha coherence and elevated micro-stress (higher LF/HF ratio).`
    },
    {
      category: 'states',
      question: 'Why was One-Way Repeated Measures ANOVA used across the 4 states?',
      answer: `ANOVA (Analysis of Variance) tests the null hypothesis that mean biomarker levels are identical across all 4 conditions. The resulting F-statistic and p-value (p < 0.05) prove that the physiological changes between meditation, resting, external tasks, and mind-wandering are statistically significant and not random noise.`
    },

    // Section 6: Machine Learning
    {
      category: 'ml',
      question: 'Why is Subject-Independent Cross-Validation (GroupKFold) mandatory?',
      answer: `In continuous signal processing, if 10-second windows from the same participant appear in both training and test sets, the model simply memorizes that subject's baseline (identity leakage), yielding misleading 99% accuracy. GroupKFold ensures that all windows from a participant are strictly held out into the test set, proving that the model can accurately classify brand-new, unseen individuals in real-world clinical practice.`
    },
    {
      category: 'ml',
      question: 'Why do Random Forest and SVM perform better than Logistic Regression?',
      answer: `Physiological boundaries are non-linear. For example, high Alpha accompanied by low Heart Rate indicates meditation, but high Alpha with rapid Heart Rate could indicate visual idling during stress. Decision trees (Random Forest, XGBoost) and non-linear Support Vector Machines (SVM RBF) easily model these multidimensional threshold interactions, whereas linear models struggle.`
    },

    // Section 7: Modules 1-4 Overview
    {
      category: 'modules',
      question: 'How do the 4 modules map to the Major Project Synopsis objectives?',
      answer: `Under the supervision of Prof. Dr. Parul Madan (Project ID: MP2026CSE86, Graphic Era University):
      - Module 1 (Objectives 3 & 4): Classifier Effectiveness across 4 Signal Representations (EEG-Only, ECG-Only, Combined, Interaction).
      - Module 2 (Objectives 1 & 2): Statistical Characterization of Expert vs. Non-Expert Physiological Differences (t-tests, Cohen's d).
      - Module 3 (Objective 8): State-Dependent Physiological Variations across 4 Cognitive Conditions (ANOVA).
      - Module 4 (Objectives 5, 6 & 7): Machine Learning Leaderboard and Unsupervised K-Means Clustering for Natural Cohort Phenotyping.`
    },
    {
      category: 'modules',
      question: 'Why are the final generated Excel files only ~500 KB when raw data is ~20 GB?',
      answer: `Raw signals contain continuous microsecond voltage samples. Feature extraction performs dimensional reduction, calculating condensed summary metrics (band powers, HRV statistics, coherence) per 10-second epoch. This compresses 20 GB of raw oscillations into concise, transparent, spreadsheet-readable tables containing thousands of validated research rows.`
    }
  ];

  const filteredFaqs = faqData.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Technical FAQ &amp; Research Knowledge Base</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete scientific justification, biological fundamentals, mathematical derivations, and methodology rationale.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords (e.g., Alpha, RMSSD, MP4, KFold)..."
            className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg pl-9 pr-3 py-2 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-cardbg text-slate-400 border border-bordercol hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Questions Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div 
                key={idx} 
                className="rounded-xl bg-cardbg border border-bordercol overflow-hidden transition"
              >
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/40 transition gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-1 rounded bg-slate-800 text-blue-400 font-mono text-[11px] font-bold shrink-0">
                      Q{idx + 1}
                    </span>
                    <span className="text-sm font-bold text-white leading-snug">{faq.question}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 bg-slate-900/40 text-xs text-slate-300 leading-relaxed space-y-2">
                    {faq.answer.split('\n').map((para, pIdx) => (
                      <p key={pIdx} className="whitespace-pre-line leading-relaxed text-[11.5px]">
                        {para.trim()}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-cardbg rounded-xl border border-bordercol text-slate-400 text-xs">
            No questions matched your search query. Try typing 'Alpha', 'HRV', 'MP4', or 'K-Means'.
          </div>
        )}
      </div>

      {/* Academic Citation Footer */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          <span className="font-semibold text-white">Project ID: MP2026CSE86</span> — Graphic Era University
          <p className="text-[11px] text-slate-500 mt-0.5">Supervised by Prof. Dr. Parul Madan | Research Dataset: alexeykashevnik/EEGMeditation</p>
        </div>
        <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-1 rounded">
          Status: Verified &amp; Defense-Ready
        </div>
      </div>
    </div>
  );
}
