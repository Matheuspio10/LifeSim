
import React from 'react';

interface StatDisplayProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
  isCurrency?: boolean;
}

const StatDisplay: React.FC<StatDisplayProps> = ({ label, value, icon, color = 'bg-gray-500', isCurrency = false }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 w-5 h-5">{icon}</span>
          <span className="font-semibold text-slate-300">{label}</span>
        </div>
        <span className="font-bold text-lg text-white">
          {isCurrency ? `$${value.toLocaleString()}` : value}
        </span>
      </div>
      {!isCurrency && (
        <div className="w-full bg-slate-700 rounded-full h-2.5">
          <div
            className={`${color} h-2.5 rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${value}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default StatDisplay;
