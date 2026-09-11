/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Plus, 
  Minus, 
  Trash2, 
  FileText, 
  Calculator, 
  Layers, 
  ArrowRight, 
  CheckCircle,
  HelpCircle,
  Wrench,
  Percent,
  Coins,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { SinapiItem } from '../types';
import { initialSinapiItems, getCurrentSinapiReference } from '../utils/dataMock';

// UF dynamic cost multiplier factor settings
const STATE_FACTORS = [
  { code: 'SP', name: 'São Paulo', factor: 1.00 },
  { code: 'RJ', name: 'Rio de Janeiro', factor: 1.03 },
  { code: 'MG', name: 'Minas Gerais', factor: 0.96 },
  { code: 'BA', name: 'Bahia', factor: 0.89 },
  { code: 'PR', name: 'Paraná', factor: 0.97 },
  { code: 'PE', name: 'Pernambuco', factor: 0.92 },
  { code: 'AM', name: 'Amazonas', factor: 1.05 }
];

export interface SinapiSectionProps {
  items?: SinapiItem[];
  onUpdateItems?: (items: SinapiItem[]) => void;
  lastUpdated?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  referenceDate?: string;
}

export default function SinapiSection({
  items = initialSinapiItems,
  onUpdateItems,
  lastUpdated,
  isRefreshing = false,
  onRefresh,
  referenceDate
}: SinapiSectionProps) {
  // Navigation states
  const [selectedState, setSelectedState] = useState<string>('SP');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Material' | 'Mão de Obra' | 'Composição'>('All');
  
  // Selected detail item state
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);

  // Fast Budget / Orçamento simulation state using item IDs for reactive price updates
  const [budgetEntries, setBudgetEntries] = useState<{ id: string; quantity: number }[]>([]);
  const [bdiPercent, setBdiPercent] = useState<number>(25); // Default BDI to 25%

  // Compute active multiplier coefficient
  const activeUF = useMemo(() => {
    return STATE_FACTORS.find(uf => uf.code === selectedState) || STATE_FACTORS[0];
  }, [selectedState]);

  // Translate Base SP price into local UF price
  const getUFPrice = (basePrice: number) => {
    return Number((basePrice * activeUF.factor).toFixed(2));
  };

  // Dynamically map budget items with the latest prices from items prop
  const budgetItems = useMemo(() => {
    return budgetEntries.map(entry => {
      const item = items.find(i => i.id === entry.id) || initialSinapiItems.find(i => i.id === entry.id);
      if (!item) return null;
      return { item, quantity: entry.quantity };
    }).filter((b): b is { item: SinapiItem; quantity: number } => b !== null);
  }, [budgetEntries, items]);

  // Filter items list on search + tab
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Category filter
      if (categoryFilter !== 'All' && item.category !== categoryFilter) {
        return false;
      }
      
      // Text search
      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;

      return (
        item.code.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        (item.specification && item.specification.toLowerCase().includes(term))
      );
    });
  }, [items, searchTerm, categoryFilter]);

  // Selected item modal/card helper
  const focusedItem = useMemo(() => {
    return items.find(i => i.id === focusedItemId) || null;
  }, [items, focusedItemId]);

  // Add Item to Quick Budget Simulation list
  const handleAddToBudget = (item: SinapiItem) => {
    setBudgetEntries(prev => {
      const existsIndex = prev.findIndex(b => b.id === item.id);
      if (existsIndex > -1) {
        const next = [...prev];
        next[existsIndex] = { ...next[existsIndex], quantity: next[existsIndex].quantity + 1 };
        return next;
      }
      return [...prev, { id: item.id, quantity: 1 }];
    });
  };

  // Quantities handlers
  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setBudgetEntries(prev => {
      return prev.map(b => {
        if (b.id === itemId) {
          const nextQ = Math.max(0.1, Number((b.quantity + delta).toFixed(2)));
          return { ...b, quantity: nextQ };
        }
        return b;
      }).filter(b => b.quantity > 0);
    });
  };

  const handleRemoveFromBudget = (itemId: string) => {
    setBudgetEntries(prev => prev.filter(b => b.id !== itemId));
  };

  const handleClearBudget = () => {
    setBudgetEntries([]);
  };

  // Compute budget cost analytics
  const budgetSumBase = useMemo(() => {
    return budgetItems.reduce((acc, current) => {
      const activePrice = getUFPrice(current.item.basePriceSP);
      return acc + (activePrice * current.quantity);
    }, 0);
  }, [budgetItems, activeUF]);

  const budgetWithBDI = useMemo(() => {
    const multiplier = 1 + (bdiPercent / 100);
    return budgetSumBase * multiplier;
  }, [budgetSumBase, bdiPercent]);

  // Dynamic SINAPI reference month/year derived from lastUpdated or referenceDate
  const sinapiReference = useMemo(() => {
    if (referenceDate) return referenceDate;
    return getCurrentSinapiReference(lastUpdated);
  }, [lastUpdated, referenceDate]);

  return (
    <div id="sinapi-intelligence-hub" className="space-y-6">
      
      {/* Sector Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1 px-1.5 text-[10px] font-mono font-bold tracking-widest text-indigo-700 bg-indigo-50 dark:text-indigo-400 dark:bg-slate-800 rounded border border-indigo-100 dark:border-slate-700">
              CEF / IBGE COOPERADO
            </span>
            <span 
              className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 flex items-center gap-1 shadow-xs"
              title="Mês e Ano de Referência Oficial da Tabela SINAPI"
            >
              <span className="text-slate-400 dark:text-slate-500 font-normal">Ref:</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-black">{sinapiReference}</span>
            </span>
            {lastUpdated && (
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40 font-semibold">
                <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${isRefreshing ? 'animate-ping' : 'animate-pulse'}`} />
                <span>Atualizado: {lastUpdated}</span>
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-indigo-505" />
            Tabela de Referência SINAPI Inteligente
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans max-w-2xl">
            Consulte insumos de mão de obra desonerada, materiais elétricos de infraestrutura, concreto fck e composições de serviços públicos de acordo com a Caixa Econômica Federal.
          </p>
        </div>

        {/* Dynamic State Selection Selector & Refresh Action */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 w-full md:w-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <MapPin className="w-3.5 h-3.5 text-indigo-505 shrink-0" />
            <span className="whitespace-nowrap">UF:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="text-xs font-mono font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-250 dark:border-slate-750 px-2 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-505 shadow-xs cursor-pointer ml-1"
            >
              {STATE_FACTORS.map(uf => (
                <option key={uf.code} value={uf.code}>
                  {uf.code} - {uf.name} (x{uf.factor.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shadow-xs disabled:opacity-50 shrink-0 active:scale-95"
              title="Recalcular e sincronizar tabela SINAPI"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Atualizando...' : 'Atualizar Preços'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Layout of Search vs Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Items Catalog list (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Functional Filters Panel */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50/50 dark:bg-slate-900/45 p-3 rounded-xl border border-slate-150 dark:border-slate-850">
            {/* Real Search Box Input */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar código SINAPI (ex: 91854) ou descrição..."
                className="w-full text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 pl-9 pr-4 py-2.5 rounded-lg border border-slate-250 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-505 shadow-xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold font-mono px-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Micro Category filtering tablets */}
            <div className="flex items-center gap-1 w-full sm:w-auto shrink-0 justify-start overflow-x-auto py-0.5">
              {(['All', 'Composição', 'Material', 'Mão de Obra'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-slate-900 text-white dark:bg-indigo-650'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat === 'All' ? 'Ver Todos' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats count bar */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <span>Resultados encontrados: <b className="text-slate-650 dark:text-indigo-400">{filteredItems.length}</b></span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Preços sincronizados com a Caixa
            </span>
          </div>

          {/* Catalog items list scrollbox */}
          <div className={`space-y-2.5 max-h-[580px] overflow-y-auto pr-1 scrollbar-none transition-opacity duration-200 ${isRefreshing ? 'opacity-60' : 'opacity-100'}`}>
            {filteredItems.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <p className="text-slate-550 dark:text-slate-400 text-xs">Nenhum insumo SINAPI combina com os filtros aplicados.</p>
                <button 
                  onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }}
                  className="text-xs text-indigo-505 dark:text-indigo-400 font-bold underline cursor-pointer"
                >
                  Limpar todos os filtros rápidos
                </button>
              </div>
            ) : (
              filteredItems.map((item) => {
                const ufPrice = getUFPrice(item.basePriceSP);
                const isSelectedForBreakdown = focusedItemId === item.id;
                const hasChange = item.changePercent !== undefined && item.changePercent !== 0;
                const isPositive = hasChange && (item.changePercent || 0) > 0;

                return (
                  <div 
                    key={item.id}
                    className={`p-3.5 bg-white dark:bg-slate-900/40 rounded-xl border transition-all hover:shadow-sm ${
                      isSelectedForBreakdown 
                        ? 'border-indigo-505 bg-indigo-550/5 dark:bg-indigo-950/15'
                        : 'border-slate-200/90 dark:border-slate-850'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      
                      {/* Left: Code, Category badge, Description */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-black text-slate-805 dark:text-indigo-350 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {item.code}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            item.category === 'Composição'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                              : item.category === 'Mão de Obra'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400'
                              : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400'
                          }`}>
                            {item.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Unid: {item.unit}</span>
                          
                          {/* Price variation tag */}
                          {hasChange && (
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded inline-flex items-center gap-0.5 ${
                              isPositive
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40'
                            }`}>
                              {isPositive ? (
                                <TrendingUp className="w-2.5 h-2.5 inline" />
                              ) : (
                                <TrendingDown className="w-2.5 h-2.5 inline" />
                              )}
                              <span>{isPositive ? `+${item.changePercent?.toFixed(2)}%` : `${item.changePercent?.toFixed(2)}%`}</span>
                            </span>
                          )}
                        </div>
                        
                        <h4 className="text-xs font-semibold leading-relaxed text-slate-900 dark:text-slate-100 hover:text-indigo-505 dark:hover:text-indigo-400 cursor-pointer" onClick={() => setFocusedItemId(isSelectedForBreakdown ? null : item.id)}>
                          {item.description}
                        </h4>
                      </div>

                      {/* Right: Cost value BRL & Simulator add button */}
                      <div className="flex flex-col items-end shrink-0 gap-2">
                        <div className="text-right">
                          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none">Preço {activeUF.code}</div>
                          <div className="text-sm font-mono font-black text-slate-850 dark:text-slate-50 mt-1">
                            R$ {ufPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          {item.previousPriceSP !== undefined && item.previousPriceSP !== item.basePriceSP && (
                            <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                              Ant: R$ {getUFPrice(item.previousPriceSP).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setFocusedItemId(isSelectedForBreakdown ? null : item.id)}
                            className="p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-[10px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-205 transition-colors cursor-pointer"
                            title="Ver Composição Técnica detalhada"
                          >
                            Análise
                          </button>
                          
                          <button
                            onClick={() => handleAddToBudget(item)}
                            className="bg-indigo-55 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-150 dark:border-indigo-800/40 px-2 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 hover:bg-indigo-650 hover:text-white dark:hover:bg-indigo-650 dark:hover:text-white transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Adicionar</span>
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Expandable detailed description or elements list if selected */}
                    {isSelectedForBreakdown && (
                      <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-850/60 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-3 animate-fadeIn">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-405 tracking-wider block">Especificação Técnica:</span>
                          <p className="text-[11px] text-slate-650 dark:text-slate-350 leading-relaxed font-sans mt-0.5">
                            {item.specification || 'Este item representa um insumo básico de especificação geral cadastrado na base oficial da Tabela de Referência SINAPI.'}
                          </p>
                        </div>

                        {/* If composition has children components */}
                        {item.components && item.components.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] uppercase font-bold text-slate-405 tracking-wider block">Insumos Relacionados no Coeficiente de Composição:</span>
                            <div className="grid grid-cols-1 divide-y divide-slate-150 dark:divide-slate-800 text-[11px]">
                              {item.components.map((c, idx) => (
                                <div key={idx} className="flex justify-between items-center py-1.5">
                                  <span className="text-slate-600 dark:text-slate-300 font-sans">{c.name}</span>
                                  <span className="font-mono text-slate-500">
                                    {c.quantity} {c.unit} • <b className="text-slate-700 dark:text-slate-200">R$ {getUFPrice(c.totalCost).toFixed(2)}</b>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center text-[10px] text-slate-450 border-t border-slate-150 dark:border-slate-800 pt-2 font-mono">
                          <span>Multiplicador UF ({selectedState}): x{activeUF.factor.toFixed(2)}</span>
                          <span>BDI Sugerido: {bdiPercent}%</span>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Side: Reactive Budget Simulator Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-4 shadow-xl relative overflow-hidden">
            
            {/* Background design accents */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>

            <div className="flex items-center justify-between border-b border-slate-810 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-indigo-350">Simulador de Orçamento Direto</h3>
              </div>
              <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-900">
                UF Ref: {activeUF.code}
              </span>
            </div>

            {/* Config controls box: BDI */}
            <div className="p-3.5 bg-slate-850/70 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-350 font-sans flex items-center gap-1">
                  Taxa de BDI (Benefício e Despesas Indiretas)
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-help" title="Margem calculada sobre custo direto para cobrir carga tributária, administração central, seguros e margem de lucro." />
                </span>
                <span className="font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded text-[11px] border border-indigo-900/30">
                  {bdiPercent}%
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={bdiPercent}
                  onChange={(e) => setBdiPercent(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>0% (Custo Seco)</span>
                <span>25% (Padrão Infra)</span>
                <span>40% (Máximo Limite)</span>
              </div>
            </div>

            {/* Selected items basket */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] uppercase font-mono text-slate-400">
                <span>Lista de Serviços e Materiais ({budgetItems.length})</span>
                {budgetItems.length > 0 && (
                  <button 
                    onClick={handleClearBudget}
                    className="flex items-center gap-1 text-red-400 hover:text-red-300 uppercase tracking-wider text-[10px] font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Limpar</span>
                  </button>
                )}
              </div>

              {budgetItems.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-850/20 text-slate-500 space-y-2">
                  <Calculator className="w-8 h-8 text-slate-700 mx-auto" />
                  <div className="text-xs font-sans">Nenhum recurso adicionado à simulação</div>
                  <p className="text-[10px] text-slate-600 max-w-xs mx-auto">
                    Navegue pela tabela SINAPI à esquerda e clique em <b>"Adicionar"</b> para compor custos estimados de infraestrutura.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1 scrollbar-none">
                  {budgetItems.map(({ item, quantity }) => {
                    const localPrice = getUFPrice(item.basePriceSP);
                    const subtotal = localPrice * quantity;

                    return (
                      <div key={item.id} className="p-3 bg-slate-850/50 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 animate-fadeIn">
                        
                        {/* Name & unit price */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[9px] font-bold text-indigo-400 bg-indigo-950 px-1 py-0.5 rounded border border-indigo-900">{item.code}</span>
                            <span className="text-[10px] text-slate-400">({item.unit})</span>
                          </div>
                          <h5 className="text-xs font-bold text-slate-200 truncate mt-1">
                            {item.description}
                          </h5>
                          <span className="text-[10px] font-mono text-slate-450">
                            Unitário: R$ {localPrice.toFixed(2)}
                          </span>
                        </div>

                        {/* Adjust qty inputs & totals */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, -1)}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 shrink-0 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={quantity}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                if (!isNaN(val) && val > 0) {
                                  setBudgetEntries(prev => prev.map(b => b.id === item.id ? { ...b, quantity: val } : b));
                                }
                              }}
                              className="w-10 text-center text-xs font-mono font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                            />

                            <button
                              onClick={() => handleUpdateQuantity(item.id, 1)}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 shrink-0 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right min-w-[70px]">
                            <div className="text-xs font-mono font-extrabold text-indigo-300">
                              R$ {subtotal.toFixed(2)}
                            </div>
                            <button 
                              onClick={() => handleRemoveFromBudget(item.id)}
                              className="text-[9px] text-red-400 hover:text-red-300 hover:underline font-mono mt-0.5 cursor-pointer"
                            >
                              Remover
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Total price calculation summaries */}
            <div className="border-t border-slate-800 pt-4 space-y-2.5 text-xs font-sans">
              
              <div className="flex justify-between items-center text-slate-400">
                <span>Custo Direto Total (Preço Seco)</span>
                <span className="font-mono text-slate-200">
                  R$ {budgetSumBase.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span>Encargo de Despesas Coaplicadas (BDI: {bdiPercent}%)</span>
                <span className="font-mono text-indigo-400">
                  + R$ {(budgetSumBase * (bdiPercent / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-slate-800/80 pt-3.5">
                <span className="text-sm font-bold text-slate-200">Total Geral Estimativo</span>
                <div className="text-right">
                  <div className="text-lg font-mono font-black text-emerald-400 leading-none">
                    R$ {budgetWithBDI.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-0.5 block">Preço Final Homologado</span>
                </div>
              </div>

            </div>

            {/* Project simulation summary exports */}
            {budgetItems.length > 0 && (
              <div className="bg-slate-950 border border-indigo-950/50 rounded-xl p-3 text-[11px] leading-relaxed text-slate-400 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-slate-200">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-450" />
                  <span>Conformidade Orçamentária</span>
                </div>
                <p className="font-sans">
                  Sua simulação contempla a contratação de mão de obra e insumos convertidos para a região de <b>{activeUF.name}</b> sob a referência oficial <b>{sinapiReference}</b>. O preço simulado serve de orientação prévia de custos sob as diretrizes estatutárias federais vigentes.
                </p>
              </div>
            )}

          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 space-y-2 leading-relaxed">
            <h5 className="font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider text-[10px] block font-mono">Entenda as Composições SINAPI:</h5>
            <p>
              <b>Composição técnica</b> representa o agrupamento normativo de uma atividade. Por exemplo, a instalação de 1 metro de eletroduto exige uma fração de tempo de um eletricista (H), uma fração de auxiliar (H) e a própria matéria de PVC rígida.
            </p>
            <p className="border-t border-slate-100 dark:border-slate-850 pt-2 text-[10px]">
              *Todos os coeficientes declarados respeitam o caderno técnico de encargos sociais desonerados para obras e reformas de infraestrutura.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
