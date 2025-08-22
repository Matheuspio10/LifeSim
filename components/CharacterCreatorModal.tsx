import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Character, FamilyBackground, RelationshipType, LegacyBonuses, Trait, Lineage, Mood, Relationship, Skill, FounderTraits } from '../types';
import { BIRTHPLACES, POSITIVE_TRAITS, NEGATIVE_TRAITS, LIFE_GOALS, LAST_NAMES, FIRST_NAMES, LINEAGE_TITLES, PORTRAIT_COLORS } from '../constants';
import { 
    GENDERS, SKIN_TONES, HAIR_STYLES, ACCESSORIES, PERSONALITY_PROFILES, BACKSTORIES, 
    ATTRIBUTE_POOL, ATTRIBUTE_BASE, ATTRIBUTE_MIN, ATTRIBUTE_MAX, FAMILY_BACKGROUNDS 
} from '../characterCreatorConstants';
import CustomizableAvatar from './CustomizableAvatar';
import { UserCircleIcon, SparklesIcon, PlusCircleIcon, MinusCircleIcon, GlobeAltIcon, ClipboardDocumentListIcon } from './Icons';
import { generateRandomCharacter } from '../services/characterCreationService';

interface CharacterCreatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: (character: Character) => void;
    lineage: Lineage | null;
    legacyBonuses: LegacyBonuses | null;
    birthYear: number;
}

const AttributeControl: React.FC<{ label: string; value: number; onIncrement: () => void; onDecrement: () => void; canIncrement: boolean; canDecrement: boolean; }> = 
({ label, value, onIncrement, onDecrement, canIncrement, canDecrement }) => (
    <div>
        <label className="block text-sm font-semibold text-slate-300 mb-1">{label}</label>
        <div className="flex items-center gap-3">
            <button onClick={onDecrement} disabled={!canDecrement} className="w-8 h-8 p-1 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><MinusCircleIcon /></button>
            <span className="text-xl font-bold text-white w-8 text-center">{value}</span>
            <button onClick={onIncrement} disabled={!canIncrement} className="w-8 h-8 p-1 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><PlusCircleIcon /></button>
        </div>
    </div>
);

