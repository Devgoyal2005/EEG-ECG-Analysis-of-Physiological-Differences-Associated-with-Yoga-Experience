import React from 'react';

// 10-20 System electrode positions on a normalized 200x220 head oval
// (cx, cy) are percentages of SVG viewBox
const ELECTRODES = [
  // Frontal
  { id: 'Fp1', x: 72, y: 22, region: 'frontal' },
  { id: 'Fpz', x: 100, y: 18, region: 'frontal' },
  { id: 'Fp2', x: 128, y: 22, region: 'frontal' },
  { id: 'AF7', x: 55, y: 38, region: 'frontal' },
  { id: 'AF3', x: 80, y: 36, region: 'frontal' },
  { id: 'AF4', x: 120, y: 36, region: 'frontal' },
  { id: 'AF8', x: 145, y: 38, region: 'frontal' },
  { id: 'F7',  x: 46, y: 60, region: 'frontal' },
  { id: 'F3',  x: 76, y: 56, region: 'frontal' },
  { id: 'Fz',  x: 100, y: 52, region: 'frontal' },
  { id: 'F4',  x: 124, y: 56, region: 'frontal' },
  { id: 'F8',  x: 154, y: 60, region: 'frontal' },
  // Frontal-Central
  { id: 'FT9', x: 32, y: 82, region: 'central' },
  { id: 'FT7', x: 44, y: 80, region: 'central' },
  { id: 'FC5', x: 60, y: 76, region: 'central' },
  { id: 'FC1', x: 84, y: 74, region: 'central' },
  { id: 'FC2', x: 116, y: 74, region: 'central' },
  { id: 'FC6', x: 140, y: 76, region: 'central' },
  { id: 'FT8', x: 156, y: 80, region: 'central' },
  { id: 'FT10',x: 168, y: 82, region: 'central' },
  // Central
  { id: 'T7',  x: 36, y: 102, region: 'temporal' },
  { id: 'C5',  x: 56, y: 100, region: 'central' },
  { id: 'C3',  x: 74, y: 98, region: 'central' },
  { id: 'C1',  x: 88, y: 96, region: 'central' },
  { id: 'Cz',  x: 100, y: 94, region: 'central' },
  { id: 'C2',  x: 112, y: 96, region: 'central' },
  { id: 'C4',  x: 126, y: 98, region: 'central' },
  { id: 'C6',  x: 144, y: 100, region: 'central' },
  { id: 'T8',  x: 164, y: 102, region: 'temporal' },
  // Temporal-Parietal
  { id: 'M1',  x: 30, y: 118, region: 'temporal' },
  { id: 'TP7', x: 44, y: 120, region: 'temporal' },
  { id: 'CP5', x: 62, y: 118, region: 'parietal' },
  { id: 'CP1', x: 84, y: 116, region: 'parietal' },
  { id: 'CPz', x: 100, y: 115, region: 'parietal' },
  { id: 'CP2', x: 116, y: 116, region: 'parietal' },
  { id: 'CP6', x: 138, y: 118, region: 'parietal' },
  { id: 'TP8', x: 156, y: 120, region: 'temporal' },
  { id: 'M2',  x: 170, y: 118, region: 'temporal' },
  // Parietal
  { id: 'P7',  x: 50, y: 138, region: 'parietal' },
  { id: 'P5',  x: 64, y: 136, region: 'parietal' },
  { id: 'P3',  x: 78, y: 134, region: 'parietal' },
  { id: 'P1',  x: 90, y: 134, region: 'parietal' },
  { id: 'Pz',  x: 100, y: 133, region: 'parietal' },
  { id: 'P2',  x: 110, y: 134, region: 'parietal' },
  { id: 'P4',  x: 122, y: 134, region: 'parietal' },
  { id: 'P6',  x: 136, y: 136, region: 'parietal' },
  { id: 'P8',  x: 150, y: 138, region: 'parietal' },
  // Parieto-Occipital
  { id: 'PO7', x: 60, y: 154, region: 'occipital' },
  { id: 'PO3', x: 78, y: 152, region: 'occipital' },
  { id: 'POz', x: 100, y: 150, region: 'occipital' },
  { id: 'PO4', x: 122, y: 152, region: 'occipital' },
  { id: 'PO8', x: 140, y: 154, region: 'occipital' },
  // Occipital
  { id: 'O1',  x: 76, y: 168, region: 'occipital' },
  { id: 'Oz',  x: 100, y: 170, region: 'occipital' },
  { id: 'O2',  x: 124, y: 168, region: 'occipital' },
  { id: 'Iz',  x: 100, y: 184, region: 'occipital' },
  // Some extra standard channels
  { id: 'F5',  x: 62, y: 58, region: 'frontal' },
  { id: 'F1',  x: 88, y: 54, region: 'frontal' },
  { id: 'F2',  x: 112, y: 54, region: 'frontal' },
  { id: 'F6',  x: 138, y: 58, region: 'frontal' },
  { id: 'FC3', x: 72, y: 76, region: 'central' },
  { id: 'FC4', x: 128, y: 76, region: 'central' },
  { id: 'CP3', x: 72, y: 116, region: 'parietal' },
  { id: 'CP4', x: 128, y: 116, region: 'parietal' },
];

const REGION_COLORS = {
  frontal: '#3B82F6',   // blue
  central: '#8B5CF6',   // purple
  temporal: '#F59E0B',  // amber
  parietal: '#10B981',  // emerald
  occipital: '#EC4899', // pink
};

export default function ElectrodeHeadSVG({ highlighted = [], size = 280 }) {
  return (
    <div style={{ width: size, height: size }}>
      <svg viewBox="10 0 180 220" width={size} height={size}>
        {/* Head outline oval */}
        <ellipse cx="100" cy="102" rx="78" ry="92" fill="none" stroke="#334155" strokeWidth="2" />

        {/* Nose */}
        <path d="M 92 12 Q 100 2 108 12" fill="none" stroke="#334155" strokeWidth="1.5" />

        {/* Left & right ears */}
        <path d="M 22 95 Q 14 102 22 110" fill="none" stroke="#334155" strokeWidth="1.5" />
        <path d="M 178 95 Q 186 102 178 110" fill="none" stroke="#334155" strokeWidth="1.5" />

        {/* Central cross-hair lines */}
        <line x1="100" y1="10" x2="100" y2="194" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="4 4" />
        <line x1="22" y1="102" x2="178" y2="102" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="4 4" />

        {/* Electrodes */}
        {ELECTRODES.map(e => {
          const isHighlighted = highlighted.includes(e.id);
          const color = REGION_COLORS[e.region] || '#6b7280';
          return (
            <g key={e.id}>
              <circle
                cx={e.x} cy={e.y} r={isHighlighted ? 5.5 : 4}
                fill={isHighlighted ? color : '#1e293b'}
                stroke={color}
                strokeWidth={isHighlighted ? 2 : 1.2}
                style={{ transition: 'all 0.3s ease' }}
              />
              {isHighlighted && (
                <text
                  x={e.x} y={e.y - 7}
                  textAnchor="middle"
                  fill={color}
                  fontSize="6"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {e.id}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export { ELECTRODES };
