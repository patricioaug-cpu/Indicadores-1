/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  RefreshCw, 
  Sun, 
  Moon, 
  LogOut, 
  Eye, 
  ShieldAlert, 
  Award, 
  Printer, 
  Copy, 
  Check, 
  ExternalLink, 
  Mail, 
  Phone, 
  User, 
  X,
  LayoutDashboard,
  Zap,
  Globe,
  Coins,
  Menu,
  TrendingUp,
  DollarSign,
  Building2,
  Activity
} from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: string;
  onExitClick: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCnnVideo: () => void;
}

export default function Header({
  isDarkMode,
  toggleDarkMode,
  onRefresh,
  isRefreshing,
  lastUpdated,
  onExitClick,
  activeTab,
  setActiveTab,
  onOpenCnnVideo
}: HeaderProps) {
  const [brtTime, setBrtTime] = useState('');
  const [views, setViews] = useState(1);
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<'all' | 'email' | 'phone' | 'full' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleMobileTabClick = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* 1. COMPACT MOBILE TOP HEADER (Sticky top, only visible below lg) */}
      <header className="lg:hidden h-16 border-b transition-all duration-300 border-slate-200/80 dark:border-slate-850 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-50 px-4 flex items-center justify-between no-print w-full shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Abrir menu de navegação"
            id="mobile-hamburger-btn"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="bg-slate-900 text-white dark:bg-blue-650 dark:text-white p-1.5 rounded-lg flex items-center justify-center shrink-0">
              <span className="font-mono text-xs font-black tracking-wider text-teal-400">IND</span>
            </div>
            <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-slate-50">INDICADORES</span>
            
            {/* CNN button */}
            <button
              onClick={onOpenCnnVideo}
              className="flex items-center gap-1 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/30 bg-red-50/80 dark:bg-red-955/20 text-[10px] font-bold text-red-655 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 transition-all cursor-pointer shrink-0"
              title="Assistir CNN"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
              <span>CNN</span>
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
            id="mobile-theme-toggle"
          >
            {isDarkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-slate-700" />}
          </button>
        </div>
      </header>

      {/* 2. MOBILE DRAWER SLIDE-OUT MENU (Only visible below lg, triggered by menu state) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex no-print" id="mobile-sidebar-drawer">
          {/* Backdrop layer */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
          />
          
          {/* Drawer layout */}
          <div className="relative flex flex-col w-80 max-w-[85vw] bg-white dark:bg-slate-900 h-full border-r border-slate-200 dark:border-slate-800 p-5 shadow-2xl transition-transform duration-300 ease-out z-10">
            {/* Drawer top close action */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="bg-slate-900 text-white dark:bg-blue-650 p-1.5 rounded-lg flex items-center justify-center">
                  <span className="font-mono text-xs font-black tracking-wider text-teal-400">IND</span>
                </div>
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-50">INDICADORES</span>
                
                {/* CNN button */}
                <button
                  onClick={onOpenCnnVideo}
                  className="flex items-center gap-1 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/30 bg-red-50/80 dark:bg-red-955/20 text-[10px] font-bold text-red-655 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 transition-all cursor-pointer shrink-0"
                  title="Assistir CNN"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                  <span>CNN</span>
                </button>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Fechar Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar content (scrollable on mobile if screen height is small) */}
            <div className="flex-grow overflow-y-auto pr-1">
              <SidebarContent 
                activeTab={activeTab}
                setActiveTab={handleMobileTabClick}
                views={views}
                brtTime={brtTime}
                isRefreshing={isRefreshing}
                onRefresh={onRefresh}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                onExitClick={() => {
                  setIsMobileMenuOpen(false);
                  onExitClick();
                }}
                setIsPromoOpen={setIsPromoOpen}
                onOpenCnnVideo={onOpenCnnVideo}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. PERSISTENT DESKTOP LEFT SIDEBAR (Sticky full-height, only visible lg and above) */}
      <aside className="hidden lg:flex flex-col w-76 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-850 h-screen sticky top-0 z-40 p-5 shrink-0 overflow-y-auto no-print shadow-xs" id="desktop-sidebar">
        <SidebarContent 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          views={views}
          brtTime={brtTime}
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          onExitClick={onExitClick}
          setIsPromoOpen={setIsPromoOpen}
          onOpenCnnVideo={onOpenCnnVideo}
        />
      </aside>

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
                    <User className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
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
                    <Mail className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
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

                {/* Telefone */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Phone className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 block uppercase tracking-wider leading-none">WhatsApp / Celular</span>
                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 block truncate mt-0.5 select-all">
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
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-950 text-white dark:bg-slate-800 hover:bg-slate-850 dark:hover:bg-slate-700 transition-all text-xs font-bold font-sans cursor-pointer active:scale-98 border border-slate-850 dark:border-slate-700"
                >
                  {copiedText === 'full' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
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
    </>
  );
}

// REDESIGNED SHARED SIDEBAR CONTENT
interface SidebarContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  views: number;
  brtTime: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onExitClick: () => void;
  setIsPromoOpen: (isOpen: boolean) => void;
  onOpenCnnVideo: () => void;
}

