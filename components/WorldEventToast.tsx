import React, { useEffect } from 'react';
import { WorldEvent } from '../types';
import { GlobeAltIcon } from './Icons';

interface WorldEventToastProps {
  event: WorldEvent | null;
  onClose: () => void;
}

const WorldEventToast: React.FC<WorldEventToastProps> = ({ event, onClose }) => {
  useEffect(() => {
    if (event) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000); // Auto-dismiss after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [event, onClose]);

  if (!event) {
    return null;
  }

  return (
    <div 
      className="fixed top-6 right-6 w-full max-w-sm bg-slate-800/80 backdrop-blur-md border border-slate-600 rounded-xl shadow-2xl p-4 z-50 animate-slide-in"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 text-cyan-400 flex-shrink-0 mt-1">
          <GlobeAltIcon />
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-white">{event.title}</h3>
          <p className="text-sm text-slate-300 mt-1">{event.description}</p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-slate-700/50 rounded-full text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
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

// Add animation styles
const style = `
@keyframes slide-in-from-right {
  from { 
    opacity: 0; 
    transform: translateX(100%); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0); 
  }
}
.animate-slide-in {
  animation: slide-in-from-right 0.5s ease-out forwards;
}
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = style;
document.head.appendChild(styleSheet);

export default WorldEventToast;