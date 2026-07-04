/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ONSTelemetry,
  ANEELTariff,
  DatacenterMetric,
  StockExchangeData
} from '../types';

// Helper to format ISO time nicely
export function getCurrentFormattedTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

export function getFullFormattedDate(): string {
  const now = new Date();
  return now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) + ' - ' + getCurrentFormattedTime();
}

// Initial USD/BRL Rate
export const INITIAL_USD_BRL = 5.1842;

// Initial ONS Telemetry
export const initialONS: ONSTelemetry = {
  instantaneousLoadMW: 78450,
  peakLoadTodayMW: 84600,
  gridStabilityReserveMW: 12450,
  gridStabilityPercent: 15.8,
  generationSources: [
    { source: 'Hídrica', percentage: 61.2, capacityFactor: 0.65, currentMW: 48011, isRenewable: true },
    { source: 'Eólica', percentage: 14.8, capacityFactor: 0.42, currentMW: 11611, isRenewable: true },
    { source: 'Solar', percentage: 8.5, capacityFactor: 0.28, currentMW: 6668, isRenewable: true },
    { source: 'Térmica (Gás/Carvão)', percentage: 11.1, capacityFactor: 0.85, currentMW: 8708, isRenewable: false },
    { source: 'Biomassa', percentage: 3.1, capacityFactor: 0.55, currentMW: 2432, isRenewable: true },
    { source: 'Nuclear', percentage: 1.3, capacityFactor: 0.92, currentMW: 1020, isRenewable: false }
  ],
  regionalConsumption: [
    { region: 'Sudeste / Centro-Oeste', consumptionMW: 45500, percentageOfTotal: 58.0 },
    { region: 'Nordeste', consumptionMW: 14100, percentageOfTotal: 18.0 },
    { region: 'Sul', consumptionMW: 13340, percentageOfTotal: 17.0 },
    { region: 'Norte', consumptionMW: 5510, percentageOfTotal: 7.0 }
  ],
  lastUpdated: getFullFormattedDate()
};

// Initial ANEEL Tariff Monitor
export const initialANEEL: ANEELTariff = {
  activeFlag: 'Amarela',
  incrementalCostR_kWh: 0.01885, // R$ per kWh incremental
  monthlyImpactByProfile: [
    { profile: 'Residencial Baixo Renda', avgConsumptionKWh: '80 kWh', costImpactR: 1.51 },
    { profile: 'Residencial Médio Padrão', avgConsumptionKWh: '220 kWh', costImpactR: 4.15 },
    { profile: 'Comércio / Escritório Pequeno', avgConsumptionKWh: '850 kWh', costImpactR: 16.02 },
    { profile: 'Indústria Compacta PMPE', avgConsumptionKWh: '5400 kWh', costImpactR: 101.79 }
  ],
  historicalFlags: [
    { month: 'Dez/25', flag: 'Verde', cost: 0 },
    { month: 'Jan/26', flag: 'Verde', cost: 0 },
    { month: 'Fev/26', flag: 'Amarela', cost: 0.01885 },
    { month: 'Mar/26', flag: 'Vermelha 1', cost: 0.04463 },
    { month: 'Abr/26', flag: 'Vermelha 2', cost: 0.07877 },
    { month: 'Mai/26', flag: 'Amarela', cost: 0.01885 }
  ],
  tariffRiskIndex: 42.5, // 42.5% hydrologic risk
  hydrologicalSituation: 'Reservatórios em patamar operacional médio (Sudeste com 58.4% de capacidade reguladora). Condições pluviométricas de período seco em transição.',
  lastUpdated: getFullFormattedDate()
};

