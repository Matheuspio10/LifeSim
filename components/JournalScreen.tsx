
import React from 'react';
import { Character, LifeSummaryEntry, MemoryItem, MemoryItemType, CraftedItem } from '../types';
import { StarIcon, DocumentTextIcon, PhotoIcon, EnvelopeIcon, TrophyIcon, SparklesIcon, TicketIcon, PencilSquareIcon } from './Icons';

interface JournalScreenProps {
  character: Character;
  lifeSummary: LifeSummaryEntry[];
  onClose: () => void;
}

const MemoryIcon: React.FC<{ type: MemoryItemType }> = ({ type }) => {
    const icons: Record<MemoryItemType, React.ReactNode> = {
        [MemoryItemType.DOCUMENT]: <DocumentTextIcon />,
        [MemoryItemType.PHOTO]: <PhotoIcon />,
        [MemoryItemType.LETTER]: <EnvelopeIcon />,
        [MemoryItemType.TROPHY]: <TrophyIcon />,
        [MemoryItemType.RELIC]: <SparklesIcon />,
        [MemoryItemType.MEMENTO]: <TicketIcon />,
    };
    return <div className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1">{icons[type] || null}</div>;
};

const JournalScreen: React.FC<JournalScreenProps> = ({ character, lifeSummary, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl h-[90vh] bg-slate-900/80 border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Diário da Vida de {character.name}</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-slate-700/50 rounded-full text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
            aria-label="Fechar Diário"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden flex-grow">
            {/* Life Timeline */}
            <div className="bg-slate-800/50 p-4 rounded-lg overflow-y-auto border border-slate-700">
                <h3 className="text-xl font-bold text-cyan-400 mb-4 sticky top-0 bg-slate-800/80 backdrop-blur-sm py-2 px-2 -mx-2">Linha do Tempo da Vida</h3>
                <ul className="space-y-3">
                {lifeSummary.map((entry, index) => (
                    <li key={index} className={`border-l-2 pl-4 flex items-start gap-2 ${entry.isEpic ? 'border-amber-400 text-amber-300' : 'border-slate-600 text-slate-400'}`}>
                    {entry.isEpic && <span className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0"><StarIcon /></span>}
                    <p className="text-sm break-words">{entry.text}</p>
                    </li>
                ))}
                </ul>
            </div>

            {/* Memory Box */}
            <div className="bg-slate-800/50 p-4 rounded-lg overflow-y-auto border border-slate-700 flex flex-col gap-6">
                <h3 className="text-xl font-bold text-cyan-400 sticky top-0 bg-slate-800/80 backdrop-blur-sm py-2 px-2 -mx-2">Caixa de Memórias</h3>
                
                {/* Crafted Items */}
                <div>
                    <h4 className="text-lg font-semibold text-slate-300 mb-3 flex items-center gap-2">
                        <span className="w-5 h-5"><PencilSquareIcon /></span> Especiais
                    </h4>
                    {character.craftedItems.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {character.craftedItems.map((item, index) => (
                                <div key={index} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600 group relative cursor-help">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 text-cyan-400 mt-1">
                                            <PencilSquareIcon />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-100">{item.name}</p>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-3 bg-slate-950 border border-slate-600 rounded-lg shadow-xl text-sm text-slate-300 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <p className="break-words">{item.description}</p>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-950"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center text-center p-6 bg-slate-900/30 rounded-lg">
                            <div>
                                <div className="w-16 h-16 mx-auto text-slate-500">
                                    <PencilSquareIcon />
                                </div>
                                <p className="text-slate-500 italic text-sm mt-2">Nenhum item especial foi criado ainda.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Memories */}
                <div>
                    <h4 className="text-lg font-semibold text-slate-300 mb-3 flex items-center gap-2">
                        <span className="w-5 h-5"><StarIcon /></span> Recordações
                    </h4>
                    {character.memories.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {character.memories.map((memory, index) => (
                                <div key={index} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600 group relative cursor-help">
                                    <div className="flex items-start gap-3">
                                        <MemoryIcon type={memory.type} />
                                        <div>
                                            <p className="font-bold text-slate-100">{memory.name}</p>
                                            <p className="text-xs text-slate-400">Adquirido(a) aos {memory.yearAcquired} anos</p>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-3 bg-slate-950 border border-slate-600 rounded-lg shadow-xl text-sm text-slate-300 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <p className="break-words">{memory.description}</p>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-950"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="flex items-center justify-center text-center p-6 bg-slate-900/30 rounded-lg">
                            <div>
                                <div className="w-16 h-16 mx-auto text-slate-500">
                                    <StarIcon />
                                </div>
                                <p className="text-slate-500 italic text-sm mt-2">Nenhuma recordação colecionada.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default JournalScreen;
