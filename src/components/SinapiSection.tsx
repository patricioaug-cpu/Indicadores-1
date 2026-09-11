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
  Calculator, 
  Layers, 
  Boxes,
  Coins, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  HelpCircle,
  CheckCircle,
  Wrench,
  FileText
} from 'lucide-react';
import { SinapiItem, SinapiComponent } from '../types';
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

// Accent normalization helper for reliable PT-BR searching
function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Consolidated BOM item definition
export interface ConsolidatedBOMItem {
  id: string;
  code?: string;
  name: string;
  unit: string;
  type: 'Material' | 'Mão de Obra' | 'Equipamento' | 'Outros';
  unitCostSP: number;
  occurrences: number;
  parentCompositions: { code: string; desc: string; qty: number }[];
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
  const [includeCompositionsWithCategory, setIncludeCompositionsWithCategory] = useState<boolean>(true);
  
  // View mode: Catalog (items & compositions) vs Exploded BOM (Consolidated inputs list)
  const [viewMode, setViewMode] = useState<'catalog' | 'bom'>('catalog');

  // Multi-expansion state for components
  const [expandedItemIds, setExpandedItemIds] = useState<Set<string>>(new Set());

  // Fast Budget / Orçamento simulation state using item IDs for reactive price updates
  const [budgetEntries, setBudgetEntries] = useState<{ id: string; quantity: number; customItem?: SinapiItem }[]>([]);
  const [bdiPercent, setBdiPercent] = useState<number>(25); // Default BDI to 25%

  // Compute active multiplier coefficient
  const activeUF = useMemo(() => {
    return STATE_FACTORS.find(uf => uf.code === selectedState) || STATE_FACTORS[0];
  }, [selectedState]);

  // Translate Base SP price into local UF price
  const getUFPrice = (basePrice: number) => {
    return Number((basePrice * activeUF.factor).toFixed(2));
  };

