

import React, { useState, useMemo } from 'react';
import { LegacyBonuses, Trait, Character, Lineage } from '../types';
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
    MinusCircleIcon
} from './Icons';

interface LegacyScreenProps {
  points: number;
  onStart: (bonuses: LegacyBonuses) => void;
  finalCharacter: Character | null;
  lineage: Lineage | null;
}

interface BonusConfig {
    id: string;
    name: string;
    description: string;
    flavorText: string;
    cost: number;
    icon: React.ReactNode;
    bonus: LegacyBonuses;
}

const LegacyScreen: React.FC<LegacyScreenProps> = ({ points, onStart, finalCharacter, lineage }) => {
    const [selectedBonuses, setSelectedBonuses] = useState<string[]>([]);

    const lineageTitleBonus = useMemo(() => {
      if (!lineage?.title) return null;
      return LINEAGE_TITLES.find(t => t.name === lineage.title);
    }, [lineage]);

    const bonusesConfig: BonusConfig[] = useMemo(() => [
        { 
            id: 'questionableFortune', 
            name: 'Fortuna Questionável', 
            description: 'Sua família acumulou riqueza por meios... criativos. Você começa com dinheiro, mas também com um alvo nas costas.',
            flavorText: ' Manchete do "Clarim Diário": "A família [Sobrenome] novamente se vê no centro de uma polêmica financeira..."',
            cost: 10, 
            icon: <ScaleIcon />,
            bonus: { wealth: 15000, addTraits: [NEGATIVE_TRAITS.find(t => t.name === 'Histórico Familiar Duvidoso')!] }
        },
        { 
            id: 'curiosityGene', 
            name: 'Gene da Curiosidade', 
            description: 'Seus ancestrais eram inventores e sonhadores. Você herda a genialidade, mas também a incapacidade de focar em uma coisa só.',
            flavorText: ' Do diário do seu avô: "Tantas ideias, tão pouco tempo! Hoje comecei a construir um relógio de cuco movido a vapor. Abandonei o projeto do barco a remo..."',
            cost: 12, 
            icon: <BrainIcon />,
            bonus: { intelligence: 5, creativity: 5, addTraits: [NEGATIVE_TRAITS.find(t => t.name === 'Distração Crônica')!] }
        },
        { 
            id: 'rebelBranch', 
            name: 'Ramo Rebelde', 
            description: 'Sua linhagem é famosa por quebrar corações e regras. Você atrai pessoas facilmente, mas a estabilidade não é seu forte.',
            flavorText: ' "Ele(a) tem o charme dos [Sobrenome], mas cuidado, eles nunca ficam por muito tempo." - Fofoca da vizinhança.',
            cost: 8, 
            icon: <FireIcon />,
            bonus: { charisma: 8, discipline: -5 }
        },
        { 
            id: 'fragileHealthLegacy', 
            name: 'Legado de Saúde Frágil', 
            description: 'Grandes mentes e corações, mas corpos que não acompanham. Sua família sempre brilhou, mesmo que por pouco tempo.',
            flavorText: ' Nota de rodapé na biografia de um parente: "...sua saúde delicada o impediu de completar sua obra-prima, mas seu brilhantismo era inegável."',
            cost: 15, 
            icon: <HeartIcon />,
            bonus: { charisma: 10, intelligence: 7, health: -10 }
        },
        { 
            id: 'badReputation', 
            name: 'Ancestrais de Fama Ruim', 
            description: 'Você já nasce famoso, mas pelos motivos errados. Limpar o nome da família será seu maior desafio.',
            flavorText: ' "Um [Sobrenome] tentando ser uma boa pessoa? Essa é nova. Vamos ver quanto tempo dura." - Editorial de um jornal local.',
            cost: 10, 
            icon: <StarIcon />,
            bonus: { fame: 15, addTraits: [NEGATIVE_TRAITS.find(t => t.name === 'Reputação Manchada')!] }
        },
        { 
            id: 'blindTraditionalism', 
            name: 'Tradicionalismo Cego', 
            description: 'Sua família faz as coisas "do jeito certo" há gerações. Isso te dá disciplina, mas te cega para o mundo em mudança.',
            flavorText: ' "Na nossa família, não precisamos dessas novidades modernas. O que funcionou para meu avô funciona para mim." - Lema da família.',
            cost: 8, 
            icon: <ShieldCheckIcon />,
            bonus: { discipline: 10, creativity: -5 } // Representado por -5 em criatividade
        },
        { 
            id: 'adventurousSpirit', 
            name: 'Espírito de Aventura', 
            description: 'Seus ancestrais foram exploradores e pioneiros. Você herda a coragem deles, e a tendência a pular antes de olhar.',
            flavorText: ' Uma velha carta: "Vendi a fazenda para comprar um mapa que leva a uma cidade perdida. O que poderia dar errado?"',
            cost: 10, 
            icon: <GlobeAltIcon />,
            bonus: { creativity: 5, health: 5, addTraits: [NEGATIVE_TRAITS.find(t => t.name === 'Impulsivo')!] }
        },
        { 
            id: 'childOfScandal', 
            name: 'Filho do Escândalo', 
            description: 'Sua família sempre esteve nos holofotes, geralmente por polêmicas. As portas se abrem, mas a desconfiança sempre te acompanha.',
            flavorText: ' "Contratar um [Sobrenome]? É bom para a publicidade, mas mantenha-o longe da sala dos cofres." - Conselho de negócios.',
            cost: 12, 
            icon: <SpeakerWaveIcon />,
            bonus: { influence: 10, charisma: -5 } // Representado por -5 em carisma
        },
        { 
            id: 'easyMoneyHardChildhood', 
            name: 'Dinheiro Fácil, Infância Difícil', 
            description: 'Você cresceu com tudo do bom e do melhor, exceto afeto. O dinheiro veio fácil, mas a um custo emocional.',
            flavorText: ' Relato do psicólogo da escola: "A criança parece ter dificuldade em formar laços, usando presentes como substitutos para a amizade."',
            cost: 15, 
            icon: <CurrencyDollarIcon />,
            bonus: { wealth: 20000, addTraits: [NEGATIVE_TRAITS.find(t => t.name === 'Coração Solitário')!] }
        },
        { 
            id: 'hiddenInheritance', 
            name: 'Herança Oculta', 
            description: 'Seu parente deixou para trás mais do que memórias. Um segredo, um item, uma dívida... algo que mudará sua vida.',
            flavorText: ' "Para meu querido herdeiro, guarde esta chave. Ela abre a caixa que contém nosso maior triunfo... ou nossa ruína." - Trecho do testamento.',
            cost: 18, 
            icon: <PuzzlePieceIcon />,
            bonus: { inheritedSecret: 'A chave para o cofre antigo da família.' }
        },
        { 
            id: 'extremeExpectations', 
            name: 'Berço de Expectativas Extremas', 
            description: 'Fracassar nunca foi uma opção na sua família. A pressão para ser o melhor te fortalece, mas também te quebra.',
            flavorText: ' "Segundo lugar é só o primeiro perdedor. Lembre-se disso." - Seu pai, todos os dias.',
            cost: 20, 
            icon: <ShieldExclamationIcon />,
            bonus: { discipline: 10, fame: 10, addTraits: [NEGATIVE_TRAITS.find(t => t.name === 'Fardo das Expectativas')!] }
        },
        { 
            id: 'artisticBlood', 
            name: '"O Sangue Artístico"', 
            description: 'Sua família vê o mundo através de uma lente diferente. Você é um gênio criativo, mas péssimo em conversas triviais.',
            flavorText: ' Crítica de arte: "Como todo [Sobrenome], sua obra é sublime, mas sua presença em um jantar é, na melhor das hipóteses, desconfortável."',
            cost: 10, 
            icon: <LightBulbIcon />,
            bonus: { creativity: 10, charisma: -5 }
        },
    ], []);

    const spentPoints = useMemo(() => {
        return selectedBonuses.reduce((total, id) => {
            const bonus = bonusesConfig.find(b => b.id === id);
            return total + (bonus ? bonus.cost : 0);
        }, 0);
    }, [selectedBonuses, bonusesConfig]);
    
    const handleSelect = (bonusId: string) => {
        const bonus = bonusesConfig.find(b => b.id === bonusId);
        if (!bonus) return;
        
        const isSelected = selectedBonuses.includes(bonusId);

        if (isSelected) {
            setSelectedBonuses(prev => prev.filter(id => id !== bonusId));
        } else if (spentPoints + bonus.cost <= points) {
            setSelectedBonuses(prev => [...prev, bonusId]);
        }
    };
    
    const handleStart = () => {
        const finalBonuses: LegacyBonuses = { addTraits: [] };

        // Add lineage bonus first
        if (lineageTitleBonus) {
            Object.assign(finalBonuses, lineageTitleBonus.bonus);
            if (lineageTitleBonus.bonus.addTraits) {
                 finalBonuses.addTraits = [...(finalBonuses.addTraits || []), ...lineageTitleBonus.bonus.addTraits];
            }
        }
        
        // Then add purchased bonuses
        for (const id of selectedBonuses) {
            const bonus = bonusesConfig.find(b => b.id === id);
            if (bonus) {
                const b = bonus.bonus;
                finalBonuses.wealth = (finalBonuses.wealth || 0) + (b.wealth || 0);
                finalBonuses.intelligence = (finalBonuses.intelligence || 0) + (b.intelligence || 0);
                finalBonuses.charisma = (finalBonuses.charisma || 0) + (b.charisma || 0);
                finalBonuses.creativity = (finalBonuses.creativity || 0) + (b.creativity || 0);
                finalBonuses.discipline = (finalBonuses.discipline || 0) + (b.discipline || 0);
                finalBonuses.health = (finalBonuses.health || 0) + (b.health || 0);
                finalBonuses.influence = (finalBonuses.influence || 0) + (b.influence || 0);
                finalBonuses.fame = (finalBonuses.fame || 0) + (b.fame || 0);
                if (b.addTraits) {
                    finalBonuses.addTraits = [...(finalBonuses.addTraits || []), ...b.addTraits];
                }
                if (b.inheritedSecret) {
                    finalBonuses.inheritedSecret = b.inheritedSecret;
                }
            }
        }
        onStart(finalBonuses);
    };
    
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

    return (
        <div className="w-full max-w-4xl text-center p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl animate-fade-in">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {bonusesConfig.map((bonus) => {
                    const isSelected = selectedBonuses.includes(bonus.id);
                    const canAfford = spentPoints + bonus.cost <= points;
                    const isDisabled = !canAfford && !isSelected;
                    
                    return (
                        <div key={bonus.id} className="relative group">
                            <button
                                onClick={() => handleSelect(bonus.id)}
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
                                    {renderTraitEffect(bonus.bonus.addTraits?.filter(t => t.type === 'positive'))}
                                    {renderSecretEffect(bonus.bonus.inheritedSecret)}

                                    <div className="font-semibold text-red-400 pt-1">Contras:</div>
                                    {renderBonusEffect(bonus.bonus.wealth < 0 ? bonus.bonus.wealth : undefined, 'Riqueza')}
                                    {renderBonusEffect(bonus.bonus.intelligence < 0 ? bonus.bonus.intelligence : undefined, 'Intel.')}
                                    {renderBonusEffect(bonus.bonus.charisma < 0 ? bonus.bonus.charisma : undefined, 'Carisma')}
                                    {renderBonusEffect(bonus.bonus.creativity < 0 ? bonus.bonus.creativity : undefined, 'Criat.')}
                                    {renderBonusEffect(bonus.bonus.discipline < 0 ? bonus.bonus.discipline : undefined, 'Disc.')}
                                    {renderBonusEffect(bonus.bonus.health < 0 ? bonus.bonus.health : undefined, 'Saúde')}
                                    {renderTraitEffect(bonus.bonus.addTraits?.filter(t => t.type === 'negative'))}
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