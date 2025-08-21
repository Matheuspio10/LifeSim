
import React, { useState, useEffect } from 'react';
import { DecisionArea } from '../types';
import { BriefcaseIcon, HeartIcon, UsersIcon } from './Icons';

interface ThinkingLoaderProps {
    area: DecisionArea;
}

const loadingMessages = [
    "Consultando os anais da história...",
    "Avaliando suas escolhas passadas...",
    "Adicionando um toque de imprevisibilidade...",
    "Tecendo as complexidades do destino...",
    "Analisando os traços da sua personalidade...",
    "Considerando o clima econômico atual...",
    "Gerando consequências realistas...",
    "Procurando por momentos de virada na vida...",
    "Equilibrando sorte e habilidade...",
    "Criando um desafio à sua altura...",
];

const ThinkingLoader: React.FC<ThinkingLoaderProps> = ({ area }) => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    const areaConfig = {
        CAREER: {
            icon: <BriefcaseIcon />,
            title: "Carreira e Finanças",
            color: "text-blue-400",
        },
        PERSONAL: {
            icon: <HeartIcon />,
            title: "Desenvolvimento Pessoal",
            color: "text-green-400",
        },
        SOCIAL: {
            icon: <UsersIcon />,
            title: "Vida Social e Relacionamentos",
            color: "text-yellow-400",
        },
    };

    const config = areaConfig[area];

    return (
        <div className="w-full max-w-lg bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 animate-fade-in border border-slate-700 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className={`w-16 h-16 ${config.color} mb-4`}>
                {config.icon}
            </div>
            <h2 className="text-xl font-bold text-white">A IA está elaborando um evento sobre...</h2>
            <p className={`text-2xl font-bold ${config.color} mb-6`}>{config.title}</p>
            
            <div className="w-full bg-slate-700 rounded-full h-2.5 mb-4 overflow-hidden">
                <div className="bg-cyan-400 h-2.5 rounded-full w-full animate-progress"></div>
            </div>

            <p className="text-slate-400 h-10 transition-opacity duration-500">
                {loadingMessages[messageIndex]}
            </p>
        </div>
    );
};


const style = `
@keyframes progress-animation {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0%); }
  100% { transform: translateX(100%); }
}
.animate-progress {
  animation: progress-animation 2s ease-in-out infinite;
}
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = style;
document.head.appendChild(styleSheet);


export default ThinkingLoader;
