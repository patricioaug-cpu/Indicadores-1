/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import EnergySystemSection from './components/EnergySystemSection';
import DatacentersSection from './components/DatacentersSection';
import SinapiSection from './components/SinapiSection';
import ExitModal from './components/ExitModal';

// Load initial parameters and calculators
import {
  initialONS,
  initialANEEL,
  initialDatacenters,
  INITIAL_USD_BRL,
  rollTheDiceAndCalculateUpdates,
  getFullFormattedDate
} from './utils/dataMock';

import {
  Zap,
  Globe,
  LayoutDashboard,
  AlertCircle,
  Coins
} from 'lucide-react';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // Default to Dark mode for tech-premium aesthetic

  // System States
  const [usdBRL, setUsdBRL] = useState<number>(INITIAL_USD_BRL);
  const [ons, setONS] = useState(initialONS);
  const [aneel, setANEEL] = useState(initialANEEL);
  const [datacenters] = useState(initialDatacenters);

  // App control states
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(getFullFormattedDate());
  const [isExitOpen, setIsExitOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Load theme preference on mount
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('indicadores_theme');
      if (storedTheme) {
        setIsDarkMode(storedTheme === 'dark');
      }
    } catch (e) {
      console.warn('LocalStorage unavailable: ', e);
    }
  }, []);

  // Toggle theme utility
  const handleToggleDarkMode = () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    try {
      localStorage.setItem('indicadores_theme', nextTheme ? 'dark' : 'light');
    } catch (e) {}
  };

  // Sincronizar / Refresh logic
  const handleRefreshData = () => {
    setIsRefreshing(true);
    
    // Smooth loading timeout animation for technical feel
    setTimeout(() => {
      const rolled = rollTheDiceAndCalculateUpdates(
        usdBRL,
        ons,
        aneel
      );

      setUsdBRL(rolled.newUSDBRL);
      setONS(rolled.updatedONS);
      setANEEL(rolled.updatedANEEL);

      const nextTime = getFullFormattedDate();
      setLastUpdated(nextTime);
      setIsRefreshing(false);
    }, 850);
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 font-sans flex flex-col justify-between selection:bg-indigo-505 selection:text-white">
        
        {/* Header Widget */}
        <Header
          isDarkMode={isDarkMode}
          toggleDarkMode={handleToggleDarkMode}
          onRefresh={handleRefreshData}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
          onExitClick={() => setIsExitOpen(true)}
        />

        {/* Categories Tab Navigation Bar */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 px-4 py-2 sm:px-6 sticky top-[61px] sm:top-[69px] z-45 shadow-sm transition-all duration-300 no-print">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 py-1">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2 w-full md:w-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer w-full sm:w-auto ${
                  activeTab === 'all'
                    ? 'bg-slate-900 text-white dark:bg-blue-650'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Geral</span>
              </button>

              <button
                onClick={() => setActiveTab('energy')}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer w-full sm:w-auto ${
                  activeTab === 'energy'
                    ? 'bg-slate-900 text-white dark:bg-blue-650'
                    : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Energia</span>
              </button>

              <button
                onClick={() => setActiveTab('datacenters')}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer w-full sm:w-auto ${
                  activeTab === 'datacenters'
                    ? 'bg-slate-900 text-white dark:bg-blue-650'
                    : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Datacenters</span>
              </button>

              <button
                onClick={() => setActiveTab('sinapi')}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer w-full sm:w-auto ${
                  activeTab === 'sinapi'
                    ? 'bg-slate-900 text-white dark:bg-blue-650'
                    : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>SINAPI</span>
              </button>
            </div>


          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6 sm:px-6">
          <div className="space-y-8">
            
            {/* Sincronizing Spinner Modal alert */}
            {isRefreshing && (
              <div className="fixed inset-0 z-50 bg-slate-950/20 backdrop-blur-xs flex items-center justify-center pointer-events-none transition-all no-print">
                <div className="bg-slate-900 text-white dark:bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-2xl flex items-center gap-3 animate-bounce">
                  <span className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin"></span>
                  <span className="text-xs font-bold font-mono tracking-wider">Recalculando matriz global de indicadores...</span>
                </div>
              </div>
            )}

            {/* Print Header banner (Hidden on screen, visible only on print) */}
            <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-950 font-sans uppercase">
                    INDICADORES • PAINEL INTEGRADO DE GOVERNANÇA E DECISÃO
                  </h1>
                  <p className="text-xs text-slate-655 font-sans mt-0.5">
                    Relatório Corporativo de Engenharia, Tecnologia, Custos Públicos & Eficiência Energética
                  </p>
                </div>
                <div className="text-right font-mono text-[9px] text-slate-500">
                  <span>Data de Emissão: {lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* ACTIVE VIEW SECTIONS */}

            <div className="space-y-8">
              {/* Responsive columns layout for Energy and Datacenters sections */}
              <div className={`grid grid-cols-1 xl:grid-cols-2 gap-6 items-start ${
                activeTab === 'all' || activeTab === 'energy' || activeTab === 'datacenters' ? 'block' : 'hidden print:block'
              }`}>
                {/* AREA 3: National ONS and ANEEL telemetry */}
                <div className={`bg-white dark:bg-slate-900/60 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-850/80 shadow-md ${
                  activeTab === 'all' || activeTab === 'energy' ? 'block' : 'hidden print:block'
                }`}>
                  <EnergySystemSection
                    ons={ons}
                    aneel={aneel}
                  />
                </div>

                {/* AREA 6: Cloud Datacenters worldwide */}
                <div className={`bg-white dark:bg-slate-900/60 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-850/80 shadow-md h-full ${
                  activeTab === 'all' || activeTab === 'datacenters' ? 'block' : 'hidden print:block'
                }`}>
                  <DatacentersSection
                    datacenters={datacenters}
                  />
                </div>
              </div>

              {/* AREA 7: SINAPI Reference Table with interactive search & simulator */}
              <div className={`bg-white dark:bg-slate-900/60 rounded-2xl p-5 sm:p-6 border border-slate-205/80 dark:border-slate-850/80 shadow-md ${
                activeTab === 'all' || activeTab === 'sinapi' ? 'block' : 'hidden print:block'
              }`}>
                <SinapiSection />
              </div>
            </div>

            {/* Project Bottom Notice Info */}
            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4.5 rounded-xl text-center text-xs text-slate-500 dark:text-slate-400 space-y-1 max-w-3xl mx-auto flex items-start gap-3.5 text-left no-print">
              <AlertCircle className="w-5 h-5 text-indigo-505 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-0.5">Nota de Conformidade sobre Dados Operacionais:</h5>
                <p className="leading-relaxed text-[11px]">
                  Este painel opera como um hub de inteligência simulando telemetrias em tempo real do Sistema Interconectado Nacional (ONS), ANEEL e datacenters corporativos globais. Modificações são atualizadas parametricamente através do botão <b>Atualizar Dados</b> para validar conformidades energéticas e eficiência de PUE.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-200/80 dark:border-slate-850 bg-white dark:bg-slate-900 py-6 px-4 mt-12 transition-all duration-300 no-print">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-450 dark:text-slate-400">
            <div>
              <span className="font-mono font-bold text-slate-750 dark:text-slate-205">INDICADORES</span> • Painel Integrado de Governança e Decisão
            </div>
            <div className="font-mono text-[10px]">
              ASHRAE • ONS • ANEEL • Datacenter Insights
            </div>
          </div>
        </footer>

        {/* Exit Application Modal */}
        <ExitModal
          isOpen={isExitOpen}
          onClose={() => setIsExitOpen(false)}
          views={3}
        />

      </div>
    </div>
  );
}
