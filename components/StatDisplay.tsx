import React from 'react';
import { SparklesIcon } from './Icons';

interface StatDisplayProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
  isCurrency?: boolean;
}

const StatDisplay: React.FC<StatDisplayProps> = ({ label, value, icon, color = 'bg-gray-500', isCurrency = false }) => {
  let rarityLabel = '';
  let rarityColor = '';
  let barGlow = '';

  if (!isCurrency) {
    if (value === 100) {
      rarityLabel = 'Nível Lendário';
      rarityColor = 'text-purple-400';
      barGlow = 'shadow-[0_0_8px_2px_rgba(192,132,252,0.5)]';
    } else if (value >= 95) {
      rarityLabel = 'Nível de Virtuoso';
      rarityColor = 'text-amber-400';
      barGlow = 'shadow-[0_0_6px_1px_rgba(251,191,36,0.5)]';
    } else if (value >= 90) {
      rarityLabel = 'Nível de Mestre';
      rarityColor = 'text-cyan-400';
    }
  }

  const tooltipText = rarityLabel ? `${label}: ${rarityLabel}` : label;

  return (
    <div title={tooltipText}>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 w-5 h-5">{icon}</span>
          <span className="font-semibold text-slate-300">{label}</span>
          {rarityLabel && (
            <span className={`w-4 h-4 ${rarityColor}`}><SparklesIcon /></span>
          )}
        </div>
        <span className="font-bold text-lg text-white">
          {isCurrency ? `$${value.toLocaleString()}` : value}
        </span>
      </div>
      {!isCurrency && (
        <div className="w-full bg-slate-700 rounded-full h-2.5">
          <div
            className={`${color} h-2.5 rounded-full transition-all duration-500 ease-out ${barGlow}`}
            style={{ width: `${value}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default StatDisplay;