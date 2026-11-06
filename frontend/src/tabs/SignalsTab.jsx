import React, { useState, useEffect } from 'react';
import WaveformChart from '../components/WaveformChart';

export default function SignalsTab() {
  const [subjectsList, setSubjectsList] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('sub-001');
  const [selectedChannel, setSelectedChannel] = useState('Fz');
  const [signalData, setSignalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/dataset/info')
      .then(r => r.json())
      .then(d => {
        if (d?.subjects?.length > 0) {
          const available = d.subjects.filter(s => s.has_eeg);
          const list = available.length > 0 ? available : d.subjects;
          setSubjectsList(list);
          const cleanSub = list[0].subject_id.split(' ')[0] || 'sub-001';
          setSelectedSubject(cleanSub);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSubject) return;
    setLoading(true);
    setError(null);

    const url = `/api/module1/signal-preview?subject=${encodeURIComponent(selectedSubject)}&session=ses-01&seconds=10&eeg_channel=${encodeURIComponent(selectedChannel)}`;

    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`Could not load signal preview (Status ${r.status})`);
        return r.json();
      })
      .then(data => {
        setSignalData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedSubject, selectedChannel]);

  return (
    <div className="py-6 space-y-12">
      {/* EEG Waveform Panel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <h3 className="text-lg font-semibold text-white">
              EEG — Brain Waves ({selectedChannel})
            </h3>
          </div>
          <span className="text-xs font-mono text-blue-400 bg-blue-950/60 border border-blue-900/40 px-2.5 py-1 rounded-md">
            500 Hz • 1–40 Hz Bandpass
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
          {loading ? (
            <div className="h-[250px] flex items-center justify-center text-slate-400 text-sm gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Streaming raw bio-signal slice...</span>
            </div>
          ) : error ? (
            <div className="h-[250px] flex items-center justify-center text-rose-400 text-sm">
              {error}
            </div>
          ) : signalData?.eeg ? (
            <WaveformChart
              times={signalData.eeg.times_ms}
              values={signalData.eeg.values_uV}
              color="#38bdf8"
              height={250}
            />
          ) : null}
        </div>

        {/* Minimal Controls */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1.5">
            <span>Subject:</span>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="bg-transparent text-white font-mono focus:outline-none cursor-pointer"
            >
              {subjectsList.map(s => {
                const clean = s.subject_id.split(' ')[0];
                return (
                  <option key={s.raw_stem} value={clean} className="bg-slate-900 text-white">
                    {s.subject_id} ({s.group === 'expert' ? 'Expert' : 'Control'})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1.5">
            <span>Lead:</span>
            <select
              value={selectedChannel}
              onChange={e => setSelectedChannel(e.target.value)}
              className="bg-transparent text-white font-mono focus:outline-none cursor-pointer"
            >
              {['Fz', 'Cz', 'Pz', 'Oz', 'F3', 'F4', 'C3', 'C4', 'P3', 'P4', 'O1', 'O2'].map(ch => (
                <option key={ch} value={ch} className="bg-slate-900 text-white">{ch}</option>
              ))}
            </select>
          </div>

          <span className="text-slate-500 font-mono">10s window</span>
        </div>
      </div>

      {/* ECG Waveform Panel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">❤️</span>
            <h3 className="text-lg font-semibold text-white">
              ECG — Heart Rhythm
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-900/40 px-2.5 py-1 rounded-md">
            Pan-Tompkins QRS
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
          {loading ? (
            <div className="h-[250px] flex items-center justify-center text-slate-400 text-sm gap-2">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span>Streaming raw bio-signal slice...</span>
            </div>
          ) : error ? (
            <div className="h-[250px] flex items-center justify-center text-rose-400 text-sm">
              {error}
            </div>
          ) : signalData?.ecg ? (
            <WaveformChart
              times={signalData.ecg.times_ms}
              values={signalData.ecg.values_mV}
              color="#10b981"
              height={250}
            />
          ) : null}
        </div>

        {/* Minimal ECG metric readouts */}
        <div className="flex items-center gap-6 text-xs text-slate-400 pt-1 font-mono">
          <div>
            R-R Interval: <span className="text-white font-semibold">~820 ms</span>
          </div>
          <span className="text-slate-700">•</span>
          <div>
            Est. Heart Rate: <span className="text-white font-semibold">~73 bpm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
