import React from 'react';

interface SpectrumDisplayProps {
  label: string;
  value: number; // -100 to 100
  icon: React.ReactNode;
  gradient: string; // e.g., 'from-red-500 via-slate-500 to-blue-500'
  getLabel: (value: number) => string;
}

const SpectrumDisplay: React.FC<SpectrumDisplayProps> = ({ label, value, icon, gradient, getLabel }) => {
  const markerPosition = ((value + 100) / 200) * 100;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 w-5 h-5">{icon}</span>
          <span className="font-semibold text-slate-300">{label}</span>
        </div>
        <span className="font-semibold text-sm text-white">{getLabel(value)}</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5 relative">
        <div className={`h-full w-full rounded-full bg-gradient-to-r ${gradient}`}></div>
        <div 
          className="absolute top-[-2px] w-1 h-3.5 bg-white rounded-full shadow-md transition-all duration-500 ease-out"
          style={{ left: `calc(${markerPosition}% - 2px)` }}
          title={`Valor: ${value}`}
        ></div>
      </div>
    </div>
  );
};

export default SpectrumDisplay;
