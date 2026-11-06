import React, { useEffect, useRef, useState } from 'react';

const BANDS = [
  { name: 'Delta',  range: '0.5–4 Hz',  color: '#6366f1', desc: 'Deep sleep, unconscious processing', pct: 100 },
  { name: 'Theta',  range: '4–8 Hz',    color: '#8B5CF6', desc: 'Meditation, creativity, drowsiness', pct: 82 },
  { name: 'Alpha',  range: '8–13 Hz',   color: '#3B82F6', desc: 'Calm alertness, eyes closed, mindfulness', pct: 68 },
  { name: 'Beta',   range: '13–30 Hz',  color: '#10B981', desc: 'Active thinking, focus, stress', pct: 54 },
  { name: 'Gamma',  range: '30–45 Hz',  color: '#F59E0B', desc: 'High focus, complex cognition', pct: 36 },
];

export default function FrequencyBands({ animate = false }) {
  const [widths, setWidths] = useState(BANDS.map(() => 0));
  const ref = useRef(null);
  const fired = useRef(false);

  useEffect(() => {
    if (!animate) {
      setWidths(BANDS.map(b => b.pct));
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true;
          BANDS.forEach((b, i) => {
            setTimeout(() => {
              setWidths(prev => {
                const next = [...prev];
                next[i] = b.pct;
                return next;
              });
            }, i * 160);
          });
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [animate]);

  return (
    <div ref={ref} className="space-y-3 w-full">
      {BANDS.map((band, i) => (
        <div key={band.name} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white w-10">{band.name}</span>
              <span className="text-slate-500 font-mono">{band.range}</span>
            </div>
            <span className="text-slate-400 text-xs hidden sm:block">{band.desc}</span>
          </div>
          <div className="h-5 bg-slate-800/80 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full flex items-center pl-2 transition-all duration-700 ease-out"
              style={{
                width: `${widths[i]}%`,
                backgroundColor: band.color,
                transitionDelay: `${i * 100}ms`,
                minWidth: widths[i] > 0 ? '8px' : '0',
              }}
            />
          </div>
        </div>
      ))}
      <p className="text-xs text-slate-500 pt-1">
        Bar width = relative amplitude contribution in a typical resting EEG
      </p>
    </div>
  );
}
