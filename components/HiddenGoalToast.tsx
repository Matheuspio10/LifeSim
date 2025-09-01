import React, { useEffect } from 'react';
import { HiddenGoal } from '../types';
import { ShieldExclamationIcon } from './Icons';

interface HiddenGoalToastProps {
  goal: HiddenGoal;
  onClose: () => void;
}

const HiddenGoalToast: React.FC<HiddenGoalToastProps> = ({ goal, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 6000); // Auto-dismiss after 6 seconds

    return () => clearTimeout(timer);
  }, [goal, onClose]);

  if (!goal) {
    return null;
  }

  return (
    <div 
      className="fixed top-6 right-6 w-full max-w-sm bg-slate-800/80 backdrop-blur-md border-2 border-amber-500 rounded-xl shadow-2xl shadow-amber-500/20 p-4 z-50 animate-slide-in"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 text-amber-400 flex-shrink-0 mt-1">
          <ShieldExclamationIcon />
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-amber-300">Conquista Secreta Desbloqueada!</h3>
          <p className="font-semibold text-white mt-1">{goal.name}</p>
          <p className="text-sm text-slate-300 mt-1">{goal.description}</p>
          <p className="text-sm font-bold text-amber-400 mt-2">+ {goal.reward} Pontos de Legado</p>
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

// Add animation styles (might be duplicated from WorldEventToast, but good for component independence)
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

export default HiddenGoalToast;
