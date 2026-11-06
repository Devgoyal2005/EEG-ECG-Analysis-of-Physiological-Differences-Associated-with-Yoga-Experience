import React, { useEffect, useRef, useState } from 'react';

export default function FileSizeAccumulator() {
  const [accumPct, setAccumPct] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAccumPct(100);
        }
      },
      { threshold: 0.25 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300 font-medium">Session Memory Footprint Accumulation</span>
        <span className="font-mono text-emerald-400 font-bold">~1,382 MB total</span>
      </div>

      {/* Progress container */}
      <div className="h-6 w-full bg-slate-800 rounded-xl overflow-hidden p-1 relative flex">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 rounded-lg transition-all duration-1000 ease-out flex items-center justify-end pr-2"
          style={{ width: `${accumPct}%` }}
        >
          <span className="text-[10px] text-white font-mono font-bold">86,400,000 samples</span>
        </div>
      </div>

      {/* Breakdown metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-2">
        <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
          <div className="text-slate-500 text-[10px] uppercase">Sampling</div>
          <div className="text-white font-bold text-sm mt-0.5">500 Hz</div>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
          <div className="text-slate-500 text-[10px] uppercase">Lead Count</div>
          <div className="text-white font-bold text-sm mt-0.5">64 Scalp Ch</div>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
          <div className="text-slate-500 text-[10px] uppercase">Raw Values</div>
          <div className="text-white font-bold text-sm mt-0.5">32-bit Float</div>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
          <div className="text-slate-500 text-[10px] uppercase">Session Length</div>
          <div className="text-white font-bold text-sm mt-0.5">~45 Minutes</div>
        </div>
      </div>
    </div>
  );
}