// Global Datacenters Metrics
export const initialDatacenters: DatacenterMetric[] = [
  { region: 'América do Norte (EUA / Canadá)', totalDatacenters: 2840, avgPUE: 1.42, operationalPowerGW: 18.5, cleanEnergyPercentage: 64.0, coolingTech: 'Liquid Cooling / Free Cooling híbrido' },
  { region: 'União Europeia e Reino Unido', totalDatacenters: 1950, avgPUE: 1.35, operationalPowerGW: 12.2, cleanEnergyPercentage: 88.5, coolingTech: 'Direct Outside Air Cooling severo' },
  { region: 'Ásia-Pacífico (China, Japão, Singapura)', totalDatacenters: 2100, avgPUE: 1.55, operationalPowerGW: 14.8, cleanEnergyPercentage: 42.0, coolingTech: 'Chilled Water Systems convencionais + AI control' },
  { region: 'América Latina (Foco Brasil/Chile)', totalDatacenters: 320, avgPUE: 1.48, operationalPowerGW: 2.1, cleanEnergyPercentage: 92.0, coolingTech: 'Sistemas de condensação a água otimizados' },
  { region: 'Oriente Médio e África', totalDatacenters: 180, avgPUE: 1.68, operationalPowerGW: 1.4, cleanEnergyPercentage: 35.0, coolingTech: 'Sistemas de água gelada redundantes e fechados' }
];

// Diffs generator to make clicking "Atualizar Dados" very live & dynamic
export function rollTheDiceAndCalculateUpdates(
  currentUSD_BRL: number,
  ons: ONSTelemetry,
  aneel: ANEELTariff
) {
  // 1. Roll shift for USDBRL (drift +-0.02)
  const usdBRLDrift = (Math.random() - 0.5) * 0.03;
  const newUSDBRL = Number((Math.max(4.80, Math.min(6.20, currentUSD_BRL + usdBRLDrift))).toFixed(4));

  // 2. Roll ONS Telemetry with electric grid fluctuation
  const loadDrift = Math.round((Math.random() - 0.5) * 650);
  const instantaneousLoadMW = Math.max(50000, Math.min(95000, ons.instantaneousLoadMW + loadDrift));
  const peakLoadTodayMW = Math.max(instantaneousLoadMW, ons.peakLoadTodayMW);
  
  // Fluctuate sources
  let renewableSum = 0;
  const updatedGenSources = ons.generationSources.map(src => {
    const sourcePowerDrift = (Math.random() - 0.5) * 0.03 * src.currentMW;
    const currentMW = Math.round(Math.max(src.currentMW * 0.8, src.currentMW + sourcePowerDrift));
    if (src.isRenewable) {
      renewableSum += currentMW;
    }
    return { ...src, currentMW };
  });
  
  const totalGenMW = updatedGenSources.reduce((acc, s) => acc + s.currentMW, 0);
  // Re-adjust percentages
  const finalGenSources = updatedGenSources.map(src => {
    const percentage = Number(((src.currentMW / totalGenMW) * 100).toFixed(1));
    const factorDrift = (Math.random() - 0.5) * 0.02;
    const capacityFactor = Number((Math.max(0.1, Math.min(0.98, src.capacityFactor + factorDrift))).toFixed(2));
    return { ...src, percentage, capacityFactor };
  });

  const totalRenewablePct = Number(((renewableSum / totalGenMW) * 100).toFixed(1));

  // Regional load changes
  const regionalConsumption = ons.regionalConsumption.map(reg => {
    const regDrift = (Math.random() - 0.5) * 0.015 * reg.consumptionMW;
    const consumptionMW = Math.round(Math.max(reg.consumptionMW * 0.85, reg.consumptionMW + regDrift));
    return { ...reg, consumptionMW };
  });
  const totalCons = regionalConsumption.reduce((acc, r) => acc + r.consumptionMW, 0);
  const finalRegConsumption = regionalConsumption.map(reg => ({
    ...reg,
    percentageOfTotal: Number(((reg.consumptionMW / totalCons) * 100).toFixed(1))
  }));

  const updatedONS: ONSTelemetry = {
    instantaneousLoadMW,
    peakLoadTodayMW,
    gridStabilityReserveMW: Math.round(instantaneousLoadMW * 0.16),
    gridStabilityPercent: Number(((Math.round(instantaneousLoadMW * 0.16) / instantaneousLoadMW) * 100).toFixed(1)),
    generationSources: finalGenSources,
    regionalConsumption: finalRegConsumption,
    lastUpdated: getFullFormattedDate()
  };

  // 3. ANEEL small updates (e.g., slight fluctuation in hydrological risk)
  const riskDrift = (Math.random() - 0.5) * 1.8;
  const tariffRiskIndex = Number((Math.max(10, Math.min(98, aneel.tariffRiskIndex + riskDrift))).toFixed(1));
  const updatedANEEL: ANEELTariff = {
    ...aneel,
    tariffRiskIndex,
    lastUpdated: getFullFormattedDate()
  };

  return {
    newUSDBRL,
    updatedONS,
    updatedANEEL
  };
}

