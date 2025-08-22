import React, { useState, useEffect } from 'react';
import { Character, FamilyBackground, Trait, Lineage, LegacyBonuses } from '../types';
import { BIRTHPLACES, LIFE_GOALS, LAST_NAMES, WEEKLY_CHALLENGES } from '../constants';
import { GlobeAltIcon, HomeIcon, PlusCircleIcon, MinusCircleIcon, StarIcon, ClipboardDocumentListIcon, TrophyIcon, UsersIcon } from './Icons';
import CharacterCreatorModal from './CharacterCreatorModal';
import { generateRandomCharacter } from '../services/characterCreationService';

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

const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const StartScreen: React.FC<StartScreenProps> = ({ onStart, lineage, legacyBonuses, currentYear, hasSaveData, onContinueGame, onStartNewGame, onShowDebug }) => {
    const [step, setStep] = useState<'menu' | 'era' | 'creation_choice' | 'creator'>('menu');
    const [selectedEra, setSelectedEra] = useState<Era | null>(null);
    const [birthYear, setBirthYear] = useState<number>(currentYear);
    const [isMultiplayer, setIsMultiplayer] = useState(false);

    useEffect(() => {
        if (lineage) {
            setStep('creation_choice');
            setBirthYear(currentYear);
        } else if (!hasSaveData) {
            setStep('era');
        } else {
            setStep('menu');
        }
    }, [lineage, hasSaveData, currentYear]);

    const handleEraSelection = (era: Era) => {
        setSelectedEra(era);
        setBirthYear(getRandomInt(era.startYear, era.endYear));
        setStep('creation_choice');
    };
    
    const handleRandomCharacterStart = () => {
        const randomChar = generateRandomCharacter(lineage, legacyBonuses, birthYear);
        onStart(randomChar, isMultiplayer);
    };

    const handleBackToMenu = () => {
        if (step === 'creator') {
            setStep('creation_choice');
            return;
        }
        setStep(lineage ? 'creation_choice' : hasSaveData ? 'menu' : 'era');
    }

    if (step === 'menu') {
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
                        onClick={() => { onStartNewGame(); setStep(lineage ? 'creation_choice' : 'era'); }}
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
    
     if (step === 'creation_choice') {
        return (
            <div className="w-full max-w-md text-center p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl animate-fade-in">
                <h2 className="text-3xl font-bold text-white mb-2">Como deseja começar?</h2>
                <p className="text-slate-300 mb-8">{lineage ? `A próxima geração da família ${lineage.lastName} está pronta.` : 'Sua nova jornada aguarda.'}</p>
                
                <div className="flex flex-col gap-4 mb-6">
                    <button 
                        onClick={() => setStep('creator')}
                        className="px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-lg hover:bg-indigo-500 transition-colors duration-200 transform hover:scale-105 shadow-lg shadow-indigo-600/30"
                    >
                        Criar Personagem
                    </button>
                    <button 
                        onClick={handleRandomCharacterStart}
                        className="px-6 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition-colors duration-200"
                    >
                        Personagem Aleatório
                    </button>
                </div>

                <div className="flex items-center gap-2 p-3 bg-slate-900/50 rounded-md border border-slate-700">
                   <label htmlFor="multiplayer-toggle" className="text-sm font-semibold text-slate-200 flex-grow text-left">Modo de Jogo:</label>
                   <button onClick={() => setIsMultiplayer(false)} className={`px-3 py-1 text-xs rounded-md ${!isMultiplayer ? 'bg-cyan-600 text-white' : 'bg-slate-700'}`}>Solo</button>
                   <button onClick={() => setIsMultiplayer(true)} className={`px-3 py-1 text-xs rounded-md ${isMultiplayer ? 'bg-cyan-600 text-white' : 'bg-slate-700'}`}>Vidas Paralelas</button>
                </div>
            </div>
        );
    }

    if (step === 'creator') {
         return (
            <CharacterCreatorModal 
                isOpen={true}
                onClose={handleBackToMenu}
                onStart={(char) => onStart(char, isMultiplayer)}
                lineage={lineage}
                legacyBonuses={legacyBonuses}
                birthYear={birthYear}
            />
        );
    }

    return null;
};

export default StartScreen;