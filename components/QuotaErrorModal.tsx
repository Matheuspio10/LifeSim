
import React from 'react';
import { ExclamationTriangleIcon } from './Icons';

interface QuotaErrorModalProps {
  onClose: () => void;
}

const QuotaErrorModal: React.FC<QuotaErrorModalProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      aria-labelledby="quota-modal-title"
      role="alertdialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-md bg-slate-800 border-2 border-red-500 rounded-2xl p-8 shadow-2xl text-center"
        role="document"
      >
        <div className="w-16 h-16 mx-auto text-red-400 mb-4">
            <ExclamationTriangleIcon />
        </div>
        <h2 id="quota-modal-title" className="text-2xl font-bold text-white mb-3">Cota da API Excedida</h2>
        <p className="text-slate-300 mb-6">
          Parece que você atingiu o limite de requisições da API do Google Gemini. Isso geralmente acontece no plano gratuito após um uso intenso.
        </p>
        <p className="text-slate-400 text-sm mb-6">
          Por favor, aguarde um pouco antes de tentar novamente ou verifique o status da sua cota no{' '}
          <a 
            href="https://aistudio.google.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline"
          >
            Google AI Studio
          </a>.
        </p>
        
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-red-600 border border-transparent rounded-lg text-white font-semibold
                     hover:bg-red-500
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500
                     transition-colors duration-200"
        >
          Entendi
        </button>
      </div>
    </div>
  );
};

// Simple fade-in animation, likely already defined elsewhere but good practice to keep it local if not.
const style = `
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.5s ease-out forwards;
}
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = style;
document.head.appendChild(styleSheet);


export default QuotaErrorModal;
