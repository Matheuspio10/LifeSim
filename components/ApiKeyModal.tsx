import React, { useState } from 'react';

interface ApiKeyModalProps {
  onSave: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
  const [key, setKey] = useState('');

  const handleSave = () => {
    if (key.trim()) {
      onSave(key.trim());
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl text-center animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-3">Configurar Chave de API do Gemini</h2>
      <p className="text-slate-400 mb-6">
        Para jogar, você precisa de uma chave de API do Google Gemini. A chave será salva localmente no seu navegador.
      </p>
      
      <div className="mb-4 text-left">
        <label htmlFor="api-key-input" className="block text-sm font-semibold text-slate-300 mb-2">
          Sua Chave de API
        </label>
        <input
          id="api-key-input"
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Cole sua chave aqui"
          className="w-full px-4 py-3 bg-slate-900/70 border border-slate-600 rounded-lg text-slate-200
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500
                     transition-colors duration-200"
          aria-label="Chave de API do Gemini"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!key.trim()}
        className="w-full px-6 py-3 bg-indigo-600 border border-transparent rounded-lg text-white font-semibold
                   hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/30
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500
                   transition-all duration-200 transform hover:-translate-y-1
                   disabled:bg-slate-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
      >
        Salvar e Iniciar Jogo
      </button>

      <p className="text-xs text-slate-500 mt-6">
        Não tem uma chave? Você pode obter uma gratuitamente no{' '}
        <a 
          href="https://aistudio.google.com/app/apikey" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-cyan-400 hover:underline"
        >
          Google AI Studio
        </a>.
      </p>
    </div>
  );
};

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


export default ApiKeyModal;
