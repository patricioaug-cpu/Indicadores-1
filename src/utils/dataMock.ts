/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ONSTelemetry,
  ANEELTariff,
  DatacenterMetric
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
