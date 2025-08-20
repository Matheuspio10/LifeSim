
import React from 'react';
import { GameEvent, Choice, MiniGameType, Character } from '../types';
import InvestmentGame from './mini-games/InvestmentGame';

interface MiniGameHostProps {
  event: GameEvent;
  character: Character;
  onComplete: (choice: Choice) => void;
}

const MiniGameHost: React.FC<MiniGameHostProps> = ({ event, character, onComplete }) => {
  const renderMiniGame = () => {
    switch (event.miniGameType) {
      case MiniGameType.INVESTMENT:
        return <InvestmentGame event={event} character={character} onComplete={onComplete} />;
      // Future mini-games can be added here
      // case MiniGameType.SOCIAL_FLIRT:
      //   return <FlirtGame event={event} onComplete={onComplete} />;
      default:
        return (
            <div className="text-center text-red-400 bg-red-900/50 p-6 rounded-lg shadow-lg">
                <p className="font-semibold text-lg mb-2">Erro de Jogo!</p>
                <p>O tipo de mini-jogo '{event.miniGameType}' não foi reconhecido.</p>
            </div>
        );
    }
  };

  return (
    <div className="w-full max-w-lg animate-fade-in">
        {renderMiniGame()}
    </div>
  );
};

export default MiniGameHost;
