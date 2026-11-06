import React from 'react';
import {
  ComposedChart, Scatter, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const Dot = ({ cx, cy, payload }) => {
  const fill = payload.group === 'expert' ? '#38bdf8' : '#f59e0b';
  return <circle cx={cx} cy={cy} r={4} fill={fill} fillOpacity={0.8} />;
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const pt = payload[0]?.payload;
  if (!pt?.group) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm shadow-xl">
      <span className={pt.group === 'expert' ? 'text-blue-400' : 'text-amber-400'}>
        {pt.group === 'expert' ? 'Yoga Expert' : 'Control'}
      </span>
      <span className="text-slate-500 ml-2 text-xs">{pt.subject}</span>
    </div>
  );
};

export default function ScatterPlot({ points = [], boundaryLine = [], height = 400 }) {
  const experts = points.filter(p => p.group === 'expert');
  const controls = points.filter(p => p.group === 'control');

  const allX = points.map(p => p.x);
  const allY = points.map(p => p.y);
  const xMin = Math.min(...allX) - 0.5;
  const xMax = Math.max(...allX) + 0.5;
  const yMin = Math.min(...allY) - 0.5;
  const yMax = Math.max(...allY) + 0.5;

  if (points.length === 0) {
    return (
      <div className="flex items-center justify-center text-slate-500 text-sm" style={{ height }}>
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart margin={{ top: 12, right: 20, bottom: 12, left: 4 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" />
        <XAxis
          type="number" dataKey="x"
          domain={[xMin, xMax]}
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          tickFormatter={v => v.toFixed(1)}
          name="PC1"
          axisLine={{ stroke: '#334155' }}
          tickLine={false}
          label={{ value: 'PC1', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 13 }}
        />
        <YAxis
          type="number" dataKey="y"
          domain={[yMin, yMax]}
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          tickFormatter={v => v.toFixed(1)}
          name="PC2"
          width={40}
          axisLine={{ stroke: '#334155' }}
          tickLine={false}
          label={{ value: 'PC2', position: 'insideTopLeft', offset: 10, fill: '#64748b', fontSize: 13 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="top" align="right"
          wrapperStyle={{ fontSize: '13px', paddingBottom: '12px' }}
        />
        <Scatter name="Expert" data={experts} fill="#38bdf8" shape={<Dot />} />
        <Scatter name="Control" data={controls} fill="#f59e0b" shape={<Dot />} />
        {boundaryLine.length > 1 && (
          <Line
            name="Decision Boundary"
            data={boundaryLine}
            dataKey="y"
            stroke="#ec4899"
            strokeWidth={2.5}
            strokeDasharray="6 3"
            dot={false}
            isAnimationActive={false}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
