import React, { useState, useMemo } from 'react';
import { Ancestor } from '../types';
import { PixelArtPortraitIcon, TrophyIcon, CrownIcon, CurrencyDollarIcon, ShieldExclamationIcon, AcademicCapIcon, HeartIcon, BriefcaseIcon, LockClosedIcon, GlobeAltIcon, CheckCircleIcon, StarIcon } from './Icons';

interface FamilyBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  ancestors: Ancestor[];
  lastName: string;
}

const iconMap: { [key: string]: React.ReactNode } = {
  TrophyIcon: <TrophyIcon />,
  CrownIcon: <CrownIcon />,
  CurrencyDollarIcon: <CurrencyDollarIcon />,
  ShieldExclamationIcon: <ShieldExclamationIcon />,
  AcademicCapIcon: <AcademicCapIcon />,
  HeartIcon: <HeartIcon />,
  BriefcaseIcon: <BriefcaseIcon />,
  GlobeAltIcon: <GlobeAltIcon />,
  CheckCircleIcon: <CheckCircleIcon />,
  StarIcon: <StarIcon />,
};

const statLabels: { [key: string]: string } = {
    intelligence: 'Inteligência',
    charisma: 'Carisma',
    creativity: 'Criatividade',
    discipline: 'Disciplina',
    morality: 'Moralidade',
    fame: 'Fama',
    influence: 'Influência',
};


