import React, { useState, useMemo } from 'react';
import { LegacyBonuses, Trait, Character, Lineage, RelationshipType, Relationship, Skill } from '../types';
import { LINEAGE_TITLES, POSITIVE_TRAITS, NEGATIVE_TRAITS } from '../constants';
import { 
    CrownIcon, 
    CurrencyDollarIcon, 
    BrainIcon, 
    UserGroupIcon, 
    LightBulbIcon, 
    ShieldCheckIcon, 
    HeartIcon, 
    SpeakerWaveIcon, 
    StarIcon, 
    PuzzlePieceIcon, 
    ShieldExclamationIcon,
    FireIcon,
    GlobeAltIcon,
    ScaleIcon,
    BookOpenIcon,
    PlusCircleIcon,
    MinusCircleIcon,
    TrophyIcon,
    UsersIcon
} from './Icons';

interface LegacyScreenProps {
  points: number;
  onStart: (bonuses: LegacyBonuses) => void;
  finalCharacter: Character | null;
  lineage: Lineage | null;
}

interface UniqueBonusConfig {
    id: string;
    name: string;
    description: string;
    flavorText: string;
    cost: number;
    icon: React.ReactNode;
    bonus: LegacyBonuses;
}

interface StackableBonusConfig {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    maxPurchases: number;
    costs: number[];
    getBonusForLevel: (level: number) => LegacyBonuses;
    getEffectForLevel: (level: number) => string;
}

// --- Helper Functions ---
const renderBonusEffect = (value: number | undefined, label: string) => {
  if (!value) return null;
  const isPositive = value > 0;
  const color = isPositive ? 'text-green-400' : 'text-red-400';
  const icon = isPositive ? <PlusCircleIcon /> : <MinusCircleIcon />;
  return <div className={`flex items-center gap-1.5 text-sm ${color}`}><span className="w-4 h-4">{icon}</span> {value > 0 ? '+' : ''}{value} {label}</div>;
};

const renderTraitEffect = (traits: Trait[] | undefined) => {
    if (!traits || traits.length === 0) return null;
    return traits.map(trait => {
         if (!trait) return null;
         const isPositive = trait.type === 'positive';
         const color = isPositive ? 'text-green-400' : 'text-red-400';
         const icon = isPositive ? <PlusCircleIcon /> : <MinusCircleIcon />;
         return <div key={trait.name} className={`flex items-center gap-1.5 text-sm ${color}`}><span className="w-4 h-4">{icon}</span> Traço: {trait.name}</div>;
    });
};
 const renderSecretEffect = (secret: string | undefined) => {
    if (!secret) return null;
    return <div className="flex items-center gap-1.5 text-sm text-purple-400"><span className="w-4 h-4"><BookOpenIcon/></span> Herda um Segredo</div>;
};

const renderGenericEffect = (text: string | undefined, icon: React.ReactNode) => {
    if (!text) return null;
    return <div className="flex items-center gap-1.5 text-sm text-green-400"><span className="w-4 h-4">{icon}</span> {text}</div>;
}

const mergeBonuses = (b1: LegacyBonuses, b2: LegacyBonuses): LegacyBonuses => {
    const merged: LegacyBonuses = { ...b1 };
    
    for (const key in b2) {
        const k = key as keyof LegacyBonuses;
        switch (k) {
            case 'addTraits':
                merged.addTraits = [...(merged.addTraits || []), ...(b2.addTraits || [])];
                break;
            case 'addSkills':
                merged.addSkills = [...(merged.addSkills || []), ...(b2.addSkills || [])];
                break;
            case 'addAssets':
                merged.addAssets = [...(merged.addAssets || []), ...(b2.addAssets || [])];
                break;
            case 'addRelationships':
                merged.addRelationships = [...(merged.addRelationships || []), ...(b2.addRelationships || [])];
                break;
            case 'inheritedSecret':
                merged.inheritedSecret = b2.inheritedSecret || merged.inheritedSecret;
                break;
            case 'wealth':
            case 'intelligence':
            case 'charisma':
            case 'creativity':
            case 'discipline':
            case 'health':
            case 'influence':
            case 'fame':
            case 'favors':
                merged[k] = (merged[k] || 0) + (b2[k] || 0);
                break;
        }
    }
    return merged;
};

