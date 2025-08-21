
import React, { useState } from 'react';
import { Checkpoint } from '../types';
import { ShieldExclamationIcon, ArrowUturnLeftIcon } from './Icons';

interface EmergencyRollbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (checkpoint: Checkpoint) => void;
  checkpoints: Checkpoint[];
}

const EmergencyRollbackModal: React.FC<EmergencyRollbackModalProps> = ({ isOpen, onClose, onRestore, checkpoints }) => {
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<string | null>(checkpoints[0]?.id || null);
  const [error, setError] = useState<string | null>(null);

  const handleRestoreClick = () => {
    if (!selectedCheckpointId) {
      setError("Por favor, selecione um ponto de restauração.");
      return;
    }
    const selected = checkpoints.find(c => c.id === selectedCheckpointId);
    if (selected) {
      onRestore(selected);
    } else {
      setError("Ponto de restauração selecionado não encontrado.");
    }
  };
  
  const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
      });
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rollback-modal-title"
    >
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 flex flex-col" role="document">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 text-yellow-400"><ShieldExclamationIcon /></div>
                <h2 id="rollback-modal-title" className="text-2xl font-bold text-white">Botão de Emergência: Restaurar Jogo</h2>
            </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-slate-700/50 rounded-full text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-slate-300 mb-4">
          Esta ferramenta reverte seu jogo para um ponto anterior seguro. Use-a se encontrou um erro grave ou deseja refazer sua última ação.
        </p>

        <div className="bg-slate-800/50 p-4 rounded-lg overflow-y-auto border border-slate-700 max-h-[40vh] mb-4">
          <fieldset>
            <legend className="sr-only">Pontos de restauração</legend>
            <div className="space-y-3">
              {checkpoints.length > 0 ? (
                checkpoints.map((checkpoint, index) => (
                  <label
                    key={checkpoint.id}
                    htmlFor={checkpoint.id}
                    className={`block p-4 bg-slate-900/70 border-2 rounded-lg cursor-pointer transition-all duration-200 
                                ${selectedCheckpointId === checkpoint.id ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-slate-700 hover:border-slate-500'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          id={checkpoint.id}
                          name="checkpoint"
                          type="radio"
                          checked={selectedCheckpointId === checkpoint.id}
                          onChange={() => setSelectedCheckpointId(checkpoint.id)}
                          className="h-4 w-4 border-slate-500 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <p className="font-bold text-slate-100">{checkpoint.name}</p>
                          <p className="text-sm text-slate-400">{formatDate(checkpoint.timestamp)}</p>
                        </div>
                      </div>
                      {index === 0 && <span className="text-xs font-bold text-cyan-400 bg-cyan-900/50 px-2 py-1 rounded-full">MAIS RECENTE</span>}
                    </div>
                    {checkpoint.keyActions && checkpoint.keyActions.length > 0 && (
                      <p className="mt-3 pl-7 text-sm text-slate-500 italic">"{checkpoint.keyActions[0]}"</p>
                    )}
                  </label>
                ))
              ) : (
                <p className="text-slate-500 text-center py-8">Nenhum ponto de restauração foi salvo ainda.</p>
              )}
            </div>
          </fieldset>
        </div>
        
        <div className="p-3 text-center bg-yellow-900/50 border border-yellow-700 rounded-lg text-yellow-200 text-sm font-semibold mb-6">
            Atenção: Todas as ações tomadas depois do ponto selecionado serão descartadas permanentemente.
        </div>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        <button
          onClick={handleRestoreClick}
          disabled={!selectedCheckpointId || checkpoints.length === 0}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 border border-transparent rounded-lg text-white font-bold
                     hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/30
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500
                     transition-all duration-200 transform hover:-translate-y-1
                     disabled:bg-slate-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
        >
          <span className="w-6 h-6"><ArrowUturnLeftIcon /></span>
          Restaurar Para Este Ponto
        </button>
      </div>
    </div>
  );
};

export default EmergencyRollbackModal;
