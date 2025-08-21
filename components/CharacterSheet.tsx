
import React, { useState, useRef, useEffect } from 'react';
import { Character, LifeStage, Lineage, Mood, HobbyType } from '../types';
import StatDisplay from './StatDisplay';
import { HeartIcon, BrainIcon, UserGroupIcon, CurrencyDollarIcon, LightBulbIcon, ShieldCheckIcon, PlusCircleIcon, MinusCircleIcon, GlobeAltIcon, HomeIcon, StarIcon, UsersIcon, BriefcaseIcon, ScaleIcon, BookOpenIcon, ExclamationTriangleIcon, ClipboardDocumentListIcon, SparklesIcon, CheckCircleIcon, ChartBarIcon, SpeakerWaveIcon, PixelArtPortraitIcon, FaceSmileIcon, FaceFrownIcon, FireIcon, HandThumbUpIcon, CloudIcon, PencilSquareIcon, MusicalNoteIcon, PaintBrushIcon, BeakerIcon, TrophyIcon, Cog6ToothIcon, PuzzlePieceIcon } from './Icons';
import SpectrumDisplay from './SpectrumDisplay';
import LineageCrestDisplay from './LineageCrestDisplay';
import { TOTAL_MONTHS_PER_YEAR } from '../constants';

interface CharacterSheetProps {
  character: Character;
  lifeStage: LifeStage;
  lineage: Lineage | null;
  isTurboMode: boolean;
  onToggleTurboMode: () => void;
  onChangeApiKey: () => void;
  onFullReset: () => void;
  monthsRemainingInYear: number;
  onOpenFamilyBook: () => void;
}

const RelationshipBar: React.FC<{ intimacy: number }> = ({ intimacy }) => {
    const percentage = ((intimacy + 100) / 200) * 100;
    let color = 'bg-slate-500'; // Neutral
    if (intimacy > 50) color = 'bg-green-500'; // Strong Positive
    else if (intimacy > 10) color = 'bg-emerald-500'; // Positive
    else if (intimacy < -50) color = 'bg-red-600'; // Strong Negative
    else if (intimacy < -10) color = 'bg-rose-500'; // Negative

    return (
        <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
            <div
                className={`${color} h-1.5 rounded-full`}
                style={{ width: `${percentage}%` }}
                title={`Intimidade: ${intimacy}`}
            ></div>
        </div>
    );
};

const MoodDisplay: React.FC<{ mood: Mood }> = ({ mood }) => {
    const moodConfig = {
        [Mood.HAPPY]: { icon: <FaceSmileIcon />, color: 'text-green-400', label: 'Feliz' },
        [Mood.CONTENT]: { icon: <HandThumbUpIcon />, color: 'text-cyan-400', label: 'Contente' },
        [Mood.STRESSED]: { icon: <CloudIcon />, color: 'text-yellow-400', label: 'Estressado(a)' },
        [Mood.SAD]: { icon: <FaceFrownIcon />, color: 'text-blue-400', label: 'Triste' },
        [Mood.ANGRY]: { icon: <FireIcon />, color: 'text-red-500', label: 'Irritado(a)' },
    };
    
    const config = moodConfig[mood] || moodConfig[Mood.CONTENT];

    return (
        <div className="mt-6 pt-6 border-t border-slate-700">
             <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Humor Atual</h3>
            <div className={`p-2 bg-slate-700/50 rounded-md text-sm font-medium text-center flex items-center justify-center gap-2 ${config.color}`}>
              <span className="w-5 h-5">{config.icon}</span>
              {config.label}
            </div>
        </div>
    );
}

const CareerBar: React.FC<{ level: number }> = ({ level }) => {
    return (
        <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
            <div
                className="bg-sky-500 h-1.5 rounded-full"
                style={{ width: `${level}%` }}
                title={`Nível de Carreira: ${level}`}
            ></div>
        </div>
    );
}

const HobbyBar: React.FC<{ level: number, color: string }> = ({ level, color }) => {
    return (
        <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
            <div
                className={`${color} h-1.5 rounded-full`}
                style={{ width: `${level}%` }}
                title={`Nível: ${level}`}
            ></div>
        </div>
    );
}