// --- Sub-components ---
const StackableBonusCard: React.FC<{
    config: StackableBonusConfig,
    currentLevel: number,
    canAfford: boolean,
    onPurchase: () => void
}> = ({ config, currentLevel, canAfford, onPurchase }) => {
    const isMaxed = currentLevel >= config.maxPurchases;
    const nextCost = isMaxed ? 0 : config.costs[currentLevel];
    const isDisabled = isMaxed || !canAfford;

    return (
        <div className="flex flex-col p-4 bg-slate-900/60 border border-slate-700 rounded-lg text-left h-full">
            <div className="flex items-start gap-3 mb-2">
                <span className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1">{config.icon}</span>
                <div>
                    <p className="font-bold text-slate-100">{config.name}</p>
                    <p className="text-sm text-slate-400">{config.description}</p>
                </div>
            </div>
            <div className="flex-grow"></div>
             <div className="flex items-center justify-between mt-3 mb-3">
                <div className="flex items-center gap-1">
                    {Array.from({ length: config.maxPurchases }).map((_, i) => (
                        <div key={i} className={`w-4 h-4 rounded-sm ${i < currentLevel ? 'bg-amber-500' : 'bg-slate-600'}`}></div>
                    ))}
                </div>
                <span className="text-sm font-semibold text-amber-300">
                    {currentLevel > 0 ? config.getEffectForLevel(currentLevel) : 'Nenhum Bônus'}
                </span>
            </div>
            <button
                onClick={onPurchase}
                disabled={isDisabled}
                className={`w-full text-center px-4 py-3 rounded-lg font-bold transition-colors
                           ${isMaxed ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : ''}
                           ${!isMaxed && canAfford ? 'bg-amber-600 text-white hover:bg-amber-500' : ''}
                           ${!isMaxed && !canAfford ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : ''}`}
            >
                {isMaxed ? 'Máximo Atingido' : `Próximo Nível: ${nextCost} Pontos`}
            </button>
        </div>
    );
};


