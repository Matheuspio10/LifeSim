import React from 'react';
import { AuditReport, AuditReportModalProps } from '../types';
import { 
    ClipboardDocumentListIcon, 
    CheckCircleIcon, 
    SparklesIcon, 
    ExclamationTriangleIcon, 
    UsersIcon, 
    PuzzlePieceIcon, 
    LightBulbIcon, 
    WrenchScrewdriverIcon 
} from './Icons';

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'completed_unmarked':
        case 'opportunity':
            return <div className="w-5 h-5 text-yellow-400"><ExclamationTriangleIcon /></div>;
        case 'neglected':
        case 'stale_rivalry':
        case 'inconsistent':
        case 'bugged':
            return <div className="w-5 h-5 text-red-400"><ExclamationTriangleIcon /></div>;
        case 'in_progress':
        case 'healthy':
            return <div className="w-5 h-5 text-cyan-400"><SparklesIcon /></div>;
        case 'completed':
        case 'ok':
            return <div className="w-5 h-5 text-green-400"><CheckCircleIcon /></div>;
        default:
            return null;
    }
};

const getStatusColor = (status: string): string => {
    switch (status) {
        case 'completed_unmarked': return 'border-yellow-600 bg-yellow-900/30';
        case 'opportunity': return 'border-sky-600 bg-sky-900/30';
        case 'neglected':
        case 'stale_rivalry':
        case 'inconsistent':
        case 'bugged': return 'border-red-600 bg-red-900/30';
        default: return 'border-slate-700 bg-slate-800/40';
    }
};

const AuditReportModal: React.FC<AuditReportModalProps> = ({ isOpen, onClose, report, onApplyFixes }) => {
  if (!isOpen || !report) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <span className="w-8 h-8 text-cyan-400"><WrenchScrewdriverIcon/></span>
            Relatório de Situação
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-slate-700/50 rounded-full text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
            aria-label="Fechar Relatório"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-slate-400 text-sm flex-shrink-0">
            Uma análise automática foi realizada para encontrar pendências e oportunidades na sua vida. Ações corretivas podem ser aplicadas para alguns itens.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden flex-grow">
            <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                {/* Goals Section */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2"><ClipboardDocumentListIcon />Metas de Vida</h3>
                    <div className="space-y-2">
                        {report.goals.map((finding, index) => (
                            <div key={index} className={`p-3 rounded-md border-l-4 ${getStatusColor(finding.status)}`}>
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">{getStatusIcon(finding.status)}</div>
                                    <div>
                                        <p className="font-semibold text-slate-200">{finding.description}</p>
                                        <p className="text-xs text-slate-400 italic mt-1">{finding.recommendation}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                 {/* Plots Section */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2"><PuzzlePieceIcon />Tramas Ativas</h3>
                    <div className="space-y-2">
                        {report.plots.map((finding, index) => (
                            <div key={index} className={`p-3 rounded-md border-l-4 ${getStatusColor(finding.status)}`}>
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">{getStatusIcon(finding.status)}</div>
                                    <div>
                                        <p className="font-semibold text-slate-200">{finding.description}</p>
                                        <p className="text-xs text-slate-400 italic mt-1">{finding.recommendation}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {report.plots.length === 0 && <p className="text-sm text-slate-500 italic text-center">Nenhuma trama ativa no momento.</p>}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                {/* Relationships Section */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2"><UsersIcon />Relacionamentos</h3>
                    <div className="space-y-2">
                        {report.relationships.map((finding, index) => (
                            <div key={index} className={`p-3 rounded-md border-l-4 ${getStatusColor(finding.status)}`}>
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">{getStatusIcon(finding.status)}</div>
                                    <div>
                                        <p className="font-semibold text-slate-200">{finding.name}</p>
                                        <p className="text-xs text-slate-400 italic mt-1">{finding.recommendation}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                 {/* Cohesion Section */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2"><LightBulbIcon />Análise de Coerência</h3>
                    <div className="space-y-2">
                        {report.cohesion.map((finding, index) => (
                            <div key={index} className={`p-3 rounded-md border-l-4 ${getStatusColor(finding.status)}`}>
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">{getStatusIcon(finding.status)}</div>
                                    <div>
                                        <p className="font-semibold text-slate-200">{finding.area}</p>
                                        <p className="text-xs text-slate-400 italic mt-1">{finding.recommendation}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div className="flex-shrink-0 pt-4 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-end gap-3">
             {report.fixesAvailable > 0 && 
                <p className="text-sm text-yellow-400 flex-grow text-center sm:text-left">
                    {report.fixesAvailable} correção(ões) automática(s) encontrada(s).
                </p>
            }
            <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition-colors"
            >
                Fechar
            </button>
            <button
                onClick={() => onApplyFixes(report)}
                disabled={report.fixesAvailable === 0}
                className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-colors disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
                Aplicar Correções Automáticas
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuditReportModal;
