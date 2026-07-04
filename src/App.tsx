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
import FloatingPipWindow, { PipWindowData } from './components/FloatingPipWindow';
import StockExchangeSection from './components/StockExchangeSection';

// Load initial parameters and calculators
import {
  initialONS,
  initialANEEL,
  initialDatacenters,
  INITIAL_USD_BRL,
  rollTheDiceAndCalculateUpdates,
  getFullFormattedDate,
  initialStocks,
  fetchRealStockData,
  rollStockExchangeData
} from './utils/dataMock';

import { StockExchangeData } from './types';

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

  // Picture-in-Picture Windows States
  const [pipWindows, setPipWindows] = useState<PipWindowData[]>([]);
  const [maxZIndex, setMaxZIndex] = useState<number>(9000);

  // PIP Window Event Handlers
  const handleOpenCnnVideo = () => {
    const id = `cnn-${Date.now()}`;
    const nextZIndex = maxZIndex + 1;
    setMaxZIndex(nextZIndex);

    // Default PIP window size (aspect ratio of Youtube standard player is 16:9 + titlebar)
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Use a safety margin so that borders are never cut off
    const margin = screenWidth < 640 ? 12 : 24;
    
    // Constrain dimensions to the screen size minus margins
    const width = Math.min(480, screenWidth - margin * 2);
    const height = Math.min(310, screenHeight - margin * 2);

    // Stagger layout position based on existing open windows
    const count = pipWindows.length;
    const offset = (count % 6) * 20;

    // Center position
    let x = (screenWidth - width) / 2 + offset;
    let y = (screenHeight - height) / 2 + offset;

    // Keep within viewport boundaries
    if (x + width > screenWidth - margin) {
      x = screenWidth - width - margin;
    }
    if (y + height > screenHeight - margin) {
      y = screenHeight - height - margin;
    }

    // Double check that it's not negative or clipped
    x = Math.max(margin, x);
    y = Math.max(margin, y);

    const newWindow: PipWindowData = {
      id,
      title: `CNN #${count + 1}`,
      videoUrl: 'https://www.youtube.com/embed/_rC_-V1AXEM?autoplay=1',
      x,
      y,
      width,
      height,
      zIndex: nextZIndex
    };

    setPipWindows(prev => [...prev, newWindow]);
  };

  const handleFocusPipWindow = (id: string) => {
    const nextZIndex = maxZIndex + 1;
    setMaxZIndex(nextZIndex);
    setPipWindows(prev => prev.map(win => {
      if (win.id === id) {
        return { ...win, zIndex: nextZIndex };
      }
      return win;
    }));
  };

  const handleUpdatePipWindow = (id: string, updates: Partial<PipWindowData>) => {
    setPipWindows(prev => prev.map(win => {
      if (win.id === id) {
        return { ...win, ...updates };
      }
      return win;
    }));
  };

  const handleClosePipWindow = (id: string) => {
    setPipWindows(prev => prev.filter(win => win.id !== id));
  };

  // System States
  const [usdBRL, setUsdBRL] = useState<number>(INITIAL_USD_BRL);
  const [ons, setONS] = useState(initialONS);
  const [aneel, setANEEL] = useState(initialANEEL);
  const [datacenters] = useState(initialDatacenters);
  const [stocks, setStocks] = useState<StockExchangeData[]>(initialStocks);

  // App control states
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(getFullFormattedDate());
  const [isExitOpen, setIsExitOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Load live stocks on initial mount
  useEffect(() => {
    async function loadLiveStocksOnMount() {
      try {
        const liveData = await fetchRealStockData();
        if (Object.keys(liveData).length > 0) {
          setStocks(prev => rollStockExchangeData(prev, liveData));
        }
      } catch (e) {
        console.warn('Initial stock fetch failed:', e);
      }
    }
    loadLiveStocksOnMount();
  }, []);

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

  // Synchronize document.documentElement class for perfect dark mode support
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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
    // Evita múltiplos cliques simultâneos
    if (isRefreshing) return;
    setIsRefreshing(true);
    
    // Fetch and roll data asynchronously with a smooth transition
    setTimeout(async () => {
      try {
        let liveData = {};
        try {
          liveData = await fetchRealStockData();
        } catch (e) {
          console.warn('Refresh stocks fetch failed:', e);
        }

        const rolled = rollTheDiceAndCalculateUpdates(
          usdBRL,
          ons,
          aneel
        );

        setUsdBRL(rolled.newUSDBRL);
        setONS(rolled.updatedONS);
        setANEEL(rolled.updatedANEEL);
        setStocks(prev => rollStockExchangeData(prev, Object.keys(liveData).length > 0 ? liveData : undefined));

        const nextTime = getFullFormattedDate();
        setLastUpdated(nextTime);
      } catch (err) {
        console.error('Error recalculating global indicators matrix:', err);
      } finally {
        setIsRefreshing(false);
      }
    }, 850);
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 font-sans flex flex-col lg:flex-row selection:bg-indigo-505 selection:text-white">
        
        {/* Responsive Left Sidebar / Top Header */}
        <Header
          isDarkMode={isDarkMode}
          toggleDarkMode={handleToggleDarkMode}
          onRefresh={handleRefreshData}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
          onExitClick={() => setIsExitOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenCnnVideo={handleOpenCnnVideo}
        />

        {/* Main layout right panel containing scrollable content & footer */}
        <div className="flex-grow flex flex-col min-h-screen lg:h-screen lg:overflow-y-auto w-full">
          
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

              {/* AREA: Stock Exchanges Summary Cards */}
              <div className={`${
                activeTab === 'all' ? 'block' : 'hidden print:block'
              }`}>
                <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-850/80 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-sm font-black font-sans tracking-tight text-slate-900 dark:text-slate-50 uppercase">
                        Bolsas de Valores Globais
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                        Resumo consolidado dos índices de referência das principais praças financeiras mundiais
                      </p>
                    </div>
                    
                    <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-850 px-2.5 py-1 rounded border border-slate-150 dark:border-slate-800">
                      CORS PROXY INTEGRADO
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stocks.map(stock => {
                      const isUp = stock.change >= 0;
                      return (
                        <button
                          key={stock.id}
                          onClick={() => setActiveTab(stock.id)}
                          className="flex flex-col justify-between p-4 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:border-indigo-500/50 dark:hover:border-indigo-550 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all cursor-pointer text-left focus:outline-hidden"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-mono font-bold text-indigo-505 dark:text-indigo-400 uppercase tracking-wider">
                                {stock.symbol}
                              </span>
                              <span className={`w-2 h-2 rounded-full ${stock.status === 'Aberto' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-600'}`} title={`Mercado ${stock.status}`} />
                            </div>
                            
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 font-sans line-clamp-1">
                              {stock.indexName}
                            </h4>
                            <span className="text-[10px] text-slate-450 dark:text-slate-500 block">
                              {stock.name.split('(')[0].trim()}
                            </span>
                          </div>

                          <div className="mt-4">
                            <div className="text-base font-mono font-black text-slate-900 dark:text-slate-100">
                              {stock.currency} {stock.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            
                            <div className={`flex items-center gap-1.5 text-[11px] font-mono font-bold mt-0.5 ${
                              isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-450'
                            }`}>
                              <span>{isUp ? '▲' : '▼'}</span>
                              <span>{isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Individual Stock Exchange Sections */}
              {stocks.map(stock => {
                if (activeTab === stock.id) {
                  return (
                    <div key={stock.id}>
                      <StockExchangeSection
                        data={stock}
                        isRefreshing={isRefreshing}
                      />
                    </div>
                  );
                }
                return null;
              })}
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

        </div>

        {/* Exit Application Modal */}
        <ExitModal
          isOpen={isExitOpen}
          onClose={() => setIsExitOpen(false)}
          views={3}
        />

        {/* Picture-in-Picture Floating Windows Layer */}
        <div className="fixed inset-0 pointer-events-none z-[9990] no-print" id="pip-windows-overlay">
          {pipWindows.map(win => (
            <FloatingPipWindow
              key={win.id}
              windowData={win}
              onClose={handleClosePipWindow}
              onFocus={handleFocusPipWindow}
              onUpdate={handleUpdatePipWindow}
              maxZIndex={maxZIndex}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
