import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function DonutChart({ expertPct = 46, controlPct = 54, size = 280 }) {
  const data = [
    { name: 'Expert', value: expertPct },
    { name: 'Control', value: controlPct },
  ];
  const COLORS = ['#3B82F6', '#F59E0B'];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="62%"
            outerRadius="85%"
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center labels */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-4">
            <div>
              <span className="text-2xl font-bold text-blue-400">{expertPct}%</span>
              <p className="text-xs text-slate-400 mt-0.5">Expert</p>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div>
              <span className="text-2xl font-bold text-amber-400">{controlPct}%</span>
              <p className="text-xs text-slate-400 mt-0.5">Control</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
