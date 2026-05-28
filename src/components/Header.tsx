/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RefreshCw, Sun, Moon, LogOut, Eye, ShieldAlert, Award, Printer, Copy, Check, ExternalLink, Mail, Phone, User, X } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: string;
  onExitClick: () => void;
}

export default function Header({
  isDarkMode,
  toggleDarkMode,
  onRefresh,
  isRefreshing,
  lastUpdated,
  onExitClick
}: HeaderProps) {
  const [brtTime, setBrtTime] = useState('');
  const [views, setViews] = useState(1);
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<'all' | 'email' | 'phone' | 'full' | null>(null);

  // View counter tracking
  useEffect(() => {
    try {
      const storedViews = localStorage.getItem('indicadores_view_count');
      if (storedViews) {
        const nextViews = parseInt(storedViews, 10) + 1;
        localStorage.setItem('indicadores_view_count', String(nextViews));
        setViews(nextViews);
      } else {
        localStorage.setItem('indicadores_view_count', '124'); // default starter
        setViews(124);
      }
    } catch (e) {
      console.warn('LocalStorage unavailable: ', e);
    }
  }, []);

  // BRT Clock (GMT-3)
  useEffect(() => {
    const updateTime = () => {
      const gmtDate = new Date();
      // Calculate Brasilia Time (UTC - 3)
      const brtOffset = -3;
      const utc = gmtDate.getTime() + (gmtDate.getTimezoneOffset() * 60000);
      const brDate = new Date(utc + (3600000 * brtOffset));
      
      const formatted = brDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setBrtTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Clipboard helper
  const handleCopyText = (textToCopy: string, label: 'all' | 'email' | 'phone' | 'full') => {
    try {
      navigator.clipboard.writeText(textToCopy);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedText(label);
        setTimeout(() => setCopiedText(null), 2000);
      } catch (err2) {
        console.error('Fallback copy failed', err2);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <header className="border-b transition-all duration-300 border-slate-200/80 dark:border-slate-850 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-50 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* Brand, Stats & Sponsor Portal Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between lg:justify-start gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 text-white dark:bg-blue-650 dark:text-white p-2.5 rounded-xl shadow-lg shadow-black/5 flex items-center justify-center">
              <span className="font-mono text-lg font-black tracking-wider text-teal-400">IND</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-sans tracking-tight text-slate-900 dark:text-slate-50">
                  INDICADORES
                </h1>
                <span className="bg-teal-550/10 text-teal-650 dark:text-teal-400 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Real-Time
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                Inteligência Operacional, Técnica e Financeira • Engenharia, Tecnologia & Finanças
              </p>
            </div>
          </div>

          {/* CalcPro Soluções Promo Button */}
          <div className="flex items-center no-print">
            <button
              onClick={() => setIsPromoOpen(true)}
              className="flex items-center gap-2.5 px-3.5 py-1.5 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-150/40 dark:border-emerald-900/30 rounded-xl hover:bg-emerald-50/80 dark:hover:bg-emerald-950/20 hover:shadow-sm hover:border-emerald-300/60 transition-all cursor-pointer text-left w-full sm:w-auto"
              title="CalcPro Soluções - Desenvolvedor & Aplicativos Inteligentes"
            >
              <div className="relative shrink-0 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-100 dark:border-slate-800 shadow-xs">
                {/* Genuine High-Fidelity CalcPro Vector Logo */}
                <svg className="w-7 h-7" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Green Outer Hexagonal Shield Shape matching the image */}
                  <path 
                    d="M25 35 C25 29.5, 29.5 25, 35 25 H85 C90.5 25, 95 29.5, 95 35 V62 C95 67.5, 92 72.5, 87.5 75.5 L63.5 91.5 C61.3 93, 58.7 93, 56.5 91.5 L32.5 75.5 C28 72.5, 25 67.5, 25 62 Z" 
                    stroke="#107c41" 
                    strokeWidth="11" 
                    strokeLinejoin="round" 
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Center nested stylized "P" */}
                  <path
                    d="M44 42 H66 C73.5 42, 77 46.5, 77 52.5 C77 58.5, 73.5 63, 66 63 H54 V78"
                    stroke="#107c41"
                    strokeWidth="11"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Circle decoration of P inside the shield */}
                  <circle cx="54" cy="52.5" r="4.5" fill="#107c41" />
                </svg>
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block leading-none">
                  desenvolvedor
                </span>
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 tracking-tight mt-1 block">
                  CalcPro Soluções
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Dashboard Status Controls & Toolbar */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 md:gap-4 border-t pt-2 lg:pt-0 lg:border-t-0 border-slate-100 dark:border-slate-850">
          
          {/* Status badge and metadata */}
          <div className="flex items-center gap-3">
            {/* Watch count widget */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-750 font-mono text-xs text-slate-600 dark:text-slate-350" title="Contador de Visualizações">
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-semibold">{views}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest pl-0.5 font-sans">Visitas</span>
            </div>

            {/* GMT-3 clock */}
            <div className="bg-slate-50 dark:bg-slate-800/60 transition-all duration-350 text-slate-700 dark:text-slate-200 font-mono text-xs px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-750 flex items-center gap-1.5" title="Horário Oficial de Brasília (BRT)">
              <span className="w-2 h-2 rounded-full bg-emerald-550 animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-sans uppercase">BRT</span>
              <span className="font-bold tabular-nums">{brtTime || '00:00:00'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              id="btn-refresh-data"
              className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-blue-650 text-white hover:bg-slate-800 dark:hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 px-4 py-2 rounded-lg font-medium text-xs transition-all shadow-md active:scale-98 cursor-pointer group"
              title="Sincronizar dados em tempo real"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-45 transition-transform duration-300'}`} />
              <span>{isRefreshing ? 'Atualizando...' : 'Atualizar Dados'}</span>
            </button>

            {/* Dark Mode toggle */}
            <button
              onClick={toggleDarkMode}
              id="btn-toggle-theme"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 active:scale-95 transition-all cursor-pointer"
              title={isDarkMode ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              id="btn-print-report"
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg text-slate-655 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 active:scale-95 transition-all cursor-pointer text-xs font-semibold"
              title="Imprimir Relatório Consolidado A4"
            >
              <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            {/* Exit/Sair Application button */}
            <button
              onClick={onExitClick}
              id="btn-exit-app"
              className="p-2 rounded-lg text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 active:scale-95 transition-all font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              title="Sair do painel de indicadores"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>

        </div>

      </div>

      {/* CalcPro Soluções - Professional Corporate Promo Modal */}
      {isPromoOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn no-print" id="calcpro-ad-modal">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col transition-all">
            
            {/* Top decorative tech bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-650"></div>
            
            {/* Close Button */}
            <button
              onClick={() => setIsPromoOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Brand Title block */}
              <div className="flex items-start gap-4">
                <div className="bg-white dark:bg-slate-950 p-2 text-white rounded-xl shadow-md border border-slate-100 dark:border-slate-800 shrink-0">
                  <svg className="w-10 h-10" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M25 35 C25 29.5, 29.5 25, 35 25 H85 C90.5 25, 95 29.5, 95 35 V62 C95 67.5, 92 72.5, 87.5 75.5 L63.5 91.5 C61.3 93, 58.7 93, 56.5 91.5 L32.5 75.5 C28 72.5, 25 67.5, 25 62 Z" 
                      stroke="#107c41" 
                      strokeWidth="11" 
                      strokeLinejoin="round" 
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M44 42 H66 C73.5 42, 77 46.5, 77 52.5 C77 58.5, 73.5 63, 66 63 H54 V78"
                      stroke="#107c41"
                      strokeWidth="11"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle cx="54" cy="52.5" r="4.5" fill="#107c41" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-50 tracking-tight leading-none">
                    <span className="text-emerald-700 dark:text-emerald-400">CalcPro</span> <span className="text-slate-900 dark:text-white">Soluções</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-widest mt-1.5">
                    desenvolvedor
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Aplicativos inteligentes com foco em engenharia, análise de faturas de energia, cálculo estrutural, conformidade técnica e agilidade.
                  </p>
                </div>
              </div>

              {/* Contact information cards */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                  FICHA DO DESENVOLVEDOR
                </h4>

                {/* Developer */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <User className="w-4 h-4 text-indigo-505 dark:text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 block uppercase tracking-wider leading-none">Desenvolvedor</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block truncate mt-0.5 select-all">
                        Patrício A. A. Silva
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyText("Patrício A. A. Silva", "all")}
                    className="p-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-all font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                    title="Copiar Nome"
                  >
                    {copiedText === 'all' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 text-[10px] font-bold">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className="w-4 h-4 text-indigo-505 dark:text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 block uppercase tracking-wider leading-none">E-mail</span>
                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 block truncate mt-0.5 select-all">
                        patricioaug@gmail.com
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyText("patricioaug@gmail.com", "email")}
                    className="p-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-all font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                    title="Copiar E-mail"
                  >
                    {copiedText === 'email' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-505 text-[10px] font-bold">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Telefone */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Phone className="w-4 h-4 text-indigo-505 dark:text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 block uppercase tracking-wider leading-none">WhatsApp / Celular</span>
                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 block truncate mt-0.5 select-all font-bold">
                        +55 (31) 97326-7529
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyText("+55 (31) 97326-7529", "phone")}
                    className="p-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-all font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                    title="Copiar Contato"
                  >
                    {copiedText === 'phone' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 text-[10px] font-bold">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Copy & CTA Links area */}
              <div className="flex flex-col gap-2.5">
                
                {/* Global copy card button */}
                <button
                  onClick={() => handleCopyText(`Desenvolvedor: Patrício A. A. Silva\nE-mail: patricioaug@gmail.com\nTelefone/WhatsApp: +55 (31) 97326-7529\nPlataforma CalcPro Soluções: https://sites.google.com/view/calcprosolucoes/início`, "full")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-955 text-white dark:bg-slate-800 hover:bg-slate-850 dark:hover:bg-slate-700 transition-all text-xs font-bold font-sans cursor-pointer active:scale-98 border border-slate-850 dark:border-slate-700"
                >
                  {copiedText === 'full' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-305" />
                      <span>Todos os dados copiados!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>Copiar Ficha Completa</span>
                    </>
                  )}
                </button>

                {/* Direct redirect Link to Website portal */}
                <a
                  href="https://sites.google.com/view/calcprosolucoes/in%C3%ADcio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold transition-all text-xs tracking-wider uppercase shadow-md hover:shadow-lg active:scale-97 cursor-pointer text-center"
                >
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  <span>Acessar Portal CalcPro Soluções</span>
                </a>
              </div>

              {/* Close Button / Bottom line */}
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                <span>© 2026 CalcPro Soluções</span>
                <button
                  onClick={() => setIsPromoOpen(false)}
                  className="text-xs font-extrabold text-slate-600 dark:text-slate-350 hover:text-slate-950 dark:hover:text-white px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer transition-all active:scale-95"
                >
                  Fechar Janela
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </header>
  );
}
