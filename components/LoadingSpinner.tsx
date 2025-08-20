
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center p-8">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-400"></div>
      <p className="text-slate-300 font-semibold text-lg">Seu destino está sendo decidido...</p>
    </div>
  );
};

export default LoadingSpinner;
