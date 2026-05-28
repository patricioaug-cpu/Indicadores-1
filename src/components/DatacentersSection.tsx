/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DatacenterMetric } from '../types';
import { Globe, Lightbulb, Gauge, Zap, Wind, Waves } from 'lucide-react';

interface DatacentersSectionProps {
  datacenters: DatacenterMetric[];
}

export default function DatacentersSection({ datacenters }: DatacentersSectionProps) {
  
  // Compute overall statistics
  const aggregateStats = React.useMemo(() => {
    const totalPower = datacenters.reduce((acc, d) => acc + d.operationalPowerGW, 0);
    const totalCount = datacenters.reduce((acc, d) => acc + d.totalDatacenters, 0);
    const avgPUE = datacenters.reduce((acc, d) => acc + d.avgPUE, 0) / datacenters.length;
    return {
      totalPower: parseFloat(totalPower.toFixed(1)),
      totalCount,
      avgPUE: parseFloat(avgPUE.toFixed(2))
    };
  }, [datacenters]);

  return (
    <section id="global-datacenters-indicator-section" className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-150 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-505" />
            Infraestrutura de Datacenters Mundiais
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitoramento de eficiência térmica (PUE), demanda elétrica consolidada e pegada energética da computação em nuvem global
          </p>
        </div>
      </div>

      {/* Intro info link to mechanical context */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800/80 p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="md:col-span-2 space-y-1">
          <h4 className="font-bold text-slate-850 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Lightbulb className="w-4 h-4 text-amber-500" /> O que é PUE (Power Usage Effectiveness)?
          </h4>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            É o indicador padrão da indústria de TI para eficiência energética de datacenters. Calculado dividindo a <b className="font-semibold text-slate-700 dark:text-slate-350">energia total recebida</b> pela <b className="font-semibold text-slate-700 dark:text-slate-350">energia consumida puramente pelos computadores</b>. O coeficiente ideal é <b>1.0</b> (tudo vira processamento). Um PUE de 1.5 indica que para cada 1W de computação, 0.5W é dissipado em perdas e refrigeração mecânica secundária.
          </p>
        </div>

        {/* Aggregate counts */}
        <div className="bg-indigo-950 text-indigo-100 dark:bg-slate-850 p-4.5 rounded-xl border border-indigo-900 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-300 dark:text-indigo-400 tracking-wider">Demanda Energética Mundial de Nuvem</span>
            <div className="text-2xl font-mono font-black text-teal-400 mt-1">
              {aggregateStats.totalPower} GW
            </div>
          </div>
          <span className="text-[9px] text-indigo-200 block mt-2 border-t border-indigo-900 dark:border-slate-800 pt-2 font-mono">
            Soma: {aggregateStats.totalCount.toLocaleString()} datacenters • PUE Médio Global: {aggregateStats.avgPUE}
          </span>
        </div>
      </div>

      {/* Grid of Global Regions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {datacenters.map((dc) => {
          // color PUE index
          const isPUEGreen = dc.avgPUE <= 1.45;

          return (
            <div
              key={dc.region}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Region Title */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">Monitor de Região</span>
                  <h3 className="text-sm font-bold text-slate-950 dark:text-slate-50 mt-1 font-sans">{dc.region}</h3>
                </div>

                {/* Grid performance values */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-850/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">PUE Médio Local</span>
                    <span className={`text-md font-mono font-black mt-1 block ${isPUEGreen ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {dc.avgPUE.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-slate-450 uppercase tracking-wider block mt-0.5">
                      {dc.avgPUE <= 1.38 ? 'Excelente' : dc.avgPUE <= 1.5 ? 'Moderado' : 'Consumo Alto'}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-850/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Potência Ativa total</span>
                    <span className="text-md font-mono font-black text-slate-855 dark:text-slate-100 mt-1 block">
                      {dc.operationalPowerGW.toFixed(1)} GW
                    </span>
                    <span className="text-[8px] text-slate-455 uppercase tracking-wider block mt-0.5">Fração Operativa</span>
                  </div>
                </div>

                {/* Sub-KPIs breakdown */}
                <div className="space-y-3 pt-1 text-xs">
                  
                  {/* Clean Energy representation gauge */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 dark:text-slate-400">🌱 Fuel de Matriz Limpa:</span>
                      <span className="font-mono font-bold text-emerald-650 dark:text-teal-400">{dc.cleanEnergyPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div style={{ width: `${dc.cleanEnergyPercentage}%` }} className="bg-emerald-555 h-full rounded-full"></div>
                    </div>
                  </div>

                  {/* Datacenters counts */}
                  <div className="flex justify-between items-center text-[10px] border-b border-slate-50 dark:border-slate-850 pb-1.5">
                    <span className="text-slate-500 dark:text-slate-400">Total Unidades Ativas:</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-350">{dc.totalDatacenters.toLocaleString()} sites</span>
                  </div>

                  {/* Cooling technology detailed description */}
                  <div className="flex items-start gap-1 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                    <Wind className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <p>
                      <b className="font-semibold text-slate-705 dark:text-slate-350">Arrefecimento Térmico:</b> {dc.coolingTech}
                    </p>
                  </div>

                </div>
              </div>

              {/* Source feed metadata */}
              <div className="text-[9px] uppercase tracking-wider text-slate-404 font-mono text-right mt-4 pt-2 border-t border-slate-50 dark:border-slate-850">
                L-SLA feed: ASHRAE TC 9.9
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
