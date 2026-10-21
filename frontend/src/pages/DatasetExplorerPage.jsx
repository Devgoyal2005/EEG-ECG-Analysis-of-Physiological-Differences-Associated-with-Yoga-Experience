import React, { useState, useEffect } from 'react';
import { 
  Database, 
  HardDrive, 
  Key, 
  CheckCircle2, 
  Download, 
  Loader2, 
  FileText, 
  FolderCheck,
  ShieldCheck,
  Users,
  RefreshCw,
  XCircle,
  Play,
  HelpCircle,
  Info,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';

export default function DatasetExplorerPage() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customToken, setCustomToken] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState('');
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

  const fetchInfo = async () => {
    try {
      const res = await fetch('/api/dataset/info');
      if (res.ok) {
        const data = await res.json();
        setInfo(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDownloadStatus = async () => {
    try {
      const res = await fetch('/api/dataset/download-status');
      if (res.ok) {
        const data = await res.json();
        setDownloadStatus(prev => {
          if (prev.is_downloading && !data.is_downloading) {
            // Refresh info once download completes
            fetchInfo();
          }
          return data;
        });
      }
    } catch (err) {
      // Backend starting
    }
  };

  useEffect(() => {
    fetchInfo();
    fetchDownloadStatus();
    const interval = setInterval(fetchDownloadStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleDownload = async (options = {}) => {
    setDownloading(true);
    setDownloadMsg('');
    try {
      const res = await fetch('/api/dataset/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: customToken.trim() || undefined,
          max_subjects: options.max_subjects,
          metadata_only: options.metadata_only
        })
      });
      const data = await res.json();
      setDownloadMsg(data.message || 'Download started/resumed in background!');
      setTimeout(fetchDownloadStatus, 1000);
    } catch (err) {
      setDownloadMsg('Failed to trigger download: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleCancel = async () => {
    try {
      await fetch('/api/dataset/cancel-download', { method: 'POST' });
      setDownloadMsg('Cancellation requested. Pausing download...');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Database className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Dataset &amp; Local Storage Explorer</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Inspection of local disk recordings, BrainVision files (.vhdr, .vmrk, .eeg), and resilient Hugging Face synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownload({})}
            disabled={downloading || downloadStatus.is_downloading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primaryblue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
            title="Resumes download for all files, skipping already completed files"
          >
            {downloadStatus.is_downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>🤗</span>}
            <span>{downloadStatus.is_downloading ? 'Syncing...' : 'Resume / Sync Dataset'}</span>
          </button>
        </div>
      </div>

      {/* Live Download Status Monitor Card */}
      {downloadStatus.is_downloading && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border border-blue-500/50 shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Hugging Face Resumable Stream
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                    HTTP Range 206 Active
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                  Subject: <strong className="text-white">{downloadStatus.current_subject || 'Loading'}</strong> | File: <span className="text-cyan-300">{downloadStatus.current_file || 'syncing...'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-white">
                  {downloadStatus.speed_mb_s > 0 ? `${downloadStatus.speed_mb_s} MB/s` : 'Resuming...'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {downloadStatus.completed_files} / {downloadStatus.total_files} files ({downloadStatus.progress_pct}%)
                </div>
              </div>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 rounded-lg text-xs font-semibold transition"
              >
                Pause
              </button>
            </div>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${Math.max(downloadStatus.progress_pct, 4)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="truncate">{downloadStatus.message}</span>
            <span className="text-slate-500 shrink-0 ml-2">Files already on disk are skipped automatically</span>
          </div>
        </div>
      )}

      {downloadMsg && (
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{downloadMsg}</span>
          </div>
          <button onClick={() => setDownloadMsg('')} className="text-slate-400 hover:text-white">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-cardbg border border-bordercol">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Repository Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white truncate" title={info?.repo}>
            {info?.repo || 'alexeykashevnik/EEGMeditation'}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Token: {info?.token_snippet || 'Authenticated'}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-cardbg border border-bordercol">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Local Subject Cohort</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {info?.total_recordings_found || 0} Recordings
          </div>
          <span className="text-[11px] text-slate-400">Saved permanently in backend/data/raw/</span>
        </div>

        <div className="p-4 rounded-xl bg-cardbg border border-bordercol">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Disk Space Used</span>
            <HardDrive className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {info?.disk_size_mb || 0} MB
          </div>
          <span className="text-[11px] text-slate-400">Drive D: safe buffer maintained</span>
        </div>
      </div>

      {/* Download Options Panel */}
      <div className="p-4 rounded-xl bg-slate-900 border border-bordercol">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="text-xs font-semibold text-white">Download Management &amp; Resume Control</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Downloads use HTTP Range requests. When clicking download, the downloader checks all local files and resumes from where it stopped without restarting.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleDownload({ max_subjects: 5 })}
              disabled={downloading || downloadStatus.is_downloading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition disabled:opacity-50"
              title="Download next 5 subjects to conserve disk space"
            >
              Sync Next 5 Subjects
            </button>
            <button
              onClick={() => handleDownload({ metadata_only: true })}
              disabled={downloading || downloadStatus.is_downloading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition disabled:opacity-50"
              title="Sync all headers, annotations, and TSV files without multi-GB EEG binaries"
            >
              Headers &amp; Markers Only (&lt;10 MB)
            </button>
            <button
              onClick={() => handleDownload({})}
              disabled={downloading || downloadStatus.is_downloading}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
              title="Resume downloading all subjects in repository"
            >
              Resume All Subjects
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Target Directory: {info?.raw_data_dir || 'd:\\...\\backend\\data\\raw'}</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 15 BIDS recordings already complete
          </span>
        </div>
      </div>

      {/* Subjects Grid Table */}
      <div className="p-5 rounded-xl bg-cardbg border border-bordercol">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-white">Subject Recordings Available Locally</h4>
          <span className="text-xs text-slate-400 font-mono">
            {info?.subjects?.length || 0} Recordings Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-bordercol text-slate-400">
                <th className="py-2.5 px-3">Subject ID</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3">BrainVision Header (.vhdr)</th>
                <th className="py-2.5 px-3">Raw Signal (.eeg)</th>
                <th className="py-2.5 px-3">Marker File (.vmrk)</th>
                <th className="py-2.5 px-3">Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bordercol font-mono text-slate-300">
              {info?.subjects && info.subjects.length > 0 ? (
                info.subjects.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-sans font-medium text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                      {s.subject_id}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        s.group === 'expert' 
                          ? 'bg-blue-950 text-blue-300 border border-blue-800' 
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {s.group === 'expert' ? 'Yoga Expert' : 'Control'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Present
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {s.has_eeg ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Present
                        </span>
                      ) : (
                        <span className="text-slate-500">Missing</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {s.has_vmrk ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Present
                        </span>
                      ) : (
                        <span className="text-slate-500">Missing</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{s.size_mb} MB</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-sans">
                    No BrainVision recordings detected yet. Click "Resume / Sync Dataset" above or click "Run Pipeline".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* HuggingFace BIDS Participants Demographic Table */}
      {info?.participants && info.participants.length > 0 && (
        <div className="p-5 rounded-xl bg-cardbg border border-bordercol">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-white">Study Participants Cohort (Hugging Face Metadata)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Official participant demographic context extracted from participants.tsv
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
              {info.participants.length} Study Participants
            </span>
          </div>

          <div className="overflow-x-auto max-h-80 border border-bordercol rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 sticky top-0 z-10 text-slate-300">
                <tr className="border-b border-bordercol">
                  <th className="py-2.5 px-3">Participant ID</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">Gender</th>
                  <th className="py-2.5 px-3">Age</th>
                  <th className="py-2.5 px-3">Yoga Experience (Years)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bordercol font-mono text-slate-300">
                {info.participants.map((p, idx) => {
                  const isControl = p.control === 1 || p.control === '1';
                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      <td className="py-2 px-3 font-sans font-medium text-white">{p.participant_id}</td>
                      <td className="py-2 px-3 font-sans">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          !isControl 
                            ? 'bg-blue-950 text-blue-300 border border-blue-800' 
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {!isControl ? 'Yoga Practitioner' : 'Control Group'}
                        </span>
                      </td>
                      <td className="py-2 px-3">{p.gender === 'F' ? 'Female (F)' : 'Male (M)'}</td>
                      <td className="py-2 px-3">{p.age} yrs</td>
                      <td className="py-2 px-3 font-semibold text-amber-400">
                        {p.experience !== null && p.experience !== undefined ? `${p.experience} years` : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Technical FAQ & Data Storage Justification */}
      <div className="p-5 rounded-xl bg-cardbg border border-bordercol space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <HelpCircle className="w-5 h-5" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-white">Technical FAQ: Storage, Data Volume &amp; Methodology</h4>
            <p className="text-[11px] text-slate-400">
              Scientific justification and architectural details for evaluators and academic supervisors
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* FAQ 1 */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-blue-300 font-semibold">
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <span>1. Why does raw physiological bio-signal data take so much storage space?</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              High-density clinical EEG records <strong>64 channels + 1 auxiliary ECG channel</strong> at a sampling rate of <strong>500 Hz</strong> (500 voltage samples every second per channel). Over a standard 45-minute (2,700s) recording:
            </p>
            <div className="p-2 rounded bg-slate-950 font-mono text-[10px] text-cyan-300 border border-slate-800">
              65 channels × 500 Hz × 2,700s = 87,750,000 raw samples / session<br/>
              87.75M samples × 4 bytes (float32) ≈ 877 MB to 1.5 GB per recording (.eeg)
            </div>
            <p className="text-slate-400 text-[11px]">
              A cohort of 15–19 recordings naturally equals ~19.5 GB of binary microvolt time-series data.
            </p>
          </div>

          {/* FAQ 2 */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>2. Why was .mp4 content downloading, and why is it now permanently deleted?</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              The BIDS repository included auxiliary webcam videos of participants in the <code>beh/</code> folder (<strong>~6 GB per video</strong>). These videos are <strong>completely irrelevant</strong> for electrical brain-heart coupling analysis.
            </p>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              The download engine now enforces a strict whitelist allowing <strong>only physiological files</strong> (<code>.vhdr</code>, <code>.vmrk</code>, <code>.eeg</code>, <code>.tsv</code>, <code>.json</code>) and permanently blocks all video formats. All previous <code>.mp4</code> video files have been purged, immediately freeing <strong>14.79 GB</strong> of drive space.
            </p>
          </div>

          {/* FAQ 3 */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>3. How much data is scientifically enough for our Major Project?</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              An academic study requires statistical power (sufficient degrees of freedom and cross-validation variance).
            </p>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Your current local cohort of <strong>15–19 recordings yields over 2,500 distinct 10-second windowed epochs</strong> across all 4 cognitive states (Resting, Internal Concentration, External Concentration, Mind-Wandering) for both Yoga Practitioners and Controls. This provides high statistical power for:
            </p>
            <ul className="list-disc list-inside text-slate-400 text-[10px] space-y-0.5">
              <li>Subject-independent 5-fold cross-validation (GroupKFold)</li>
              <li>Two-sample t-tests &amp; Mann-Whitney U tests (p &lt; 0.05, Cohen's d &gt; 0.8)</li>
              <li>4-State One-Way ANOVA and K-Means Clustering (K=2 to 6)</li>
            </ul>
          </div>

          {/* FAQ 4 */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-semibold">
              <FileSpreadsheet className="w-4 h-4 text-purple-400 shrink-0" />
              <span>4. Why are the final Excel reports only ~500 KB when raw data is ~20 GB?</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Raw data consists of continuous microvolt oscillations. Dimensionality reduction condenses each 10s epoch into structured biomarkers:
            </p>
            <ul className="list-disc list-inside text-slate-400 text-[10px] space-y-0.5">
              <li><strong>EEG Spectral Bands:</strong> Delta, Theta, Alpha, Beta, Gamma power via Welch's PSD</li>
              <li><strong>ECG HRV Metrics:</strong> Mean HR, SDNN, RMSSD, pNN50, LF, HF, and LF/HF ratio</li>
              <li><strong>Coupling:</strong> Frontal Alpha/Heart Rate coherence</li>
            </ul>
            <p className="text-slate-400 text-[11px]">
              This compresses 20 GB of raw oscillations into concise, transparent, spreadsheet-readable workbooks ready for project presentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
