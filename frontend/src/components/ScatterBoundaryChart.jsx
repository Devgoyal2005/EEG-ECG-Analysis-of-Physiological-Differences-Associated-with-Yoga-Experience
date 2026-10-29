import React from 'react';
import {
  ComposedChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Cpu, Zap } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const pt = payload[0].payload;
    if (pt.group) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs shadow-xl">
          <div className="flex items-center gap-1.5 font-semibold">
            <span className={`w-2.5 h-2.5 rounded-full ${pt.group === 'expert' ? 'bg-sky-400' : 'bg-amber-400'}`} />
            <span className={pt.group === 'expert' ? 'text-sky-300' : 'text-amber-300'}>
              {pt.group === 'expert' ? 'Yoga Practitioner' : 'Control Subject'}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-300 font-mono space-y-0.5">
            <div>Subject: <span className="text-white">{pt.subject || 'N/A'}</span></div>
            <div>State: <span className="text-slate-400 capitalize">{pt.state?.replace('_', ' ') || 'Resting'}</span></div>
            <div className="text-slate-500 text-[10px]">PC1: {pt.x?.toFixed(2)} | PC2: {pt.y?.toFixed(2)}</div>
          </div>
        </div>
      );
    }
  }
  return null;
};

export default function ScatterBoundaryChart({
  scatterData = {},
  selectedModel = 'SVM (Linear)',
  onSelectModel,
  availableModels = ['Logistic Regression', 'SVM (Linear)', 'SVM (RBF)', 'XGBoost'],
  height = 360
}) {
  const points = scatterData.points || [];
  const boundaryLine = scatterData.boundary_line || [];
  const isLinear = scatterData.is_linear !== false;
  const acc2D = scatterData.acc_2d || 0;

  // Split points for legend & color separation
  const expertPts = points.filter(p => p.group === 'expert');
  const controlPts = points.filter(p => p.group === 'control');

  // Find min/max bounds for axes
  const bounds = scatterData.bounds || {};
  const xMin = bounds.x_min ?? -4;
  const xMax = bounds.x_max ?? 4;
  const yMin = bounds.y_min ?? -4;
  const yMax = bounds.y_max ?? 4;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
      {/* Header with Title and Model Selector Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            <h4 className="text-sm font-semibold text-white">
              PCA Feature Space &amp; Classifier Decision Boundary
            </h4>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            2D projection of bio-signal epochs with separating hyperplane / decision curve
          </p>
        </div>

        {/* Model Switcher Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-lg border border-slate-800 self-start sm:self-auto overflow-x-auto">
          {availableModels.map(m => {
            const isActive = selectedModel === m;
            return (
              <button
                key={m}
                onClick={() => onSelectModel && onSelectModel(m)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accuracy & Boundary Info Bar */}
      <div className="flex items-center justify-between text-xs px-2 py-1 mb-2 bg-slate-950/40 rounded border border-slate-800/60">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-300 text-[11px]">
            Model: <strong className="text-white">{selectedModel}</strong>
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-[11px] text-slate-400">
            Type: <span className="text-slate-300 font-mono">{isLinear ? 'Linear Hyperplane' : 'Non-Linear Boundary'}</span>
          </span>
        </div>
        <div className="text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
          2D Fit Acc: {acc2D}%
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart margin={{ top: 10, right: 15, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[xMin, xMax]}
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickFormatter={v => v.toFixed(1)}
              name="PC1"
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[yMin, yMax]}
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickFormatter={v => v.toFixed(1)}
              name="PC2"
              width={35}
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '8px', fontSize: '11px' }}
            />

            {/* Expert Scatter Points (Blue/Cyan) */}
            <Scatter
              name="Yoga Experts (Class 1)"
              data={expertPts}
              fill="#38bdf8"
              fillOpacity={0.85}
            />

            {/* Control Scatter Points (Amber/Orange) */}
            <Scatter
              name="Controls (Class 0)"
              data={controlPts}
              fill="#f59e0b"
              fillOpacity={0.85}
            />

            {/* Classifier Decision Boundary Line (Glowing Pink/Magenta) */}
            {boundaryLine && boundaryLine.length > 1 && (
              <Line
                name="Decision Boundary"
                data={boundaryLine}
                dataKey="y"
                stroke="#ec4899"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Reading Advice */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60 mt-1">
        <span>● Blue = Yoga Experts | ● Orange = Control Group</span>
        <span className="text-pink-400 font-mono">— Pink Line = Decision Boundary Line</span>
      </div>
    </div>
  );
}
