/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LogOut, ArrowLeft, CheckCircle2, ShieldCheck, Award } from 'lucide-react';

interface ExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  views: number;
}

export default function ExitModal({ isOpen, onClose }: ExitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-950/75 dark:bg-slate-950/85 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-slate-900 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-200 dark:border-slate-800">
          
          <div className="bg-white dark:bg-slate-900 px-6 pt-6 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start gap-4">
              
              {/* Exit Indicator Icon */}
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 sm:mx-0 sm:h-10 sm:w-10">
                <LogOut className="h-5 w-5" />
              </div>

              {/* Text / Stats Summary */}
              <div className="mt-3 text-center sm:mt-0 sm:ml-2 sm:text-left space-y-3.5">
                <h3 className="text-lg leading-6 font-bold text-slate-905 dark:text-slate-50" id="modal-title">
                  Sessão Encerrada com Sucesso
                </h3>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                  Você saiu com segurança do painel integrado <b>INDICADORES</b>. Todas as calibrações de conformidade, simulações de custos de cobre e dados de telemetria foram arquivadas em sua sessão local e estão prontas para sua próxima auditoria técnica.
                </p>

                {/* Audit summary checklists items */}
                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-150 dark:border-slate-800 space-y-2.5 text-xs text-slate-650 dark:text-slate-350">
                  <header className="font-bold text-[10px] uppercase font-mono tracking-widest text-slate-400">
                    Ações Executadas no Ciclo de Trabalho:
                  </header>
                  
                  <div className="space-y-1.5 font-sans">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Sincronização LME commodities calibrada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Fator de exposição cambial (USD/BRL) atualizado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Checklist de conformidade ABNT/NBR arquivado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Telemetria térmica de infraestrutura civil/mecânica ok</span>
                    </div>
                  </div>
                </div>

                {/* Notice link */}
                <p className="text-[10px] text-slate-450 text-center leading-normal">
                  Pressione o botão abaixo para retornar de imediato à plataforma de indicadores.
                </p>
              </div>

            </div>
          </div>

          {/* Action buttons footer */}
          <div className="bg-slate-50 dark:bg-slate-850 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2 border-t border-slate-150 dark:border-slate-800/85">
            <button
              type="button"
              onClick={onClose}
              id="exit-modal-btn-return"
              className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-slate-900 dark:bg-blue-650 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-indigo-505 sm:ml-3 sm:w-auto cursor-pointer"
            >
              Retornar ao Painel
            </button>
            <button
              type="button"
              onClick={() => {
                // simulated complete page reload or home reset
                window.location.reload();
              }}
              id="exit-modal-btn-restart"
              className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm px-4 py-2 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none sm:mt-0 sm:w-auto cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Reiniciar Painel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
