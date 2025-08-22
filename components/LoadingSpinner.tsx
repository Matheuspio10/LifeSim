import React from 'react';

interface LoadingSpinnerProps {
  onShowDebug: () => void;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ onShowDebug }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center p-8">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-400"></div>
      <p className="text-slate-300 font-semibold text-lg">Seu destino está sendo decidido...</p>
      <div className="flex items-center gap-2">
        <button
          onClick={onShowDebug}
          className="mt-4 px-4 py-2 text-xs bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 transition-colors"
        >
          Ver Depuração
        </button>
      </div>
    </div>
  );
};

export default LoadingSpinner;