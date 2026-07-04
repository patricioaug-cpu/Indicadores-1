/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StockExchangeData } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Info 
} from 'lucide-react';

interface StockExchangeSectionProps {
  data: StockExchangeData;
  isRefreshing: boolean;
}

export default function StockExchangeSection({ data, isRefreshing }: StockExchangeSectionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const isPositive = data.change >= 0;

  // Render simulated mini line chart points based on current prices to make it responsive
  const generateChartPoints = () => {
    // Determine seed values from index price
    const base = data.price;
    const isUp = data.change >= 0;
    
    // Create 8 points mimicking a day trend
    const points = [
      base * 0.995,
      base * 0.997,
      base * 0.993,
      isUp ? base * 1.002 : base * 0.994,
      isUp ? base * 1.001 : base * 0.991,
      isUp ? base * 1.005 : base * 0.996,
      base * (isUp ? 1.000 : 0.993),
      base // Final point is current price
    ];

    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;

    // Map to SVG coordinates (width: 400, height: 120, padding: 10)
    return points.map((p, idx) => {
      const x = 10 + (idx * 380) / (points.length - 1);
      const y = 110 - ((p - min) / range) * 100;
      return { x, y, value: p };
    });
  };

  const chartPoints = generateChartPoints();
  const pathData = chartPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
  const areaData = `${pathData} L ${chartPoints[chartPoints.length - 1].x.toFixed(1)} 120 L ${chartPoints[0].x.toFixed(1)} 120 Z`;

  // Calculate grid values
  const pointsValues = chartPoints.map(p => p.value);
  const minVal = Math.min(...pointsValues);
  const maxVal = Math.max(...pointsValues);
  const midVal = (minVal + maxVal) / 2;

  // Generate helper time for tooltip points
  const getHourForPoint = (idx: number) => {
    if (idx === 7) return 'Agora';
    const startHour = data.id === 'bovespa' ? 10 : data.id === 'londres' ? 8 : 9.5; // B3: 10, LSE: 8, NYSE/Nasdaq: 9:30
    const hour = startHour + idx * 1;
    const h = Math.floor(hour);
    const m = hour % 1 === 0 ? '00' : '30';
    return `${String(h).padStart(2, '0')}:${m}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn" id={`stock-panel-${data.id}`}>
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
        {/* Background visual detail */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-950 px-2 py-0.5 rounded border border-indigo-900/40">
              {data.symbol}
            </span>
            <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              data.status === 'Aberto' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${data.status === 'Aberto' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              Mercado {data.status}
            </span>
          </div>
          
          <h2 className="text-xl font-bold font-sans tracking-tight mt-1.5 text-slate-100">
            {data.name}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-sans leading-relaxed">
            Monitor de ativos em tempo real com integração de mercado e simulador de rentabilidade corporativa.
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider">Última Atualização</span>
          <span className="text-xs font-mono font-bold text-slate-100 block mt-0.5">{data.lastUpdated}</span>
        </div>
      </div>

      {/* 2. Index Display & SVG Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Big Index Value Card */}
        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-850/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
              Índice Referência
            </span>
            <h3 className="text-2xl font-black font-sans tracking-tight text-slate-900 dark:text-white mt-1">
              {data.indexName}
            </h3>
          </div>

          <div className="my-5">
            <div className="text-4xl font-mono font-black tracking-tight text-slate-900 dark:text-slate-50 tabular-nums">
              {data.currency} {data.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black font-mono tracking-tight ${
                isPositive 
                  ? 'bg-emerald-550/10 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-rose-550/10 text-rose-600 dark:text-rose-450'
              }`}>
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {isPositive ? '+' : ''}{data.change.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`inline-flex items-center text-xs font-black font-mono ${
                isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-650 dark:text-rose-450'
              }`}>
                ({isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-150 dark:border-slate-800/80 pt-4 text-xs">
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">Mínima Diária</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                {data.currency} {data.low.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">Máxima Diária</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                {data.currency} {data.high.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Real-time SVGTrend Line Chart */}
        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-850/80 shadow-xs flex flex-col justify-between lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                Tendência Intra-diária
              </span>
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 font-sans">
                Flutuação de preço consolidada (Sessão Atual)
              </h4>
            </div>
            
            <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] font-bold">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Real-Time Tracker</span>
            </div>
          </div>

          {/* SVG Line Drawing with animated gradient */}
          <div className="h-36 w-full mt-4 relative">
            {isRefreshing && (
              <div className="absolute inset-0 bg-white/20 dark:bg-slate-950/25 backdrop-blur-3xs flex items-center justify-center rounded-xl z-10">
                <span className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
              </div>
            )}
            
            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="10" y1="20" x2="390" y2="20" stroke="currentColor" className="text-slate-200 dark:text-slate-800/40" strokeDasharray="3,3" />
              <line x1="10" y1="60" x2="390" y2="60" stroke="currentColor" className="text-slate-200 dark:text-slate-800/40" strokeDasharray="3,3" />
              <line x1="10" y1="100" x2="390" y2="100" stroke="currentColor" className="text-slate-200 dark:text-slate-800/40" strokeDasharray="3,3" />

              {/* Y-Axis Scale Values Overlayed on Grid Lines */}
              <text x="12" y="16" fill="currentColor" className="text-slate-400 dark:text-slate-500/80 font-mono text-[9px] font-bold select-none">
                {data.currency} {maxVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </text>
              <text x="12" y="56" fill="currentColor" className="text-slate-400 dark:text-slate-500/80 font-mono text-[9px] font-bold select-none">
                {data.currency} {midVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </text>
              <text x="12" y="96" fill="currentColor" className="text-slate-400 dark:text-slate-500/80 font-mono text-[9px] font-bold select-none">
                {data.currency} {minVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </text>

              {/* Filled Area */}
              <path d={areaData} fill="url(#chartGrad)" />

              {/* Stroke Line */}
              <path
                d={pathData}
                fill="none"
                stroke={isPositive ? '#10b981' : '#f43f5e'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-500"
              />

              {/* Interactive Vertical Guidance Line */}
              {hoveredIndex !== null && (
                <line
                  x1={chartPoints[hoveredIndex].x}
                  y1="10"
                  x2={chartPoints[hoveredIndex].x}
                  y2="110"
                  stroke={isPositive ? '#10b981' : '#f43f5e'}
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                  className="pointer-events-none"
                />
              )}

              {/* Permanent Value label on Opening point (0) */}
              <g className="pointer-events-none">
                <rect 
                  x="6" 
                  y={chartPoints[0].y > 25 ? chartPoints[0].y - 20 : chartPoints[0].y + 6} 
                  width="68" 
                  height="13" 
                  rx="3" 
                  fill="currentColor" 
                  className="text-slate-900/90 dark:text-slate-800/90"
                />
                <text 
                  x="10" 
                  y={chartPoints[0].y > 25 ? chartPoints[0].y - 10 : chartPoints[0].y + 16} 
                  fill="#ffffff" 
                  className="font-mono text-[8px] font-black"
                >
                  Ab: {chartPoints[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </text>
              </g>

              {/* Permanent Value label on Current point (7) */}
              <g className="pointer-events-none">
                <rect 
                  x="326" 
                  y={chartPoints[7].y > 25 ? chartPoints[7].y - 20 : chartPoints[7].y + 6} 
                  width="68" 
                  height="13" 
                  rx="3" 
                  fill="currentColor" 
                  className="text-indigo-950/90 dark:text-indigo-900/90"
                />
                <text 
                  x="330" 
                  y={chartPoints[7].y > 25 ? chartPoints[7].y - 10 : chartPoints[7].y + 16} 
                  fill="#ffffff" 
                  className="font-mono text-[8px] font-black"
                >
                  At: {chartPoints[7].value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </text>
              </g>

              {/* Point Node Highlights */}
              {chartPoints.map((pt, idx) => {
                const isHovered = hoveredIndex === idx;
                return (
                  <g key={idx}>
                    {/* Small dot always visible */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? "6" : "3.5"}
                      fill={isPositive ? '#10b981' : '#f43f5e'}
                      stroke="white"
                      strokeWidth={isHovered ? "2.5" : "1.5"}
                      className="transition-all duration-150 cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                    
                    {/* Larger hover area target */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="16"
                      className="fill-transparent stroke-transparent cursor-crosshair"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  </g>
                );
              })}

              {/* Final Node Pulse (when not hovering other points) */}
              {hoveredIndex === null && chartPoints.length > 0 && (
                <circle
                  cx={chartPoints[chartPoints.length - 1].x}
                  cy={chartPoints[chartPoints.length - 1].y}
                  r="5"
                  fill={isPositive ? '#10b981' : '#f43f5e'}
                  className="animate-ping pointer-events-none"
                />
              )}
            </svg>

            {/* Custom Interactive Tooltip box */}
            {hoveredIndex !== null && (
              <div 
                className="absolute bg-slate-900/95 text-white dark:bg-slate-950/95 px-3 py-2 rounded-xl shadow-2xl border border-slate-700/60 text-xs font-mono select-none pointer-events-none transition-all duration-150 z-20 whitespace-nowrap"
                style={{
                  left: `${(chartPoints[hoveredIndex].x / 400) * 100}%`,
                  transform: `translateX(${chartPoints[hoveredIndex].x > 220 ? '-108%' : '8%'})`,
                  top: `${Math.max(10, Math.min(65, chartPoints[hoveredIndex].y - 30))}px`
                }}
              >
                <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 uppercase tracking-wider leading-none">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  <span>Horário: {getHourForPoint(hoveredIndex)}</span>
                </div>
                
                <div className="text-sm font-black mt-1 text-slate-100 font-sans tracking-tight">
                  {data.currency} {chartPoints[hoveredIndex].value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                
                <div className={`text-[10px] font-bold mt-0.5 ${
                  chartPoints[hoveredIndex].value >= chartPoints[0].value ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  Ref. Abertura: {chartPoints[hoveredIndex].value >= chartPoints[0].value ? '+' : ''}{(((chartPoints[hoveredIndex].value - chartPoints[0].value) / chartPoints[0].value) * 100).toFixed(2)}%
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-2 border-t border-slate-150 dark:border-slate-800/80 pt-2">
            <span>Abertura (09:00)</span>
            <span>Meio Dia</span>
            <span>Fechamento (Atual)</span>
          </div>
        </div>

      </div>

      {/* 3. Top Market Movers Table */}
      <div className="w-full">
        
        {/* Top Movers/Stocks list */}
        <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-850/80 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black font-sans tracking-tight text-slate-900 dark:text-slate-50 uppercase">
                Ações Principais (Blue Chips)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                Maiores contribuintes do índice de referência
              </p>
            </div>
            <BarChart3 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5">Código</th>
                  <th className="py-2.5">Nome</th>
                  <th className="py-2.5 text-right">Cotação</th>
                  <th className="py-2.5 text-right">Variação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data.topMovers.map((mover) => {
                  const mPositive = mover.change >= 0;
                  return (
                    <tr key={mover.symbol} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 font-mono font-black text-indigo-650 dark:text-indigo-400 select-all">
                        {mover.symbol}
                      </td>
                      <td className="py-3 font-bold text-slate-800 dark:text-slate-200">
                        {mover.name}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {data.currency} {mover.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded font-mono font-bold tabular-nums ${
                          mPositive 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                          {mPositive ? <ArrowUpRight className="w-3 h-3 shrink-0" /> : <ArrowDownRight className="w-3 h-3 shrink-0" />}
                          {mPositive ? '+' : ''}{mover.changePercent.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-150 dark:border-slate-800/80 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed no-print">
            <Info className="w-4 h-4 text-indigo-550 shrink-0 mt-0.5" />
            <p className="text-[11px]">
              O volume negociado acumulado nesta sessão é de aproximadamente <strong className="text-slate-700 dark:text-slate-200 font-mono font-black">{data.volume}</strong>, indicando liquidez consolidada.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