const LegacyScreen: React.FC<LegacyScreenProps> = ({ points, onStart, finalCharacter, lineage }) => {
    const [selectedUniqueBonuses, setSelectedUniqueBonuses] = useState<string[]>([]);
    const [stackablePurchases, setStackablePurchases] = useState<Record<string, number>>({});

    const lineageTitleBonus = useMemo(() => {
      if (!lineage?.title) return null;
      return LINEAGE_TITLES.find(t => t.name === lineage.title);
    }, [lineage]);
    
    // --- Bonus Configurations ---
    const uniqueBonusesConfig: UniqueBonusConfig[] = useMemo(() => [
        { id: 'questionableFortune', name: 'Fortuna Questionável', description: 'Sua família acumulou riqueza por meios... criativos. Você começa com dinheiro, mas também com um alvo nas costas.', flavorText: ' Manchete do "Clarim Diário": "A família [Sobrenome] novamente se vê no centro de uma polêmica financeira..."', cost: 10, icon: <ScaleIcon />, bonus: { wealth: 15000, addTraits: [NEGATIVE_TRAITS.find(t => t.name === 'Histórico Familiar Duvidoso')!] } },
        { id: 'curiosityGene', name: 'Gene da Curiosidade', description: 'Seus ancestrais eram inventores e sonhadores. Você herda a genialidade, mas também a incapacidade de focar em uma coisa só.', flavorText: ' Do diário do seu avô: "Tantas ideias, tão pouco tempo! Hoje comecei a construir um relógio de cuco movido a vapor. Abandonei o projeto do barco a remo..."', cost: 12, icon: <BrainIcon />, bonus: { intelligence: 5, creativity: 5, addTraits: [NEGATIVE_TRAITS.find(t => t.name === 'Distração Crônica')!] } },
        { id: 'rebelBranch', name: 'Ramo Rebelde', description: 'Sua linhagem é famosa por quebrar corações e regras. Você atrai pessoas facilmente, mas a estabilidade não é seu forte.', flavorText: ' "Ele(a) tem o charme dos [Sobrenome], mas cuidado, eles nunca ficam por muito tempo." - Fofoca da vizinhança.', cost: 8, icon: <FireIcon />, bonus: { charisma: 8, discipline: -5 } },
        { id: 'badReputation', name: 'Ancestrais de Fama Ruim', description: 'Você já nasce famoso, mas pelos motivos errados. Limpar o nome da família será seu maior desafio.', flavorText: ' "Um [Sobrenome] tentando ser uma boa pessoa? Essa é nova. Vamos ver quanto tempo dura." - Editorial de um jornal local.', cost: 3, icon: <StarIcon />, bonus: { fame: -15, addTraits: [NEGATIVE_TRAITS.find(t => t.name === 'Reputação Manchada')!] } },
        { id: 'adventurousSpirit', name: 'Espírito de Aventura', description: 'Seus ancestrais foram exploradores e pioneiros. Você herda a coragem deles, e a tendência a pular antes de olhar.', flavorText: ' Uma velha carta: "Vendi a fazenda para comprar um mapa que leva a uma cidade perdida. O que poderia dar errado?"', cost: 8, icon: <GlobeAltIcon />, bonus: { health: 5, addTraits: [NEGATIVE_TRAITS.find(t => t.name === 'Impulsivo')!] } },
        { id: 'hiddenInheritance', name: 'Herança Oculta', description: 'Seu parente deixou para trás mais do que memórias. Um segredo, um item, uma dívida... algo que mudará sua vida.', flavorText: ' "Para meu querido herdeiro, guarde esta chave. Ela abre a caixa que contém nosso maior triunfo... ou nossa ruína." - Trecho do testamento.', cost: 18, icon: <PuzzlePieceIcon />, bonus: { inheritedSecret: 'A chave para o cofre antigo da família.' } },
        { id: 'politicalContact', name: 'Contato Político', description: 'Sua família tem amigos nos lugares certos. Você herda influência, mas também o escrutínio que vem com ela.', flavorText: 'Seu pai sempre dizia: "É bom ter o prefeito na discagem rápida, mas lembre-se que ele também tem o seu número."', cost: 12, icon: <SpeakerWaveIcon />, bonus: { influence: 10, addTraits: [NEGATIVE_TRAITS.find(t => t.name === 'Sob os Holofotes')!] } },
        { id: 'richPatron', name: 'Amizade com Patrono Rico', description: 'Um patrono rico e influente financiou os estudos da sua família. Você começa com uma rede de contatos, mas também com uma dívida de gratidão.', flavorText: 'O envelope anual do Sr. Vandergelb sempre vinha com um cheque e um bilhete: "Espero grandes coisas de você."', cost: 15, icon: <UsersIcon />, bonus: { influence: 5, addTraits: [NEGATIVE_TRAITS.find(t => t.name === 'Dívida de Gratidão')!], addRelationships: [{ name: 'Patrono da Família', type: RelationshipType.MENTOR, intimacy: 60, history: ['Financiou seus estudos.'] }] } },
        { id: 'secretSociety', name: 'Acesso à Sociedade Secreta', description: 'Um ancestral fazia parte de uma ordem secreta. Você recebe um convite para seguir os mesmos passos.', flavorText: 'Um anel com um brasão que você nunca viu antes chega pelo correio, com um bilhete: "Eles estão observando."', cost: 20, icon: <BookOpenIcon />, bonus: { inheritedSecret: 'Um convite para uma sociedade secreta.' } },
    ], [lineage]);
    
    const stackableBonusesConfig: StackableBonusConfig[] = [
        { id: 'wealth', name: 'Fortuna Herdada', description: 'Comece a vida com uma vantagem financeira.', icon: <CurrencyDollarIcon />, maxPurchases: 5, costs: [1, 2, 3, 5, 8], getBonusForLevel: (level) => ({ wealth: 10000 * level }), getEffectForLevel: (level) => `+$${(10000 * level).toLocaleString()}` },
        { id: 'intelligence', name: 'Cultura Erudita', description: 'Uma herança de conhecimento e aprendizado.', icon: <BrainIcon />, maxPurchases: 4, costs: [1, 2, 4, 6], getBonusForLevel: (level) => ({ intelligence: 2 * level }), getEffectForLevel: (level) => `+${2 * level} Intel.` },
        { id: 'charisma', name: 'Carisma Nato', description: 'Sua família sempre soube como encantar.', icon: <UserGroupIcon />, maxPurchases: 4, costs: [1, 2, 4, 6], getBonusForLevel: (level) => ({ charisma: 2 * level }), getEffectForLevel: (level) => `+${2 * level} Caris.` },
        { id: 'creativity', name: 'Criatividade Estimulada', description: 'A veia artística é forte em sua linhagem.', icon: <LightBulbIcon />, maxPurchases: 4, costs: [1, 2, 4, 6], getBonusForLevel: (level) => ({ creativity: 2 * level }), getEffectForLevel: (level) => `+${2 * level} Criat.` },
        { id: 'health', name: 'Saúde de Ferro', description: 'Uma linhagem de pessoas fortes e resistentes.', icon: <HeartIcon />, maxPurchases: 4, costs: [1, 2, 4, 6], getBonusForLevel: (level) => ({ health: 2 * level }), getEffectForLevel: (level) => `+${2 * level} Saúde` },
        { id: 'discipline', name: 'Disciplina da Casa', description: 'Uma herança de foco e determinação.', icon: <ShieldCheckIcon />, maxPurchases: 4, costs: [1, 2, 4, 6], getBonusForLevel: (level) => ({ discipline: 2 * level }), getEffectForLevel: (level) => `+${2 * level} Disc.` },
        { id: 'influence', name: 'Influência Familiar', description: 'O nome da sua família abre portas.', icon: <SpeakerWaveIcon />, maxPurchases: 3, costs: [2, 4, 7], getBonusForLevel: (level) => ({ influence: 4 * level }), getEffectForLevel: (level) => `+${4 * level} Influ.` },
        { id: 'favors', name: 'Favor de Família', description: 'Acumule favores que podem ser usados para reverter eventos ruins.', icon: <PuzzlePieceIcon />, maxPurchases: 3, costs: [2, 4, 7], getBonusForLevel: (level) => ({ favors: level }), getEffectForLevel: (level) => `+${level} Favor(es)` },
        { id: 'luck', name: 'Sorte Familiar', description: 'Aumenta a chance de eventos positivos aleatórios.', icon: <StarIcon />, maxPurchases: 5, costs: [1, 2, 3, 4, 5], getBonusForLevel: (level) => ({ addTraits: [{ name: 'Sorte Familiar', description: `O destino parece sorrir para você. (Nv. ${level})`, type: 'positive', level }] }), getEffectForLevel: (level) => `Sorte Nv. ${level}` },
    ];


    const spentPoints = useMemo(() => {
        const uniqueCost = selectedUniqueBonuses.reduce((total, id) => {
            const bonus = uniqueBonusesConfig.find(b => b.id === id);
            return total + (bonus ? bonus.cost : 0);
        }, 0);

        const stackableCost = Object.entries(stackablePurchases).reduce((total, [id, level]) => {
            const config = stackableBonusesConfig.find(b => b.id === id);
            if (config) {
                const costForLevels = config.costs.slice(0, level).reduce((sum, cost) => sum + cost, 0);
                return total + costForLevels;
            }
            return total;
        }, 0);

        return uniqueCost + stackableCost;
    }, [selectedUniqueBonuses, stackablePurchases, uniqueBonusesConfig, stackableBonusesConfig]);
    
    const handleSelectUnique = (bonusId: string) => {
        const bonus = uniqueBonusesConfig.find(b => b.id === bonusId);
        if (!bonus) return;
        
        const isSelected = selectedUniqueBonuses.includes(bonusId);

        if (isSelected) {
            setSelectedUniqueBonuses(prev => prev.filter(id => id !== bonusId));
        } else if (spentPoints + bonus.cost <= points) {
            setSelectedUniqueBonuses(prev => [...prev, bonusId]);
        }
    };

    const handleSelectStackable = (bonusId: string) => {
        const config = stackableBonusesConfig.find(b => b.id === bonusId);
        if (!config) return;

        const currentLevel = stackablePurchases[bonusId] || 0;
        if (currentLevel >= config.maxPurchases) return;

        const nextCost = config.costs[currentLevel];
        if (spentPoints + nextCost <= points) {
            setStackablePurchases(prev => ({
                ...prev,
                [bonusId]: currentLevel + 1
            }));
        }
    };
    
    const handleStart = () => {
        let finalBonuses: LegacyBonuses = { addTraits: [], addSkills: [], addAssets: [], addRelationships: [] };

        if (lineageTitleBonus?.bonus) {
            finalBonuses = mergeBonuses(finalBonuses, lineageTitleBonus.bonus);
        }
        
        for (const id of selectedUniqueBonuses) {
            const bonus = uniqueBonusesConfig.find(b => b.id === id);
            if (bonus) finalBonuses = mergeBonuses(finalBonuses, bonus.bonus);
        }

        for (const [id, level] of Object.entries(stackablePurchases)) {
            if (level > 0) {
                const config = stackableBonusesConfig.find(b => b.id === id);
                if (config) {
                     // We get the bonus for the final level, not for each level, to avoid stacking traits incorrectly
                    const stackBonus = config.getBonusForLevel(level);
                    finalBonuses = mergeBonuses(finalBonuses, stackBonus);
                }
            }
        }
        onStart(finalBonuses);
    };

    return (
        <div className="w-full max-w-6xl text-center p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl animate-fade-in">
            <h2 className="text-3xl font-bold text-amber-400 mb-2">Editor de Legado</h2>
            <p className="text-slate-300 mb-6">Gaste seus Pontos de Legado para dar ao seu herdeiro a melhor chance de sucesso.</p>
            
            <div className="sticky top-4 z-10 bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 mb-6 border border-slate-700">
                <p className="text-lg font-semibold text-slate-300">Pontos de Legado</p>
                <p className="text-4xl font-bold text-white">
                    <span className={spentPoints > points ? 'text-red-500' : 'text-amber-400'}>{points - spentPoints}</span> / {points}
                </p>
            </div>

            {lineageTitleBonus && (
                <div className="mb-8 p-4 bg-slate-900/70 border-2 border-cyan-500 rounded-lg shadow-lg shadow-cyan-500/20">
                    <h3 className="text-xl font-bold text-cyan-300 flex items-center justify-center gap-2"><CrownIcon />Bônus de Linhagem: {lineageTitleBonus.name}</h3>
                    <p className="text-slate-300 mt-2">Pela sua vida anterior, seu herdeiro recebe o seguinte bônus gratuito: <span className="text-amber-400 font-bold">{lineageTitleBonus.bonusDescription}</span></p>
                </div>
            )}
            
            <div className="mb-10">
                <h3 className="text-2xl font-bold text-slate-200 mb-4">Bônus Acumuláveis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stackableBonusesConfig.map((config) => {
                        const currentLevel = stackablePurchases[config.id] || 0;
                        const nextCost = currentLevel < config.maxPurchases ? config.costs[currentLevel] : 0;
                        return (
                            <StackableBonusCard
                                key={config.id}
                                config={config}
                                currentLevel={currentLevel}
                                canAfford={spentPoints + nextCost <= points}
                                onPurchase={() => handleSelectStackable(config.id)}
                            />
                        );
                    })}
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-200 mb-4">Bônus Únicos</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {uniqueBonusesConfig.map((bonus) => {
                        const isSelected = selectedUniqueBonuses.includes(bonus.id);
                        const canAfford = spentPoints + bonus.cost <= points;
                        const isDisabled = !canAfford && !isSelected;
                        
                        return (
                            <div key={bonus.id} className="relative group h-full">
                                <button
                                    onClick={() => handleSelectUnique(bonus.id)}
                                    disabled={isDisabled}
                                    className={`w-full h-full p-4 bg-slate-900/60 border border-slate-700 rounded-lg text-left transition-all duration-200 flex flex-col justify-between
                                            ${isSelected ? 'ring-2 ring-amber-500' : ''}
                                            ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700/50 hover:border-slate-600'}`}
                                >
                                    <div>
                                        <div className="flex items-start gap-3 mb-2">
                                            <span className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1">{bonus.icon}</span>
                                            <div>
                                                <p className="font-bold text-slate-100">{bonus.name}</p>
                                                <p className="text-sm font-semibold text-amber-500">Custo: {bonus.cost} Pontos</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-400 mb-3">{bonus.description}</p>
                                    </div>
                                    <div className="border-t border-slate-700 pt-3 space-y-1.5 mt-auto">
                                        <div className="font-semibold text-green-400">Prós:</div>
                                        {renderBonusEffect(bonus.bonus.wealth, 'Riqueza')}
                                        {renderBonusEffect(bonus.bonus.intelligence, 'Intel.')}
                                        {renderBonusEffect(bonus.bonus.charisma, 'Carisma')}
                                        {renderBonusEffect(bonus.bonus.creativity, 'Criat.')}
                                        {renderBonusEffect(bonus.bonus.discipline, 'Disc.')}
                                        {renderBonusEffect(bonus.bonus.health, 'Saúde')}
                                        {renderBonusEffect(bonus.bonus.fame, 'Fama')}
                                        {renderBonusEffect(bonus.bonus.influence, 'Influência')}
                                        {renderTraitEffect(bonus.bonus.addTraits?.filter(t => t?.type === 'positive'))}
                                        {renderSecretEffect(bonus.bonus.inheritedSecret)}
                                        {renderGenericEffect(bonus.bonus.addAssets?.[0], <PlusCircleIcon />)}
                                        {renderGenericEffect(bonus.bonus.addSkills?.[0]?.name, <TrophyIcon />)}
                                        {renderGenericEffect(bonus.bonus.addRelationships?.[0]?.name, <UsersIcon />)}

                                        <div className="font-semibold text-red-400 pt-1">Contras:</div>
                                        {renderBonusEffect(bonus.bonus.wealth && bonus.bonus.wealth < 0 ? bonus.bonus.wealth : undefined, 'Riqueza')}
                                        {renderBonusEffect(bonus.bonus.intelligence && bonus.bonus.intelligence < 0 ? bonus.bonus.intelligence : undefined, 'Intel.')}
                                        {renderBonusEffect(bonus.bonus.charisma && bonus.bonus.charisma < 0 ? bonus.bonus.charisma : undefined, 'Carisma')}
                                        {renderBonusEffect(bonus.bonus.creativity && bonus.bonus.creativity < 0 ? bonus.bonus.creativity : undefined, 'Criat.')}
                                        {renderBonusEffect(bonus.bonus.discipline && bonus.bonus.discipline < 0 ? bonus.bonus.discipline : undefined, 'Disc.')}
                                        {renderBonusEffect(bonus.bonus.health && bonus.bonus.health < 0 ? bonus.bonus.health : undefined, 'Saúde')}
                                        {renderTraitEffect(bonus.bonus.addTraits?.filter(t => t?.type === 'negative'))}
                                    </div>
                                </button>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-slate-950 border border-slate-600 rounded-lg shadow-xl text-sm text-slate-300 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <p className="italic">"{bonus.flavorText.replace('[Sobrenome]', lineage?.lastName || '???')}"</p>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-950"></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
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