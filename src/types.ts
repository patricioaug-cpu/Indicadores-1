/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Types for ONS Telemetry
export interface ONSTelemetry {
  instantaneousLoadMW: number;
  peakLoadTodayMW: number;
  gridStabilityReserveMW: number;
  gridStabilityPercent: number;
  generationSources: {
    source: string;
    percentage: number;
    capacityFactor: number; // 0 to 1
    currentMW: number;
    isRenewable: boolean;
  }[];
  regionalConsumption: {
    region: string;
    consumptionMW: number;
    percentageOfTotal: number;
  }[];
  lastUpdated: string;
}

// Types for ANEEL Tariff Monitor
export interface ANEELTariff {
  activeFlag: 'Verde' | 'Amarela' | 'Vermelha 1' | 'Vermelha 2' | 'Escassez Hídrica';
  incrementalCostR_kWh: number;
  monthlyImpactByProfile: {
    profile: string;
    avgConsumptionKWh: string;
    costImpactR: number;
  }[];
  historicalFlags: {
    month: string;
    flag: string;
    cost: number;
  }[];
  tariffRiskIndex: number; // 0 to 100%
  hydrologicalSituation: string; // descriptive
  lastUpdated: string;
}

// Global Datacenter Metrics
export interface DatacenterMetric {
  region: string;
  totalDatacenters: number;
  avgPUE: number;
  operationalPowerGW: number;
  cleanEnergyPercentage: number;
  coolingTech: string;
}
