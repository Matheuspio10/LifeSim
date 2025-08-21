import React, { useMemo } from 'react';
import { Character, LifeSummaryEntry, MemoryItem, MemoryItemType, ParallelLifeData, Lineage } from '../types';
import { StarIcon, DocumentTextIcon, PhotoIcon, EnvelopeIcon, TrophyIcon, SparklesIcon, TicketIcon, CheckCircleIcon } from './Icons';
import { WEEKLY_CHALLENGES, LINEAGE_TITLES } from '../constants';

interface GameOverScreenProps {
  finalCharacter: Character;
  lifeSummary: LifeSummaryEntry[];
  legacyPoints: number;
  completedChallenges: { name: string; reward: number }[];
  isMultiplayerCycle: boolean;
  onContinueLineage: () => void;
  onStartNewLineage: () => void;
  lineage: Lineage | null;
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
    return <div className="w-8 h-8 text-cyan-400">{icons[type] || null}</div>;
};

const GameOverScreen: React.FC<GameOverScreenProps> = ({ finalCharacter, lifeSummary, legacyPoints, completedChallenges, isMultiplayerCycle, onContinueLineage, onStartNewLineage, lineage }) => {
  const completedGoals = finalCharacter.lifeGoals.filter(g => g.completed);
  const specialEnding = finalCharacter.specialEnding;
  
  const earnedTitleInfo = useMemo(() => {
    if (!lineage?.title) return null;
    return LINEAGE_TITLES.find(t => t.name === lineage.title);
  }, [lineage]);

  // Mock data for parallel lives
  const parallelLivesData: ParallelLifeData[] = useMemo(() => [
        { lastName: 'Silva', notableAchievement: 'Tornou-se a primeira pessoa a pisar em Marte.', finalWealth: 2500000 },
        { lastName: 'Souza', notableAchievement: 'Descobriu a cura para uma doença rara, sem nunca buscar os holofotes.', finalWealth: 850000 },
        { lastName: 'Pereira', notableAchievement: 'Fundou uma dinastia de artistas que moldou a cultura por décadas.', finalWealth: 1200000 },
        { lastName: 'Costa', notableAchievement: 'Alcançou o posto de CEO de uma megacorporação global.', finalWealth: 15300000 }
    ], []);
  
  const weeklyChallengeRanking = useMemo(() => {
    const challenge = WEEKLY_CHALLENGES.find(c => c.id === 'magnate');
    if (!challenge) return null;
    
    const playerEntry: ParallelLifeData = {
        lastName: finalCharacter.lastName,
        notableAchievement: 'Sua jornada',
        finalWealth: finalCharacter.wealth + finalCharacter.investments,
        isPlayer: true
    };
    
    const allPlayers = [...parallelLivesData, playerEntry];
    const sortedPlayers = allPlayers.sort((a, b) => b.finalWealth - a.finalWealth);
    
    return {
        challengeName: challenge.name,
        ranking: sortedPlayers.slice(0, 4)
    };
  }, [finalCharacter, parallelLivesData]);


  return (
    <div className="w-full max-w-4xl bg-slate-800/70 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl p-8 text-center animate-fade-in">
        {specialEnding ? (
            <>
                <h2 className="text-4xl font-pixel text-purple-400 mb-2">Um Destino Incomum</h2>
                <p className="text-xl text-slate-300 mb-4 px-4">{lifeSummary[lifeSummary.length - 1]?.text}</p>
            </>
        ) : (
            <>
                <h2 className="text-4xl font-pixel text-red-500 mb-2">A Linhagem Terminou</h2>
                <p className="text-xl text-slate-300 mb-2">
                    {finalCharacter.name} {finalCharacter.lastName} morreu aos {finalCharacter.age} anos
                    {finalCharacter.causeOfDeath ? ` devido a ${finalCharacter.causeOfDeath.toLowerCase()}` : ''}.
                </p>
            </>
        )}
      <p className="text-lg text-amber-400 font-bold mb-2">
        Você acumulou <span className="text-2xl">{legacyPoints}</span> Pontos de Legado para a próxima geração.
      </p>
       {specialEnding && (
          <p className="text-sm text-purple-300 mb-6 bg-purple-900/40 inline-block px-3 py-1 rounded-full">
            (Inclui +100 pontos por um final especial!)
          </p>
        )}

      {earnedTitleInfo && (
          <div className="my-6 p-4 bg-slate-900/70 border-2 border-cyan-500 rounded-lg shadow-lg shadow-cyan-500/20 max-w-2xl mx-auto">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Legado Conquistado</h3>
              <p className="text-2xl font-bold text-cyan-300 mt-1">Sua família agora é conhecida como: {earnedTitleInfo.name}</p>
              <p className="text-slate-300 mt-2 italic">"{earnedTitleInfo.description}"</p>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 text-left">
        <div className="bg-slate-900/50 p-6 rounded-lg max-h-[450px] overflow-y-auto border border-slate-700">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 sticky top-0 bg-slate-900/80 backdrop-blur-sm py-2">Sua História de Vida</h3>
            <ul className="space-y-3">
            {lifeSummary.map((entry, index) => (
                <li key={index} className={`border-l-2 pl-4 flex items-start gap-2 transition-colors duration-300 ${entry.isEpic ? 'border-amber-400 text-amber-300' : 'border-slate-600 text-slate-400'}`}>
                {entry.isEpic && <span className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0"><StarIcon /></span>}
                <p>{entry.text}</p>
                </li>
            ))}
            </ul>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-lg max-h-[450px] overflow-y-auto border border-slate-700 space-y-6">
             <div>
                <h3 className="text-xl font-bold text-cyan-400 mb-4 sticky top-0 bg-slate-900/80 backdrop-blur-sm py-2">Álbum de Memórias</h3>
                {finalCharacter.memories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {finalCharacter.memories.map((memory, index) => (
                            <div key={index} className="bg-slate-800/70 p-4 rounded-lg border border-slate-600 group relative cursor-help">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                        <MemoryIcon type={memory.type} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-100 truncate">{memory.name}</p>
                                        <p className="text-xs text-slate-400">Adquirido(a) aos {memory.yearAcquired} anos</p>
                                    </div>
                                </div>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-slate-950 border border-slate-600 rounded-lg shadow-xl text-sm text-slate-300 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    {memory.description}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-950"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 italic text-center pt-4">Sua vida passou sem deixar memórias colecionáveis.</p>
                )}
            </div>
            <div>
                <h3 className="text-xl font-bold text-green-400 mb-4 sticky top-0 bg-slate-900/80 backdrop-blur-sm py-2">Conquistas Notáveis</h3>
                {completedGoals.length > 0 ? (
                     <ul className="space-y-2">
                        {completedGoals.map((goal, index) => (
                             <li key={index} className="flex items-center gap-3 bg-slate-800/70 p-3 rounded-lg border border-slate-700">
                                <span className="w-6 h-6 text-green-400 flex-shrink-0"><CheckCircleIcon /></span>
                                <p className="font-semibold text-slate-200">{goal.description}</p>
                             </li>
                        ))}
                     </ul>
                ) : (
                    <p className="text-slate-500 italic text-center pt-4">Você não completou nenhum objetivo de vida marcante.</p>
                )}
            </div>
            {isMultiplayerCycle ? (
                <>
                <div>
                     <h3 className="text-xl font-bold text-indigo-400 mb-4 sticky top-0 bg-slate-900/80 backdrop-blur-sm py-2">Resumo das Vidas Paralelas</h3>
                     <div className="space-y-3">
                        {parallelLivesData.slice(0, 3).map((life, index) => (
                             <div key={index} className="bg-slate-800/70 p-3 rounded-lg border-l-4 border-indigo-500">
                                <p className="font-semibold text-slate-200">A linhagem '{life.lastName}'...</p>
                                <p className="text-sm text-slate-300 italic">"{life.notableAchievement}"</p>
                                <p className="text-xs text-right font-mono text-indigo-300 mt-1">Patrimônio Final: ${life.finalWealth.toLocaleString()}</p>
                             </div>
                        ))}
                     </div>
                </div>
                 {weeklyChallengeRanking && (
                 <div>
                    <h3 className="text-xl font-bold text-amber-400 mb-4 sticky top-0 bg-slate-900/80 backdrop-blur-sm py-2">Ranking: {weeklyChallengeRanking.challengeName}</h3>
                     <ol className="space-y-2">
                        {weeklyChallengeRanking.ranking.map((player, index) => {
                             const medals = ['🥇', '🥈', '🥉'];
                             return (
                                 <li key={index} className={`flex items-center gap-3 p-3 rounded-lg border border-slate-700 ${player.isPlayer ? 'bg-amber-900/50 border-amber-600 ring-2 ring-amber-500' : 'bg-slate-800/70'}`}>
                                     <span className="text-2xl w-8 text-center">{medals[index] || index + 1}</span>
                                     <div className="flex-grow">
                                         <p className="font-bold text-slate-100">Família {player.lastName} {player.isPlayer && '(Você)'}</p>
                                     </div>
                                     <p className="font-mono font-bold text-amber-300">${player.finalWealth.toLocaleString()}</p>
                                 </li>
                            );
                        })}
                     </ol>
                </div>
                )}
                </>
            ) : (
                 <div>
                    <h3 className="text-xl font-bold text-cyan-400 mb-4 sticky top-0 bg-slate-900/80 backdrop-blur-sm py-2">Desafios da Linhagem</h3>
                    {completedChallenges.length > 0 ? (
                        <ul className="space-y-2">
                            {completedChallenges.map((challenge, index) => (
                                <li key={index} className="flex items-center gap-3 bg-slate-800/70 p-3 rounded-lg border border-slate-700">
                                    <span className="w-6 h-6 text-amber-400 flex-shrink-0"><TrophyIcon /></span>
                                    <div>
                                        <p className="font-semibold text-slate-200">{challenge.name}</p>
                                        <p className="text-sm font-bold text-amber-500">+ {challenge.reward} Pontos de Legado</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500 italic text-center pt-4">Nenhum desafio de linhagem foi concluído.</p>
                    )}
                </div>
            )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
            onClick={onContinueLineage}
            className="px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-lg
                    hover:bg-indigo-500 transition-colors duration-200 transform hover:scale-105
                    shadow-lg shadow-indigo-600/30"
        >
            Continuar Linhagem
        </button>
        <button
            onClick={onStartNewLineage}
            className="px-6 py-3 bg-slate-600 text-white font-semibold rounded-lg
                    hover:bg-slate-500 transition-colors duration-200"
        >
            Iniciar Nova Família
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;