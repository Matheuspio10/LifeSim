
import React, { useState, useEffect } from 'react';
import { GameEvent, Choice, MiniGameType, Character } from '../types';
import InvestmentGame from './mini-games/InvestmentGame';
import { SpeakerWaveIcon, ShieldExclamationIcon, BriefcaseIcon, ScaleIcon, ShieldCheckIcon, LightBulbIcon, SparklesIcon, BeakerIcon } from './Icons';

interface MiniGameProps {
  event: GameEvent;
  character: Character;
  onComplete: (choice: Choice) => void;
}

// --- Custom Hook for Mini-Game Result Flow ---
const useMiniGameResult = (onComplete: (choice: Choice) => void) => {
    const [resultText, setResultText] = useState<string | null>(null);
    const [title, setTitle] = useState<string>('Resultado');

    const showResult = (choice: Choice, resultTitle: string, delay: number = 3500) => {
        setResultText(choice.outcomeText);
        setTitle(resultTitle);
        
        const timer = setTimeout(() => {
            onComplete(choice);
        }, delay);

        return () => clearTimeout(timer); // Cleanup on unmount
    };

    const ResultDisplay = resultText ? (
        <div className="w-full max-w-3xl bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 text-center animate-fade-in">
             <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-cyan-400 mx-auto mb-4"></div>
             <h2 className="text-2xl font-bold text-cyan-400 mb-4">{title}</h2>
             <p className="text-slate-300 leading-relaxed">{resultText}</p>
        </div>
    ) : null;

    return { showResult, ResultDisplay, isShowingResult: !!resultText };
};


// --- Speakeasy Smuggling Mini-Game Component ---
const SpeakeasySmugglingGame: React.FC<MiniGameProps> = ({ event, character, onComplete }) => {
    const { showResult, ResultDisplay, isShowingResult } = useMiniGameResult(onComplete);

    const handleRoute = (route: 'fast' | 'standard' | 'slow') => {
        let successChance = 0;
        let outcomeText = '';
        const statChanges: Choice['statChanges'] = { wealth: 0 };
        
        switch(route) {
            case 'fast':
                successChance = 20 + character.discipline; // Low base chance, high reward
                if (Math.random() * 100 < successChance) {
                    outcomeText = "A rota rápida foi um sucesso! Você entregou a mercadoria em tempo recorde e recebeu um bônus generoso.";
                    statChanges.wealth = 500;
                    statChanges.discipline = 2;
                } else {
                    outcomeText = "Desastre! A polícia estava patrulhando a rota rápida. Você perdeu toda a mercadoria e por pouco não foi preso.";
                    statChanges.wealth = -250;
                    statChanges.discipline = -1;
                }
                break;
            case 'standard':
                successChance = 50 + character.discipline;
                 if (Math.random() * 100 < successChance) {
                    outcomeText = "A entrega ocorreu sem problemas. O pagamento foi o combinado.";
                    statChanges.wealth = 250;
                } else {
                    outcomeText = "Você foi emboscado por uma gangue rival e perdeu metade da carga. Um prejuízo doloroso.";
                    statChanges.wealth = -125;
                }
                break;
            case 'slow':
                successChance = 80 + character.discipline;
                 if (Math.random() * 100 < successChance) {
                    outcomeText = "A rota lenta e segura cumpriu o prometido. A entrega foi feita, mas o pagamento foi menor devido à demora.";
                    statChanges.wealth = 100;
                } else {
                    // Very low chance of failure
                    outcomeText = "Um azar incrível! Um pneu furado atrasou você tanto que o cliente desistiu do negócio. Pelo menos você não perdeu a carga.";
                    statChanges.wealth = -20;
                }
                break;
        }

        statChanges.morality = -5; // It's still illegal
        
        showResult({
            choiceText: `Escolheu a rota ${route}.`,
            outcomeText,
            statChanges
        }, 'Resultado da Entrega');
    };
    
    if (isShowingResult) {
        return ResultDisplay;
    }

    return (
        <div className="w-full max-w-3xl bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-cyan-400 text-center mb-2 flex items-center justify-center gap-3">
                <span className="w-8 h-8"><BriefcaseIcon /></span>
                Contrabando na Lei Seca
            </h2>
            <p className="text-slate-300 text-center leading-relaxed mb-6">{event.eventText}</p>
            <p className="text-sm text-slate-400 text-center font-semibold mb-6">Escolha sua rota de contrabando:</p>
            <div className="flex flex-col gap-4">
                <button onClick={() => handleRoute('fast')} className="w-full text-left p-4 bg-slate-700/50 border border-slate-600 rounded-lg group hover:bg-red-900/50 hover:border-red-700 transition-all">
                    <p className="font-bold text-red-400">Rota Rápida e Perigosa (Alto Risco, Alta Recompensa)</p>
                </button>
                 <button onClick={() => handleRoute('standard')} className="w-full text-left p-4 bg-slate-700/50 border border-slate-600 rounded-lg group hover:bg-yellow-900/50 hover:border-yellow-700 transition-all">
                    <p className="font-bold text-yellow-400">Rota Padrão (Risco Moderado)</p>
                </button>
                 <button onClick={() => handleRoute('slow')} className="w-full text-left p-4 bg-slate-700/50 border border-slate-600 rounded-lg group hover:bg-green-900/50 hover:border-green-700 transition-all">
                    <p className="font-bold text-green-400">Rota Lenta e Segura (Baixo Risco, Baixa Recompensa)</p>
                </button>
            </div>
        </div>
    );
};

