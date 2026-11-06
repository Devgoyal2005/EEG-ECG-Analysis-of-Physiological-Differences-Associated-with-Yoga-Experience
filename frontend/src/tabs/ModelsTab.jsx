import React, { useState, useEffect } from 'react';
import ModelBarsChart from '../components/ModelBarsChart';
import ScatterPlot from '../components/ScatterPlot';
import ConfusionHeatmap from '../components/ConfusionHeatmap';
import FeatureImportance from '../components/FeatureImportance';

export default function ModelsTab() {
  const [modality, setModality] = useState('ecg'); // 'eeg' | 'ecg' | 'combined'
  const [selectedModel, setSelectedModel] = useState('SVM (Linear)');
  const [benchmark, setBenchmark] = useState(null);
  const [scatterData, setScatterData] = useState(null);
  const [confusionData, setConfusionData] = useState(null);
  const [topFeatures, setTopFeatures] = useState([]);
  const [showBoundary, setShowBoundary] = useState(true);

  // Fetch benchmark data & top features on modality change
  useEffect(() => {
    fetch(`/api/module1/benchmark?modality=${modality}`)
      .then(r => r.json())
      .then(d => {
        setBenchmark(d);
        if (d.top3?.length > 0) {
          const names = d.top3.map(m => m.model);
          if (!names.includes(selectedModel)) {
            setSelectedModel(d.top3[0].model);
          }
        }
      })
      .catch(() => {});

    // Fetch top features from module1 results
    fetch('/api/module1/results')
      .then(r => r.json())
      .then(d => {
        if (d.top_features?.length > 0) {
          setTopFeatures(d.top_features);
        }
      })
      .catch(() => {});
  }, [modality]);

  // Fetch scatter plot & confusion matrix when selected model or modality changes
  useEffect(() => {
    fetch(`/api/module1/pca-scatter?modality=${modality}&model=${encodeURIComponent(selectedModel)}`)
      .then(r => r.json())
      .then(d => setScatterData(d))
      .catch(() => {});

    fetch(`/api/module1/confusion-matrix?modality=${modality}&model=${encodeURIComponent(selectedModel)}`)
      .then(r => r.json())
      .then(d => setConfusionData(d))
      .catch(() => {});
  }, [modality, selectedModel]);

  const modelsList = benchmark?.all_models?.length
    ? benchmark.all_models
    : [
        { model: 'SVM (Linear)', accuracy: 93.04, f1_score: 96.40 },
        { model: 'SVM (RBF)', accuracy: 93.04, f1_score: 96.40 },
        { model: 'Logistic Regression', accuracy: 92.98, f1_score: 96.36 },
        { model: 'XGBoost', accuracy: 92.94, f1_score: 96.34 },
        { model: 'Random Forest', accuracy: 92.92, f1_score: 96.33 },
      ];

  return (
    <div className="py-6 space-y-8">
      {/* ─── MODALITY SELECTOR BAR ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/80">
          {[
            { id: 'eeg', label: 'EEG Only' },
            { id: 'ecg', label: 'ECG Only' },
            { id: 'combined', label: 'EEG + ECG Combined' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setModality(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                modality === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Boundary visibility toggle */}
        <button
          onClick={() => setShowBoundary(!showBoundary)}
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800 px-3 py-2 rounded-lg transition"
        >
          <span className={`w-2.5 h-2.5 rounded-full ${showBoundary ? 'bg-pink-500' : 'bg-slate-600'}`} />
          <span>{showBoundary ? 'Boundary Visible' : 'Boundary Hidden'}</span>
        </button>
      </div>

      {/* ─── 4-PANEL RICH ML DASHBOARD GRID ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* PANEL 1: Model Accuracy Bars */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4">
          <ModelBarsChart
            models={modelsList}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
          />
        </div>

        {/* PANEL 2: 2D PCA Scatter with Decision Boundary */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>2D PCA PROJECTION & SEPARATING HYPERPLANE</span>
            <span className="text-blue-400">{selectedModel}</span>
          </div>
          <ScatterPlot
            points={scatterData?.points || []}
            boundaryLine={showBoundary ? (scatterData?.boundary_line || []) : []}
            height={320}
          />
        </div>

        {/* PANEL 3: Confusion Matrix Heatmap */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
          <ConfusionHeatmap cm={confusionData} modelName={selectedModel} />
        </div>

        {/* PANEL 4: Feature Importance Biomarkers */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
          <FeatureImportance features={topFeatures} />
        </div>
      </div>
    </div>
  );
}
