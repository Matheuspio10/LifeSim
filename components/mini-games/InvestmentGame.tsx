
import React, { useState, useMemo } from 'react';
import { GameEvent, Choice, Character } from '../../types';
import { ChartPieIcon, CurrencyDollarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '../Icons';

interface InvestmentGameProps {
  event: GameEvent;
  character: Character;
  onComplete: (choice: Choice) => void;
}

interface InvestmentOption {
    name: string;
    description: string;
    riskLevel: 'low' | 'medium' | 'high';
    potentialReturnMultiplier: number;
    failureLossMultiplier: number;
}

const InvestmentGame: React.FC<InvestmentGameProps> = ({ event, character, onComplete }) => {
  const [selectedOption, setSelectedOption] = useState<InvestmentOption | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<number>(Math.floor(character.wealth * 0.1));
  const [error, setError] = useState<string | null>(null);

  const options: InvestmentOption[] = useMemo(() => event.miniGameData?.options || [], [event]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      setInvestmentAmount(0);
    } else {
      setInvestmentAmount(Math.max(0, Math.min(character.wealth, value)));
    }
  };

  const handleInvest = () => {
    if (!selectedOption || investmentAmount <= 0) {
        setError('Por favor, selecione uma opção e um valor para investir.');
        return;
    }
    setError(null);

    // Calculate success chance
    let baseSuccessChance: number;
    switch (selectedOption.riskLevel) {
        case 'low': baseSuccessChance = 80; break;
        case 'medium': baseSuccessChance = 50; break;
        case 'high': baseSuccessChance = 25; break;
        default: baseSuccessChance = 50;
    }
    // Intelligence influences the chance
    const intelligenceModifier = (character.intelligence - 50) / 10; // -5% to +5%
    const finalSuccessChance = baseSuccessChance + intelligenceModifier;

    const isSuccess = Math.random() * 100 < finalSuccessChance;

    let wealthChange: number;
    let outcomeText: string;
    
    if (isSuccess) {
        wealthChange = Math.floor(investmentAmount * (selectedOption.potentialReturnMultiplier - 1));
        outcomeText = `Seu investimento em '${selectedOption.name}' foi um sucesso! Você obteve um lucro de $${wealthChange.toLocaleString()}.`;
    } else {
        wealthChange = Math.floor(investmentAmount * (selectedOption.failureLossMultiplier - 1));
        outcomeText = `O mercado virou contra você. Seu investimento em '${selectedOption.name}' resultou em uma perda de $${Math.abs(wealthChange).toLocaleString()}.`;
    }
    
    const generatedChoice: Choice = {
        choiceText: `Investiu $${investmentAmount.toLocaleString()} em ${selectedOption.name}`,
        outcomeText: outcomeText,
        statChanges: {
            wealth: wealthChange,
            // Investing can be a learning experience
            intelligence: isSuccess ? 1 : 0,
            // Taking risks can affect discipline
            discipline: selectedOption.riskLevel === 'high' ? (isSuccess ? 2 : -1) : 0,
        }
    };

    onComplete(generatedChoice);
  };
  
  const riskConfig = {
      low: { label: 'Baixo Risco', color: 'bg-green-600', icon: <ArrowTrendingUpIcon/> },
      medium: { label: 'Médio Risco', color: 'bg-yellow-500', icon: <ArrowTrendingUpIcon/> },
      high: { label: 'Alto Risco', color: 'bg-red-600', icon: <ArrowTrendingDownIcon/> }
  };

  return (
    <div className="w-full max-w-lg bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
        <h2 className="text-2xl font-bold text-cyan-400 text-center mb-2 flex items-center justify-center gap-3">
            <span className="w-8 h-8"><ChartPieIcon /></span>
            Oportunidade de Investimento
        </h2>
        <p className="text-slate-300 text-center leading-relaxed mb-6">{event.eventText}</p>
      
        <div className="space-y-3 mb-6">
            {options.map((option, index) => (
                <button
                    key={index}
                    onClick={() => setSelectedOption(option)}
                    className={`w-full p-4 bg-slate-900/50 border-2 rounded-lg text-left transition-all duration-200
                                ${selectedOption?.name === option.name ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-slate-700 hover:border-slate-500'}`}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-slate-100">{option.name}</p>
                            <p className="text-sm text-slate-400">{option.description}</p>
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-bold text-white px-2 py-1 rounded-full ${riskConfig[option.riskLevel].color}`}>
                             <span className="w-3 h-3">{riskConfig[option.riskLevel].icon}</span>
                            {riskConfig[option.riskLevel].label}
                        </div>
                    </div>
                </button>
            ))}
        </div>

        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
             <div className="flex justify-between items-center mb-2">
                <label htmlFor="investment-amount" className="font-semibold text-slate-300">Valor a Investir</label>
                <div className="text-sm text-slate-400 flex items-center gap-2">
                    <span className="w-4 h-4"><CurrencyDollarIcon/></span>
                    <span>Disponível: ${character.wealth.toLocaleString()}</span>
                </div>
             </div>
            <div className="flex items-center gap-4">
                <input
                    type="range"
                    min="0"
                    max={character.wealth}
                    step={Math.floor(character.wealth / 100)}
                    value={investmentAmount}
                    onChange={handleAmountChange}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                 <input
                    id="investment-amount"
                    type="number"
                    value={investmentAmount}
                    onChange={handleAmountChange}
                    className="w-32 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white font-bold text-right"
                />
            </div>
        </div>
        
        {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}

        <button
            onClick={handleInvest}
            disabled={!selectedOption || investmentAmount <= 0}
            className="w-full mt-6 text-center px-6 py-4 bg-indigo-600 border border-transparent rounded-lg text-white font-semibold
                       hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/30
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500
                       transition-all duration-200 transform hover:-translate-y-1
                       disabled:bg-slate-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
        >
            {selectedOption ? `Investir $${investmentAmount.toLocaleString()} em ${selectedOption.name}` : 'Selecione uma opção'}
        </button>
    </div>
  );
};

export default InvestmentGame;