// --- Black Market Mini-Game Component ---
const BlackMarketGame: React.FC<MiniGameProps> = ({ event, onComplete }) => {
    const createChoice = (type: 'medicine' | 'food' | 'secrets'): Choice => {
        const choices = {
            medicine: {
                choiceText: "Negociou remédios no mercado negro.",
                outcomeText: "Você usa seus contatos para conseguir remédios essenciais para a comunidade. Você não ganha muito, mas a gratidão das pessoas é imensa.",
                statChanges: { wealth: 50, morality: 15, influence: 5 }
            },
            food: {
                choiceText: "Negociou comida no mercado negro.",
                outcomeText: "Você garante um suprimento de comida e o vende por um preço justo, mas com lucro. Um negócio arriscado, mas necessário.",
                statChanges: { wealth: 200, morality: 5 }
            },
            secrets: {
                choiceText: "Negociou informações secretas.",
                outcomeText: "Você vende informações valiosas para o lance mais alto. O lucro é enorme, mas o peso na consciência e o perigo são ainda maiores.",
                statChanges: { wealth: 1000, morality: -20, fame: -5 }
            }
        };
        return choices[type];
    };

    return (
        <div className="w-full max-w-3xl bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-cyan-400 text-center mb-2 flex items-center justify-center gap-3">
                <span className="w-8 h-8"><ScaleIcon /></span>
                Comércio no Mercado Negro
            </h2>
            <p className="text-slate-300 text-center leading-relaxed mb-6">{event.eventText}</p>
            <div className="flex flex-col gap-4">
                <button onClick={() => onComplete(createChoice('medicine'))} className="w-full text-left p-4 bg-slate-700/50 border border-slate-600 rounded-lg group hover:bg-green-900/50 hover:border-green-700 transition-all">
                    <p className="font-bold text-green-400">Negociar Remédios (Ato de Bondade)</p>
                </button>
                 <button onClick={() => onComplete(createChoice('food'))} className="w-full text-left p-4 bg-slate-700/50 border border-slate-600 rounded-lg group hover:bg-yellow-900/50 hover:border-yellow-700 transition-all">
                    <p className="font-bold text-yellow-400">Negociar Comida (Ato de Necessidade)</p>
                </button>
                 <button onClick={() => onComplete(createChoice('secrets'))} className="w-full text-left p-4 bg-slate-700/50 border border-slate-600 rounded-lg group hover:bg-red-900/50 hover:border-red-700 transition-all">
                    <p className="font-bold text-red-500">Negociar Informações (Ato de Ganância)</p>
                </button>
            </div>
        </div>
    );
};

// --- Generic Tactic Choice Mini-Game Component ---
interface Tactic {
    id: string;
    name: string;
    description: string;
    stat: keyof Character;
    color: string;
    hoverColor: string;
}

interface TacticChoiceGameProps extends MiniGameProps {
    title: string;
    icon: React.ReactNode;
    tactics: Tactic[];
}

const TacticChoiceGame: React.FC<TacticChoiceGameProps> = ({ event, character, onComplete, title, icon, tactics }) => {
    const { showResult, ResultDisplay, isShowingResult } = useMiniGameResult(onComplete);

    const handleTactic = (tactic: Tactic) => {
        const statValue = (character[tactic.stat] as number) || 50;
        const successChance = 30 + statValue * 0.7; // Base 30% + 0.7% per stat point
        const isSuccess = Math.random() * 100 < successChance;
        
        let outcomeText = '';
        const statChanges: Choice['statChanges'] = {};

        if (isSuccess) {
            outcomeText = `Sua tática de '${tactic.name}' foi um sucesso espetacular. Você superou o desafio com maestria.`;
            statChanges.influence = 5;
            statChanges.fame = 2;
            (statChanges[tactic.stat] as number) = ((statChanges[tactic.stat] as number) || 0) + 2;
        } else {
            outcomeText = `Apesar de seus esforços, sua tática de '${tactic.name}' falhou. Você subestimou o desafio e agora enfrenta as consequências.`;
            statChanges.influence = -3;
            (statChanges[tactic.stat] as number) = ((statChanges[tactic.stat] as number) || 0) - 1;
        }

        showResult({
            choiceText: `Usou a tática de ${tactic.name}.`,
            outcomeText,
            statChanges,
        }, 'Resultado da Missão');
    };

    if (isShowingResult) {
        return ResultDisplay;
    }

    return (
        <div className="w-full max-w-3xl bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-cyan-400 text-center mb-2 flex items-center justify-center gap-3">
                <span className="w-8 h-8">{icon}</span>
                {title}
            </h2>
            <p className="text-slate-300 text-center leading-relaxed mb-6">{event.eventText}</p>
            <div className="flex flex-col gap-4">
                {tactics.map(tactic => (
                    <button key={tactic.id} onClick={() => handleTactic(tactic)} className={`w-full text-left p-4 bg-slate-700/50 border border-slate-600 rounded-lg group ${tactic.hoverColor} transition-all`}>
                        <p className={`font-bold ${tactic.color}`}>{tactic.name}</p>
                        <p className="text-sm text-slate-400 group-hover:text-slate-300">{tactic.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- Generic Moral Choice Mini-Game ---
interface MoralChoice {
    id: string;
    name: string;
    choice: Choice;
    color: string;
    hoverColor: string;
}

interface MoralChoiceGameProps extends MiniGameProps {
    title: string;
    icon: React.ReactNode;
    choices: MoralChoice[];
}

const MoralChoiceGame: React.FC<MoralChoiceGameProps> = ({ event, onComplete, title, icon, choices }) => {
    return (
         <div className="w-full max-w-3xl bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-cyan-400 text-center mb-2 flex items-center justify-center gap-3">
                <span className="w-8 h-8">{icon}</span>
                {title}
            </h2>
            <p className="text-slate-300 text-center leading-relaxed mb-6">{event.eventText}</p>
            <div className="flex flex-col gap-4">
                 {choices.map(c => (
                    <button key={c.id} onClick={() => onComplete(c.choice)} className={`w-full text-left p-4 bg-slate-700/50 border border-slate-600 rounded-lg group ${c.hoverColor} transition-all`}>
                        <p className={`font-bold ${c.color}`}>{c.name}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}


// --- Public Debate Mini-Game Component ---
const PublicDebateGame: React.FC<MiniGameProps> = ({ event, character, onComplete }) => {
    const { showResult, ResultDisplay, isShowingResult } = useMiniGameResult(onComplete);

    const handleDebate = (tactic: 'logic' | 'emotion' | 'attack') => {
        let successChance = 0;
        let outcomeText = '';
        const statChanges: Choice['statChanges'] = {};

        switch (tactic) {
            case 'logic':
                successChance = 20 + character.intelligence;
                if (Math.random() * 100 < successChance) {
                    outcomeText = "Com argumentos lógicos e bem estruturados, você desmantela a posição do seu oponente. A multidão aplaude sua sabedoria.";
                    statChanges.influence = 5;
                    statChanges.fame = 3;
                    statChanges.intelligence = 1;
                } else {
                    outcomeText = "Você tenta usar a lógica, mas se atrapalha em seus próprios argumentos. Seu oponente explora a falha e te ridiculariza.";
                    statChanges.influence = -4;
                    statChanges.fame = -2;
                }
                break;
            case 'emotion':
                successChance = 20 + character.charisma;
                 if (Math.random() * 100 < successChance) {
                    outcomeText = "Você apela para os corações e mentes da audiência. Suas palavras apaixonadas comovem a todos e seu oponente fica sem resposta.";
                    statChanges.influence = 5;
                    statChanges.charisma = 2;
                } else {
                    outcomeText = "Sua tentativa de apelo emocional parece forçada e insincera. A audiência não se convence e você perde credibilidade.";
                    statChanges.influence = -4;
                    statChanges.charisma = -1;
                }
                break;
            case 'attack':
                successChance = 30 + character.charisma - (character.morality / 5);
                if (Math.random() * 100 < successChance) {
                    outcomeText = "Você ataca o caráter do seu oponente, expondo uma falha pessoal. Chocada, a audiência se volta contra ele, lhe dando a vitória.";
                    statChanges.influence = 6;
                    statChanges.morality = -10;
                    statChanges.fame = -2;
                } else {
                    outcomeText = "Seu ataque pessoal é visto como um golpe baixo e desesperado. A multidão se volta contra você, e seu oponente ganha a simpatia de todos.";
                    statChanges.influence = -8;
                    statChanges.morality = -5;
                }
                break;
        }
        
        showResult({
            choiceText: `Usou a tática de ${tactic} no debate.`,
            outcomeText,
            statChanges,
        }, 'Resultado do Debate');
    };

    if (isShowingResult) {
        return ResultDisplay;
    }

    return (
        <div className="w-full max-w-3xl bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-cyan-400 text-center mb-2 flex items-center justify-center gap-3">
                <span className="w-8 h-8"><SpeakerWaveIcon /></span>
                Debate Público
            </h2>
            <p className="text-slate-300 text-center leading-relaxed mb-6">{event.eventText}</p>
            <p className="text-sm text-slate-400 text-center font-semibold mb-6">Escolha sua tática:</p>

            <div className="flex flex-col gap-4">
                <button onClick={() => handleDebate('logic')} className="w-full text-left p-4 bg-slate-700/50 border border-slate-600 rounded-lg group hover:bg-blue-900/50 hover:border-blue-700 transition-all">
                    <p className="font-bold text-blue-400">Argumento Lógico</p>
                    <p className="text-sm text-slate-400 group-hover:text-slate-300">Use sua inteligência para apresentar fatos e dados irrefutáveis.</p>
                </button>
                 <button onClick={() => handleDebate('emotion')} className="w-full text-left p-4 bg-slate-700/50 border border-slate-600 rounded-lg group hover:bg-yellow-900/50 hover:border-yellow-700 transition-all">
                    <p className="font-bold text-yellow-400">Apelo Emocional</p>
                    <p className="text-sm text-slate-400 group-hover:text-slate-300">Use seu carisma para tocar o coração da audiência e ganhar sua simpatia.</p>
                </button>
                 <button onClick={() => handleDebate('attack')} className="w-full text-left p-4 bg-slate-700/50 border border-slate-600 rounded-lg group hover:bg-red-900/50 hover:border-red-700 transition-all">
                    <p className="font-bold text-red-500">Ataque Pessoal (Ad Hominem)</p>
                    <p className="text-sm text-slate-400 group-hover:text-slate-300">Ignore o argumento e ataque o caráter do seu oponente. Arriscado, mas pode funcionar.</p>
                </button>
            </div>
        </div>
    );
};


// --- Pistol Duel Mini-Game Component ---
const PistolDuelGame: React.FC<MiniGameProps> = ({ event, character, onComplete }) => {
    const { showResult, ResultDisplay, isShowingResult } = useMiniGameResult(onComplete);

    const handleDuel = (action: 'aim' | 'air' | 'quick') => {
        let outcomeText = '';
        const statChanges: Choice['statChanges'] = {};
        let specialEnding: string | undefined = undefined;

        const opponentSkill = 50 + Math.random() * 30; // 50-80
        let playerSkill = character.discipline * 1.5; // Disciplina é crucial

        switch (action) {
            case 'aim':
                playerSkill += 20; // Bônus por mirar
                if (playerSkill > opponentSkill) {
                    const hitSeverity = Math.random();
                    if (hitSeverity < 0.2) { // 20% chance de ser letal
                        outcomeText = "Com nervos de aço, você mira e atira. O tiro é fatal. Você venceu o duelo, mas a um custo terrível.";
                        statChanges.morality = -20;
                        statChanges.fame = 5;
                    } else if (hitSeverity < 0.7) { // 50% chance de ferir
                        outcomeText = "Sua mira é certeira e atinge o ombro do seu oponente, incapacitando-o. A honra foi restaurada.";
                        statChanges.morality = -5;
                        statChanges.fame = 3;
                    } else { // 30% chance de errar por pouco
                        outcomeText = "Seu tiro passa de raspão, assustando seu oponente, que desiste do duelo. Você é vitorioso(a).";
                         statChanges.fame = 2;
                    }
                } else {
                     outcomeText = "Você tenta mirar, mas seus nervos falham. Seu oponente é mais rápido e o tiro dele te atinge em cheio.";
                     const deathChance = 0.6; // 60% chance de morrer
                     if (Math.random() < deathChance) {
                         specialEnding = "Sua vida termina na poeira de um campo de duelo, uma vítima de uma disputa de honra.";
                     } else {
                         outcomeText += " Você sobrevive por pouco, mas gravemente ferido.";
                         statChanges.health = -50;
                     }
                }
                break;
            case 'air':
                 outcomeText = "Recusando-se a tirar uma vida, você atira para o ar. Seu oponente, surpreso, abaixa a arma. Você perdeu o duelo e sua reputação, mas manteve sua consciência limpa.";
                 statChanges.morality = 20;
                 statChanges.fame = -10;
                 statChanges.influence = -5;
                break;
            case 'quick':
                playerSkill += (Math.random() * 40 - 10); // Sorte: -10 to +30
                if (playerSkill > opponentSkill) {
                    outcomeText = "Em um movimento rápido e instintivo, você atira primeiro. O tiro surpreende seu oponente, que cai ferido. A vitória é sua.";
                    statChanges.fame = 4;
                    statChanges.discipline = 1;
                } else {
                    outcomeText = "Sua pressa resulta em um tiro mal mirado. Seu oponente, calmo e preparado, atira em seguida. O impacto te joga no chão.";
                     const deathChance = 0.75; // 75% chance de morrer
                     if (Math.random() < deathChance) {
                         specialEnding = "Seu ato impulsivo custou sua vida. A morte foi rápida e brutal.";
                     } else {
                         outcomeText += " O ferimento é grave, um lembrete doloroso de sua imprudência.";
                         statChanges.health = -60;
                         statChanges.discipline = -2;
                     }
                }
                break;
        }

        showResult({
            choiceText: `Escolheu a ação '${action}' no duelo.`,
            outcomeText,
            statChanges,
            specialEnding,
        }, 'O Tiro Ecoa...');
    }
    
     if (isShowingResult) {
        return ResultDisplay;
    }

    return (
        <div className="w-full max-w-3xl bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border-2 border-red-800/80 shadow-lg shadow-red-900/30">
            <h2 className="text-2xl font-bold text-red-500 text-center mb-2 flex items-center justify-center gap-3">
                <span className="w-8 h-8"><ShieldExclamationIcon /></span>
                Duelo de Pistolas!
            </h2>
            <p className="text-slate-300 text-center leading-relaxed mb-6">{event.eventText}</p>
            <p className="text-sm text-slate-400 text-center font-semibold mb-6">Sua vida está em jogo. O que você faz?</p>

            <div className="flex flex-col gap-4">
                 <button onClick={() => handleDuel('aim')} className="w-full text-left p-4 bg-slate-700/50 border border-slate-600 rounded-lg group hover:bg-slate-600/50 hover:border-slate-500 transition-all">
                    <p className="font-bold text-slate-200">Mirar com Cuidado</p>
                    <p className="text-sm text-slate-400 group-hover:text-slate-300">Confie na sua disciplina e firmeza para acertar o alvo. (Depende de Disciplina)</p>
                </button>
                <button onClick={() => handleDuel('quick')} className="w-full text-left p-4 bg-slate-700/50 border border-slate-600 rounded-lg group hover:bg-slate-600/50 hover:border-slate-500 transition-all">
                    <p className="font-bold text-slate-200">Tentar um Tiro Rápido</p>
                    <p className="text-sm text-slate-400 group-hover:text-slate-300">Arrisque tudo na velocidade e no instinto. (Alto risco, alta recompensa)</p>
                </button>
                 <button onClick={() => handleDuel('air')} className="w-full text-left p-4 bg-slate-700/50 border border-slate-600 rounded-lg group hover:bg-slate-600/50 hover:border-slate-500 transition-all">
                    <p className="font-bold text-slate-200">Atirar para o Ar</p>
                    <p className="text-sm text-slate-400 group-hover:text-slate-300">Demonstre que sua moral é maior que seu orgulho. (Opção não-letal)</p>
                </button>
            </div>
        </div>
    );
};


const MiniGameHost: React.FC<MiniGameProps> = ({ event, character, onComplete }) => {
  const renderMiniGame = () => {
    switch (event.miniGameType) {
      case MiniGameType.INVESTMENT:
      case MiniGameType.STOCK_MARKET_SPECULATION:
      case MiniGameType.DOTCOM_DAY_TRADING:
        return <InvestmentGame event={event} character={character} onComplete={onComplete} />;
      case MiniGameType.PUBLIC_DEBATE:
        return <PublicDebateGame event={event} character={character} onComplete={onComplete} />;
      case MiniGameType.PISTOL_DUEL:
        return <PistolDuelGame event={event} character={character} onComplete={onComplete} />;
      case MiniGameType.SPEAKEASY_SMUGGLING:
        return <SpeakeasySmugglingGame event={event} character={character} onComplete={onComplete} />;
      case MiniGameType.BLACK_MARKET_TRADING:
        return <BlackMarketGame event={event} character={character} onComplete={onComplete} />;
      case MiniGameType.COLD_WAR_ESPIONAGE:
        return <TacticChoiceGame 
            event={event} character={character} onComplete={onComplete}
            title="Espionagem da Guerra Fria" icon={<ShieldCheckIcon />}
            tactics={[
                { id: 'infiltrate', name: 'Infiltrar-se Furtivamente', description: 'Use sua disciplina para evitar a detecção.', stat: 'discipline', color: 'text-green-400', hoverColor: 'hover:bg-green-900/50 hover:border-green-700' },
                { id: 'bribe', name: 'Subornar um Contato', description: 'Use seu carisma (e dinheiro) para conseguir acesso.', stat: 'charisma', color: 'text-yellow-400', hoverColor: 'hover:bg-yellow-900/50 hover:border-yellow-700' },
                { id: 'intercept', name: 'Interceptar Mensagens', description: 'Use sua inteligência para decifrar códigos e comunicações.', stat: 'intelligence', color: 'text-blue-400', hoverColor: 'hover:bg-blue-900/50 hover:border-blue-700' },
            ]}
        />;
      case MiniGameType.GARAGE_STARTUP:
         return <TacticChoiceGame 
            event={event} character={character} onComplete={onComplete}
            title="Startup de Garagem" icon={<LightBulbIcon />}
            tactics={[
                { id: 'engineering', name: 'Focar na Engenharia', description: 'Crie o melhor produto do mercado. (Testa Inteligência)', stat: 'intelligence', color: 'text-blue-400', hoverColor: 'hover:bg-blue-900/50 hover:border-blue-700' },
                { id: 'marketing', name: 'Focar no Marketing', description: 'Crie uma marca forte e desejo pelo produto. (Testa Carisma)', stat: 'charisma', color: 'text-yellow-400', hoverColor: 'hover:bg-yellow-900/50 hover:border-yellow-700' },
                { id: 'sales', name: 'Focar nas Vendas', description: 'Construa uma equipe de vendas agressiva. (Testa Disciplina)', stat: 'discipline', color: 'text-green-400', hoverColor: 'hover:bg-green-900/50 hover:border-green-700' },
            ]}
        />;
       case MiniGameType.VIRAL_CONTENT_CHALLENGE:
         return <TacticChoiceGame 
            event={event} character={character} onComplete={onComplete}
            title="Desafio do Conteúdo Viral" icon={<SparklesIcon />}
            tactics={[
                { id: 'funny', name: 'Conteúdo Engraçado', description: 'Faça o mundo rir. (Testa Criatividade)', stat: 'creativity', color: 'text-yellow-400', hoverColor: 'hover:bg-yellow-900/50 hover:border-yellow-700' },
                { id: 'controversial', name: 'Conteúdo Controverso', description: 'Gere debate e polêmica. (Testa Carisma, afeta Moralidade)', stat: 'charisma', color: 'text-red-400', hoverColor: 'hover:bg-red-900/50 hover:border-red-700' },
                { id: 'inspiring', name: 'Conteúdo Inspirador', description: 'Motive e inspire as pessoas. (Testa Carisma)', stat: 'charisma', color: 'text-green-400', hoverColor: 'hover:bg-green-900/50 hover:border-green-700' },
            ]}
        />;
       case MiniGameType.GENETIC_EDITING_DILEMMA:
          return <MoralChoiceGame 
            event={event} character={character} onComplete={onComplete}
            title="Dilema da Edição Genética" icon={<BeakerIcon />}
            choices={[
                { id: 'cure', name: 'Focar na Cura de Doenças', choice: { choiceText: 'Usou a tecnologia para curar doenças.', outcomeText: 'Sua pesquisa erradica uma doença genética terrível. Você é celebrado como um herói da humanidade.', statChanges: { morality: 30, fame: 20, influence: 15 } }, color: 'text-green-400', hoverColor: 'hover:bg-green-900/50 hover:border-green-700' },
                { id: 'enhance', name: 'Focar no Aprimoramento Humano', choice: { choiceText: 'Usou a tecnologia para aprimorar humanos.', outcomeText: 'Você oferece aprimoramentos genéticos para os ricos e poderosos, criando uma nova classe de super-humanos e aprofundando a desigualdade social.', statChanges: { morality: -25, fame: 15, influence: 25, wealth: 50000 } }, color: 'text-yellow-400', hoverColor: 'hover:bg-yellow-900/50 hover:border-yellow-700' },
                { id: 'refuse', name: 'Recusar e Alertar o Mundo', choice: { choiceText: 'Recusou-se a continuar e alertou o mundo.', outcomeText: 'Considerando os perigos, você destrói sua pesquisa e alerta o mundo sobre os riscos da edição genética. Muitos te chamam de louco, mas você dorme com a consciência tranquila.', statChanges: { morality: 15, fame: -10, influence: -5 }, traitChanges: { add: [{ name: 'Consciente', description: 'Você pesa as consequências éticas de suas ações.', type: 'positive' }] } }, color: 'text-blue-400', hoverColor: 'hover:bg-blue-900/50 hover:border-blue-700' },
            ]}
        />;
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
    <div className="w-full max-w-3xl animate-fade-in">
        {renderMiniGame()}
    </div>
  );
};

export default MiniGameHost;