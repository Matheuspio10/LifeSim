import React, { useState, useEffect, useCallback } from 'react';
import { Character, FamilyBackground, RelationshipType, LegacyBonuses, Trait, Lineage, Mood, Relationship, Hobby } from '../types';
import { BIRTHPLACES, POSITIVE_TRAITS, NEGATIVE_TRAITS, LIFE_GOALS, LAST_NAMES, WEEKLY_CHALLENGES, FIRST_NAMES, PORTRAIT_COLORS, LINEAGE_TITLES } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import { GlobeAltIcon, HomeIcon, PlusCircleIcon, MinusCircleIcon, StarIcon, ClipboardDocumentListIcon, TrophyIcon, UsersIcon } from './Icons';

interface Era {
  name: string;
  description:string;
  startYear: number;
  endYear: number;
}

const ERAS: Era[] = [
  { name: 'Era das Luzes e Revoluções', description: 'Navegue por um tempo de ideias iluministas, revoluções e agitação política. Oportunidades surgem em salões culturais, mas a censura e a instabilidade são perigos constantes.', startYear: 1700, endYear: 1820 },
  { name: 'Era Industrial e Romântica', description: 'Testemunhe o vapor das fábricas e a paixão do Romantismo. Oportunidades econômicas crescem nas cidades, mas as condições de trabalho são duras e os conflitos sociais, intensos.', startYear: 1820, endYear: 1870 },
  { name: 'Era dos Impérios e da Segunda Revolução Industrial', description: 'Viva a era da eletricidade, dos grandes impérios e da expansão global. Inove em um mercado mundial, mas enfrente a desigualdade social e as tensões imperialistas.', startYear: 1870, endYear: 1900 },
  { name: 'Era das Grandes Guerras', description: 'Viva a ascensão da indústria, as tensões globais da Primeira Guerra Mundial e a efervescência cultural dos Anos Loucos.', startYear: 1900, endYear: 1929 },
  { name: 'Era da Incerteza', description: 'Enfrente a Grande Depressão, testemunhe a Segunda Guerra Mundial e lute pela sobrevivência em tempos de crise global.', startYear: 1930, endYear: 1945 },
  { name: 'Era Atômica', description: 'Experimente a prosperidade do pós-guerra, a revolução do rock and roll e a tensão constante da Guerra Fria.', startYear: 1946, endYear: 1979 },
  { name: 'Era Analógica', description: 'Cresça com fitas K7 e telefones fixos.', startYear: 1980, endYear: 1995 },
  { name: 'Era da Internet', description: 'A revolução da internet discada e das primeiras redes sociais.', startYear: 1996, endYear: 2010 },
  { name: 'Era das Redes Sociais', description: 'Um mundo dominado por smartphones e influenciadores digitais.', startYear: 2011, endYear: 2030 },
  { name: 'Era Futurista', description: 'Encare um futuro com IA avançada e biotecnologia.', startYear: 2031, endYear: 2050 },
];

interface StartScreenProps {
    onStart: (character: Character, isMultiplayer: boolean) => void;
    lineage: Lineage | null;
    legacyBonuses: LegacyBonuses | null;
    currentYear: number;
    hasSaveData: boolean;
    onContinueGame: () => void;
    onStartNewGame: () => void;
    onShowDebug: () => void;
}

const getRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const StartScreen: React.FC<StartScreenProps> = ({ onStart, lineage, legacyBonuses, currentYear, hasSaveData, onContinueGame, onStartNewGame, onShowDebug }) => {
    const [character, setCharacter] = useState<Character | null>(null);
    const [step, setStep] = useState<'era' | 'character'>(lineage ? 'character' : 'era');
    const [selectedEra, setSelectedEra] = useState<Era | null>(null);

    const generateCharacter = useCallback((birthYear: number) => {
        const family = lineage?.lastKnownWealthTier ? lineage.lastKnownWealthTier : getRandom([FamilyBackground.POOR, FamilyBackground.MIDDLE_CLASS, FamilyBackground.WEALTHY]);
        
        let startingWealth = 0;
        if (family === FamilyBackground.MIDDLE_CLASS) startingWealth = 500;
        if (family === FamilyBackground.WEALTHY) startingWealth = 5000;
        
        const lineageBonus: LegacyBonuses = lineage?.title ? LINEAGE_TITLES.find(t => t.name === lineage.title)?.bonus || {} : {};
        const purchasedBonuses: LegacyBonuses = legacyBonuses || {};

        const allBonuses: Required<LegacyBonuses> = {
            wealth: (lineageBonus.wealth || 0) + (purchasedBonuses.wealth || 0),
            intelligence: (lineageBonus.intelligence || 0) + (purchasedBonuses.intelligence || 0),
            charisma: (lineageBonus.charisma || 0) + (purchasedBonuses.charisma || 0),
            creativity: (lineageBonus.creativity || 0) + (purchasedBonuses.creativity || 0),
            discipline: (lineageBonus.discipline || 0) + (purchasedBonuses.discipline || 0),
            health: (lineageBonus.health || 0) + (purchasedBonuses.health || 0),
            fame: (lineageBonus.fame || 0) + (purchasedBonuses.fame || 0),
            influence: (lineageBonus.influence || 0) + (purchasedBonuses.influence || 0),
            favors: (lineageBonus.favors || 0) + (purchasedBonuses.favors || 0),
            addTraits: [...(lineageBonus.addTraits || []), ...(purchasedBonuses.addTraits || [])],
            addHobbies: [...(lineageBonus.addHobbies || []), ...(purchasedBonuses.addHobbies || [])],
            addAssets: [...(lineageBonus.addAssets || []), ...(purchasedBonuses.addAssets || [])],
            addRelationships: [...(lineageBonus.addRelationships || []), ...(purchasedBonuses.addRelationships || [])],
            inheritedSecret: purchasedBonuses.inheritedSecret || lineageBonus.inheritedSecret || ''
        };


        const initialTraits: Trait[] = [
            getRandom(POSITIVE_TRAITS),
            getRandom(NEGATIVE_TRAITS),
            ...allBonuses.addTraits,
        ].filter((trait, index, self) => trait && index === self.findIndex(t => t.name === trait.name)); // Remove duplicates
        
        const founderTraits = lineage 
            ? lineage.founderTraits
            : { hairColor: getRandom(PORTRAIT_COLORS.hair), eyeColor: getRandom(PORTRAIT_COLORS.eyes) };

        // Balanced stat generation using a point pool system
        const distributePoints = (points: number, bins: number): number[] => {
            const values = Array(bins).fill(0);
            let remainingPoints = points;
            while (remainingPoints > 0) {
                const binIndex = Math.floor(Math.random() * bins);
                values[binIndex]++;
                remainingPoints--;
            }
            return values;
        };

        const pointPool = 40;
        const baseStat = 10;
        const distributedPoints = distributePoints(pointPool, 4);

        const baseRelationships: Relationship[] = [
            { name: 'Mãe', type: RelationshipType.FAMILY, intimacy: getRandomInt(50, 70), history: [] },
            { name: 'Pai', type: RelationshipType.FAMILY, intimacy: getRandomInt(50, 70), history: [] }
        ];

        const newChar: Character = {
            name: getRandom(FIRST_NAMES),
            lastName: lineage ? lineage.lastName : getRandom(LAST_NAMES),
            generation: lineage ? lineage.generation + 1 : 1,
            birthYear: birthYear,
            age: 5,
            health: getRandomInt(65, 85) + allBonuses.health,
            intelligence: baseStat + distributedPoints[0] + allBonuses.intelligence,
            charisma: baseStat + distributedPoints[1] + allBonuses.charisma,
            creativity: baseStat + distributedPoints[2] + allBonuses.creativity,
            discipline: baseStat + distributedPoints[3] + allBonuses.discipline,
            wealth: startingWealth + allBonuses.wealth,
            investments: 0,
            morality: 0,
            fame: allBonuses.fame,
            influence: allBonuses.influence,
            mood: Mood.CONTENT,
            birthplace: lineage?.lastKnownLocation ? lineage.lastKnownLocation : getRandom(BIRTHPLACES),
            familyBackground: family,
            traits: initialTraits,
            assets: [...allBonuses.addAssets],
            relationships: [...baseRelationships, ...allBonuses.addRelationships],
            memories: [],
            craftedItems: [],
            lifeGoals: [{ description: getRandom(LIFE_GOALS), completed: false }],
            hobbies: [...allBonuses.addHobbies],
            healthCondition: null,
            profession: null,
            jobTitle: null,
            careerLevel: 0,
            founderTraits,
            favors: allBonuses.favors,
            inheritedSecret: allBonuses.inheritedSecret || null,
        };

        // Clamp stats
        newChar.health = Math.max(10, Math.min(100, newChar.health));
        newChar.intelligence = Math.max(5, Math.min(100, newChar.intelligence));
        newChar.charisma = Math.max(5, Math.min(100, newChar.charisma));
        newChar.creativity = Math.max(5, Math.min(100, newChar.creativity));
        newChar.discipline = Math.max(5, Math.min(100, newChar.discipline));
        newChar.fame = Math.max(-100, Math.min(100, newChar.fame));
        newChar.influence = Math.max(-100, Math.min(100, newChar.influence));

        setCharacter(newChar);
    }, [legacyBonuses, lineage]);

    useEffect(() => {
        if (lineage) { // Continuing lineage
            setStep('character');
            generateCharacter(currentYear);
        } else if (!hasSaveData) { // Starting a new lineage without a save file
            setStep('era');
            setCharacter(null);
        }
    }, [lineage, legacyBonuses, currentYear, generateCharacter, hasSaveData]);

    const handleEraSelection = (era: Era) => {
        setSelectedEra(era);
        const year = getRandomInt(era.startYear, era.endYear);
        generateCharacter(year);
        setStep('character');
    };
    
    const handleReroll = () => {
        setCharacter(null); // Show loading spinner briefly
        setTimeout(() => {
            if (lineage) {
                generateCharacter(currentYear);
            } else if (selectedEra) {
                const year = getRandomInt(selectedEra.startYear, selectedEra.endYear);
                generateCharacter(year);
            }
        }, 150);
    };
    
    const handleBackToEraSelection = () => {
        setStep('era');
        setCharacter(null);
        setSelectedEra(null);
    };

    if (hasSaveData && !lineage) {
        return (
            <div className="w-full max-w-md text-center p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl animate-fade-in">
                <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo(a) de volta!</h2>
                <p className="text-slate-300 mb-8">Encontramos um jogo salvo. O que você gostaria de fazer?</p>
                <div className="flex flex-col gap-4">
                    <button 
                        onClick={onContinueGame} 
                        className="px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-lg hover:bg-indigo-500 transition-colors duration-200 transform hover:scale-105 shadow-lg shadow-indigo-600/30"
                    >
                        Continuar Jogo
                    </button>
                    <button 
                        onClick={onStartNewGame} 
                        className="px-6 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition-colors duration-200"
                    >
                        Começar Novo Jogo (Apaga o anterior)
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'era') {
        return (
            <div className="w-full max-w-3xl text-center p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl animate-fade-in">
                <h2 className="text-3xl font-bold text-white mb-2">Escolha sua Época</h2>
                <p className="text-slate-300 mb-8">Cada geração enfrenta desafios únicos. Onde sua história começará?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ERAS.map(era => (
                        <button 
                            key={era.name} 
                            onClick={() => handleEraSelection(era)} 
                            className="p-6 bg-slate-900/60 border border-slate-700 rounded-lg text-left transition-all duration-200 hover:bg-slate-700/50 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20 transform hover:-translate-y-1"
                        >
                            <h3 className="text-xl font-bold text-cyan-400">{era.name}</h3>
                            <p className="text-sm font-semibold text-slate-400 mb-2">{`(${era.startYear} - ${era.endYear})`}</p>
                            <p className="text-sm text-slate-300">{era.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        );
    }
    
    if (step === 'character' && !character) {
        return <div className="w-full max-w-xl text-center p-8"><LoadingSpinner onShowDebug={onShowDebug} /></div>;
    }

    if (step === 'character' && character) {
        const title = lineage ? `O Herdeiro da Família ${lineage.lastName}` : "Seu Ponto de Partida";
        const subtitle = lineage 
            ? `A ${character.generation}ª geração está prestes a começar no ano de ${currentYear}.` 
            : `Sua história começa na ${selectedEra?.name}, no ano de ${character.birthYear}. O destino lhe deu estas cartas.`;

        return (
            <div className="w-full max-w-2xl text-center p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl animate-fade-in">
                <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
                <p className="text-slate-300 mb-6">{subtitle}</p>
                
                <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-6 text-left mb-6 space-y-4">
                    {/* Character details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <p className="text-sm text-slate-400 mb-2">Detalhes</p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 text-slate-400"><GlobeAltIcon/></span>
                                    <div>
                                        <p className="text-sm text-slate-400">Local de Nascimento</p>
                                        <p className="font-semibold text-slate-100">{character.birthplace}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 text-slate-400"><HomeIcon/></span>
                                    <div>
                                        <p className="text-sm text-slate-400">Origem Familiar</p>
                                        <p className="font-semibold text-slate-100">{character.familyBackground}</p>
                                    </div>
                                </div>
                                 <div className="flex items-start gap-3">
                                    <span className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5"><ClipboardDocumentListIcon/></span>
                                    <div>
                                        <p className="text-sm text-slate-400">Seu Objetivo de Vida Inicial</p>
                                        <p className="font-semibold text-cyan-300">{character.lifeGoals[0].description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                             <p className="text-sm text-slate-400 mb-2">Traços Iniciais</p>
                            <div className="space-y-2">
                                {character.traits.map(trait => (
                                    <div key={trait.name} title={trait.description} className={`flex items-center gap-2 p-2 bg-slate-700/50 rounded-md cursor-help ${legacyBonuses?.addTraits?.find(t => t.name === trait.name) ? 'ring-2 ring-amber-400' : ''}`}>
                                    <span className={`w-5 h-5 flex-shrink-0 ${trait.type === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                                        {trait.type === 'positive' ? <PlusCircleIcon /> : <MinusCircleIcon />}
                                    </span>
                                    <p className="text-sm font-medium text-slate-200">{trait.name}</p>
                                    {legacyBonuses?.addTraits?.find(t => t.name === trait.name) && <span className="text-xs text-amber-400 font-bold ml-auto">Herdado</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weekly Challenges & Mode Selection */}
                 <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-6 text-left mb-6">
                    <h3 className="text-xl font-bold text-center text-amber-400 mb-4">Desafios Semanais do Ciclo</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        {WEEKLY_CHALLENGES.slice(0, 4).map(challenge => (
                            <div key={challenge.id} className="flex items-start gap-3 p-2 bg-slate-800/50 rounded-md">
                                <span className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"><TrophyIcon /></span>
                                <div>
                                    <p className="font-semibold text-slate-200 text-sm">{challenge.name}</p>
                                    <p className="text-xs text-slate-400">{challenge.description}</p>
                                </div>
                            </div>
                        ))}
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={() => onStart(character, true)} className="p-4 bg-indigo-600/30 border border-indigo-500 rounded-lg text-left transition-all duration-200 hover:bg-indigo-600/50 hover:border-indigo-400 transform hover:-translate-y-1 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/30">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="w-6 h-6 text-indigo-300"><UsersIcon/></span>
                                <h4 className="text-lg font-bold text-white">Vidas Paralelas</h4>
                            </div>
                            <p className="text-sm text-slate-300">Compare sua vida com a de outros, compita nos rankings e veja histórias alternativas se desenrolarem.</p>
                        </button>
                        <button onClick={() => onStart(character, false)} className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg text-left transition-all duration-200 hover:bg-slate-700/80">
                             <div className="flex items-center gap-3 mb-2">
                                <span className="w-6 h-6 text-slate-300"><StarIcon/></span>
                                <h4 className="text-lg font-bold text-white">Vida Solo</h4>
                            </div>
                            <p className="text-sm text-slate-300">Uma experiência clássica e introspectiva, focada apenas na sua jornada e legado familiar.</p>
                        </button>
                     </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleReroll}
                        className="w-full sm:w-auto px-8 py-3 bg-slate-600 text-white font-bold rounded-lg
                                hover:bg-slate-500 transition-colors duration-200"
                    >
                        Girar Novamente
                    </button>
                </div>
                 {!lineage && (
                    <button 
                        onClick={handleBackToEraSelection} 
                        className="mt-6 text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        Voltar para a seleção de época
                    </button>
                )}
            </div>
        );
    }

    return null;
};

export default StartScreen;