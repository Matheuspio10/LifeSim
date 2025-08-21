

import React, { useState, useMemo } from 'react';
import { Character, WeeklyFocus } from '../types';
import { FOCUS_OPTIONS, MAX_FOCUS_POINTS } from '../constants';
import { 
    BriefcaseIcon, 
    UsersIcon, 
    HeartPulseIcon, 
    LightBulbIcon, 
    AcademicCapIcon, 
    HomeIcon, 
    CheckCircleIcon, 
    PaintBrushIcon, 
    MusicalNoteIcon,
    ChartBarIcon,
    SpeakerWaveIcon,
    CurrencyDollarIcon,
    HeartIcon,
    TrophyIcon,
    BeakerIcon,
    ShieldExclamationIcon,
    SparklesIcon 
} from './Icons';

interface RoutineScreenProps {
  character: Character;
  onConfirm: (focuses: WeeklyFocus[]) => void;
  isLoading: boolean;
}

const iconMap: { [key: string]: React.ReactNode } = {
    BriefcaseIcon: <BriefcaseIcon />,
    UsersIcon: <UsersIcon />,
    HeartPulseIcon: <HeartPulseIcon />,
    LightBulbIcon: <LightBulbIcon />,
    AcademicCapIcon: <AcademicCapIcon />,
    HomeIcon: <HomeIcon />,
    PaintBrushIcon: <PaintBrushIcon />,
    MusicalNoteIcon: <MusicalNoteIcon />,
    ChartBarIcon: <ChartBarIcon />,
    SpeakerWaveIcon: <SpeakerWaveIcon />,
    CurrencyDollarIcon: <CurrencyDollarIcon />,
    HeartIcon: <HeartIcon />,
    TrophyIcon: <TrophyIcon />,
    BeakerIcon: <BeakerIcon />,
    ShieldExclamationIcon: <ShieldExclamationIcon />,
    SparklesIcon: <SparklesIcon />,
};


const RoutineScreen: React.FC<RoutineScreenProps> = ({ character, onConfirm, isLoading }) => {
  const [selectedFocuses, setSelectedFocuses] = useState<string[]>([]);
  
  const pointsUsed = selectedFocuses.length;
  const pointsRemaining = MAX_FOCUS_POINTS - pointsUsed;

  const handleSelectFocus = (focusId: string) => {
    setSelectedFocuses(prev => {
      if (prev.includes(focusId)) {
        return prev.filter(id => id !== focusId);
      }
      if (prev.length < MAX_FOCUS_POINTS) {
        return [...prev, focusId];
      }
      return prev;
    });
  };

  const handleConfirm = () => {
    const focusesToConfirm = FOCUS_OPTIONS.filter(f => selectedFocuses.includes(f.id));
    onConfirm(focusesToConfirm);
  };
  
  const getStatChangeText = (change: number | undefined, unit: string = ''): string | null => {
      if (!change) return null;
      const sign = change > 0 ? '+' : '';
      return `${sign}${change}${unit}`;
  }

  if (isLoading) {
    return (
        <div className="w-full max-w-2xl text-center p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl animate-fade-in flex flex-col items-center justify-center min-h-[500px]">
             <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-400"></div>
             <h2 className="text-2xl font-bold text-white mt-6">Preparando sua vida...</h2>
             <p className="text-slate-300 mt-2">Suas escolhas estão moldando o futuro.</p>
        </div>
    );
  }

  return (
    <div className="w-full max-w-2xl text-center p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-2">Planeje seu Ano</h2>
      <p className="text-slate-300 mb-6">A vida é feita de escolhas. Em que você vai focar suas energias agora?</p>

      <div className="sticky top-4 z-10 bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 mb-6 border border-slate-700">
        <p className="text-lg font-semibold text-slate-300">Pontos de Foco Restantes</p>
        <div className="flex justify-center items-center gap-2 mt-2">
            {Array.from({ length: MAX_FOCUS_POINTS }).map((_, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${i < pointsRemaining ? 'bg-cyan-400' : 'bg-slate-600'} transition-colors`}></div>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {FOCUS_OPTIONS.map(focus => {
          const isSelected = selectedFocuses.includes(focus.id);
          const isDisabled = pointsRemaining === 0 && !isSelected;
          
          return (
            <button
              key={focus.id}
              onClick={() => handleSelectFocus(focus.id)}
              disabled={isDisabled}
              className={`relative p-4 bg-slate-900/60 border border-slate-700 rounded-lg text-left transition-all duration-200 group
                         ${isSelected ? 'ring-2 ring-cyan-500' : ''}
                         ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700/50 hover:border-slate-600 transform hover:-translate-y-1'}`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 text-cyan-400 bg-slate-800 rounded-full flex items-center justify-center">
                    <CheckCircleIcon />
                </div>
              )}
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 text-cyan-400 flex-shrink-0">{iconMap[focus.iconName]}</span>
                <h3 className="text-lg font-bold text-slate-100">{focus.name}</h3>
              </div>
              <p className="text-sm text-slate-400 mb-3 h-10">{focus.description}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold border-t border-slate-700 pt-2">
                    <span className="text-green-400">{getStatChangeText(focus.statChanges.health, ' Saúde')}</span>
                    <span className="text-blue-400">{getStatChangeText(focus.statChanges.intelligence, ' Intel.')}</span>
                    <span className="text-yellow-400">{getStatChangeText(focus.statChanges.charisma, ' Caris.')}</span>
                    <span className="text-purple-400">{getStatChangeText(focus.statChanges.creativity, ' Criat.')}</span>
                    <span className="text-emerald-400">{getStatChangeText(focus.statChanges.discipline, ' Disc.')}</span>
                    <span className={`font-mono ${focus.statChanges.wealth && focus.statChanges.wealth > 0 ? 'text-amber-400' : 'text-rose-400'}`}>{getStatChangeText(focus.statChanges.wealth, '$')}</span>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleConfirm}
        disabled={pointsRemaining > MAX_FOCUS_POINTS -1}
        className="w-full sm:w-auto px-8 py-4 bg-cyan-600 text-white font-bold text-lg rounded-lg
                   hover:bg-cyan-500 transition-all duration-200 transform hover:scale-105
                   shadow-lg shadow-cyan-600/30 disabled:bg-slate-600 disabled:shadow-none disabled:scale-100 disabled:cursor-not-allowed"
      >
        Confirmar Plano
      </button>
    </div>
  );
};

export default RoutineScreen;
