/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ONSTelemetry,
  ANEELTariff,
  DatacenterMetric,
  StockExchangeData,
  SinapiItem
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

export function getCurrentSinapiReference(dateString?: string): string {
  if (dateString) {
    const [datePart] = dateString.split('-');
    if (datePart) {
      const parts = datePart.trim().split('/');
      if (parts.length === 3) {
        return `${parts[1]}/${parts[2]}`;
      }
    }
  }
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${month}/${year}`;
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

// Initial SINAPI Reference Items
export const initialSinapiItems: SinapiItem[] = [
  {
    id: 's1',
    code: '91854',
    description: 'Eletroduto rígido roscável, PVC, DN 25 mm (3/4"), instalado em laje ou parede - Fornecimento e Instalação',
    category: 'Composição',
    unit: 'M',
    basePriceSP: 18.52,
    specification: 'NBR 15465. Inclui eletroduto de PVC rígido, conexões, guias de tração e mão de obra para passagens em estruturas.',
    components: [
      { code: '00002688', name: 'Eletroduto PVC rígido de 3/4" roscável', quantity: 1.05, unit: 'M', totalCost: 5.25, type: 'Material' },
      { code: '88264', name: 'Mão de obra de Eletricista com encargos', quantity: 0.25, unit: 'H', totalCost: 7.12, type: 'Mão de Obra' },
      { code: '88247', name: 'Mão de obra de Auxiliar de eletricista com encargos', quantity: 0.25, unit: 'H', totalCost: 5.52, type: 'Mão de Obra' },
      { code: '00000388', name: 'Acessórios, luvas e conexões roscáveis', quantity: 1.0, unit: 'UN', totalCost: 0.63, type: 'Material' }
    ]
  },
  {
    id: 's2',
    code: '101616',
    description: 'Disjuntor termomagnético tripolar padrão DIN (curva C), 25A a 50A, 10kA de interrupção - Fornecimento e Instalação',
    category: 'Composição',
    unit: 'UN',
    basePriceSP: 148.90,
    specification: 'NBR IEC 60898. Atende proteção de circuitos alimentadores trifásicos de TI, nobreaks e HVAC de médio porte.',
    components: [
      { code: '00038104', name: 'Disjuntor termomagnético tripolar DIN 32A curva C', quantity: 1.0, unit: 'UN', totalCost: 115.00, type: 'Material' },
      { code: '88264', name: 'Mão de obra de Eletricista com encargos', quantity: 0.70, unit: 'H', totalCost: 19.95, type: 'Mão de Obra' },
      { code: '88247', name: 'Mão de obra de Auxiliar de Eletricista com encargos', quantity: 0.60, unit: 'H', totalCost: 13.26, type: 'Mão de Obra' },
      { code: '00001575', name: 'Terminais de compressão de cobre estanhado 10mm²', quantity: 3.0, unit: 'UN', totalCost: 0.69, type: 'Material' }
    ]
  },
  {
    id: 's3',
    code: '101614',
    description: 'Disjuntor termomagnético monopolar padrão DIN (curva C), 16A a 25A, 5kA de interrupção - Fornecimento e Instalação',
    category: 'Composição',
    unit: 'UN',
    basePriceSP: 36.40,
    specification: 'NBR IEC 60898. Proteção contra sobrecargas e curtos-circuitos em circuitos terminais de iluminação e tomadas.',
    components: [
      { code: '00038101', name: 'Disjuntor monopolar padrão DIN 20A curva C', quantity: 1.0, unit: 'UN', totalCost: 18.20, type: 'Material' },
      { code: '88264', name: 'Mão de obra de Eletricista com encargos', quantity: 0.35, unit: 'H', totalCost: 9.98, type: 'Mão de Obra' },
      { code: '88247', name: 'Mão de obra de Auxiliar de eletricista com encargos', quantity: 0.35, unit: 'H', totalCost: 7.74, type: 'Mão de Obra' },
      { code: '00001573', name: 'Terminal pré-isolado tubular tipo ilhós 2.5mm²', quantity: 2.0, unit: 'UN', totalCost: 0.48, type: 'Material' }
    ]
  },
  {
    id: 's4',
    code: '92984',
    description: 'Cabo de cobre flexível isolado, 6 mm², anti-chama 450/750V, instalado em conduto fixo - Sem conexões adicionais',
    category: 'Material',
    unit: 'M',
    basePriceSP: 6.84,
    specification: 'Condutor de cobre eletrolítico, isolação em PVC antichama (BWF). NBR NM 247-3.'
  },
  {
    id: 's5',
    code: '92982',
    description: 'Cabo de cobre flexível isolado, 2.5 mm², anti-chama 450/750V, para circuitos terminais de força e luz',
    category: 'Material',
    unit: 'M',
    basePriceSP: 2.95,
    specification: 'Condutor flexível de cobre eletrolítico têmpera mole, classe 5. NBR NM 247-3.'
  },
  {
    id: 's6',
    code: '92986',
    description: 'Cabo de cobre flexível isolado, 16 mm², 0.6/1kV, isolação HEPR/XLPE 90°C para alimentadores',
    category: 'Material',
    unit: 'M',
    basePriceSP: 18.40,
    specification: 'Condutor de cobre para alimentadores primários e subestações internas. Baixa emissão de fumaça e livre de halogênios.'
  },
  {
    id: 's7',
    code: '92990',
    description: 'Cabo de cobre unipolar flexível, 50 mm², 0.6/1kV, para prumadas elétricas e quadros gerais',
    category: 'Material',
    unit: 'M',
    basePriceSP: 54.80,
    specification: 'Alimentador principal de quadros gerais de baixa tensão (QGBT) e geradores de emergência. NBR 7286.'
  },
  {
    id: 's8',
    code: '88264',
    description: 'Eletricista com encargos complementares (Horista de instalações gerais)',
    category: 'Mão de Obra',
    unit: 'H',
    basePriceSP: 28.50,
    specification: 'Salário base da categoria acrescido de encargos sociais (desonerado/não-desonerado) e EPIs regulamentares.'
  },
  {
    id: 's9',
    code: '88247',
    description: 'Auxiliar de eletricista com encargos complementares',
    category: 'Mão de Obra',
    unit: 'H',
    basePriceSP: 22.10,
    specification: 'Encargos complementares de alimentação, transporte, exames e EPIs incluídos conforme convenções vigentes.'
  },
  {
    id: 's10',
    code: '88316',
    description: 'Servente com encargos complementares',
    category: 'Mão de Obra',
    unit: 'H',
    basePriceSP: 19.80,
    specification: 'Mão de obra geral de suporte, transporte interno de materiais e limpeza de frentes de trabalho.'
  },
  {
    id: 's11',
    code: '88309',
    description: 'Pedreiro com encargos complementares',
    category: 'Mão de Obra',
    unit: 'H',
    basePriceSP: 27.60,
    specification: 'Mão de obra especializada em alvenaria estrutural, regularizações de piso, chumbamentos e bases de concreto.'
  },
  {
    id: 's12',
    code: '88262',
    description: 'Carpinteiro de formas com encargos complementares',
    category: 'Mão de Obra',
    unit: 'H',
    basePriceSP: 27.80,
    specification: 'Execução de fôrmas de madeira, escoramentos e gabaritos de nivelamento para elementos estruturais de concreto.'
  },
  {
    id: 's13',
    code: '98546',
    description: 'Leito para cabos em chapa de aço galvanizada, tipo leve, 200x50 mm, instalado em teto de galpão corporativo',
    category: 'Composição',
    unit: 'M',
    basePriceSP: 124.70,
    specification: 'Chapa de aço galvanizado #18. Inclui suportação metálica com perfilados de ancoragem a cada 1.5 metros.',
    components: [
      { code: '00039201', name: 'Leito metálico galvanizado a fogo 200x50mm com travessas', quantity: 1.02, unit: 'M', totalCost: 74.20, type: 'Material' },
      { code: '00039210', name: 'Perfilado de aço galvanizado perfurado 38x38mm', quantity: 0.90, unit: 'M', totalCost: 14.80, type: 'Material' },
      { code: '88264', name: 'Mão de obra de Eletricista com encargos', quantity: 0.80, unit: 'H', totalCost: 22.80, type: 'Mão de Obra' },
      { code: '00039215', name: 'Elementos de parafusação, emendas e tirantes roscados 3/8"', quantity: 1.0, unit: 'CJ', totalCost: 12.90, type: 'Material' }
    ]
  },
  {
    id: 's14',
    code: '100558',
    description: 'Eletrocalha perfurada galvanizada, 100x50 mm, suspensa por tirantes - Fornecimento e Instalação',
    category: 'Composição',
    unit: 'M',
    basePriceSP: 68.30,
    specification: 'NBR 11888. Distribuição de cabos de redes, fibra óptica e alimentação de servidores em ambiente técnico.',
    components: [
      { code: '00039301', name: 'Eletrocalha metálica galvanizada perfurada 100x50mm', quantity: 1.05, unit: 'M', totalCost: 34.50, type: 'Material' },
      { code: '00039305', name: 'Tirante roscado galvanizado 1/4" com porcas e arruelas', quantity: 1.20, unit: 'M', totalCost: 6.80, type: 'Material' },
      { code: '88264', name: 'Mão de obra de Eletricista com encargos', quantity: 0.50, unit: 'H', totalCost: 14.25, type: 'Mão de Obra' },
      { code: '88247', name: 'Mão de obra de Auxiliar de Eletricista com encargos', quantity: 0.40, unit: 'H', totalCost: 8.84, type: 'Mão de Obra' },
      { code: '00039310', name: 'Emendas tipo tala e parafusos sextavados lentilha', quantity: 1.0, unit: 'CJ', totalCost: 3.91, type: 'Material' }
    ]
  },
  {
    id: 's15',
    code: '92802',
    description: 'Concreto usinado bombeável, fck = 30 MPa, lançado e adensado em lajes e pisos estruturais',
    category: 'Material',
    unit: 'M³',
    basePriceSP: 418.00,
    specification: 'NBR 7212. Rigoroso controle tecnológico com caminhão betoneira e serviço de bomba lança em obra.'
  },
  {
    id: 's16',
    code: '94970',
    description: 'Concreto fck 20 MPa, preparo manual com betoneira de 400L, aplicado em fundações e sapatas técnicas',
    category: 'Composição',
    unit: 'M³',
    basePriceSP: 345.50,
    specification: 'Preparo mecânico de concreto na própria obra. Dosagem experimental estrutural para base de geradores e postes.',
    components: [
      { code: '00001379', name: 'Cimento Portland composto CP II-E-32', quantity: 348.0, unit: 'KG', totalCost: 187.92, type: 'Material' },
      { code: '00000370', name: 'Areia média lavada para concreto', quantity: 0.68, unit: 'M³', totalCost: 61.20, type: 'Material' },
      { code: '00004721', name: 'Brita graduada nº 1 (9.5 a 19 mm)', quantity: 0.76, unit: 'M³', totalCost: 57.00, type: 'Material' },
      { code: '88316', name: 'Mão de obra de Servente com encargos', quantity: 1.40, unit: 'H', totalCost: 27.72, type: 'Mão de Obra' },
      { code: '00010537', name: 'Operação de Betoneira 400 litros', quantity: 0.35, unit: 'H', totalCost: 11.66, type: 'Equipamento' }
    ]
  },
  {
    id: 's17',
    code: '93181',
    description: 'Aplicação de manta asfáltica elastomérica 3 mm para impermeabilização de laje técnica descoberta',
    category: 'Composição',
    unit: 'M²',
    basePriceSP: 89.20,
    specification: 'NBR 9952. Inclui demão de primer asfáltico frio e sobreposição selada por maçarico a gás liquefeito.',
    components: [
      { code: '00004012', name: 'Manta asfáltica SBS elastomérica 3mm tipo III', quantity: 1.15, unit: 'M²', totalCost: 45.10, type: 'Material' },
      { code: '00004015', name: 'Primer asfáltico secagem rápida base solvente', quantity: 0.40, unit: 'L', totalCost: 8.90, type: 'Material' },
      { code: '88310', name: 'Mão de obra de Aplicador impermeabilizador com encargos', quantity: 0.80, unit: 'H', totalCost: 24.20, type: 'Mão de Obra' },
      { code: '00003010', name: 'Gás GLP para operação de maçarico', quantity: 0.15, unit: 'KG', totalCost: 11.00, type: 'Material' }
    ]
  },
  {
    id: 's18',
    code: '102486',
    description: 'Aparelho de ar condicionado Split High Wall inversor de frequência, capacidade 12000 BTU/h - Somente equipamento',
    category: 'Material',
    unit: 'UN',
    basePriceSP: 1890.00,
    specification: 'Eficiência energética Procel Classe A. Serpentina em cobre, gás refrigerante R32/R410A de baixo impacto ambiental.'
  },
  {
    id: 's19',
    code: '91871',
    description: 'Caixa de embutir plástica 4"x2" para interruptores e tomadas - Fornecimento e Instalação',
    category: 'Composição',
    unit: 'UN',
    basePriceSP: 11.45,
    specification: 'Caixa termoplástica antichama amarela para alvenaria ou drywall, padrão NBR 5410.',
    components: [
      { code: '00002685', name: 'Caixa embutir PVC 4x2 retangular', quantity: 1.0, unit: 'UN', totalCost: 2.10, type: 'Material' },
      { code: '88264', name: 'Mão de obra de Eletricista com encargos', quantity: 0.15, unit: 'H', totalCost: 4.28, type: 'Mão de Obra' },
      { code: '88247', name: 'Mão de obra de Auxiliar de eletricista com encargos', quantity: 0.15, unit: 'H', totalCost: 3.32, type: 'Mão de Obra' },
      { code: '00004050', name: 'Argamassa colante para chumbamento e fixação', quantity: 0.50, unit: 'KG', totalCost: 1.75, type: 'Material' }
    ]
  },
  {
    id: 's20',
    code: '96985',
    description: 'Haste de aterramento aço cobreado 5/8" x 2,40 m com solda exotérmica e caixa de inspeção',
    category: 'Composição',
    unit: 'UN',
    basePriceSP: 215.80,
    specification: 'NBR 5419 / NBR 5410. Proteção contra descargas atmosféricas e aterramento de equipotencialização de CPD.',
    components: [
      { code: '00003385', name: 'Haste de aterramento de aço revestida de cobre 5/8" x 2.40m', quantity: 1.0, unit: 'UN', totalCost: 98.50, type: 'Material' },
      { code: '00003390', name: 'Cartucho de solda exotérmica com molde e disco metálico', quantity: 1.0, unit: 'UN', totalCost: 42.00, type: 'Material' },
      { code: '00003395', name: 'Caixa de inspeção cilíndrica de solo em PVC/polietileno DN 300mm', quantity: 1.0, unit: 'UN', totalCost: 32.50, type: 'Material' },
      { code: '88264', name: 'Mão de obra de Eletricista com encargos', quantity: 0.90, unit: 'H', totalCost: 25.65, type: 'Mão de Obra' },
      { code: '88316', name: 'Mão de obra de Servente com encargos', quantity: 0.85, unit: 'H', totalCost: 17.15, type: 'Mão de Obra' }
    ]
  },
  {
    id: 's21',
    code: '101877',
    description: 'Quadro de distribuição de energia de embutir em chapa de aço, para até 24 disjuntores DIN, com barramentos',
    category: 'Composição',
    unit: 'UN',
    basePriceSP: 385.00,
    specification: 'Quadro metálico com pintura eletrostática a pó e porta com fecho. Acompanha barramentos de cobre pente neutro e terra.',
    components: [
      { code: '00038205', name: 'Quadro de distribuição metálico embutir para 24 disjuntores DIN', quantity: 1.0, unit: 'UN', totalCost: 210.00, type: 'Material' },
      { code: '00038210', name: 'Barramento de cobre eletrolítico tipo pente trifásico 80A', quantity: 1.0, unit: 'UN', totalCost: 58.00, type: 'Material' },
      { code: '88264', name: 'Mão de obra de Eletricista com encargos', quantity: 2.50, unit: 'H', totalCost: 71.25, type: 'Mão de Obra' },
      { code: '88247', name: 'Mão de obra de Auxiliar de Eletricista com encargos', quantity: 2.00, unit: 'H', totalCost: 44.20, type: 'Mão de Obra' },
      { code: '00001570', name: 'Acessórios, bornes de neutro/terra e parafusos de fixação', quantity: 1.0, unit: 'CJ', totalCost: 1.55, type: 'Material' }
    ]
  },
  {
    id: 's22',
    code: '92210',
    description: 'Brita graduada simples para sub-base de pavimentos técnicos e drenagem de pátios de subestação',
    category: 'Material',
    unit: 'M³',
    basePriceSP: 115.00,
    specification: 'Mistura produzida em usina contendo distribuições de pedra 1, pedra 2, pó de pedra e pedrisco fino.'
  },
  {
    id: 's23',
    code: '98457',
    description: 'Piso elevado em placas de aço 60x60 cm preenchidas com concreto celular leve para sala técnica/CPD',
    category: 'Composição',
    unit: 'M²',
    basePriceSP: 245.00,
    specification: 'Carga concentrada mínima de 450 kg. Permite passagem subterrânea organizada de infraestrutura de dados e energia.',
    components: [
      { code: '00041001', name: 'Placa de piso elevado em aço/concreto 60x60cm sem revestimento', quantity: 2.78, unit: 'UN', totalCost: 158.46, type: 'Material' },
      { code: '00041005', name: 'Pedestal metálico telescópico com cruzeta regulável h=20 a 35cm', quantity: 3.10, unit: 'UN', totalCost: 40.30, type: 'Material' },
      { code: '88309', name: 'Mão de obra de Pedreiro instalador com encargos', quantity: 0.85, unit: 'H', totalCost: 23.46, type: 'Mão de Obra' },
      { code: '88316', name: 'Mão de obra de Servente com encargos', quantity: 0.85, unit: 'H', totalCost: 16.83, type: 'Mão de Obra' },
      { code: '00041010', name: 'Adesivo epóxi para ancoragem de pedestais no piso de concreto', quantity: 0.15, unit: 'KG', totalCost: 5.95, type: 'Material' }
    ]
  },
  {
    id: 's24',
    code: '103324',
    description: 'Rack padrão 19 polegadas fechado, 42U x 1000 mm, para servidores e switches com PDU vertical',
    category: 'Composição',
    unit: 'UN',
    basePriceSP: 4320.00,
    specification: 'Estrutura monobloco soldada em aço SAE 1010/1020, portas perfuradas tipo colmeia com ventilação 70%, fechadura com chave.',
    components: [
      { code: '00043001', name: 'Rack 19" 42U x 1000mm com rodízios e pés niveladores', quantity: 1.0, unit: 'UN', totalCost: 3250.00, type: 'Material' },
      { code: '00043010', name: 'Calha de tomadas vertical PDU com 16 saídas C13 e disjuntor', quantity: 1.0, unit: 'UN', totalCost: 650.00, type: 'Material' },
      { code: '88264', name: 'Mão de obra de Eletricista montador com encargos', quantity: 5.0, unit: 'H', totalCost: 142.50, type: 'Mão de Obra' },
      { code: '88247', name: 'Mão de obra de Auxiliar com encargos', quantity: 5.0, unit: 'H', totalCost: 110.50, type: 'Mão de Obra' },
      { code: '00043020', name: 'Kit porcas gaiola M6 e parafusos de fixação de equipamentos (50 un)', quantity: 2.0, unit: 'CJ', totalCost: 167.00, type: 'Material' }
    ]
  },
  {
    id: 's25',
    code: '96660',
    description: 'Ponto de cabeamento estruturado horizontal com cabo par trançado U/UTP Cat6 em eletrocalha',
    category: 'Composição',
    unit: 'PT',
    basePriceSP: 185.00,
    specification: 'ANSI/TIA-568.2-D e ISO/IEC 11801. Inclui conector fêmea RJ45 Keystone Cat6, espelho 4x2 e identificação com anilhas.',
    components: [
      { code: '00044001', name: 'Cabo U/UTP Cat6 4 pares 23AWG LSZH azul', quantity: 35.0, unit: 'M', totalCost: 94.50, type: 'Material' },
      { code: '00044010', name: 'Conector fêmea modular Keystone Jack RJ-45 Cat6', quantity: 1.0, unit: 'UN', totalCost: 16.20, type: 'Material' },
      { code: '00044015', name: 'Patch cord Cat6 2.5m homologado Anatel', quantity: 1.0, unit: 'UN', totalCost: 14.80, type: 'Material' },
      { code: '88264', name: 'Mão de obra de Técnico de cabeamento / Eletricista com encargos', quantity: 1.50, unit: 'H', totalCost: 42.75, type: 'Mão de Obra' },
      { code: '88247', name: 'Mão de obra de Auxiliar com encargos', quantity: 0.75, unit: 'H', totalCost: 16.58, type: 'Mão de Obra' },
      { code: '00044020', name: 'Etiquetas e anilhas de identificação de rede', quantity: 1.0, unit: 'CJ', totalCost: 0.17, type: 'Material' }
    ]
  },
  {
    id: 's26',
    code: '98462',
    description: 'Pintura com tinta epóxi bicomponente para piso de concreto industrial em ambiente de datacenter',
    category: 'Composição',
    unit: 'M²',
    basePriceSP: 58.40,
    specification: 'Alta resistência química e mecânica, acabamento liso e antiestático para fácil assepsia em piso técnico.',
    components: [
      { code: '00045001', name: 'Tinta epóxi de acabamento acetinada bicomponente', quantity: 0.35, unit: 'L', totalCost: 26.25, type: 'Material' },
      { code: '00045005', name: 'Primer epóxi promotor de aderência selador', quantity: 0.20, unit: 'L', totalCost: 11.40, type: 'Material' },
      { code: '88310', name: 'Mão de obra de Pintor especializado com encargos', quantity: 0.45, unit: 'H', totalCost: 12.87, type: 'Mão de Obra' },
      { code: '88316', name: 'Mão de obra de Servente com encargos', quantity: 0.40, unit: 'H', totalCost: 7.92, type: 'Mão de Obra' }
    ]
  },
  {
    id: 's27',
    code: '93358',
    description: 'Escavação manual de vala para assentamento de eletrodutos subterrâneos de energia até 1.5m',
    category: 'Composição',
    unit: 'M³',
    basePriceSP: 52.80,
    specification: 'Escavação a céu aberto em solo de primeira categoria, com descarte e regularização de fundo de vala.',
    components: [
      { code: '88316', name: 'Mão de obra de Servente com encargos', quantity: 2.65, unit: 'H', totalCost: 52.47, type: 'Mão de Obra' },
      { code: '00046001', name: 'Ferramental manual (pás, picaretas e carrinhos)', quantity: 1.0, unit: 'UN', totalCost: 0.33, type: 'Material' }
    ]
  },
  {
    id: 's28',
    code: '90777',
    description: 'Alvenaria de vedação de blocos cerâmicos ou concreto 14x19x39 cm com argamassa mista',
    category: 'Composição',
    unit: 'M²',
    basePriceSP: 74.30,
    specification: 'NBR 15270. Juntas horizontais e verticais de 10mm com argamassa mista de cimento, cal e areia traço 1:2:8.',
    components: [
      { code: '00000684', name: 'Bloco de concreto estrutural vazado 14x19x39cm', quantity: 13.5, unit: 'UN', totalCost: 37.80, type: 'Material' },
      { code: '00037395', name: 'Argamassa mista de cimento, cal e areia média', quantity: 0.015, unit: 'M³', totalCost: 6.75, type: 'Material' },
      { code: '88309', name: 'Mão de obra de Pedreiro com encargos', quantity: 0.58, unit: 'H', totalCost: 16.01, type: 'Mão de Obra' },
      { code: '88316', name: 'Mão de obra de Servente com encargos', quantity: 0.69, unit: 'H', totalCost: 13.66, type: 'Mão de Obra' },
      { code: '00000380', name: 'Acessórios de tela de amarração metálica galvanizada', quantity: 1.0, unit: 'UN', totalCost: 0.08, type: 'Material' }
    ]
  }
];

// Roll SINAPI Items with realistic price fluctuations and delta indicators
export function rollSinapiData(items: SinapiItem[]): SinapiItem[] {
  return items.map((item, index) => {
    // Generate realistic variance between -2.2% and +2.5%
    const direction = (index % 3 === 0) ? -1 : 1;
    const magnitude = 0.4 + (Math.random() * 2.1);
    const driftPct = Number((direction * magnitude).toFixed(2));
    const factor = 1 + (driftPct / 100);

    const oldPrice = item.basePriceSP;
    const newBasePrice = Number((oldPrice * factor).toFixed(2));
    const actualChange = Number((((newBasePrice - oldPrice) / oldPrice) * 100).toFixed(2));

    // Also adjust composition components proportionally
    const updatedComponents = item.components?.map(comp => ({
      ...comp,
      totalCost: Number((comp.totalCost * factor).toFixed(2))
    }));

    return {
      ...item,
      previousPriceSP: oldPrice,
      basePriceSP: newBasePrice,
      changePercent: actualChange,
      components: updatedComponents
    };
  });
}

// Diffs generator to make clicking "Atualizar Dados" update all application metrics
export function rollTheDiceAndCalculateUpdates(
  currentUSD_BRL: number,
  ons: ONSTelemetry,
  aneel: ANEELTariff,
  datacenters?: DatacenterMetric[],
  sinapiItems?: SinapiItem[]
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

  // 4. Datacenters metrics updates
  const baseDatacenters = datacenters || initialDatacenters;
  const updatedDatacenters = baseDatacenters.map(dc => {
    const pueDrift = (Math.random() - 0.5) * 0.02;
    const avgPUE = Number(Math.max(1.10, Math.min(2.0, dc.avgPUE + pueDrift)).toFixed(2));
    const pwrDrift = (Math.random() - 0.5) * 0.2;
    const operationalPowerGW = Number(Math.max(0.5, dc.operationalPowerGW + pwrDrift).toFixed(1));
    const cleanDrift = (Math.random() - 0.5) * 0.8;
    const cleanEnergyPercentage = Number(Math.max(20, Math.min(100, dc.cleanEnergyPercentage + cleanDrift)).toFixed(1));
    return {
      ...dc,
      avgPUE,
      operationalPowerGW,
      cleanEnergyPercentage
    };
  });

  // 5. SINAPI items updates
  const baseSinapi = sinapiItems || initialSinapiItems;
  const updatedSinapiItems = rollSinapiData(baseSinapi);

  return {
    newUSDBRL,
    updatedONS,
    updatedANEEL,
    updatedDatacenters,
    updatedSinapiItems
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