// Initial Stock Exchange Data
export const initialStocks: StockExchangeData[] = [
  {
    id: 'bovespa',
    name: "Bolsa de Valores de São Paulo (B3)",
    indexName: "Ibovespa",
    symbol: "^BVSP",
    price: 118450.25,
    change: 450.20,
    changePercent: 0.38,
    currency: "R$",
    volume: "3.2B",
    status: 'Aberto',
    high: 119100.00,
    low: 117950.00,
    topMovers: [
      { symbol: "VALE3.SA", name: "Vale S.A.", price: 61.24, change: 0.85, changePercent: 1.41 },
      { symbol: "PETR4.SA", name: "Petrobras PN", price: 38.50, change: -0.42, changePercent: -1.08 },
      { symbol: "ITUB4.SA", name: "Itaú Unibanco PN", price: 34.12, change: 0.35, changePercent: 1.04 },
      { symbol: "BBDC4.SA", name: "Banco Bradesco PN", price: 13.85, change: 0.12, changePercent: 0.87 }
    ],
    lastUpdated: getFullFormattedDate()
  },
  {
    id: 'nyse',
    name: "New York Stock Exchange (NYSE)",
    indexName: "Dow Jones Industrial Average",
    symbol: "^DJI",
    price: 39150.80,
    change: -120.40,
    changePercent: -0.31,
    currency: "$",
    volume: "4.8B",
    status: 'Aberto',
    high: 39300.00,
    low: 39050.00,
    topMovers: [
      { symbol: "JPM", name: "JPMorgan Chase & Co.", price: 198.50, change: 1.20, changePercent: 0.61 },
      { symbol: "DIS", name: "The Walt Disney Company", price: 112.35, change: -0.80, changePercent: -0.71 },
      { symbol: "KO", name: "The Coca-Cola Company", price: 62.40, change: 0.15, changePercent: 0.24 },
      { symbol: "XOM", name: "Exxon Mobil Corporation", price: 115.80, change: -1.45, changePercent: -1.24 }
    ],
    lastUpdated: getFullFormattedDate()
  },
  {
    id: 'londres',
    name: "London Stock Exchange (LSE)",
    indexName: "FTSE 100",
    symbol: "^FTSE",
    price: 7950.35,
    change: 15.85,
    changePercent: 0.20,
    currency: "£",
    volume: "1.1B",
    status: 'Fechado',
    high: 7980.00,
    low: 7920.00,
    topMovers: [
      { symbol: "SHEL.L", name: "Shell plc", price: 2840.50, change: 12.00, changePercent: 0.42 },
      { symbol: "AZN.L", name: "AstraZeneca plc", price: 11340.00, change: -45.00, changePercent: -0.40 },
      { symbol: "HSBA.L", name: "HSBC Holdings plc", price: 645.20, change: 3.40, changePercent: 0.53 },
      { symbol: "BP.L", name: "BP p.l.c.", price: 512.40, change: -2.10, changePercent: -0.41 }
    ],
    lastUpdated: getFullFormattedDate()
  },
  {
    id: 'nasdaq',
    name: "Nasdaq Stock Market",
    indexName: "Nasdaq Composite",
    symbol: "^IXIC",
    price: 16420.50,
    change: 210.15,
    changePercent: 1.30,
    currency: "$",
    volume: "5.5B",
    status: 'Aberto',
    high: 16500.00,
    low: 16280.00,
    topMovers: [
      { symbol: "AAPL", name: "Apple Inc.", price: 182.52, change: 1.84, changePercent: 1.02 },
      { symbol: "MSFT", name: "Microsoft Corporation", price: 415.60, change: 4.80, changePercent: 1.17 },
      { symbol: "NVDA", name: "NVIDIA Corporation", price: 875.12, change: 25.40, changePercent: 2.99 },
      { symbol: "TSLA", name: "Tesla Inc.", price: 175.45, change: -3.50, changePercent: -1.96 }
    ],
    lastUpdated: getFullFormattedDate()
  }
];

