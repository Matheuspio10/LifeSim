import React from 'react';
import { ExclamationTriangleIcon } from './Icons';

interface GlobalPlotBannerProps {
  title: string;
  description: string;
  onClose: () => void;
}

const GlobalPlotBanner: React.FC<GlobalPlotBannerProps> = ({ title, description, onClose }) => {
  return (
    <div 
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-4xl bg-red-900/80 backdrop-blur-md border-2 border-red-500 rounded-xl shadow-2xl p-4 z-30 animate-fade-in"
      role="alert"
    >
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 text-red-300 flex-shrink-0 mt-1">
          <ExclamationTriangleIcon />
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-lg text-white">{title}</h3>
          <p className="text-sm text-red-200 mt-1">{description}</p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-red-800/50 rounded-full text-red-200 hover:bg-red-700 hover:text-white transition-colors"
          aria-label="Fechar notificação"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default GlobalPlotBanner;
