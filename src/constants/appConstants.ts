export const UNIDADES_DISPONIVEIS = ['50', '94', '300', '350', '550', '590', '991', '994', '1100', '1250', '1500', '1800', '2500', '2650', '2900', '5200'];

export const CD_NAMES: Record<string, string> = {
  '50': '50 - Ribeirão Preto - SP',
  '94': '94 - Londrina - PR',
  '300': '300 - Louveira - SP',
  '350': '350 - Contagem - MG',
  '550': '550 - Itajaí - SC',
  '590': '590 - Guarulhos - SP',
  '991': '991 - Alhandra - PB',
  '994': '994 - Maracanau - CE',
  '1100': '1100 - Hidrolandia - GO',
  '1250': '1250 - Teresina - PI',
  '1500': '1500 - Candeias - BA',
  '1800': '1800 - Cuiabá - MT',
  '2500': '2500 - Duque de Caxias - RJ',
  '2650': '2650 - Benevides - PA',
  '2900': '2900 - Araucária - PR',
  '5200': '5200 - Gravataí - RS'
};

export const CD_REGIONS: Record<string, { divisional: string, divisao: string }> = {
  '50': { divisional: 'Nesello', divisao: 'SP' },
  '94': { divisional: 'Christian', divisao: 'Sul / Sudeste' },
  '300': { divisional: 'Nesello', divisao: 'SP' },
  '350': { divisional: 'Christian', divisao: 'Sul / Sudeste' },
  '550': { divisional: 'Christian', divisao: 'Sul / Sudeste' },
  '590': { divisional: 'Nesello', divisao: 'SP' },
  '991': { divisional: 'Paiva', divisao: 'NE/NO/CO' },
  '994': { divisional: 'Paiva', divisao: 'NE/NO/CO' },
  '1100': { divisional: 'Paiva', divisao: 'NE/NO/CO' },
  '1250': { divisional: 'Paiva', divisao: 'NE/NO/CO' },
  '1500': { divisional: 'Paiva', divisao: 'NE/NO/CO' },
  '1800': { divisional: 'Paiva', divisao: 'NE/NO/CO' },
  '2500': { divisional: 'Christian', divisao: 'Sul / Sudeste' },
  '2650': { divisional: 'Paiva', divisao: 'NE/NO/CO' },
  '2900': { divisional: 'Christian', divisao: 'Sul / Sudeste' },
  '5200': { divisional: 'Christian', divisao: 'Sul / Sudeste' }
};

export const PILAR_ORDER = ['Pessoas', 'Segurança', 'Sustentabilidade', 'Cliente', 'Gestão', 'Armazém'];
export const BLOCO_ORDER = [
  'Reconhecimento', 'Carreira', 'Desenvolvimento', 'Clima', 'Retenção', 'Atração', 'Cultura', 'Diversidade',
  'Gestão de Acidente', 'Ergonomia', 'Gestão de Fornecedores', 'Segurança Sanitária', 'PAE', 'Manutenção', 'Saúde', 'Gestão Meio Ambiente', 'Comportamento Seguro',
  'Prazo', 'Gestão do Transportador', 'Encantamento', 'Experiência do Cliente',
  'Maga Lean', 'Resolução de problema', 'Kaizen', 'Conselho', '5S', 'Agenda da Rotina',
  'Recebimento', 'Acuracidade', 'Expedição Leves', 'Expedição Pesado', 'Intralogística'
];

import { Mic, Sliders, Users, FileText, Award, RefreshCw, BarChart, Settings, Shield, Package, ShoppingCart, Leaf } from 'lucide-react';

export const dashboardData = [
  { title: 'Pessoas', icon: Users, color: 'bg-[#7b52ab]', objetivo: 60, autoAuditoria: 72, autoColor: 'bg-[#22a06b]', oficial: 67, oficialColor: 'bg-[#22a06b]', dispersao: 5, dispersaoType: 'down' },
  { title: 'Gestão', icon: Settings, color: 'bg-[#2684ff]', objetivo: 58, autoAuditoria: 54, autoColor: 'bg-[#e34935]', oficial: 53, oficialColor: 'bg-[#e34935]', dispersao: 1, dispersaoType: 'up' },
  { title: 'Segurança', icon: Shield, color: 'bg-[#4a545e]', objetivo: 70, autoAuditoria: 67, autoColor: 'bg-[#e34935]', oficial: 65, oficialColor: 'bg-[#e34935]', dispersao: 2, dispersaoType: 'up' },
  { title: 'Armazém', icon: Package, color: 'bg-[#ff8b00]', objetivo: 60, autoAuditoria: 62, autoColor: 'bg-[#22a06b]', oficial: 58, oficialColor: 'bg-[#e34935]', dispersao: 4, dispersaoType: 'down' },
  { title: 'Clientes', icon: ShoppingCart, color: 'bg-[#00b8d9]', objetivo: 80, autoAuditoria: 82, autoColor: 'bg-[#22a06b]', oficial: 83, oficialColor: 'bg-[#22a06b]', dispersao: 1, dispersaoType: 'up' },
  { title: 'Sustentabilidade', icon: Leaf, color: 'bg-[#36b37e]', objetivo: 55, autoAuditoria: 57, autoColor: 'bg-[#22a06b]', oficial: 56, oficialColor: 'bg-[#22a06b]', dispersao: 1, dispersaoType: 'up' },
];

export const EVIDENCE_CATEGORIES = [
  { id: 'entrevistas', label: 'Entrevistas em campo', icon: Mic, bg: 'bg-pink-500' },
  { id: 'controles', label: 'Controles', icon: Sliders, bg: 'bg-orange-500' },
  { id: 'reunioes', label: 'Reuniões', icon: Users, bg: 'bg-purple-600' },
  { id: 'documentos', label: 'Documentos', icon: FileText, bg: 'bg-blue-500' },
  { id: 'treinamentos', label: 'Evidências de treinamentos em padrões', icon: Award, bg: 'bg-yellow-500' },
  { id: 'plano_acao', label: 'Plano de ação para desvios de KPIs críticos', icon: RefreshCw, bg: 'bg-blue-600' },
  { id: 'gestao_vista', label: 'Gestão à vista', icon: BarChart, bg: 'bg-green-600' },
];