// Fetch with timeout helper to prevent hanging on slow proxies
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 1500): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Real stock API fetch using multiple fallbacks/CORS bypasses
export async function fetchRealStockData(): Promise<Record<string, { price: number; change: number; changePercent: number }>> {
  const symbols = ['^BVSP', '^DJI', '^FTSE', '^IXIC'];
  const symbolsStr = symbols.join(',');
  const targetUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsStr}`;
  
  // Try proxies to bypass CORS
  const proxies = [
    (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`
  ];

  for (const getProxyUrl of proxies) {
    try {
      const proxyUrl = getProxyUrl(targetUrl);
      const res = await fetchWithTimeout(proxyUrl, {}, 1500);
      if (!res.ok) continue;
      
      let data;
      if (proxyUrl.includes('allorigins')) {
        const raw = await res.json();
        data = JSON.parse(raw.contents);
      } else {
        data = await res.json();
      }

      if (data && data.quoteResponse && data.quoteResponse.result) {
        const result = data.quoteResponse.result;
        const parsed: Record<string, { price: number; change: number; changePercent: number }> = {};
        
        result.forEach((item: any) => {
          if (item.symbol && item.regularMarketPrice !== undefined) {
            parsed[item.symbol] = {
              price: Number(item.regularMarketPrice),
              change: Number(item.regularMarketChange || 0),
              changePercent: Number(item.regularMarketChangePercent || 0)
            };
          }
        });
        
        if (Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch from proxy:', e);
    }
  }
  
  return {};
}

// Fluctuates or integrates real data
export function rollStockExchangeData(
  currentStocks: StockExchangeData[],
  realData?: Record<string, { price: number; change: number; changePercent: number }>
): StockExchangeData[] {
  return currentStocks.map(stock => {
    let price = stock.price;
    let change = stock.change;
    let changePercent = stock.changePercent;
    
    if (realData && realData[stock.symbol]) {
      const rd = realData[stock.symbol];
      price = rd.price;
      change = rd.change;
      changePercent = rd.changePercent;
    } else {
      // Simulate fluctuation
      const pctChange = (Math.random() - 0.48) * 0.005; // slight upward drift
      const delta = stock.price * pctChange;
      price = Number((stock.price + delta).toFixed(2));
      change = Number((stock.change + delta).toFixed(2));
      changePercent = Number(((change / (price - change)) * 100).toFixed(2));
    }
    
    // Fluctuate individual movers
    const updatedMovers = stock.topMovers.map(mover => {
      const pctMoverChange = (Math.random() - 0.5) * 0.015;
      const deltaMover = mover.price * pctMoverChange;
      const mPrice = Number((mover.price + deltaMover).toFixed(2));
      const mChange = Number((mover.change + deltaMover).toFixed(2));
      const mChangePercent = Number(((mChange / (mPrice - mChange)) * 100).toFixed(2));
      return {
        ...mover,
        price: mPrice,
        change: mChange,
        changePercent: mChangePercent
      };
    });

    // Trading hours simulation (São Paulo: 10-18, NYSE/Nasdaq: 9:30-16:00, London: 8-16:30)
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const isWeekend = day === 0 || day === 6;
    let status: 'Aberto' | 'Fechado' = 'Aberto';
    
    if (isWeekend) {
      status = 'Fechado';
    } else {
      if (stock.id === 'bovespa' && (hour < 10 || hour >= 18)) status = 'Fechado';
      else if (stock.id === 'nyse' && (hour < 9 || hour >= 16)) status = 'Fechado';
      else if (stock.id === 'londres' && (hour < 8 || hour >= 16)) status = 'Fechado';
      else if (stock.id === 'nasdaq' && (hour < 9 || hour >= 16)) status = 'Fechado';
    }

    const high = Math.max(stock.high, price);
    const low = Math.min(stock.low, price);

    return {
      ...stock,
      price,
      change,
      changePercent,
      topMovers: updatedMovers,
      status,
      high,
      low,
      lastUpdated: getFullFormattedDate()
    };
  });
}

