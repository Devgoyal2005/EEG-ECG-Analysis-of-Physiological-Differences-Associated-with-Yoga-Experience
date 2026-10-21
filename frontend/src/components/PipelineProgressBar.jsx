import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, AlertCircle, Loader2, Download, XCircle } from 'lucide-react';

export default function PipelineProgressBar({ onPipelineCompleted }) {
  const [status, setStatus] = useState({
    is_running: false,
    current_step: "idle",
    progress_pct: 0,
    message: "Ready to run"
  });
  const [downloadStatus, setDownloadStatus] = useState({
    is_downloading: false,
    current_file: null,
    current_subject: null,
    completed_files: 0,
    total_files: 0,
    progress_pct: 0,
    speed_mb_s: 0,
    message: "Ready",
    error: null
  });
  const [triggering, setTriggering] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Poll status for pipeline and background download
  useEffect(() => {
    let intervalId;
    const fetchAllStatus = async () => {
      try {
        const [pipeRes, dlRes] = await Promise.all([
          fetch('/api/pipeline/status'),
          fetch('/api/dataset/download-status')
        ]);
        if (pipeRes.ok) {
          const data = await pipeRes.json();
          setStatus(data);
          if (!data.is_running && data.progress_pct === 100) {
            if (onPipelineCompleted) onPipelineCompleted();
          }
        }
        if (dlRes.ok) {
          const dlData = await dlRes.json();
          setDownloadStatus(dlData);
        }
      } catch (err) {
        // Backend starting or network hiccup
      }
    };

    fetchAllStatus();
    intervalId = setInterval(fetchAllStatus, 2000);
    return () => clearInterval(intervalId);
  }, [onPipelineCompleted]);

  const handleRunPipeline = async () => {
    setTriggering(true);
    try {
      const res = await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ use_synthetic_if_empty: true, num_synthetic_subjects: 6 })
      });
      await res.json();
    } catch (err) {
      console.error('Failed to trigger pipeline:', err);
    } finally {
      setTriggering(false);
    }
  };

  const handleDownloadHF = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/dataset/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.status === 'already_running') {
        alert('Dataset download is already in progress and resuming!');
      }
    } catch (err) {
      console.error('Failed to trigger download:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCancelDownload = async () => {
    try {
      await fetch('/api/dataset/cancel-download', { method: 'POST' });
    } catch (err) {
      console.error('Failed to cancel download:', err);
    }
  };

  return (
    <div className="bg-cardbg border border-bordercol rounded-xl p-4 mb-6 shadow-sm space-y-3">
      {/* Active Download Banner if downloading */}
      {downloadStatus.is_downloading && (
        <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-600/40 text-blue-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-white">
                  🤗 Hugging Face Sync Active (Resumable)
                </span>
                <span className="text-[10px] ml-2 text-cyan-300 font-mono">
                  {downloadStatus.speed_mb_s > 0 ? `${downloadStatus.speed_mb_s} MB/s` : 'Resuming...'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-300 font-mono">
                File {downloadStatus.completed_files} of {downloadStatus.total_files} ({downloadStatus.progress_pct}%)
              </span>
              <button
                onClick={handleCancelDownload}
                className="text-[10px] px-2 py-0.5 rounded bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700/50 transition"
              >
                Pause
              </button>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${Math.max(downloadStatus.progress_pct, 5)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-300 mt-1 truncate">
            {downloadStatus.message}
          </p>
        </div>
      )}

      {/* Main Pipeline Engine Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            status.is_running ? 'bg-blue-500/10 text-blue-400' :
            status.progress_pct === 100 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
          }`}>
            {status.is_running ? <Loader2 className="w-5 h-5 animate-spin" /> :
             status.progress_pct === 100 ? <CheckCircle2 className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-white">Pipeline Execution Engine</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${
                status.is_running ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50' :
                status.progress_pct === 100 ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' :
                'bg-slate-800 text-slate-400'
              }`}>
                {status.is_running ? 'Running' : status.progress_pct === 100 ? 'Completed' : 'Idle'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{status.message}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleDownloadHF}
            disabled={downloading || downloadStatus.is_downloading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
            title="Download/resume dataset from alexeykashevnik/EEGMeditation"
          >
            {downloadStatus.is_downloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                <span>Syncing ({downloadStatus.progress_pct}%)</span>
              </>
            ) : (
              <>
                <span>🤗</span>
                <span>Download / Resume HF</span>
              </>
            )}
          </button>

          <button
            onClick={handleRunPipeline}
            disabled={status.is_running || triggering}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primaryblue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-xs font-semibold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status.is_running ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Run Pipeline
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 rounded-full ${
            status.progress_pct === 100 
              ? 'bg-gradient-to-r from-secondarygreen to-emerald-400' 
              : 'bg-gradient-to-r from-primaryblue via-accentpurple to-blue-400'
          }`}
          style={{ width: `${Math.max(status.progress_pct, status.is_running ? 10 : 0)}%` }}
        />
      </div>
      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
        <span>Step: {status.current_step}</span>
        <span>{status.progress_pct}%</span>
      </div>
    </div>
  );
}
