import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function WaveformChart({ times = [], values = [], color = '#38bdf8', height = 250 }) {
  const data = times.map((t, i) => ({ t: Math.round(t), v: values[i] }));

  if (data.length === 0) return null;

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const pad = (maxVal - minVal) * 0.12 || 1;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" />
        <XAxis
          dataKey="t"
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          tickFormatter={v => `${(v / 1000).toFixed(1)}s`}
          interval="preserveStartEnd"
          tickLine={false}
          axisLine={{ stroke: '#334155' }}
        />
        <YAxis
          domain={[minVal - pad, maxVal + pad]}
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          tickFormatter={v => v.toFixed(0)}
          width={42}
          tickLine={false}
          axisLine={{ stroke: '#334155' }}
        />
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
