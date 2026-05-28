/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ONSTelemetry, ANEELTariff } from '../types';
import { Activity, ShieldCheck, Sun, Zap, Info, Landmark, HelpCircle, BarChart3, AlertOctagon, RefreshCw } from 'lucide-react';

interface EnergySystemSectionProps {
  ons: ONSTelemetry;
  aneel: ANEELTariff;
  onRefreshONSAndFlags?: () => void;
}

export default function EnergySystemSection({ ons, aneel }: EnergySystemSectionProps) {
  // Let the user simulate switching ANEEL flags to immediately recalculate costs!
  const [activeFlag, setActiveFlag] = useState<ANEELTariff['activeFlag']>('Amarela');

  // Recalculate incremental rates and profile impacts based on simulated flag
  const flagDetails = {
    'Verde': { cost: 0.00, color: 'text-emerald-500 bg-emerald-50 border-emerald-250 dark:bg-emerald-950/30 dark:border-emerald-900', label: 'Bandeira Verde (Sem custo adicional)' },
    'Amarela': { cost: 0.01885, color: 'text-amber-500 bg-amber-50 border-amber-250 dark:bg-amber-950/30 dark:border-amber-900', label: 'Bandeira Amarela' },
    'Vermelha 1': { cost: 0.04463, color: 'text-rose-500 bg-rose-50 border-rose-250 dark:bg-rose-950/30 dark:border-rose-900', label: 'Bandeira Vermelha Patamar 1' },
    'Vermelha 2': { cost: 0.07877, color: 'text-red-500 bg-red-50 border-red-250 dark:bg-red-950/30 dark:border-red-900', label: 'Bandeira Vermelha Patamar 2' },
    'Escassez Hídrica': { cost: 0.14200, color: 'text-purple-500 bg-purple-50 border-purple-250 dark:bg-purple-950/30 dark:border-purple-900', label: 'Bandeira Escassez Hídrica (Extraordinária)' }
  };

  const simulatedIncrementalCost = flagDetails[activeFlag].cost;

  // Recalculate profile impacts dynamically
  const recalculatedProfiles = aneel.monthlyImpactByProfile.map((profile) => {
    // extract digits from "220 kWh"
    const kwh = parseInt(profile.avgConsumptionKWh.replace(/\D/g, ''), 10) || 100;
    const recalculatedImpact = kwh * simulatedIncrementalCost;
    return {
      ...profile,
      costImpactR: recalculatedImpact
    };
  });

  // Calculate renewable total sum
  const totalRenewablePct = ons.generationSources
    .filter(s => s.isRenewable)
    .reduce((sum, s) => sum + s.percentage, 0);

  return (
    <section id="system-energy-indicators-section" className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-150 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-505" />
            Indicadores do Sistema Elétrico Nacional
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhamento de demanda pelo Operador Nacional (ONS) e regulação de encargos tarifários (ANEEL)
          </p>
        </div>
      </div>

      {/* Grid: Left column (ONS Telemetry), Right column (ANEEL Tariff) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ONS TELEMETRY BOX */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-250/60 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Activity className="w-4 h-4 text-emerald-505" />
              Telemetria da Rede Elétrica (ONS)
            </h3>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-750">ONS LIVE</span>
          </div>

          {/* Demanda & Reserva */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Carga Instantânea</span>
              <div className="text-2xl font-mono font-black text-slate-900 dark:text-slate-100 mt-1">
                {ons.instantaneousLoadMW.toLocaleString()} MW
              </div>
              <span className="text-[10px] text-slate-400">Pico hoje: {ons.peakLoadTodayMW.toLocaleString()} MW</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Reserva Operativa (Estabilidade)</span>
              <div className="text-2xl font-mono font-black text-blue-600 dark:text-indigo-400 mt-1">
                {ons.gridStabilityReserveMW.toLocaleString()} MW
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Estável ({ons.gridStabilityPercent}% de margem)
              </div>
            </div>
          </div>

          {/* Renewable vs Thermal gauge */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Matriz Elétrica Geral: % Renovável</span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">{totalRenewablePct.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-orange-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex" title="Verde: Fontes limpas | Laranja: Térmica e Nuclear">
              <div style={{ width: `${totalRenewablePct}%` }} className="bg-emerald-550 h-full rounded-l-full"></div>
              <div style={{ width: `${100 - totalRenewablePct}%` }} className="bg-amber-600 h-full rounded-r-full"></div>
            </div>
            <div className="flex justify-between text-[9px] text-slate-450 uppercase font-semibold">
              <span>🌱 Limpa: {totalRenewablePct.toFixed(1)}% (Hídrica, Wind, Solar, Biomassa)</span>
              <span>🔥 Térmica/Fóssil: {(100 - totalRenewablePct).toFixed(1)}%</span>
            </div>
          </div>

          {/* Breakdown / Capacity Factor details */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Geração por Fonte Primária e Fator de Capacidade (FC)</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {ons.generationSources.map((gs) => (
                <div key={gs.source} className="p-2 bg-slate-50/50 dark:bg-slate-850/40 rounded border border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-750 dark:text-slate-350 block text-[11px]">{gs.source}</span>
                    <span className="text-[9px] font-mono text-slate-450">({gs.currentMW.toLocaleString()} MW)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold block text-slate-850 dark:text-slate-100 text-[11px]">{gs.percentage}%</span>
                    <span className="text-[9px] text-indigo-550 dark:text-indigo-400 font-mono font-semibold" title="Fator de capacidade médio operacional">
                      FC: {(gs.capacityFactor * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional consumption share comparison */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-850 pt-3">
            <span className="text-[10px] text-slate-405 uppercase font-bold tracking-wider block">Comparativo Regional de Consumo</span>
            <div className="space-y-1.5 text-xs">
              {ons.regionalConsumption.map((reg) => (
                <div key={reg.region} className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-semibold text-slate-750 dark:text-slate-350">{reg.region}</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">
                      <b>{reg.consumptionMW.toLocaleString()} MW</b> ({reg.percentageOfTotal}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div style={{ width: `${reg.percentageOfTotal}%` }} className="bg-blue-500 h-full rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ANEEL TARIFF BOX */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-250/60 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Landmark className="w-4 h-4 text-indigo-505" />
              Monitor Inteligente de Tarifas (ANEEL)
            </h3>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-750">ANEEL REG</span>
          </div>

          {/* Interactive flag picker inside */}
          <div className="space-y-2 bg-slate-550/5 dark:bg-slate-850/30 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-405">Bandeira Vigorante ANEEL:</span>
              <span className="text-[10px] text-slate-400 font-mono">Última fixação homologada</span>
            </div>
            
            {/* Display Flag State */}
            <div className={`p-4 rounded-lg border text-center font-bold text-sm transition-all shadow-inner uppercase tracking-wider flex items-center justify-center gap-2 ${flagDetails[activeFlag].color}`}>
              <span className="w-3.5 h-3.5 rounded-full bg-current animate-pulse"></span>
              {flagDetails[activeFlag].label}
            </div>

            {/* Click to simulate state change dynamically */}
            <div className="mt-3">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5 text-center">Simulador de Bandeira (Clique para re-estimar impactos)</span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {Object.keys(flagDetails).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFlag(f as any)}
                    className={`px-2.5 py-1 text-[10px] rounded-md font-bold uppercase transition-all border cursor-pointer ${
                      activeFlag === f
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-50 dark:border-slate-50 dark:text-slate-950 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-350 dark:hover:bg-slate-800'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submetrics list */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Custo Incremental Médio</span>
              <span className="text-lg font-mono font-black text-slate-900 dark:text-slate-100 block mt-1">
                R$ {simulatedIncrementalCost.toFixed(5)} <span className="text-xs font-sans text-slate-500 font-normal">/kWh</span>
              </span>
              <p className="text-[10px] text-slate-450 mt-1 leading-tight">Adicional aplicado diretamente na fatura líquida antes de impostos PIS/COFINS.</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-404 block uppercase font-bold">Risco de Escassez Hídrica</span>
              <span className="text-lg font-mono font-black text-amber-600 dark:text-amber-400 block mt-1">
                {aneel.tariffRiskIndex.toFixed(1)}%
              </span>
              {/* Hydrologic risk gauge */}
              <div className="w-full bg-slate-200 dark:bg-slate-750 h-1.5 rounded-full overflow-hidden mt-1 bg-yellow-405/10">
                <div style={{ width: `${aneel.tariffRiskIndex}%` }} className="bg-amber-500 h-full rounded-full"></div>
              </div>
              <p className="text-[9px] text-slate-450 mt-1.5 leading-tight">Previsão baseada em vazões de afluência e armazenamento de segurança do ONS.</p>
            </div>
          </div>

          {/* Profile Impact Recalculator */}
          <div className="space-y-2.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Impacto Mensal Adicional por Perfil de Consumidor (Simulado)</span>
            <div className="space-y-2 text-xs">
              {recalculatedProfiles.map((p) => (
                <div key={p.profile} className="flex justify-between items-center p-2 rounded bg-slate-50/50 dark:bg-slate-850/45 border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-semibold text-slate-850 dark:text-slate-300 block">{p.profile}</span>
                    <span className="text-[10px] text-slate-455">Consumo Médio Comercializado: <b className="font-mono text-slate-600 dark:text-slate-400">{p.avgConsumptionKWh}</b></span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-black block text-sm ${simulatedIncrementalCost > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      + R$ {p.costImpactR.toFixed(2)}
                    </span>
                    <span className="text-[8px] text-slate-450 uppercase tracking-widest block mt-0.5">impacto / mês</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hydrologic Condition Description */}
          <div className="bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800 p-3 rounded-lg flex items-start gap-2 text-xs">
            <Info className="w-4 h-4 text-indigo-505 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              <b className="font-sans text-slate-700 dark:text-slate-350 block mb-0.5">Sumário Hidrológico Técnico:</b>
              {aneel.hydrologicalSituation}
            </p>
          </div>

        </div>

      </div>

    </section>
  );
}