function SidebarContent({
  activeTab,
  setActiveTab,
  views,
  brtTime,
  isRefreshing,
  onRefresh,
  isDarkMode,
  toggleDarkMode,
  onExitClick,
  setIsPromoOpen,
  onOpenCnnVideo
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full justify-between gap-6">
      {/* Scrollable upper section */}
      <div className="space-y-6">
        {/* Brand block (hidden inside desktop sidebar if redundant, but fits beautifully here) */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-2.5">
            <div className="bg-slate-900 text-white dark:bg-blue-650 dark:text-white p-2.5 rounded-xl shadow-lg shadow-black/5 flex items-center justify-center shrink-0">
              <span className="font-mono text-lg font-black tracking-wider text-teal-400">IND</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base font-bold font-sans tracking-tight text-slate-900 dark:text-slate-50">
                  INDICADORES
                </h1>
                
                {/* CNN button */}
                <button
                  onClick={onOpenCnnVideo}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-900/30 bg-red-50/80 dark:bg-red-955/20 text-[9px] font-bold text-red-655 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 transition-all cursor-pointer shrink-0"
                  title="Assistir CNN"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                  <span>CNN</span>
                </button>

                <span className="bg-teal-550/10 text-teal-650 dark:text-teal-400 text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                  Real-Time
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-0.5 leading-snug">
                Inteligência de Engenharia, Energia & TI
              </p>
            </div>
          </div>
        </div>

        {/* CalcPro Soluções Promo Button */}
        <div>
          <button
            onClick={() => setIsPromoOpen(true)}
            className="flex items-center gap-2.5 px-3 py-2 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-150/40 dark:border-emerald-900/30 rounded-xl hover:bg-emerald-50/80 dark:hover:bg-emerald-950/20 hover:shadow-xs hover:border-emerald-300/60 transition-all cursor-pointer text-left w-full"
            title="CalcPro Soluções - Desenvolvedor & Aplicativos Inteligentes"
          >
            <div className="relative shrink-0 bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 shadow-xs">
              <svg className="w-6 h-6" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <div className="min-w-0">
              <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block leading-none">
                desenvolvedor
              </span>
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 tracking-tight mt-0.5 block">
                CalcPro Soluções
              </span>
            </div>
          </button>
        </div>

        {/* Categories Tab Navigation List (VERTICAL MENU LATERAL) */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2.5 block mb-1.5 font-mono">
            Navegação
          </span>
          
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer w-full ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white dark:bg-blue-650 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0 text-indigo-505 dark:text-indigo-400" />
            <span>Geral</span>
          </button>

          <button
            onClick={() => setActiveTab('energy')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer w-full ${
              activeTab === 'energy'
                ? 'bg-slate-900 text-white dark:bg-blue-650 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 shrink-0 text-amber-500 dark:text-amber-400" />
            <span>Energia</span>
          </button>

          <button
            onClick={() => setActiveTab('datacenters')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer w-full ${
              activeTab === 'datacenters'
                ? 'bg-slate-900 text-white dark:bg-blue-650 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Globe className="w-4 h-4 shrink-0 text-cyan-500 dark:text-cyan-400" />
            <span>Datacenters</span>
          </button>

          <button
            onClick={() => setActiveTab('sinapi')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer w-full ${
              activeTab === 'sinapi'
                ? 'bg-slate-900 text-white dark:bg-blue-650 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Coins className="w-4 h-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
            <span>SINAPI</span>
          </button>

          <button
            onClick={() => setActiveTab('bovespa')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer w-full ${
              activeTab === 'bovespa'
                ? 'bg-slate-900 text-white dark:bg-blue-650 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
            <span>São Paulo (B3)</span>
          </button>

          <button
            onClick={() => setActiveTab('nyse')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer w-full ${
              activeTab === 'nyse'
                ? 'bg-slate-900 text-white dark:bg-blue-650 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4 shrink-0 text-blue-500 dark:text-blue-400" />
            <span>New York (NYSE)</span>
          </button>

          <button
            onClick={() => setActiveTab('londres')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer w-full ${
              activeTab === 'londres'
                ? 'bg-slate-900 text-white dark:bg-blue-650 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0 text-amber-500 dark:text-amber-400" />
            <span>London (LSE)</span>
          </button>

          <button
            onClick={() => setActiveTab('nasdaq')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer w-full ${
              activeTab === 'nasdaq'
                ? 'bg-slate-900 text-white dark:bg-blue-650 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Activity className="w-4 h-4 shrink-0 text-purple-500 dark:text-purple-400" />
            <span>Nasdaq (US)</span>
          </button>
        </div>

        {/* Telemetry/Status Information */}
        <div className="pt-4 border-t border-slate-150 dark:border-slate-800/80 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2.5 block mb-1.5 font-mono">
            Métricas de Sistema
          </span>
          
          {/* Watch count widget */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs text-slate-655 dark:text-slate-350" title="Contador de Visualizações">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-wider font-sans">Visitas</span>
            </div>
            <span className="font-mono font-bold">{views}</span>
          </div>

          {/* BRT Clock */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs text-slate-655 dark:text-slate-350" title="Horário Oficial de Brasília (BRT)">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse animate-duration-1000"></span>
              <span className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-wider font-sans">BRT</span>
            </div>
            <span className="font-mono font-bold tabular-nums">{brtTime || '00:00:00'}</span>
          </div>
        </div>
      </div>

      {/* Persistent Bottom Section containing system actions */}
      <div className="pt-4 border-t border-slate-150 dark:border-slate-800/80 space-y-2 shrink-0">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2.5 block mb-1.5 font-mono">
          Painel de Controle
        </span>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-blue-650 text-white hover:bg-slate-800 dark:hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-md active:scale-98 cursor-pointer group"
          title="Sincronizar dados em tempo real"
        >
          <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-45 transition-transform duration-300'}`} />
          <span>{isRefreshing ? 'Atualizando...' : 'Atualizar Dados'}</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl text-slate-655 dark:text-slate-350 hover:bg-slate-105 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 active:scale-95 transition-all cursor-pointer text-xs font-bold"
            title="Imprimir Relatório Consolidado A4"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>Imprimir</span>
          </button>

          {/* Dark Mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl text-slate-655 dark:text-slate-350 hover:bg-slate-105 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 active:scale-95 transition-all cursor-pointer text-xs font-bold"
            title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                <span>Escuro</span>
              </>
            )}
          </button>
        </div>

        {/* Exit Button */}
        <button
          onClick={onExitClick}
          className="w-full py-2.5 rounded-xl text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-955/40 border border-rose-200 dark:border-rose-900/40 active:scale-95 transition-all font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs"
          title="Sair do painel de indicadores"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>Sair do Painel</span>
        </button>
      </div>
    </div>
  );
}
