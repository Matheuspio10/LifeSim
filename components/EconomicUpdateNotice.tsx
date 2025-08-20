
import React from 'react';
import { EconomicUpdate, EconomicClimate } from '../types';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from './Icons';

interface EconomicUpdateNoticeProps {
  update: EconomicUpdate;
}

const ClimateDisplay: React.FC<{ climate: EconomicClimate }> = ({ climate }) => {
    const config = {
        [EconomicClimate.BOOM]: {
            icon: <ArrowTrendingUpIcon />,
            color: 'text-green-400',
            bgColor: 'bg-green-900/50',
            borderColor: 'border-green-700'
        },
        [EconomicClimate.STABLE]: {
            icon: <MinusIcon />,
            color: 'text-slate-400',
            bgColor: 'bg-slate-700/50',
            borderColor: 'border-slate-600'
        },
        [EconomicClimate.RECESSION]: {
            icon: <ArrowTrendingDownIcon />,
            color: 'text-red-400',
            bgColor: 'bg-red-900/50',
            borderColor: 'border-red-700'
        },
    };
    
    const { icon, color, bgColor, borderColor } = config[climate];

    return (
        <div className={`flex items-center gap-4 p-3 rounded-lg ${bgColor} border ${borderColor}`}>
            <span className={`w-8 h-8 ${color}`}>{icon}</span>
            <div>
                <p className="text-sm text-slate-400">Clima Econômico</p>
                <p className={`text-lg font-bold ${color}`}>{climate}</p>
            </div>
        </div>
    );
};

const ChangeDisplay: React.FC<{ label: string, value: number }> = ({ label, value }) => {
    const color = value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-slate-400';
    const sign = value > 0 ? '+' : '';
    
    if (value === 0) return null;

    return (
        <div>
            <p className="text-sm text-slate-400">{label}</p>
            <p className={`font-bold text-lg ${color}`}>{sign}${value.toLocaleString()}</p>
        </div>
    );
};

const EconomicUpdateNotice: React.FC<EconomicUpdateNoticeProps> = ({ update }) => {
  return (
    <div className="w-full max-w-lg bg-slate-800/80 backdrop-blur-md rounded-2xl p-8 animate-fade-in border border-slate-700 shadow-2xl">
      <h3 className="text-xl font-bold text-center text-cyan-400 mb-4">Fase de Mercado</h3>
      <div className="mb-6">
        <ClimateDisplay climate={update.climate} />
      </div>
      <p className="text-slate-300 text-center italic mb-6">{update.message}</p>
      <div className="flex justify-around text-center bg-slate-900/50 p-4 rounded-lg">
          <ChangeDisplay label="Riqueza" value={update.wealthChange} />
          <ChangeDisplay label="Investimentos" value={update.investmentChange} />
      </div>
    </div>
  );
};

export default EconomicUpdateNotice;
