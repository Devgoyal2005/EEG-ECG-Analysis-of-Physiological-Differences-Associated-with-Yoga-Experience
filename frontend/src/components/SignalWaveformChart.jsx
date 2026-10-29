import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-[11px]">
        <p className="text-slate-400">{label} ms</p>
        <p className="text-emerald-300 font-mono">{Number(payload[0].value).toFixed(2)} {unit}</p>
      </div>
    );
  }
  return null;
};

export default function SignalWaveformChart({
  times = [],
  values = [],
  color = '#3B82F6',
  unit = 'µV',
  label = 'Signal',
  height = 160,
}) {
  const data = times.map((t, i) => ({ t: Math.round(t), v: values[i] }));

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = (maxVal - minVal) * 0.15 || 1;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="t"
          tick={{ fill: '#64748b', fontSize: 9 }}
          tickFormatter={v => `${(v / 1000).toFixed(1)}s`}
          interval="preserveStartEnd"
          tickLine={false}
          axisLine={{ stroke: '#334155' }}
        />
        <YAxis
          domain={[minVal - padding, maxVal + padding]}
          tick={{ fill: '#64748b', fontSize: 9 }}
          tickFormatter={v => `${v.toFixed(0)}`}
          width={38}
          tickLine={false}
          axisLine={{ stroke: '#334155' }}
        />
        <Tooltip content={<CustomTooltip unit={unit} />} />
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
