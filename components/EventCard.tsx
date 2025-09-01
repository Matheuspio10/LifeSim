
import React, { useState } from 'react';
import { GameEvent, Choice } from '../types';

interface EventCardProps {
  event: GameEvent;
  onChoice: (choice: Choice) => void;
  onOpenResponseSubmit: (responseText: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onChoice, onOpenResponseSubmit }) => {
  const [responseText, setResponseText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (responseText.trim()) {
      onOpenResponseSubmit(responseText.trim());
      setResponseText('');
    }
  };

  const showOpenResponse = event.type === 'OPEN_RESPONSE' || event.type === 'MULTIPLE_CHOICE';
  const showChoices = event.choices && event.choices.length > 0;

  const getCardStyle = () => {
    if (event.isWorldEvent) {
      return 'border-purple-400 shadow-2xl shadow-purple-500/20 ring-2 ring-purple-500/50';
    }
    if (event.isEpic) {
      return 'border-amber-400 shadow-2xl shadow-amber-500/20 ring-2 ring-amber-500/50';
    }
    return 'border border-slate-700';
  };

  return (
    <div className={`w-full max-w-3xl bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 animate-fade-in transition-all duration-300 ${getCardStyle()}`}>
      <p className="text-lg text-slate-300 leading-relaxed mb-8">
        {event.eventText}
      </p>
      
      {showChoices && (
        <div className="flex flex-col gap-4">
          {event.choices.map((choice) => (
            <button
              key={choice.choiceText}
              onClick={() => onChoice(choice)}
              className="w-full text-left px-6 py-4 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 font-semibold
                         hover:bg-indigo-600 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-600/30
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500
                         transition-all duration-200 transform hover:-translate-y-1"
            >
              {choice.choiceText}
            </button>
          ))}
        </div>
      )}

      {showChoices && showOpenResponse && (
        <div className="flex items-center my-6">
            <hr className="flex-grow border-slate-600" />
            <span className="px-4 text-slate-400 font-semibold text-sm">OU</span>
            <hr className="flex-grow border-slate-600" />
        </div>
      )}

      {showOpenResponse && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
           <label htmlFor="open-response-input" className="text-sm font-semibold text-slate-300 text-left">
            {showChoices ? "Tente outra coisa..." : "Escreva sua ação"}
          </label>
          <textarea
            id="open-response-input"
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder={event.placeholderText || "O que você faz a seguir?"}
            className="w-full h-24 px-4 py-3 bg-slate-900/70 border border-slate-600 rounded-lg text-slate-200
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500
                       transition-colors duration-200 resize-none"
            aria-label="Sua resposta"
          />
          <button
            type="submit"
            disabled={!responseText.trim()}
            className="w-full text-center px-6 py-4 bg-indigo-600 border border-transparent rounded-lg text-white font-semibold
                       hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/30
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500
                       transition-all duration-200 transform hover:-translate-y-1
                       disabled:bg-slate-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
          >
            Confirmar Ação
          </button>
        </form>
      )}
    </div>
  );
};

// Simple fade-in animation using Tailwind config in a real project
// For now, let's use a style tag and keyframes
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


export default EventCard;