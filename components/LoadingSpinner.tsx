
import React from 'react';

interface LoadingSpinnerProps {
  onShowDebug: () => void;
  onRollback?: () => void;
  canRollback?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ onShowDebug, onRollback, canRollback }) => {
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
        {onRollback && canRollback && (
           <button onClick={onRollback} className="mt-4 px-4 py-2 text-xs bg-yellow-800 text-yellow-200 rounded-md hover:bg-yellow-700 transition-colors">
                Restaurar Jogo
            </button>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