const FamilyBookModal: React.FC<FamilyBookModalProps> = ({ isOpen, onClose, ancestors, lastName }) => {
  const [selectedAncestorId, setSelectedAncestorId] = useState<string | null>(ancestors[ancestors.length - 1]?.id || null);
  
  const selectedAncestor = useMemo(() => {
    return ancestors.find(a => a.id === selectedAncestorId);
  }, [selectedAncestorId, ancestors]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl h-[90vh] bg-slate-800 rounded-2xl shadow-2xl flex flex-col relative overflow-hidden font-serif border-4 border-amber-900/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Book Spine */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-full bg-slate-900 border-x-2 border-amber-900/80"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-amber-800/50 rounded-full text-amber-100 hover:bg-amber-700 hover:text-white transition-colors z-20"
          aria-label="Fechar Livro da Família"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Book Content */}
        <div className="w-full h-full flex z-10">
          {/* Left Page: Timeline */}
          <div className="w-1/2 bg-[#fdf6e3] text-slate-800 p-8 overflow-y-auto">
            <h2 className="text-3xl font-bold text-amber-900 mb-6 pb-2 border-b-2 border-amber-800/20">A Linhagem {lastName}</h2>
            <div className="relative pl-4 border-l-2 border-amber-800/30">
              {ancestors.map((ancestor, index) => (
                <div key={ancestor.id} className="mb-4 relative">
                  <span className="absolute -left-6 top-1.5 w-3 h-3 bg-amber-800 rounded-full border-2 border-[#fdf6e3]"></span>
                  <button onClick={() => setSelectedAncestorId(ancestor.id)} className={`text-left w-full p-2 rounded-md transition-colors ${selectedAncestorId === ancestor.id ? 'bg-amber-100' : 'hover:bg-amber-50'}`}>
                    <p className="font-bold">{`Geração ${ancestor.generation}: ${ancestor.name}`}</p>
                    <p className="text-sm text-slate-600">{ancestor.eraLived}</p>
                  </button>
                </div>
              ))}
               <div className="mb-4 relative">
                  <span className="absolute -left-6 top-1.5 w-3 h-3 bg-slate-500 rounded-full border-2 border-[#fdf6e3]"></span>
                  <div className="text-left w-full p-2 rounded-md">
                    <p className="font-bold text-slate-500 flex items-center gap-2"><LockClosedIcon /> Segredo da Família</p>
                    <p className="text-sm text-slate-500 italic">Descubra nas próximas gerações...</p>
                  </div>
                </div>
            </div>
          </div>
          
          {/* Right Page: Details */}
          <div className="w-1/2 bg-[#fdf6e3] text-slate-800 p-8 overflow-y-auto border-l-2 border-amber-900/10">
            {selectedAncestor ? (
                <div>
                    <div className="text-center mb-6">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-md overflow-hidden border-4 border-amber-800/20 bg-amber-100 shadow-lg">
                           <PixelArtPortraitIcon 
                                hairColor={selectedAncestor.portraitTraits.hairColor} 
                                eyeColor={selectedAncestor.portraitTraits.eyeColor} 
                            />
                        </div>
                        <h3 className="text-2xl font-bold text-amber-900">{selectedAncestor.name} {selectedAncestor.lastName}</h3>
                        {selectedAncestor.title && <p className="text-lg text-amber-700 font-semibold">{selectedAncestor.title}</p>}
                        <p className="text-md text-slate-600">{selectedAncestor.eraLived}</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="font-bold text-amber-900 text-lg border-b border-amber-800/20 mb-2 pb-1">Status Final</h4>
                            <p className="text-slate-700 italic">"{selectedAncestor.finalStatus}"</p>
                        </div>
                        
                        {selectedAncestor.historicalContext && (
                            <div className="my-4">
                                <h4 className="font-bold text-amber-900 text-lg border-b border-amber-800/20 mb-2 pb-1">Marco Histórico</h4>
                                <p className="text-slate-700">Viveu durante o período de <strong>{selectedAncestor.historicalContext.plotTitle}</strong>.</p>
                                <p className="text-slate-700 mt-1 italic">Sua contribuição registrada foi: "{selectedAncestor.historicalContext.contribution}"</p>
                            </div>
                        )}

                        <div>
                            <h4 className="font-bold text-amber-900 text-lg border-b border-amber-800/20 mb-2 pb-1">Resumo da Vida</h4>
                            <p className="text-slate-700 leading-relaxed text-justify">{selectedAncestor.narrative}</p>
                        </div>

                        <div className="bg-amber-50/40 p-4 rounded-lg border border-amber-200/50">
                            <h4 className="font-bold text-amber-900 text-lg border-b border-amber-800/20 mb-3 pb-1">Legado Deixado</h4>
                            <div className="space-y-4">
                                <div>
                                    <h5 className="font-semibold text-amber-800 mb-2">Traços Marcantes</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAncestor.definingTraits.map(trait => (
                                            <span key={trait} className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-sm font-semibold border border-amber-200">{trait}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-amber-800 mb-2">Conquistas Notáveis</h5>
                                    <div className="space-y-2">
                                    {selectedAncestor.achievements.map((ach, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                                <span className="w-5 h-5 text-amber-800 flex-shrink-0">{iconMap[ach.icon] || <TrophyIcon />}</span>
                                                <p className="text-slate-700 font-medium text-sm">{ach.text}</p>
                                        </div>
                                    ))}
                                    {selectedAncestor.achievements.length === 0 && <p className="text-slate-500 italic text-sm">Nenhuma grande conquista registrada.</p>}
                                    </div>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-amber-800 mb-2">Atributos Finais</h5>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm">
                                        {Object.entries(selectedAncestor.finalStats).map(([key, value]) => (
                                            <div key={key} className="flex justify-between border-b border-amber-200/50 py-1">
                                                <span className="capitalize text-slate-600">{statLabels[key] || key}:</span>
                                                <span className="font-bold text-slate-800">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                 <div>
                                    <h5 className="font-semibold text-amber-800 mb-2">Carreira e Finanças</h5>
                                    <div className="text-sm space-y-1">
                                        <p><span className="text-slate-600">Profissão Final:</span> <span className="font-bold text-slate-800">{selectedAncestor.careerSummary.jobTitle || 'Não especificado'}</span></p>
                                        <p><span className="text-slate-600">Nível de Carreira:</span> <span className="font-bold text-slate-800">{selectedAncestor.careerSummary.careerLevel}</span></p>
                                        <p><span className="text-slate-600">Patrimônio Deixado:</span> <span className="font-bold text-slate-800">${selectedAncestor.finalWealth.toLocaleString('pt-BR')}</span></p>
                                    </div>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-amber-800 mb-2">Relacionamentos Chave</h5>
                                    <div className="space-y-2 text-sm">
                                        {selectedAncestor.keyRelationships.map((rel, index) => {
                                            const intimacyColor = rel.intimacy > 20 ? 'text-green-800' : rel.intimacy < -20 ? 'text-red-800' : 'text-slate-700';
                                            return (
                                                <div key={index} className="flex justify-between items-center">
                                                    <p className="font-semibold text-slate-800">{rel.name} <span className="text-xs text-slate-500">({rel.title})</span></p>
                                                    <span className={`font-bold ${intimacyColor}`}>{rel.intimacy > 0 ? `+${rel.intimacy}` : rel.intimacy}</span>
                                                </div>
                                            );
                                        })}
                                        {selectedAncestor.keyRelationships.length === 0 && <p className="text-slate-500 italic">Viveu uma vida solitária.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-2xl text-amber-900 font-bold">Selecione um ancestral</p>
                    <p className="text-slate-600">Escolha um membro na linha do tempo para ver sua história.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyBookModal;