const CharacterSheet: React.FC<CharacterSheetProps> = ({ character, lifeStage, lineage, isTurboMode, onToggleTurboMode, onChangeApiKey, onFullReset, monthsRemainingInYear, onOpenFamilyBook }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const displayName = lineage?.title ? `${lineage.title} dos ${character.lastName}` : `${character.name} ${character.lastName}`;
  const currentMonth = Math.max(1, TOTAL_MONTHS_PER_YEAR - monthsRemainingInYear + 1);
  
  const hobbyConfig = {
      [HobbyType.ART]: { icon: <PaintBrushIcon />, color: 'bg-purple-500' },
      [HobbyType.MUSIC]: { icon: <MusicalNoteIcon />, color: 'bg-yellow-500' },
      [HobbyType.COOKING]: { icon: <BeakerIcon />, color: 'bg-orange-500' },
      [HobbyType.SPORTS]: { icon: <TrophyIcon />, color: 'bg-green-500' },
      [HobbyType.GAMBLING]: { icon: <CurrencyDollarIcon />, color: 'bg-red-600' },
  }
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
            setIsSettingsOpen(false);
        }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingsRef]);


  return (
    <aside className="relative w-full md:w-80 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-2xl flex-shrink-0 self-start">
      <div className="absolute top-4 right-4" ref={settingsRef}>
          <button
            onClick={() => setIsSettingsOpen(prev => !prev)}
            className="w-8 h-8 p-1 text-slate-400 hover:text-white transition-colors"
            aria-label="Abrir configurações"
          >
            <Cog6ToothIcon />
          </button>
          {isSettingsOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 animate-fade-in-fast">
              <button
                onClick={() => {
                  onChangeApiKey();
                  setIsSettingsOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-slate-800 rounded-t-lg"
              >
                Mudar Chave de API (Manter Jogo)
              </button>
              <button
                onClick={() => {
                  onFullReset();
                  setIsSettingsOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-800 rounded-b-lg border-t border-slate-700"
              >
                Reiniciar Jogo (Apaga Tudo)
              </button>
            </div>
          )}
        </div>
      <div className="text-center mb-6 relative">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 flex items-center gap-2">
            {lineage && <LineageCrestDisplay crest={lineage.crest} />}
            {lineage && (
                <button 
                    onClick={onOpenFamilyBook}
                    className="w-10 h-10 p-2 bg-amber-800/80 border border-amber-600 rounded-full text-amber-200 hover:bg-amber-700 transition-colors"
                    title="Abrir Livro da Família"
                >
                    <BookOpenIcon />
                </button>
            )}
        </div>
        <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-slate-600 bg-slate-700 shadow-lg mt-8">
            <PixelArtPortraitIcon 
                hairColor={character.founderTraits.hairColor} 
                eyeColor={character.founderTraits.eyeColor} 
            />
        </div>
        <h2 className="text-xl font-bold text-white">{displayName}</h2>
        {!lineage?.title && <p className="text-sm text-slate-400">{character.name} {character.lastName}</p>}
        <p className="text-lg text-cyan-400 font-semibold">{`Geração ${character.generation} | Idade: ${character.age}`}</p>
        <p className="text-sm text-slate-400">Ano: {character.birthYear + character.age} | Período: {currentMonth}/{TOTAL_MONTHS_PER_YEAR}</p>
        <p className="mt-2 text-sm bg-cyan-900/50 text-cyan-300 rounded-full px-3 py-1 inline-block">{lifeStage}</p>
      </div>
      <div className="space-y-4">
        <StatDisplay label="Saúde" value={character.health} icon={<HeartIcon />} color="bg-red-500" />
        <StatDisplay label="Inteligência" value={character.intelligence} icon={<BrainIcon />} color="bg-blue-500" />
        <StatDisplay label="Carisma" value={character.charisma} icon={<UserGroupIcon />} color="bg-yellow-500" />
        <StatDisplay label="Criatividade" value={character.creativity} icon={<LightBulbIcon />} color="bg-purple-500" />
        <StatDisplay label="Disciplina" value={character.discipline} icon={<ShieldCheckIcon />} color="bg-green-500" />
        <StatDisplay label="Riqueza" value={character.wealth} icon={<CurrencyDollarIcon />} isCurrency={true} />
        {character.investments > 0 && 
            <StatDisplay label="Investimentos" value={character.investments} icon={<ChartBarIcon />} isCurrency={true} />
        }
        {character.favors > 0 &&
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-2">
                    <span className="text-purple-400 w-5 h-5"><PuzzlePieceIcon /></span>
                    <span className="font-semibold text-slate-300">Favores da Família</span>
                </div>
                <span className="font-bold text-lg text-white">{character.favors}</span>
            </div>
        }
      </div>

      {character.healthCondition && (
        <div className="mt-6 pt-6 border-t border-slate-700">
             <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-4 h-4 text-yellow-400"><ExclamationTriangleIcon /></span>
                Estado de Saúde
            </h3>
            <div className="p-2 bg-yellow-900/50 rounded-md text-yellow-300 text-sm font-medium text-center">
              {character.healthCondition.name}
            </div>
        </div>
      )}
      
      <MoodDisplay mood={character.mood} />

      <div className="space-y-4 mt-6 pt-6 border-t border-slate-700">
        <SpectrumDisplay
            label="Moralidade"
            value={character.morality}
            icon={<ScaleIcon />}
            gradient="from-rose-600 via-slate-500 to-sky-500"
            getLabel={(value) => {
                if (value > 60) return 'Justo(a)';
                if (value > 20) return 'Ético(a)';
                if (value > -20) return 'Ambíguo(a)';
                if (value > -60) return 'Antiético(a)';
                return 'Corrupto(a)';
            }}
        />
        <SpectrumDisplay
            label="Fama"
            value={character.fame}
            icon={<StarIcon />}
            gradient="from-purple-600 via-slate-500 to-amber-400"
            getLabel={(value) => {
                if (value > 80) return 'Lenda Global';
                if (value > 50) return 'Celebridade';
                if (value > 20) return 'Conhecido(a)';
                if (value > -20) return 'Anônimo(a)';
                if (value > -50) return 'Controverso(a)';
                return 'Infame';
            }}
        />
        <SpectrumDisplay
            label="Influência"
            value={character.influence}
            icon={<SpeakerWaveIcon />}
            gradient="from-red-600 via-slate-500 to-cyan-400"
            getLabel={(value) => {
                if (value > 80) return 'Ícone Global';
                if (value > 50) return 'Figura Nacional';
                if (value > 20) return 'Líder Comunitário';
                if (value > -20) return 'Cidadão Comum';
                if (value > -50) return 'Figura Polêmica';
                return 'Inimigo Público';
            }}
        />
      </div>


       <div className="mt-6 pt-4 border-t border-slate-700">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Origem</h3>
         <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2 text-slate-300"><span className="w-5 h-5 text-slate-400"><StarIcon/></span> Nascido(a) em: {character.birthYear}</p>
            <p className="flex items-center gap-2 text-slate-300"><span className="w-5 h-5 text-slate-400"><GlobeAltIcon/></span> Nasceu em {character.birthplace}</p>
            <p className="flex items-center gap-2 text-slate-300"><span className="w-5 h-5 text-slate-400"><HomeIcon/></span> Família de origem {character.familyBackground}</p>
         </div>
      </div>

       <div className="mt-4 pt-4 border-t border-slate-700">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-4 h-4"><ClipboardDocumentListIcon /></span>
            Lista de Metas
        </h3>
        <div className="space-y-2">
            {character.lifeGoals.length > 0 ? (
                character.lifeGoals.map((goal, index) => (
                    <div key={index} className="flex items-start gap-2">
                        <span className={`w-5 h-5 flex-shrink-0 mt-0.5 ${goal.completed ? 'text-green-400' : 'text-cyan-400'}`}>
                            {goal.completed ? <CheckCircleIcon /> : <SparklesIcon />}
                        </span>
                        <p className={`text-sm font-medium ${goal.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                            {goal.description}
                        </p>
                    </div>
                ))
            ) : (
                <p className="text-sm text-slate-500 italic">Sem metas definidas.</p>
            )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-4 h-4"><BriefcaseIcon /></span>
            Carreira
        </h3>
        {character.profession ? (
          <div>
            <div className="flex justify-between items-baseline">
                <p className="text-sm font-medium text-slate-200">{character.jobTitle}</p>
            </div>
            <p className="text-xs text-slate-400 mb-1">{character.profession}</p>
            <CareerBar level={character.careerLevel} />
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">Desempregado(a)</p>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-700">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Traços</h3>
        <div className="space-y-2">
          {character.traits.map(trait => (
            <div key={trait.name} title={trait.description} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-md cursor-help">
              <span className={`w-5 h-5 flex-shrink-0 ${trait.type === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                {trait.type === 'positive' ? <PlusCircleIcon /> : <MinusCircleIcon />}
              </span>
              <p className="text-sm font-medium text-slate-200">{trait.name}{trait.level ? ` Nv. ${trait.level}`: ''}</p>
            </div>
          ))}
        </div>
      </div>
       <div className="mt-4 pt-4 border-t border-slate-700">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Hobbies</h3>
        {character.hobbies.length > 0 ? (
            <div className="space-y-3">
            {character.hobbies.map((hobby) => {
                const config = hobbyConfig[hobby.type];
                return (
                    <div key={hobby.type}>
                        <div className="flex justify-between items-baseline">
                           <div className="flex items-center gap-2">
                               <span className="w-5 h-5 text-cyan-400">{config?.icon}</span>
                               <p className="text-sm font-medium text-slate-200">{hobby.type}</p>
                           </div>
                           <p className="text-xs text-slate-400">{hobby.description}</p>
                        </div>
                        <HobbyBar level={hobby.level} color={config?.color || 'bg-slate-500'} />
                    </div>
                );
            })}
            </div>
        ) : (
            <p className="text-sm text-slate-500 italic">Nenhum hobby desenvolvido.</p>
        )}
      </div>

       <div className="mt-4 pt-4 border-t border-slate-700">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-4 h-4"><BookOpenIcon /></span>
            Memórias
        </h3>
        {character.memories.length > 0 ? (
            <div>
                 <p className="text-sm text-slate-400 mb-2">
                    {character.memories.length} memórias coletadas.
                </p>
                <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                    {character.memories.slice(-3).reverse().map((memory, index) => <li key={index} className="truncate" title={memory.name}>{memory.name}</li>)}
                </ul>
            </div>
        ) : (
          <p className="text-sm text-slate-500 italic">Nenhuma memória coletada ainda.</p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-4 h-4"><PencilSquareIcon /></span>
            Itens Criados
        </h3>
        {character.craftedItems.length > 0 ? (
          <div className="space-y-2">
            {character.craftedItems.map((item, index) => (
              <div key={index} title={item.description} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-md cursor-help">
                <span className="w-5 h-5 flex-shrink-0 text-cyan-400">
                  <PencilSquareIcon />
                </span>
                <p className="text-sm font-medium text-slate-200">{item.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">Nenhum item especial foi criado.</p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Bens</h3>
        {character.assets.length > 0 ? (
          <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
            {character.assets.map((asset, index) => <li key={index}>{asset}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-slate-500 italic">Nenhum bem adquirido.</p>
        )}
      </div>

       <div className="mt-4 pt-4 border-t border-slate-700">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-4 h-4"><UsersIcon /></span>
            Relacionamentos
        </h3>
        {character.relationships.length > 0 ? (
          <div className="space-y-3">
            {character.relationships.map((rel) => (
              <div key={rel.name} className="group relative">
                 <div className="flex justify-between items-baseline">
                    <p className="text-sm font-medium text-slate-200">{rel.name}</p>
                    <p className="text-xs text-slate-400">{rel.type}</p>
                 </div>
                 <RelationshipBar intimacy={rel.intimacy} />
                 {rel.history && rel.history.length > 0 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-3 bg-slate-950 border border-slate-600 rounded-lg shadow-xl text-sm text-slate-300 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <p className="font-bold text-slate-100 mb-1">Últimas Interações:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                            {rel.history.slice(-3).reverse().map((mem, i) => <li key={i}>{mem}</li>)}
                        </ul>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-950"></div>
                    </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">Nenhum relacionamento significativo.</p>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-700">
          <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Modo Avançado</h3>
              <button 
                  onClick={onToggleTurboMode} 
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${!isTurboMode ? 'bg-cyan-500' : 'bg-slate-600'}`}
                  aria-label="Ativar Modo Avançado"
              >
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${!isTurboMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
              Ativa um modelo de IA mais complexo para gerar eventos com maior profundidade e imprevisibilidade. As respostas podem ser mais lentas.
          </p>
      </div>

    </aside>
  );
};

const style = `
@keyframes fade-in-fast {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in-fast {
  animation: fade-in-fast 0.1s ease-out forwards;
}
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = style;
document.head.appendChild(styleSheet);

export default CharacterSheet;