  // Build consolidated list of all components (BOM) across all compositions and direct items
  const consolidatedBOM = useMemo(() => {
    const map = new Map<string, ConsolidatedBOMItem>();

    items.forEach(item => {
      // If it has internal components
      if (item.components && item.components.length > 0) {
        item.components.forEach(comp => {
          const key = comp.code || normalizeText(comp.name);
          const existing = map.get(key);

          // Infer type if not explicitly set
          let inferredType: 'Material' | 'Mão de Obra' | 'Equipamento' | 'Outros' = comp.type || 'Material';
          if (!comp.type) {
            const normName = normalizeText(comp.name);
            if (comp.unit === 'H' || normName.includes('mao de obra') || normName.includes('eletricista') || normName.includes('auxiliar') || normName.includes('servente') || normName.includes('pedreiro') || normName.includes('pintor')) {
              inferredType = 'Mão de Obra';
            } else if (normName.includes('betoneira') || normName.includes('caminhao') || normName.includes('bomba')) {
              inferredType = 'Equipamento';
            }
          }

          const unitCost = comp.quantity > 0 ? comp.totalCost / comp.quantity : comp.totalCost;

          if (existing) {
            existing.occurrences += 1;
            existing.parentCompositions.push({
              code: item.code,
              desc: item.description,
              qty: comp.quantity
            });
          } else {
            map.set(key, {
              id: 'bom_' + (comp.code || item.id + '_' + normalizeText(comp.name).substring(0, 10)),
              code: comp.code,
              name: comp.name,
              unit: comp.unit,
              type: inferredType,
              unitCostSP: Number(unitCost.toFixed(2)),
              occurrences: 1,
              parentCompositions: [{
                code: item.code,
                desc: item.description,
                qty: comp.quantity
              }]
            });
          }
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [items]);

  // Dynamically map budget items with the latest prices from items prop or custom component items
  const budgetItems = useMemo(() => {
    return budgetEntries.map(entry => {
      if (entry.customItem) {
        return { item: entry.customItem, quantity: entry.quantity };
      }
      const item = items.find(i => i.id === entry.id) || initialSinapiItems.find(i => i.id === entry.id);
      if (!item) return null;
      return { item, quantity: entry.quantity };
    }).filter((b): b is { item: SinapiItem; quantity: number } => b !== null);
  }, [budgetEntries, items]);

  // Filter items list on search + tab + deep component inspection
  const filteredItemsWithMatch = useMemo(() => {
    const normTerm = normalizeText(searchTerm);

    return items.map(item => {
      // 1. Category check
      let categoryMatch = false;
      if (categoryFilter === 'All') {
        categoryMatch = true;
      } else if (item.category === categoryFilter) {
        categoryMatch = true;
      } else if (includeCompositionsWithCategory && item.components && item.components.length > 0) {
        // Check if composition contains component of the selected category
        const hasMatchingComp = item.components.some(c => {
          if (categoryFilter === 'Mão de Obra') {
            const normCompName = normalizeText(c.name);
            return c.type === 'Mão de Obra' || c.unit === 'H' || normCompName.includes('mao de obra') || normCompName.includes('eletricista') || normCompName.includes('auxiliar') || normCompName.includes('servente') || normCompName.includes('pedreiro') || normCompName.includes('pintor');
          }
          if (categoryFilter === 'Material') {
            return c.type === 'Material' || (!c.type && c.unit !== 'H');
          }
          return false;
        });
        if (hasMatchingComp) {
          categoryMatch = true;
        }
      }

      if (!categoryMatch) return null;

      // 2. Text search check (direct + component deep-check)
      if (!normTerm) {
        return { item, matchedComponent: null };
      }

      const normCode = normalizeText(item.code);
      const normDesc = normalizeText(item.description);
      const normSpec = normalizeText(item.specification || '');
      const normUnit = normalizeText(item.unit);
      const normCategory = normalizeText(item.category);

      const directMatch =
        normCode.includes(normTerm) ||
        normDesc.includes(normTerm) ||
        normSpec.includes(normTerm) ||
        normUnit.includes(normTerm) ||
        normCategory.includes(normTerm);

      if (directMatch) {
        return { item, matchedComponent: null };
      }

      // Check inside child components
      if (item.components && item.components.length > 0) {
        const matchedComp = item.components.find(c => {
          const normCompName = normalizeText(c.name);
          const normCompCode = normalizeText(c.code || '');
          const normCompUnit = normalizeText(c.unit);
          const normCompType = normalizeText(c.type || '');
          return (
            normCompName.includes(normTerm) ||
            normCompCode.includes(normTerm) ||
            normCompUnit.includes(normTerm) ||
            normCompType.includes(normTerm)
          );
        });

        if (matchedComp) {
          return { item, matchedComponent: matchedComp };
        }
      }

      return null;
    }).filter((res): res is { item: SinapiItem; matchedComponent: SinapiComponent | null } => res !== null);
  }, [items, searchTerm, categoryFilter, includeCompositionsWithCategory]);

  // Filtered BOM entries for the Exploded Insumos tab
  const filteredBOM = useMemo(() => {
    const normTerm = normalizeText(searchTerm);
    return consolidatedBOM.filter(comp => {
      // Category filter for BOM
      if (categoryFilter !== 'All') {
        if (categoryFilter === 'Mão de Obra' && comp.type !== 'Mão de Obra') return false;
        if (categoryFilter === 'Material' && comp.type !== 'Material' && comp.type !== 'Equipamento') return false;
        if (categoryFilter === 'Composição') return false; // BOM are insumos
      }

      if (!normTerm) return true;

      const normName = normalizeText(comp.name);
      const normCode = normalizeText(comp.code || '');
      const normType = normalizeText(comp.type);
      const normUnit = normalizeText(comp.unit);

      return (
        normName.includes(normTerm) ||
        normCode.includes(normTerm) ||
        normType.includes(normTerm) ||
        normUnit.includes(normTerm) ||
        comp.parentCompositions.some(p => normalizeText(p.desc).includes(normTerm) || normalizeText(p.code).includes(normTerm))
      );
    });
  }, [consolidatedBOM, searchTerm, categoryFilter]);

  // Toggle item expansion for components
  const toggleExpand = (itemId: string) => {
    setExpandedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // Expand all items that have components
  const expandAll = () => {
    const allWithComponents = new Set(items.filter(i => i.components && i.components.length > 0).map(i => i.id));
    setExpandedItemIds(allWithComponents);
  };

  // Collapse all items
  const collapseAll = () => {
    setExpandedItemIds(new Set());
  };

  // Add Item to Quick Budget Simulation list
  const handleAddToBudget = (item: SinapiItem) => {
    setBudgetEntries(prev => {
      const existsIndex = prev.findIndex(b => b.id === item.id);
      if (existsIndex > -1) {
        const next = [...prev];
        next[existsIndex] = { ...next[existsIndex], quantity: next[existsIndex].quantity + 1 };
        return next;
      }
      return [...prev, { id: item.id, quantity: 1, customItem: item }];
    });
  };

  // Add individual BOM component to budget
  const handleAddBOMToBudget = (bomItem: ConsolidatedBOMItem) => {
    const syntheticItem: SinapiItem = {
      id: bomItem.id,
      code: bomItem.code || 'INS-SINAPI',
      description: bomItem.name,
      category: bomItem.type === 'Mão de Obra' ? 'Mão de Obra' : 'Material',
      unit: bomItem.unit,
      basePriceSP: bomItem.unitCostSP,
      specification: `Insumo analítico SINAPI utilizado em ${bomItem.occurrences} composição(ões) registrada(s).`
    };
    handleAddToBudget(syntheticItem);
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

  // General counters
  const totalCompositionsCount = useMemo(() => items.filter(i => i.category === 'Composição').length, [items]);
  const totalMaterialsCount = useMemo(() => items.filter(i => i.category === 'Material').length, [items]);
  const totalLaborCount = useMemo(() => items.filter(i => i.category === 'Mão de Obra').length, [items]);

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
            Catálogo oficial com insumos desonerados, mão de obra com encargos sociais, materiais elétricos, civis e composições analíticas da Caixa Econômica Federal.
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

      {/* Primary View Switcher Tabs: Catalog vs Exploded BOM */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-100/70 dark:bg-slate-850/60 p-1.5 rounded-2xl border border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setViewMode('catalog')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'catalog'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-750'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-500" />
            <span>Itens & Composições</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {items.length}
            </span>
          </button>

          <button
            onClick={() => setViewMode('bom')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'bom'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-750'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Boxes className="w-4 h-4 text-amber-500" />
            <span>Explosão de Insumos (BOM)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold border border-amber-200/50 dark:border-amber-800/40">
              {consolidatedBOM.length}
            </span>
          </button>
        </div>

        {/* Global Expand/Collapse helpers for compositions */}
        {viewMode === 'catalog' && (
          <div className="flex items-center gap-1.5 px-2 self-end sm:self-auto">
            <button
              onClick={expandAll}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              title="Expandir a lista de insumos de todas as composições"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Expandir Todos os Insumos</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              onClick={collapseAll}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              title="Recolher fichas técnicas"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Recolher</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid Layout of Catalog/BOM vs Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Items Catalog list / Exploded BOM (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Functional Filters Panel */}
          <div className="bg-slate-50/70 dark:bg-slate-900/45 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3">
            {/* Search Box Input with Accent Normalization & Component Match */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar código SINAPI (ex: 91854, 88264), descrição ou insumo interno..."
                className="w-full text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 pl-9 pr-8 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-505 shadow-xs placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold font-mono px-1 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Limpar busca"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Micro Category filtering tablets */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <div className="flex items-center gap-1 flex-wrap">
                {[
                  { id: 'All', label: 'Ver Todos', count: items.length },
                  { id: 'Composição', label: 'Composições', count: totalCompositionsCount },
                  { id: 'Material', label: 'Materiais', count: totalMaterialsCount },
                  { id: 'Mão de Obra', label: 'Mão de Obra', count: totalLaborCount }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-tight transition-all flex items-center gap-1.5 cursor-pointer ${
                      categoryFilter === cat.id
                        ? 'bg-slate-900 text-white dark:bg-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-200/80 dark:border-slate-700'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-[9px] font-mono px-1 rounded ${
                      categoryFilter === cat.id
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Composition components inclusivity toggle */}
              {viewMode === 'catalog' && (categoryFilter === 'Mão de Obra' || categoryFilter === 'Material') && (
                <label className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeCompositionsWithCategory}
                    onChange={(e) => setIncludeCompositionsWithCategory(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                  />
                  <span>Incluir composições que usam este insumo</span>
                </label>
              )}
            </div>
          </div>

          {/* Quick Stats count bar */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <div className="flex items-center gap-2">
              <span>
                {viewMode === 'catalog' ? (
                  <>Exibindo: <b className="text-slate-700 dark:text-indigo-400">{filteredItemsWithMatch.length}</b> de {items.length} itens cadastrados</>
                ) : (
                  <>Insumos analíticos: <b className="text-amber-600 dark:text-amber-400">{filteredBOM.length}</b> de {consolidatedBOM.length}</>
                )}
              </span>
              {(searchTerm || categoryFilter !== 'All') && (
                <button
                  onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                >
                  (Limpar Filtros)
                </button>
              )}
            </div>

            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Preços base SP x Multiplicador {activeUF.code} ({activeUF.factor.toFixed(2)})
            </span>
          </div>

          {/* Catalog view */}
          {viewMode === 'catalog' && (
            <div className={`space-y-2.5 max-h-[580px] overflow-y-auto pr-1 scrollbar-none transition-opacity duration-200 ${isRefreshing ? 'opacity-60' : 'opacity-100'}`}>
              {filteredItemsWithMatch.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">
                    Nenhum insumo ou composição SINAPI corresponde aos termos ou filtros selecionados.
                  </p>
                  <button 
                    onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold underline cursor-pointer"
                  >
                    Limpar todos os filtros rápidos
                  </button>
                </div>
              ) : (
                filteredItemsWithMatch.map(({ item, matchedComponent }) => {
                  const ufPrice = getUFPrice(item.basePriceSP);
                  const isExpanded = expandedItemIds.has(item.id) || (matchedComponent !== null);
                  const hasChange = item.changePercent !== undefined && item.changePercent !== 0;
                  const isPositive = hasChange && (item.changePercent || 0) > 0;
                  const compCount = item.components?.length || 0;

                  return (
                    <div 
                      key={item.id}
                      className={`p-4 bg-white dark:bg-slate-900/50 rounded-2xl border transition-all hover:shadow-sm ${
                        isExpanded 
                          ? 'border-indigo-500/50 bg-indigo-50/5 dark:bg-indigo-950/15'
                          : 'border-slate-200/90 dark:border-slate-850'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        
                        {/* Left: Code, Category badge, Description */}
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-black text-slate-900 dark:text-indigo-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700">
                              {item.code}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              item.category === 'Composição'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40'
                                : item.category === 'Mão de Obra'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40'
                                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40'
                            }`}>
                              {item.category}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono font-medium">Unid: <b className="text-slate-600 dark:text-slate-300">{item.unit}</b></span>
                            
                            {/* Number of components badge */}
                            {compCount > 0 && (
                              <button
                                onClick={() => toggleExpand(item.id)}
                                className="text-[10px] font-mono font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-1 hover:bg-amber-100 dark:hover:bg-amber-900/50 cursor-pointer"
                              >
                                <Boxes className="w-3 h-3" />
                                <span>{compCount} insumos</span>
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            )}

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
                          
                          <h4 
                            className="text-xs font-semibold leading-relaxed text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer" 
                            onClick={() => toggleExpand(item.id)}
                          >
                            {item.description}
                          </h4>

                          {/* Component search match badge */}
                          {matchedComponent && (
                            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200/80 dark:border-amber-800/60">
                              <Search className="w-3 h-3 text-amber-500" />
                              <span>Insumo correspondente: <b>{matchedComponent.name}</b> ({matchedComponent.quantity} {matchedComponent.unit})</span>
                            </div>
                          )}
                        </div>

                        {/* Right: Cost value BRL & Simulator add button */}
                        <div className="flex flex-col items-end shrink-0 gap-2">
                          <div className="text-right">
                            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none">Preço {activeUF.code}</div>
                            <div className="text-sm font-mono font-black text-slate-900 dark:text-slate-50 mt-1">
                              R$ {ufPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            {item.previousPriceSP !== undefined && item.previousPriceSP !== item.basePriceSP && (
                              <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                                Ant: R$ {getUFPrice(item.previousPriceSP).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {compCount > 0 && (
                              <button
                                onClick={() => toggleExpand(item.id)}
                                className="p-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 transition-colors cursor-pointer flex items-center gap-1"
                                title="Ver detalhamento e coeficientes de insumos"
                              >
                                <span>{isExpanded ? 'Ocultar' : 'Ficha'}</span>
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleAddToBudget(item)}
                              className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
                              title="Adicionar item ao simulador de orçamento"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Adicionar</span>
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* Expandable detailed description and components list */}
                      {isExpanded && (
                        <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-850/60 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-3 animate-fadeIn">
                          {item.specification && (
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block">Especificação Técnica & Normas:</span>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-sans mt-0.5">
                                {item.specification}
                              </p>
                            </div>
                          )}

                          {/* Composition children components breakdown */}
                          {item.components && item.components.length > 0 && (
                            <div className="space-y-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                                  <Boxes className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Insumos e Coeficientes de Composição ({item.components.length}):</span>
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">Coef. por {item.unit}</span>
                              </div>

                              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-800 divide-y divide-slate-150 dark:divide-slate-800 overflow-hidden text-[11px]">
                                {item.components.map((c, idx) => {
                                  const isMatched = matchedComponent && (matchedComponent.name === c.name || matchedComponent.code === c.code);
                                  const cCostLocal = getUFPrice(c.totalCost);

                                  return (
                                    <div 
                                      key={idx} 
                                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 px-3 py-2 ${
                                        isMatched ? 'bg-amber-50/80 dark:bg-amber-950/30' : 'hover:bg-slate-50/60 dark:hover:bg-slate-850/40'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {c.code && (
                                          <span className="font-mono text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1 rounded">
                                            {c.code}
                                          </span>
                                        )}
                                        {c.type && (
                                          <span className={`text-[8px] font-bold uppercase px-1 rounded ${
                                            c.type === 'Mão de Obra'
                                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                              : c.type === 'Equipamento'
                                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                          }`}>
                                            {c.type}
                                          </span>
                                        )}
                                        <span className={`font-sans ${isMatched ? 'font-bold text-amber-900 dark:text-amber-200' : 'text-slate-700 dark:text-slate-300'}`}>
                                          {c.name}
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 font-mono text-[10px]">
                                        <span className="text-slate-500 dark:text-slate-400">
                                          {c.quantity} {c.unit}
                                        </span>
                                        <span className="font-bold text-slate-800 dark:text-slate-100 min-w-[75px] text-right">
                                          R$ {cCostLocal.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-200/60 dark:border-slate-800 pt-2 font-mono">
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
          )}

          {/* Exploded BOM view (Consolidated Bill of Materials) */}
          {viewMode === 'bom' && (
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1 scrollbar-none">
              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Boxes className="w-4 h-4 text-amber-600" />
                  <span>Visão Consolidada de Insumos da Base SINAPI</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  Lista detalhada de todos os insumos constituintes (materiais, mão de obra horista e equipamentos) que formam as composições, permitindo orçar insumos elementares separadamente.
                </p>
              </div>

              {filteredBOM.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500">
                  Nenhum insumo encontrado para os filtros ativos.
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-150 dark:divide-slate-800">
                  {filteredBOM.map((bom) => {
                    const localUnitCost = getUFPrice(bom.unitCostSP);

                    return (
                      <div key={bom.id} className="p-3.5 hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition-colors flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {bom.code && (
                              <span className="font-mono text-xs font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                {bom.code}
                              </span>
                            )}
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              bom.type === 'Mão de Obra'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                : bom.type === 'Equipamento'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}>
                              {bom.type}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">Unid: <b className="text-slate-600 dark:text-slate-300">{bom.unit}</b></span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                              Presente em {bom.occurrences} comp.
                            </span>
                          </div>

                          <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {bom.name}
                          </h5>

                          <div className="text-[10px] text-slate-400 font-sans truncate">
                            Usado em: {bom.parentCompositions.map(p => p.code).join(', ')}
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 gap-1.5">
                          <div className="text-right">
                            <div className="text-[9px] font-mono text-slate-400 uppercase">Preço Unit {activeUF.code}</div>
                            <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                              R$ {localUnitCost.toFixed(2)} / {bom.unit}
                            </div>
                          </div>

                          <button
                            onClick={() => handleAddBOMToBudget(bom)}
                            className="bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md text-[10px] font-bold font-mono flex items-center gap-1 transition-all cursor-pointer"
                            title="Adicionar insumo ao simulador"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Adicionar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Side: Reactive Budget Simulator Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-4 shadow-xl relative overflow-hidden">
            
            {/* Background design accents */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
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
                <span className="text-slate-300 font-sans flex items-center gap-1">
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
                <span>Lista de Recursos ({budgetItems.length})</span>
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
                    Navegue pela tabela SINAPI ou pela aba de insumos e clique em <b>"Adicionar"</b> para compor custos estimados.
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
                          <span className="text-[10px] font-mono text-slate-400">
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
                              className="w-10 text-center text-xs font-mono font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-white"
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
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Conformidade Orçamentária</span>
                </div>
                <p className="font-sans">
                  Sua simulação contempla a contratação de mão de obra e insumos convertidos para a região de <b>{activeUF.name}</b> sob a referência oficial <b>{sinapiReference}</b>. O preço simulado serve de orientação prévia de custos sob as diretrizes estatutárias federais vigentes.
                </p>
              </div>
            )}

          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 space-y-2 leading-relaxed">
            <h5 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px] block font-mono">Entenda as Composições SINAPI:</h5>
            <p>
              <b>Composição analítica</b> representa o agrupamento normativo de uma atividade completa. Por exemplo, a instalação de 1 metro de eletroduto inclui a mão de obra de eletricista com encargos (H), mão de obra de auxiliar (H), o eletroduto de PVC rígido (M) e as conexões e luvas (UN).
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