const CharacterCreatorModal: React.FC<CharacterCreatorModalProps> = ({ isOpen, onClose, onStart, lineage, legacyBonuses, birthYear }) => {
    const [character, setCharacter] = useState<Partial<Character> | null>(null);

    const randomizeCharacter = useCallback(() => {
        const newChar = generateRandomCharacter(lineage, legacyBonuses, birthYear);
        setCharacter(newChar);
    }, [lineage, legacyBonuses, birthYear]);

    useEffect(() => {
        if (isOpen) {
            randomizeCharacter();
        }
    }, [isOpen, randomizeCharacter]);
    
    const handleUpdate = (field: keyof Character | `founderTraits.${keyof FounderTraits}` | 'founderTraits.accessories', value: any) => {
        setCharacter(prev => {
            if (!prev) return null;
            if (field.startsWith('founderTraits.')) {
                const subField = field.split('.')[1] as keyof FounderTraits;
                if (subField === 'accessories') {
                     return {
                        ...prev,
                        founderTraits: {
                            ...(prev.founderTraits!),
                            accessories: value
                        }
                    };
                }
                return {
                    ...prev,
                    founderTraits: {
                        ...(prev.founderTraits!),
                        [subField]: value
                    }
                };
            }
            return { ...prev, [field]: value };
        });
    };
    
    const handleStartGame = () => {
        if (character && character.name && character.lastName) {
            onStart(character as Character);
        }
    };
    
    const pointsSpent = useMemo(() => {
        if (!character) return 0;
        const intelligence = character.intelligence || ATTRIBUTE_BASE;
        const charisma = character.charisma || ATTRIBUTE_BASE;
        const creativity = character.creativity || ATTRIBUTE_BASE;
        const discipline = character.discipline || ATTRIBUTE_BASE;
        
        const spent = (intelligence - ATTRIBUTE_BASE) + (charisma - ATTRIBUTE_BASE) + (creativity - ATTRIBUTE_BASE) + (discipline - ATTRIBUTE_BASE);
        return spent;
    }, [character]);

    const pointsRemaining = ATTRIBUTE_POOL - pointsSpent;

    const handleAttributeChange = (stat: 'intelligence' | 'charisma' | 'creativity' | 'discipline', delta: number) => {
        if (!character) return;

        const currentValue = character[stat] || ATTRIBUTE_BASE;
        const newValue = currentValue + delta;

        if (delta > 0 && pointsRemaining <= 0) return;
        if (newValue < ATTRIBUTE_MIN || newValue > ATTRIBUTE_MAX) return;
        
        handleUpdate(stat, newValue);
    };

    const handleFamilyBgChange = (bg: FamilyBackground) => {
        const bgData = FAMILY_BACKGROUNDS[bg];
        setCharacter(prev => ({
            ...prev,
            familyBackground: bg,
            wealth: bgData.wealth
        }));
    };

    if (!isOpen || !character || !character.founderTraits) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-5xl h-[90vh] bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl flex flex-col md:flex-row animate-fade-in" onClick={e => e.stopPropagation()}>
                {/* Left Panel - Customization */}
                <div className="w-full md:w-3/5 p-6 overflow-y-auto">
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2"><UserCircleIcon/> Crie Sua Lenda</h2>
                    <p className="text-slate-400 mb-6">Molde o fundador da sua dinastia ou deixe o destino escolher.</p>

                    <div className="space-y-4">
                        {/* NOME & GÊNERO */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-semibold text-slate-300 mb-1">Nome</label>
                                <input type="text" value={character.name || ''} onChange={e => handleUpdate('name', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white" />
                            </div>
                             <div className="md:col-span-1">
                                <label className="block text-sm font-semibold text-slate-300 mb-1">Sobrenome</label>
                                <input type="text" value={character.lastName || ''} onChange={e => handleUpdate('lastName', e.target.value)} disabled={!!lineage} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white disabled:bg-slate-800 disabled:text-slate-400" />
                            </div>
                            <div className="md:col-span-1">
                                 <label className="block text-sm font-semibold text-slate-300 mb-1">Gênero</label>
                                 <select value={character.gender} onChange={e => handleUpdate('gender', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white">
                                     {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                                 </select>
                            </div>
                        </div>
                       
                        {/* APARÊNCIA */}
                        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                             <h3 className="text-lg font-semibold text-cyan-400 mb-3">Aparência</h3>
                             <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-300 mb-1">Tom de Pele</label>
                                        <div className="flex flex-wrap gap-2">{SKIN_TONES.map(color => <button key={color} onClick={() => handleUpdate('founderTraits.skinTone', color)} className={`w-8 h-8 rounded-full border-2 ${character.founderTraits?.skinTone === color ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: color }}></button>)}</div>
                                    </div>
                                     <div>
                                        <label className="block text-sm text-slate-300 mb-1">Cor dos Olhos</label>
                                        <div className="flex flex-wrap gap-2">{PORTRAIT_COLORS.eyes.map(color => <button key={color} onClick={() => handleUpdate('founderTraits.eyeColor', color)} className={`w-8 h-8 rounded-full border-2 ${character.founderTraits?.eyeColor === color ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: color }}></button>)}</div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-300 mb-1">Cor do Cabelo</label>
                                    <div className="flex flex-wrap gap-2">{PORTRAIT_COLORS.hair.map(color => <button key={color} onClick={() => handleUpdate('founderTraits.hairColor', color)} className={`w-8 h-8 rounded-full border-2 ${character.founderTraits?.hairColor === color ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: color }}></button>)}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-300 mb-1">Penteado</label>
                                        <select value={character.founderTraits?.hairstyle} onChange={e => handleUpdate('founderTraits.hairstyle', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white">
                                            {Object.entries(HAIR_STYLES).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-300 mb-1">Acessórios</label>
                                        <select value={character.founderTraits?.accessories?.glasses} onChange={e => handleUpdate('founderTraits.accessories', { glasses: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white">
                                            {Object.entries(ACCESSORIES).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
                                        </select>
                                    </div>
                                </div>
                             </div>
                        </div>

                         {/* ATRIBUTOS */}
                         <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                             <div className="flex justify-between items-center mb-3">
                                 <h3 className="text-lg font-semibold text-cyan-400">Atributos</h3>
                                 <div className="text-right">
                                    <p className="font-bold text-xl text-white">{pointsRemaining}</p>
                                    <p className="text-xs text-slate-400">Pontos Restantes</p>
                                 </div>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                 <AttributeControl label="Inteligência" value={character.intelligence || 0} onIncrement={() => handleAttributeChange('intelligence', 1)} onDecrement={() => handleAttributeChange('intelligence', -1)} canIncrement={pointsRemaining > 0} canDecrement={(character.intelligence || 0) > ATTRIBUTE_MIN} />
                                 <AttributeControl label="Carisma" value={character.charisma || 0} onIncrement={() => handleAttributeChange('charisma', 1)} onDecrement={() => handleAttributeChange('charisma', -1)} canIncrement={pointsRemaining > 0} canDecrement={(character.charisma || 0) > ATTRIBUTE_MIN} />
                                 <AttributeControl label="Criatividade" value={character.creativity || 0} onIncrement={() => handleAttributeChange('creativity', 1)} onDecrement={() => handleAttributeChange('creativity', -1)} canIncrement={pointsRemaining > 0} canDecrement={(character.creativity || 0) > ATTRIBUTE_MIN} />
                                 <AttributeControl label="Disciplina" value={character.discipline || 0} onIncrement={() => handleAttributeChange('discipline', 1)} onDecrement={() => handleAttributeChange('discipline', -1)} canIncrement={pointsRemaining > 0} canDecrement={(character.discipline || 0) > ATTRIBUTE_MIN} />
                             </div>
                        </div>
                        
                        {/* ORIGEM */}
                         <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                             <h3 className="text-lg font-semibold text-cyan-400 mb-3">Origem Familiar</h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {Object.entries(FAMILY_BACKGROUNDS).map(([key, value]) => (
                                    <button key={key} onClick={() => handleFamilyBgChange(key as FamilyBackground)} className={`p-3 rounded-md text-sm text-left transition-colors ${character.familyBackground === key ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                                        <p className="font-bold">{value.name}</p>
                                        <p className="text-xs opacity-80">{value.description}</p>
                                    </button>
                                ))}
                             </div>
                        </div>

                        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                             <h3 className="text-lg font-semibold text-cyan-400 mb-3">Origem & Localização</h3>
                             <div>
                                 <label className="block text-sm text-slate-300 mb-1">Local de Nascimento</label>
                                 <select value={character.birthplace || ''} onChange={e => handleUpdate('birthplace', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white">
                                     {BIRTHPLACES.map(place => <option key={place} value={place}>{place}</option>)}
                                 </select>
                             </div>
                        </div>

                        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                             <h3 className="text-lg font-semibold text-cyan-400 mb-3">Meta de Vida Inicial</h3>
                             <div>
                                 <label className="block text-sm text-slate-300 mb-1">Escolha um objetivo que guiará seus primeiros passos.</label>
                                 <select 
                                    value={character.lifeGoals?.[0]?.description || ''} 
                                    onChange={e => handleUpdate('lifeGoals', [{ description: e.target.value, completed: false }])} 
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                                >
                                     {LIFE_GOALS.map(goal => <option key={goal} value={goal}>{goal}</option>)}
                                 </select>
                             </div>
                        </div>

                    </div>
                </div>
                {/* Right Panel - Preview & Actions */}
                <div className="w-full md:w-2/5 p-6 bg-slate-900/50 flex flex-col">
                    <div className="flex-grow flex flex-col items-center justify-center text-center">
                        <div className="w-48 h-48 bg-slate-700 rounded-lg mb-4 border-4 border-slate-600 group">
                            <CustomizableAvatar
                                skinTone={character.founderTraits.skinTone}
                                hairColor={character.founderTraits.hairColor}
                                eyeColor={character.founderTraits.eyeColor}
                                hairstyle={character.founderTraits.hairstyle}
                                accessory={character.founderTraits.accessories?.glasses || 'none'}
                            />
                        </div>
                        <h3 className="text-2xl font-bold text-white">{character.name || 'Nome'} {character.lastName || 'Sobrenome'}</h3>
                        <p className="text-slate-400">Riqueza Inicial: ${character.wealth?.toLocaleString()}</p>
                        
                        <div className="mt-4 text-left w-full max-w-xs space-y-2">
                             <div className="flex items-start gap-2 text-sm text-slate-300">
                                <span className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5"><GlobeAltIcon /></span>
                                <p><span className="font-semibold text-slate-400">De:</span> {character.birthplace}</p>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-slate-300">
                                <span className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5"><ClipboardDocumentListIcon /></span>
                                <p><span className="font-semibold text-slate-400">Meta:</span> {character.lifeGoals?.[0]?.description}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3 mt-6">
                        <button onClick={randomizeCharacter} className="w-full py-3 bg-amber-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-amber-500 transition-colors"><SparklesIcon/> Personagem Aleatório</button>
                        <button onClick={handleStartGame} disabled={pointsRemaining < 0} className="w-full py-4 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
                            {pointsRemaining < 0 ? `${Math.abs(pointsRemaining)} pontos acima do limite!` : 'Salvar e Iniciar Jogo'}
                        </button>
                        <button onClick={onClose} className="w-full text-center text-sm text-slate-400 py-2 hover:text-white transition-colors">Voltar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharacterCreatorModal;