
import React, { useState, useMemo } from 'react';
import { LegacyBonuses, Trait, Character, Lineage } from '../types';
import { LINEAGE_TITLES, POSITIVE_TRAITS } from '../constants';
import { CrownIcon, CurrencyDollarIcon, BrainIcon, UserGroupIcon, LightBulbIcon, ShieldCheckIcon, HeartIcon, PlusCircleIcon, SpeakerWaveIcon, BriefcaseIcon, StarIcon, PuzzlePieceIcon, ShieldExclamationIcon } from './Icons';

interface LegacyScreenProps {
  points: number;
  onStart: (bonuses: LegacyBonuses) => void;
  finalCharacter: Character | null;
  lineage: Lineage | null;
}

type BonusId = 'wealth' | 'intelligence' | 'charisma' | 'creativity' | 'discipline' | 'health' | 'trait' | 'influence' | 'entrepreneur' | 'celebrity';

interface BonusConfig {
    id: BonusId;
    name: string;
    description: string;
    cost: number;
    icon: React.ReactNode;
    repeatable?: boolean;
    data?: any;
    prerequisite?: (char: Character) => boolean;
    prerequisiteText?: string;
}

const LegacyScreen: React.FC<LegacyScreenProps> = ({ points, onStart, finalCharacter, lineage }) => {
    const [selections, setSelections] = useState<Record<string, number>>({});

    const randomFamilyTrait = useMemo(() =>
        POSITIVE_TRAITS[Math.floor(Math.random() * POSITIVE_TRAITS.length)]
    , []);

    const lineageTitleBonus = useMemo(() => {
      if (!lineage?.title) return null;
      return LINEAGE_TITLES.find(t => t.name === lineage.title);
    }, [lineage]);

    const bonusesConfig = useMemo(() => {
        const ALL_BONUSES: BonusConfig[] = [
            { id: 'wealth', name: 'Fortuna Herdada', description: 'Comece com +$10,000.', cost: 5, icon: <CurrencyDollarIcon />, repeatable: true },
            { id: 'intelligence', name: 'Educação Privilegiada', description: 'Comece com +5 de Inteligência.', cost: 10, icon: <BrainIcon /> },
            { id: 'charisma', name: 'Berço de Ouro', description: 'Comece com +5 de Carisma.', cost: 10, icon: <UserGroupIcon /> },
            { id: 'creativity', name: 'Incentivo Artístico', description: 'Comece com +5 de Criatividade.', cost: 8, icon: <LightBulbIcon /> },
            { id: 'discipline', name: 'Criação Rígida', description: 'Comece com +5 de Disciplina.', cost: 8, icon: <ShieldCheckIcon /> },
            { id: 'health', name: 'Genética Robusta', description: 'Comece com +5 de Saúde.', cost: 12, icon: <HeartIcon /> },
            { id: 'influence', name: 'Capital Político', description: 'Comece com +10 de Influência.', cost: 15, icon: <SpeakerWaveIcon /> },
            { id: 'trait', name: 'Traço de Família', description: `Herde o traço positivo: ${randomFamilyTrait.name}.`, cost: 15, icon: <PlusCircleIcon />, data: randomFamilyTrait },
            { 
                id: 'entrepreneur', 
                name: 'Gênio Empreendedor', 
                description: 'Comece com +$5000, +5 em Disciplina e um bônus para eventos de negócios.', 
                cost: 20, 
                icon: <BriefcaseIcon />, 
                prerequisite: (char: Character) => char.wealth + char.investments >= 500000,
                prerequisiteText: 'Requer ter acumulado $500,000 na vida anterior.',
            },
            { 
                id: 'celebrity', 
                name: 'Lenda Viva', 
                description: 'Comece com +20 de Fama e o traço Carismático.', 
                cost: 25, 
                icon: <StarIcon />, 
                prerequisite: (char: Character) => char.fame >= 80,
                prerequisiteText: 'Requer ter atingido o status de Celebridade (Fama 80+).',
                data: { fame: 20, trait: POSITIVE_TRAITS.find(t => t.name === 'Carismático') }
            },
        ];
        return ALL_BONUSES;
    }, [randomFamilyTrait]);

    const spentPoints = useMemo(() => {
        return Object.entries(selections).reduce((total, [id, count]) => {
            const bonus = bonusesConfig.find(b => b.id === id);
            return total + (bonus ? bonus.cost * count : 0);
        }, 0);
    }, [selections, bonusesConfig]);
    
    const isUnlocked = (bonus: BonusConfig): boolean => {
        if (!bonus.prerequisite) return true;
        if (!finalCharacter) return false;
        return bonus.prerequisite(finalCharacter);
    };

    const handleSelect = (bonus: BonusConfig) => {
        if (!isUnlocked(bonus)) return;
        if (spentPoints + bonus.cost > points && !(selections[bonus.id] > 0 && !bonus.repeatable)) return;

        setSelections(prev => {
            const currentCount = prev[bonus.id] || 0;
            if (bonus.repeatable) {
                return { ...prev, [bonus.id]: currentCount + 1 };
            }
            return { ...prev, [bonus.id]: currentCount > 0 ? 0 : 1 };
        });
    };
    
    const handleStart = () => {
        const finalBonuses: LegacyBonuses = {};
        for (const [id, count] of Object.entries(selections)) {
            if (count > 0) {
                const bonus = bonusesConfig.find(b => b.id === id);
                if (bonus) {
                    switch (bonus.id) {
                        case 'wealth': finalBonuses.wealth = (finalBonuses.wealth || 0) + count * 10000; break;
                        case 'intelligence': finalBonuses.intelligence = 5; break;
                        case 'charisma': finalBonuses.charisma = 5; break;
                        case 'creativity': finalBonuses.creativity = 5; break;
                        case 'discipline': finalBonuses.discipline = 5; break;
                        case 'health': finalBonuses.health = 5; break;
                        case 'influence': finalBonuses.influence = 10; break;
                        case 'trait': finalBonuses.trait = bonus.data; break;
                        case 'entrepreneur':
                            finalBonuses.wealth = (finalBonuses.wealth || 0) + 5000;
                            finalBonuses.discipline = (finalBonuses.discipline || 0) + 5;
                            break;
                        case 'celebrity':
                            finalBonuses.fame = (finalBonuses.fame || 0) + bonus.data.fame;
                            if (!finalBonuses.trait) finalBonuses.trait = bonus.data.trait;
                            break;
                    }
                }
            }
        }
        onStart(finalBonuses);
    };

    return (
        <div className="w-full max-w-2xl text-center p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl animate-fade-in">
            <h2 className="text-3xl font-bold text-amber-400 mb-2">Editor de Legado</h2>
            <p className="text-slate-300 mb-6">Suas conquistas desbloquearam novas vantagens. Gaste seus Pontos de Legado para dar ao seu herdeiro a melhor chance de sucesso.</p>
            
            {lineageTitleBonus && (
                <div className="mb-8 p-4 bg-slate-900/70 border-2 border-cyan-500 rounded-lg shadow-lg shadow-cyan-500/20">
                    <h3 className="text-xl font-bold text-cyan-300 flex items-center justify-center gap-2">
                        <span className="w-6 h-6"><CrownIcon /></span>
                        Bônus de Linhagem: {lineageTitleBonus.name}
                    </h3>
                    <p className="text-slate-300 mt-2">Pela sua vida anterior, seu herdeiro recebe o seguinte bônus gratuito:</p>
                    <p className="text-amber-400 font-bold mt-1">{lineageTitleBonus.bonusDescription}</p>
                </div>
            )}

            <div className="sticky top-4 z-10 bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 mb-6 border border-slate-700">
                <p className="text-lg font-semibold text-slate-300">Pontos de Legado</p>
                <p className="text-4xl font-bold text-white">
                    <span className={spentPoints > points ? 'text-red-500' : 'text-amber-400'}>{points - spentPoints}</span> / {points}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {bonusesConfig.map((bonus) => {
                    const isSelected = (selections[bonus.id] || 0) > 0;
                    const unlocked = isUnlocked(bonus);
                    const canAfford = spentPoints + bonus.cost <= points;
                    const isDisabled = !unlocked || (!canAfford && !isSelected);
                    
                    return (
                        <button
                            key={bonus.id}
                            onClick={() => handleSelect(bonus)}
                            disabled={isDisabled && !isSelected}
                            className={`p-4 bg-slate-900/60 border border-slate-700 rounded-lg text-left transition-all duration-200
                                       ${isSelected ? 'ring-2 ring-amber-500' : ''}
                                       ${isDisabled && !isSelected ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700/50 hover:border-slate-600'}`}
                        >
                            <div className="flex items-start gap-4">
                                <span className={`w-8 h-8 ${unlocked ? 'text-amber-400' : 'text-slate-500'} flex-shrink-0 mt-1`}>{bonus.icon}</span>
                                <div>
                                    <p className={`font-bold ${unlocked ? 'text-slate-100' : 'text-slate-500'}`}>{bonus.name} {bonus.repeatable && isSelected && `(x${selections[bonus.id]})`}</p>
                                    <div className="flex items-center gap-2">
                                         <span className="w-4 h-4 text-slate-400"><PuzzlePieceIcon/></span>
                                         <p className="text-sm text-slate-400">{bonus.description}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-amber-500 mt-2">Custo: {bonus.cost} Pontos</p>
                                </div>
                            </div>
                             {!unlocked && bonus.prerequisiteText && (
                                <div className="mt-2 flex items-start gap-2 text-left p-2 bg-slate-800/70 rounded-md border border-slate-700">
                                    <span className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"><ShieldExclamationIcon /></span>
                                    <div>
                                        <p className="text-xs font-semibold text-red-400">Requisito</p>
                                        <p className="text-xs text-slate-400">{bonus.prerequisiteText}</p>
                                    </div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            <button
                onClick={handleStart}
                disabled={spentPoints > points}
                className="w-full sm:w-auto px-8 py-4 bg-amber-500 text-slate-900 font-bold text-lg rounded-lg
                           hover:bg-amber-400 transition-all duration-200 transform hover:scale-105
                           shadow-lg shadow-amber-500/30 disabled:bg-slate-600 disabled:shadow-none disabled:scale-100 disabled:cursor-not-allowed"
            >
                Iniciar Próxima Geração
            </button>
        </div>
    );
};

export default LegacyScreen;
