import React, { useState } from 'react';
import { StatChanges, Mood, Character } from '../types';

export interface MicroActionResult {
    statChanges: StatChanges;
    outcomeText: string;
}

interface DowntimeActivitiesProps {
    character: Character;
    onMicroAction: (result: MicroActionResult) => void;
    onShowDebug: () => void;
}

const DowntimeActivities: React.FC<DowntimeActivitiesProps> = ({ character, onMicroAction, onShowDebug }) => {
    const [lastOutcome, setLastOutcome] = useState<string | null>(null);
    const [isCoolingDown, setIsCoolingDown] = useState<boolean>(false);
    const currentYear = character.birthYear + character.age;

    const handleAction = (outcomes: MicroActionResult[]) => {
        if (isCoolingDown) return;

        const result = outcomes[Math.floor(Math.random() * outcomes.length)];
        onMicroAction(result);
        setLastOutcome(result.outcomeText);

        setIsCoolingDown(true);
        setTimeout(() => {
            setIsCoolingDown(false);
        }, 3000); 

        setTimeout(() => {
            // Check if the current outcome is the one that triggered this timeout
            setLastOutcome(current => (current === result.outcomeText ? null : current));
        }, 2800);
    };

    // --- Action Definitions ---
    
    // Timeless Actions
    const snackActions: MicroActionResult[] = [
        { outcomeText: 'O café quente e forte te deixa mais focado(a).', statChanges: { discipline: 1, energy: 2 } },
        { outcomeText: 'Um lanche rápido e saudável te dá um pouco de energia.', statChanges: { health: 1, energy: 3 } },
        { outcomeText: 'O doce é delicioso, mas você se sente um pouco culpado(a).', statChanges: { health: 1, discipline: -1, happiness: 2 } },
        { outcomeText: 'Você experimenta um chá exótico que acalma seus nervos.', statChanges: { health: 2, stress: -3 } },
        { outcomeText: 'Você derruba café na sua roupa. Que desastre!', statChanges: { health: -1, stress: 2 } },
    ];
    const windowActions: MicroActionResult[] = [
        { outcomeText: 'Observar as nuvens passando te dá uma sensação de paz.', statChanges: { stress: -2 } },
        { outcomeText: 'Você vê uma cena curiosa na rua que te faz pensar sobre a vida.', statChanges: { intelligence: 1 } },
        { outcomeText: 'O dia cinzento lá fora te deixa um pouco melancólico(a).', statChanges: { happiness: -2 } },
    ];
    const meditateActions: MicroActionResult[] = [
        { outcomeText: 'Você se sente mais calmo(a) e centrado(a) após alguns minutos de meditação.', statChanges: { health: 1, discipline: 1, stress: -3 } },
        { outcomeText: 'Sua mente divaga e você não consegue se concentrar. Que frustrante.', statChanges: { discipline: -1, stress: 1 } },
        { outcomeText: 'Uma ideia brilhante para um projeto pessoal surge enquanto você refletia.', statChanges: { creativity: 1 } },
    ];
    const doodleActions: MicroActionResult[] = [
        { outcomeText: 'Um rabisco aleatório se transforma em um desenho interessante.', statChanges: { creativity: 2 } },
        { outcomeText: 'Você apenas faz alguns traços sem sentido, mas foi relaxante.', statChanges: { health: 1, stress: -1 } },
        { outcomeText: 'Você tenta desenhar algo, mas não gosta do resultado e amassa o papel.', statChanges: { creativity: -1, stress: 2 } },
    ];

    // Era-Specific Action Definitions
    const phoneActions: MicroActionResult[] = [
        { outcomeText: 'Uma mensagem de um amigo te faz sorrir.', statChanges: { happiness: 3 } },
        { outcomeText: 'As notícias no seu feed são desanimadoras.', statChanges: { happiness: -2, stress: 1 } },
        { outcomeText: 'Você perde a noção do tempo navegando nas redes sociais.', statChanges: { discipline: -1, energy: -2 } },
        { outcomeText: 'Você aprende um fato interessante em um vídeo curto.', statChanges: { intelligence: 1 } },
        { outcomeText: 'Você entra em uma discussão inútil nos comentários e se sente esgotado(a).', statChanges: { charisma: -1, stress: 3, energy: -3 } },
    ];
    const pcActions: MicroActionResult[] = [
        { outcomeText: 'Você se conecta à internet discada. O som nostálgico te irrita um pouco.', statChanges: { discipline: -1, stress: 1 } },
        { outcomeText: 'Você descobre um fórum online sobre seu hobby e aprende algo novo.', statChanges: { intelligence: 1 } },
        { outcomeText: 'Você joga uma partida de Campo Minado para relaxar.', statChanges: { health: 1, stress: -1 } },
        { outcomeText: 'Você recebe um e-mail de um "príncipe nigeriano" e o apaga sabiamente.', statChanges: { intelligence: 1, discipline: 1 } },
    ];
    const landlinePhoneActions: MicroActionResult[] = [
        { outcomeText: 'Você liga para um amigo para colocar o papo em dia.', statChanges: { charisma: 1, happiness: 2 } },
        { outcomeText: 'Ninguém atende. Você se sente um pouco solitário(a).', statChanges: { happiness: -2 } },
        { outcomeText: 'A linha está ocupada. Você terá que tentar mais tarde.', statChanges: { discipline: -1 } },
        { outcomeText: 'Você recebe uma ligação com um trote e desliga irritado(a).', statChanges: { health: -1, stress: 2 } },
    ];
    const letterActions: MicroActionResult[] = [
        { outcomeText: 'Você escreve para um parente distante, contando as novidades.', statChanges: { charisma: 1, happiness: 1 } },
        { outcomeText: 'Você tenta escrever um poema, mas acaba frustrado(a) com o resultado.', statChanges: { creativity: -1, stress: 1 } },
        { outcomeText: 'Você relê uma carta antiga de um ente querido e sente uma onda de nostalgia.', statChanges: { health: 1, happiness: -2 } },
        { outcomeText: 'Escrever sobre seus sentimentos em um diário te ajuda a clarear a mente.', statChanges: { intelligence: 1, stress: -1 } },
    ];
    const radioActions: MicroActionResult[] = [
        { outcomeText: 'Uma música nostálgica toca no rádio, trazendo boas lembranças.', statChanges: { happiness: 2 } },
        { outcomeText: 'Um debate político acalorado no rádio te deixa irritado(a).', statChanges: { stress: 3 } },
        { outcomeText: 'Você ouve uma dica de investimento interessante em um programa de finanças.', statChanges: { intelligence: 1 } },
        { outcomeText: 'Você ganha um pequeno prêmio em um concurso da rádio!', statChanges: { wealth: 25, happiness: 5 } },
    ];
    const newspaperActions: MicroActionResult[] = [
        { outcomeText: 'Uma notícia sobre a economia local te deixa preocupado(a).', statChanges: { intelligence: 1, stress: 2 } },
        { outcomeText: 'Você lê uma história inspiradora sobre superação nos classificados.', statChanges: { health: 1, happiness: 2 } },
        { outcomeText: 'As tirinhas de quadrinhos te fazem rir.', statChanges: { health: 1, happiness: 1 } },
        { outcomeText: 'Você se perde em um artigo longo e complexo sobre política internacional.', statChanges: { intelligence: 1, energy: -1 } },
    ];


    // --- Dynamic Action Selection ---
    let communicationSlot: { id: string, emoji: string, label: string, outcomes: MicroActionResult[] };
    if (currentYear >= 2008) {
        communicationSlot = { id: 'phone', emoji: '📱', label: 'Checar Smartphone', outcomes: phoneActions };
    } else if (currentYear >= 1995) {
        communicationSlot = { id: 'pc', emoji: '💻', label: 'Usar o Computador', outcomes: pcActions };
    } else if (currentYear >= 1940) {
        communicationSlot = { id: 'landline', emoji: '☎️', label: 'Telefonar para Alguém', outcomes: landlinePhoneActions };
    } else {
        communicationSlot = { id: 'letter', emoji: '✍️', label: 'Escrever uma Carta', outcomes: letterActions };
    }

    let mediaSlot: { id: string, emoji: string, label: string, outcomes: MicroActionResult[] };
    if (currentYear >= 1925) {
        mediaSlot = { id: 'radio', emoji: '📻', label: 'Ouvir Rádio', outcomes: radioActions };
    } else {
        mediaSlot = { id: 'newspaper', emoji: '📰', label: 'Ler o Jornal', outcomes: newspaperActions };
    }


    return (
        <div className="w-full max-w-3xl bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 animate-fade-in border border-slate-700 text-center">
            <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-cyan-400 mx-auto"></div>
            <h2 className="text-xl font-bold text-white mt-4">Enquanto o tempo passa...</h2>
            <p className="text-slate-400 mb-6">A vida continua. O que você faz enquanto espera?</p>

            <div className="space-y-3 mb-6">
                <button 
                    onClick={() => handleAction(communicationSlot.outcomes)} 
                    disabled={isCoolingDown}
                    className="w-full text-left p-3 bg-slate-700/50 border border-slate-600 rounded-lg flex items-center gap-3 disabled:opacity-50 transition-all hover:bg-slate-700"
                >
                    <span className="text-xl w-6 h-6 text-center">{communicationSlot.emoji}</span>
                    <span className="font-semibold text-slate-200">{communicationSlot.label}</span>
                </button>
                <button 
                    onClick={() => handleAction(snackActions)} 
                    disabled={isCoolingDown}
                    className="w-full text-left p-3 bg-slate-700/50 border border-slate-600 rounded-lg flex items-center gap-3 disabled:opacity-50 transition-all hover:bg-slate-700"
                >
                    <span className="text-xl w-6 h-6 text-center">☕</span>
                    <span className="font-semibold text-slate-200">Tomar um Café / Lanche</span>
                </button>
                <button 
                    onClick={() => handleAction(mediaSlot.outcomes)} 
                    disabled={isCoolingDown}
                    className="w-full text-left p-3 bg-slate-700/50 border border-slate-600 rounded-lg flex items-center gap-3 disabled:opacity-50 transition-all hover:bg-slate-700"
                >
                    <span className="text-xl w-6 h-6 text-center">{mediaSlot.emoji}</span>
                    <span className="font-semibold text-slate-200">{mediaSlot.label}</span>
                </button>
                <button 
                    onClick={() => handleAction(windowActions)} 
                    disabled={isCoolingDown}
                    className="w-full text-left p-3 bg-slate-700/50 border border-slate-600 rounded-lg flex items-center gap-3 disabled:opacity-50 transition-all hover:bg-slate-700"
                >
                    <span className="text-xl w-6 h-6 text-center">🏞️</span>
                    <span className="font-semibold text-slate-200">Olhar pela Janela</span>
                </button>
                <button 
                    onClick={() => handleAction(meditateActions)} 
                    disabled={isCoolingDown}
                    className="w-full text-left p-3 bg-slate-700/50 border border-slate-600 rounded-lg flex items-center gap-3 disabled:opacity-50 transition-all hover:bg-slate-700"
                >
                    <span className="text-xl w-6 h-6 text-center">🧘</span>
                    <span className="font-semibold text-slate-200">Meditar / Organizar Pensamentos</span>
                </button>
                <button 
                    onClick={() => handleAction(doodleActions)} 
                    disabled={isCoolingDown}
                    className="w-full text-left p-3 bg-slate-700/50 border border-slate-600 rounded-lg flex items-center gap-3 disabled:opacity-50 transition-all hover:bg-slate-700"
                >
                    <span className="text-xl w-6 h-6 text-center">✏️</span>
                    <span className="font-semibold text-slate-200">Rabiscar em um Papel</span>
                </button>
            </div>
            
            <div className="h-10">
                {lastOutcome && (
                    <div className="p-3 bg-slate-900/70 rounded-lg text-center text-sm text-cyan-300 animate-fade-in">
                        <p>{lastOutcome}</p>
                    </div>
                )}
            </div>

            <div className="flex justify-center items-center gap-2">
                <button
                    onClick={onShowDebug}
                    className="mt-4 px-4 py-2 text-xs bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 transition-colors"
                >
                    Ver Depuração
                </button>
            </div>
        </div>
    );
};

export default DowntimeActivities;