import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, badge, color = "blue" }) {
  const colorMap = {
    blue: "text-blue-400 border-blue-500/20 bg-blue-500/5",
    green: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    purple: "text-purple-400 border-purple-500/20 bg-purple-500/5",
    amber: "text-amber-400 border-amber-500/20 bg-amber-500/5",
  };

  return (
    <div className={`p-4 rounded-xl border bg-cardbg shadow-sm ${colorMap[color] || colorMap.blue} transition-all hover:border-slate-700`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        {Icon && <Icon className="w-4 h-4 opacity-75" />}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
        {badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-800 text-slate-300 border border-slate-700">
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}
