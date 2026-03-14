import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HardHat, LayoutDashboard, ListChecks, Check, Building, X, Plus, Save, Edit2,
  Users, Settings, Shield, Package, ShoppingCart, Leaf, ArrowUp, ArrowDown,
  LogOut, Mail, ShieldAlert, User as UserIcon, Bell, Sun, Moon, CheckCircle2, Circle, Database,
  Mic, Sliders, FileText, Award, RefreshCw, BarChart, Trash2, ChevronDown, ChevronRight, Lock, Trophy, Medal, Upload, PanelLeftClose, Menu, PlusCircle
} from "lucide-react";
import { ChecklistItem, INITIAL_CHECKLIST, Role, User, MOCK_USERS, AutoauditoriaItem, Autoauditoria } from "./data";
import { api } from "./api";
import logoImg from './assets/images/Logo.png';
import TrendChart from "./components/TrendChart";

const UNIDADES_DISPONIVEIS = ['50', '94', '300', '350', '550', '590', '991', '994', '1100', '1250', '1500', '1800', '2500', '2650', '2900', '5200'];

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

const PILAR_ORDER = ['Pessoas', 'Segurança', 'Sustentabilidade', 'Cliente', 'Gestão', 'Armazém'];
const BLOCO_ORDER = [
  'Reconhecimento', 'Carreira', 'Desenvolvimento', 'Clima', 'Retenção', 'Atração', 'Cultura', 'Diversidade',
  'Gestão de Acidente', 'Ergonomia', 'Gestão de Fornecedores', 'Segurança Sanitária', 'PAE', 'Manutenção', 'Saúde', 'Gestão Meio Ambiente', 'Comportamento Seguro',
  'Prazo', 'Gestão do Transportador', 'Encantamento', 'Experiência do Cliente',
  'Maga Lean', 'Resolução de problema', 'Kaizen', 'Conselho', '5S', 'Agenda da Rotina',
  'Recebimento', 'Acuracidade', 'Expedição Leves', 'Expedição Pesado', 'Intralogística'
];

const getPilarWeight = (pilar: string) => {
  const idx = PILAR_ORDER.indexOf(pilar);
  return idx === -1 ? 999 : idx;
};

const getBlocoWeight = (bloco: string) => {
  const idx = BLOCO_ORDER.indexOf(bloco);
  return idx === -1 ? 999 : idx;
};

const LogoIconSVG = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
    <defs>
      <linearGradient id="logoIconGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FACC15" />
        <stop offset="50%" stopColor="#FB923C" />
        <stop offset="100%" stopColor="#FB7185" />
      </linearGradient>
      <linearGradient id="logoIconGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A855F7" />
        <stop offset="33%" stopColor="#3B82F6" />
        <stop offset="66%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#22C55E" />
      </linearGradient>
      <linearGradient id="logoIconGradient3" x1="100%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#9333EA" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
    </defs>
    
    {/* Outer Arc (starts at left) */}
    <path
      d="M 12 50 A 38 38 0 1 1 35 83"
      stroke="url(#logoIconGradient1)"
      strokeWidth="8"
      strokeLinecap="round"
    />
    <circle cx="12" cy="50" r="4.5" fill="#FACC15" />

    {/* Middle Arc (starts at top) */}
    <path
      d="M 50 18 A 32 32 0 1 1 25 50"
      stroke="url(#logoIconGradient2)"
      strokeWidth="8"
      strokeLinecap="round"
    />
    <circle cx="50" cy="18" r="4.5" fill="#A855F7" />

    {/* Inner Arc (starts at bottom) */}
    <path
      d="M 50 82 A 25 25 0 1 1 73 50"
      stroke="url(#logoIconGradient3)"
      strokeWidth="8"
      strokeLinecap="round"
    />
    <circle cx="50" cy="82" r="4.5" fill="#9333EA" />

    {/* Center Eye */}
    <path
      d="M 55 35 A 15 15 0 0 1 70 50"
      stroke="#006CEE"
      strokeWidth="6"
      strokeLinecap="round"
      opacity="0.7"
    />
  </svg>
);
const MainLogo = ({ className = '', size = 'medium' }: { className?: string, size?: 'small' | 'medium' | 'large' }) => {
  const isSmall = size === 'small';
  const isLarge = size === 'large';
  
  return (
    <div className={`flex flex-col items-center justify-center ${className} select-none w-full px-4 ${isSmall ? 'h-12' : isLarge ? 'h-32' : 'h-20'}`}>
      <img 
        src={logoImg} 
        alt="Magalog Logo" 
        className={`w-full h-full object-contain transition-transform duration-300 hover:scale-105`}
      />
    </div>
  );
};






const TopMagalogLogo = ({ className = '' }: { className?: string }) => (
  <div className={`flex items-center gap-4 ${className} select-none`}>
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1">
        <span className="text-3xl sm:text-4xl font-black text-[#006CEE] tracking-tighter" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>Top</span>
        <div className="flex text-yellow-400 drop-shadow-sm" style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.3))' }}>
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex flex-col gap-[2px] mr-1.5 mt-1">
          <div className="w-5 h-[3px] bg-yellow-400 rounded-full" style={{ boxShadow: '0 0 4px rgba(250,204,21,0.6)' }}></div>
          <div className="w-5 h-[3px] bg-red-500 rounded-full" style={{ boxShadow: '0 0 4px rgba(239,68,68,0.6)' }}></div>
          <div className="w-5 h-[3px] bg-fuchsia-500 rounded-full" style={{ boxShadow: '0 0 4px rgba(217,70,239,0.6)' }}></div>
          <div className="w-5 h-[3px] bg-cyan-400 rounded-full" style={{ boxShadow: '0 0 4px rgba(34,211,238,0.6)' }}></div>
        </div>
        <span className="text-4xl sm:text-5xl font-black text-[#006CEE] pb-0.5 pt-1" style={{ fontFamily: 'Arial, Helvetica, sans-serif', textTransform: 'lowercase' }}>magalog</span>
      </div>
    </div>
    <div className="flex flex-col justify-center border-l-2 border-gray-300 dark:border-zinc-700 pl-3 sm:pl-4 h-full py-1">
      <span className="text-sm sm:text-base font-bold text-[#003865] dark:text-blue-300 leading-tight tracking-tight">Programa de</span>
      <span className="text-sm sm:text-base font-bold text-[#003865] dark:text-blue-300 leading-tight tracking-tight">Excelência</span>
    </div>
  </div>
);


const CustomTrophy = ({ className, gold = false, silver = false, bronze = false }: { className?: string, gold?: boolean, silver?: boolean, bronze?: boolean }) => {
  let mainColor = '#FACC15'; // Gold
  let borderHighlight = '#FEF08A';

  if (silver) {
    mainColor = '#CBD5E1';
    borderHighlight = '#F8FAFC';
  } else if (bronze) {
    mainColor = '#D97706';
    borderHighlight = '#FDE68A';
  }

  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Handles */}
      <path d="M 24 30 C 0 30 0 60 38 58" fill="none" stroke="#27272a" strokeWidth="9" strokeLinecap="round" />
      <path d="M 24 30 C 0 30 0 60 38 58" fill="none" stroke={mainColor} strokeWidth="4" strokeLinecap="round" />

      <path d="M 76 30 C 100 30 100 60 62 58" fill="none" stroke="#27272a" strokeWidth="9" strokeLinecap="round" />
      <path d="M 76 30 C 100 30 100 60 62 58" fill="none" stroke={mainColor} strokeWidth="4" strokeLinecap="round" />

      {/* Stem */}
      <rect x="42" y="65" width="16" height="15" fill={mainColor} stroke="#27272a" strokeWidth="5" strokeLinejoin="round" />

      {/* Lower Base */}
      <path d="M 30 85 L 70 85 L 70 95 L 30 95 Z" fill="#27272a" stroke="#27272a" strokeWidth="4" strokeLinejoin="round" />
      {/* Upper Base */}
      <path d="M 38 75 L 62 75 L 62 85 L 38 85 Z" fill="#3f3f46" stroke="#27272a" strokeWidth="4" strokeLinejoin="round" />

      {/* Bowl */}
      <path d="M 20 20 L 80 20 C 80 50 65 70 50 70 C 35 70 20 50 20 20 Z" fill={mainColor} stroke="#27272a" strokeWidth="5" strokeLinejoin="round" />

      {/* Highlight inside Bowl */}
      <path d="M 28 30 C 28 45 35 55 42 62" fill="none" stroke={borderHighlight} strokeWidth="4" strokeLinecap="round" />
      <circle cx="34" cy="53" r="2.5" fill={borderHighlight} />

      {/* Top Rim */}
      <line x1="18" y1="20" x2="82" y2="20" stroke="#27272a" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
};

const AutoauditoriaRow = React.memo(({
  item,
  canEdit,
  pontoValue,
  nossaAcaoValue,
  onPontoChange,
  onNossaAcaoChange,
  onNossaAcaoBlur,
  // Props novas inseridas
  unidade,
  mesAno,
  existingEvidenciaUrl
}: {
  item: ChecklistItem;
  canEdit: boolean;
  pontoValue: string;
  nossaAcaoValue: string;
  onPontoChange: (itemId: string, newPonto: string) => void;
  onNossaAcaoChange: (itemId: string, newAcao: string) => void;
  onNossaAcaoBlur: (itemId: string, finalAcao: string) => void;
  unidade: string;
  mesAno: string;
  existingEvidenciaUrl?: string; // Trazida do loadAutoauditoria
}) => {
  const [localNossaAcao, setLocalNossaAcao] = useState(nossaAcaoValue);
  const [isUploading, setIsUploading] = useState(false);
  const [evidenciaUrl, setEvidenciaUrl] = useState<string | undefined>(existingEvidenciaUrl);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync prop -> local state ONLY when parent value explicitly changes via polling or load
  useEffect(() => {
    setLocalNossaAcao(nossaAcaoValue);
  }, [nossaAcaoValue]);

  useEffect(() => {
    // Quando mudamos de filial ou mês, o item pai manda uma prop nova (com url nova ou undefined se não houver).
    // Atualiza o estado local independente de ser undefined para "limpar" a url do CD anterior.
    setEvidenciaUrl(existingEvidenciaUrl);
  }, [existingEvidenciaUrl]);

  const handleNossaAcaoChange = (val: string) => {
    setLocalNossaAcao(val);
    onNossaAcaoChange(item.id, val);
  };

  const handleNossaAcaoBlur = () => {
    if (localNossaAcao !== nossaAcaoValue) {
      onNossaAcaoBlur(item.id, localNossaAcao);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('unidade', unidade);
      formData.append('mesAno', mesAno);
      formData.append('pilar', item.pilar);
      formData.append('bloco', item.bloco);
      formData.append('pergunta', item.item);
      formData.append('baseItemId', item.id);

      const res = await api.uploadEvidenciaGoogleDrive(formData);
      if (res.success && res.url) {
        setEvidenciaUrl(res.url);
      }
    } catch (error) {
      console.error('Erro no upload da evidência:', error);
      alert('Falha ao enviar arquivo para o Google Drive. Verifique o console.');
    } finally {
      setIsUploading(false);
      // Limpa input
      e.target.value = '';
    }
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
      <td className="px-6 py-4 font-medium text-gray-900 dark:text-zinc-200">{item.pilar}</td>
      <td className="px-6 py-4">{item.bloco}</td>
      <td className="px-6 py-4">{item.trilha}</td>
      <td className="px-6 py-4">
        <div className="max-w-md" title={item.descricao || item.item}>{item.item}</div>
      </td>
      <td className="px-6 py-4">
        <select
          value={pontoValue}
          disabled={!canEdit}
          onChange={(e) => onPontoChange(item.id, e.target.value)}
          className={`border border-gray-200 dark:border-zinc-800 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${!canEdit ? 'opacity-70 cursor-not-allowed' : 'focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500'} ${pontoValue === '3'
            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
            : pontoValue === '1'
              ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30'
              : pontoValue === '0'
                ? 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border-red-300 dark:border-red-500/30'
                : 'bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white'
            }`}
        >
          <option value=""></option>
          <option value="1">1</option>
          <option value="3">3</option>
          <option value="0">0</option>
        </select>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all shadow-sm border ${
            localNossaAcao.trim() 
              ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-500/20' 
              : 'bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          {localNossaAcao.trim() ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ver/Editar Plano</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Adicionar Plano</span>
            </>
          )}
        </button>

        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-950/50">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Plano de Ação / Observações</h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">{item.pilar} {' > '} {item.bloco}</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">Item:</label>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-950 p-3 rounded-lg border border-gray-100 dark:border-zinc-800 italic">
                      "{item.item}"
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">Descrição Detalhada:</label>
                    <textarea
                      value={localNossaAcao}
                      onChange={(e) => handleNossaAcaoChange(e.target.value)}
                      onBlur={handleNossaAcaoBlur}
                      disabled={!canEdit}
                      placeholder={canEdit ? "Descreva detalhadamente a ação corretiva ou observação técnica..." : "Nenhum plano registrado."}
                      className={`w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white transition-all min-h-[150px] resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${!canEdit ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 flex justify-end">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all transform hover:scale-105 active:scale-95 text-sm"
                  >
                    Salvar e Fechar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col space-y-2">
          {evidenciaUrl && (
            <a
              href={evidenciaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center"
            >
              Ver Evidência Salva
            </a>
          )}
          <label className={`inline-flex items-center justify-center space-x-1 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-sm ${!canEdit || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800'}`}>
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Enviando...' : (evidenciaUrl ? 'Substituir' : 'Anexar')}</span>
            <input
              type="file"
              className="hidden"
              disabled={!canEdit || isUploading}
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </td>
    </tr>
  );
});

const DebouncedTextarea = ({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  rows = 2,
  disabled = false
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  disabled?: boolean;
}) => {
  const [localValue, setLocalValue] = useState(value);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [localValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onChange(newValue);
    }, 500);
  };

  return (
    <textarea
      ref={textareaRef}
      value={localValue}
      onChange={handleChange}
      onBlur={onBlur}
      placeholder={placeholder}
      className={`${className} overflow-hidden resize-none transition-[height] duration-200`}
      rows={rows}
      disabled={disabled}
      style={{ minHeight: `${rows * 1.5}rem` }}
    />
  );
};


const dashboardData = [
  { title: 'Pessoas', icon: Users, color: 'bg-[#7b52ab]', objetivo: 60, autoAuditoria: 72, autoColor: 'bg-[#22a06b]', oficial: 67, oficialColor: 'bg-[#22a06b]', dispersao: 5, dispersaoType: 'down' },
  { title: 'Gestão', icon: Settings, color: 'bg-[#2684ff]', objetivo: 58, autoAuditoria: 54, autoColor: 'bg-[#e34935]', oficial: 53, oficialColor: 'bg-[#e34935]', dispersao: 1, dispersaoType: 'up' },
  { title: 'Segurança', icon: Shield, color: 'bg-[#4a545e]', objetivo: 70, autoAuditoria: 67, autoColor: 'bg-[#e34935]', oficial: 65, oficialColor: 'bg-[#e34935]', dispersao: 2, dispersaoType: 'up' },
  { title: 'Armazém', icon: Package, color: 'bg-[#ff8b00]', objetivo: 60, autoAuditoria: 62, autoColor: 'bg-[#22a06b]', oficial: 58, oficialColor: 'bg-[#e34935]', dispersao: 4, dispersaoType: 'down' },
  { title: 'Clientes', icon: ShoppingCart, color: 'bg-[#00b8d9]', objetivo: 80, autoAuditoria: 82, autoColor: 'bg-[#22a06b]', oficial: 83, oficialColor: 'bg-[#22a06b]', dispersao: 1, dispersaoType: 'up' },
  { title: 'Sustentabilidade', icon: Leaf, color: 'bg-[#36b37e]', objetivo: 55, autoAuditoria: 57, autoColor: 'bg-[#22a06b]', oficial: 56, oficialColor: 'bg-[#22a06b]', dispersao: 1, dispersaoType: 'up' },
];

const getDueDateStatus = (prazo?: string) => {
  if (!prazo) return 'none';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Using UTC to avoid timezone issues with YYYY-MM-DD strings
  const [year, month, day] = prazo.split('-').map(Number);
  const dueDate = new Date(year, month - 1, day);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays <= 3) return 'approaching';
  return 'ok';
};

const EVIDENCE_CATEGORIES = [
  { id: 'entrevistas', label: 'Entrevistas em campo', icon: Mic, bg: 'bg-pink-500' },
  { id: 'controles', label: 'Controles', icon: Sliders, bg: 'bg-orange-500' },
  { id: 'reunioes', label: 'Reuniões', icon: Users, bg: 'bg-purple-600' },
  { id: 'documentos', label: 'Documentos', icon: FileText, bg: 'bg-blue-500' },
  { id: 'treinamentos', label: 'Evidências de treinamentos em padrões', icon: Award, bg: 'bg-yellow-500' },
  { id: 'plano_acao', label: 'Plano de ação para desvios de KPIs críticos', icon: RefreshCw, bg: 'bg-blue-600' },
  { id: 'gestao_vista', label: 'Gestão à vista', icon: BarChart, bg: 'bg-green-600' },
];

export default function App() {
  // --- ESTADOS DE AUTENTICAÇÃO ---
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('som_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loginEmail, setLoginEmail] = useState('admin@magalu.com');
  const [loginPassword, setLoginPassword] = useState('123');
  const [loginError, setLoginError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ESTADOS DO SISTEMA ---
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('som_theme') as 'dark' | 'light') || 'light');
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('som_activeTab') || 'home');
  const [selectedUnit, setSelectedUnit] = useState<string>(() => localStorage.getItem('som_selectedUnit') || 'Todas');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('som_sidebarCollapsed') === 'true');

  const isPrivileged = currentUser && ['ADMIN', 'AUDITOR', 'GERENTE_DIVISIONAL', 'DIRETORIA'].includes(currentUser.role);

  const [usersList, setUsersList] = useState<User[]>([]);
  const [baseItems, setBaseItems] = useState<ChecklistItem[]>([]);
  const [items, setItems] = useState<ChecklistItem[]>([]);

  // --- ESTADOS DO CHECKLIST ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ChecklistItem>>({ pilar: '', bloco: '', trilha: '', item: '', descricao: '', exigeEvidencia: false, ativo: true, nossaAcao: '' });

  // --- ESTADOS DA AUTOAUDITORIA ---
  const [autoauditoriaMesAno, setAutoauditoriaMesAno] = useState(() => {
    const d = new Date();
    const mes = d.toLocaleString('pt-BR', { month: 'long' });
    const ano = d.getFullYear();
    return `${mes.charAt(0).toUpperCase() + mes.slice(1)}-${ano}`;
  });
  const [autoauditoriaData, setAutoauditoriaData] = useState<Record<string, { score: string; nossaAcao: string; evidencias?: any[] }>>({});
  const [allAutoauditorias, setAllAutoauditorias] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedAutoauditoriaPilar, setSelectedAutoauditoriaPilar] = useState('Todos');
  const [selectedAutoauditoriaBloco, setSelectedAutoauditoriaBloco] = useState('Todos');
  const [isSavingAutoauditoria, setIsSavingAutoauditoria] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [expandedPilars, setExpandedPilars] = useState<Set<string>>(new Set());

  const togglePilarExpansion = (pilar: string) => {
    setExpandedPilars(prev => {
      const next = new Set(prev);
      if (next.has(pilar)) next.delete(pilar);
      else next.add(pilar);
      return next;
    });
  };

  // Deletar Pilar
  const [isDeletePilarModalOpen, setIsDeletePilarModalOpen] = useState(false);
  const [pilarToDelete, setPilarToDelete] = useState('');

  // --- ESTADOS DE TROCA DE SENHA ---
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');


  const [isDeletingPilar, setIsDeletingPilar] = useState(false);

  // Refs para rastrear edição local e evitar sobrescritas ou saves desnecessários do polling
  const isInitialLoad = useRef(true);
  const needsAutoauditoriaSave = useRef(false);
  const pendingAutoauditoriaEdits = useRef<Set<string>>(new Set());

  const loadAutoauditoria = async (unidade: string, mesAno: string, isPolling = false) => {
    try {
      if (!isPolling) {
        isInitialLoad.current = true;
        setAutoauditoriaData({});
      }
      const data = await api.getAutoauditoria(unidade, mesAno);
      if (data && data.items) {
        // Usa a função setState em formato callback para evitar sobrescrever a digitação atual do usuário
        setAutoauditoriaData(prevData => {
          const mappedData: Record<string, any> = { ...prevData };
          let hasChanges = false;
          data.items.forEach((item: AutoauditoriaItem) => {
            // Somente sobrescreve do banco se o usuário NÃO estiver editando este item ativamente 
            if (!pendingAutoauditoriaEdits.current.has(item.baseItemId)) {
              if (!mappedData[item.baseItemId] ||
                mappedData[item.baseItemId].score !== (item.score || '') ||
                mappedData[item.baseItemId].nossaAcao !== (item.nossaAcao || '')) {

                mappedData[item.baseItemId] = {
                  score: item.score || '',
                  nossaAcao: item.nossaAcao || '',
                  evidencias: item.evidencias || []
                };
                hasChanges = true;
              }
            }
          });
          // Otimização: Só retorna um novo objeto se houveram mudanças reais (evita re-renders desnecessários)
          return (hasChanges || !isPolling) ? mappedData : prevData;
        });
      } else if (!isPolling) {
        setAutoauditoriaData({});
      }

      if (!isPolling) setLastSavedTime(null);
    } catch (e) {
      console.error("Erro ao carregar autoauditoria:", e);
      if (!isPolling) setAutoauditoriaData({});
    } finally {
      if (!isPolling) {
        // Dá um tempo curto para a renderização estabilizar antes de liberar o flag
        setTimeout(() => {
          isInitialLoad.current = false;
        }, 500);
      }
    }
  };

  const currentAutoauditoriaUnit = selectedUnit;

  // Usa debounce no useEffect para ouvir alterações em autoauditoriaData e auto-salvar
  useEffect(() => {
    // Evita salvar no loop inicial ou se os combos globais estiverem num estado inválido
    if (isInitialLoad.current || !currentUser) return;
    if (Object.keys(autoauditoriaData).length === 0) return;
    if (currentAutoauditoriaUnit === 'Todas' || currentAutoauditoriaUnit === 'Master') return;

    // Verifica permissão (se não poderia sobrescrever dados quando não deve, apesar de bloqueios do UI)
    const canEdit = ['ADMIN', 'GERENTE_DO_CD', 'DONO_DO_PILAR'].includes(currentUser?.role || '') &&
      (currentUser?.role === 'ADMIN' || currentUser?.unidade === currentAutoauditoriaUnit);
    if (!canEdit) return;

    if (!needsAutoauditoriaSave.current) return; // Só engatilha auto-save se houver edição local confirmada

    setIsSavingAutoauditoria(true);

    const timeoutId = setTimeout(async () => {
      // Capturamos as edições pendentes agora, para limpá-las caso o save seja bem sucedido
      const savingIds = new Set(pendingAutoauditoriaEdits.current);

      try {
        const itemsToSave = Object.keys(autoauditoriaData).map(baseItemId => ({
          baseItemId,
          score: autoauditoriaData[baseItemId].score,
          nossaAcao: autoauditoriaData[baseItemId].nossaAcao,
        }));

        const response = await api.saveAutoauditoria({
          unidade: currentAutoauditoriaUnit,
          mesAno: autoauditoriaMesAno,
          items: itemsToSave
        });

        // Limpa os Ids que salvamos para permitir que o polling os atualize novamente
        savingIds.forEach(id => pendingAutoauditoriaEdits.current.delete(id));
        needsAutoauditoriaSave.current = pendingAutoauditoriaEdits.current.size > 0;

        setLastSavedTime(new Date());
      } catch (e) {
        console.error("Erro no auto-save da autoauditoria:", e);
      } finally {
        setIsSavingAutoauditoria(false);
      }
    }, 1000); // 1 segundo de debounce

    return () => clearTimeout(timeoutId);
  }, [autoauditoriaData, currentAutoauditoriaUnit, autoauditoriaMesAno, currentUser]);

  const loadAllAutoauditorias = async (mesAno: string) => {
    try {
      const data = await api.getAllAutoauditorias(mesAno);
      setAllAutoauditorias(data || []);
    } catch (e) {
      console.error("Erro ao carregar todas as autoauditorias:", e);
      setAllAutoauditorias([]);
    }
  };

  const loadData = async () => {
    try {
      const [u, b, i] = await Promise.all([
        api.getUsers(),
        api.getBaseItems(),
        api.getChecklists()
      ]);
      setUsersList(u);
      setBaseItems(b);
      setItems(i);
    } catch (e) {
      console.error("Erro ao carregar dados da API:", e);
    }
  };

  useEffect(() => {
    loadData();
    loadAllAutoauditorias(autoauditoriaMesAno);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (activeTab === 'autoauditoria' && currentUser) {
      if (currentAutoauditoriaUnit && currentAutoauditoriaUnit !== 'Todas' && currentAutoauditoriaUnit !== 'Master') {
        loadAutoauditoria(currentAutoauditoriaUnit, autoauditoriaMesAno);
        intervalId = setInterval(() => {
          loadAutoauditoria(currentAutoauditoriaUnit, autoauditoriaMesAno, true);
        }, 5000);
      } else {
        setAutoauditoriaData({});
      }
    }

    if (activeTab === 'home' || activeTab === 'autoauditoria') {
      loadAllAutoauditorias(autoauditoriaMesAno);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeTab, autoauditoriaMesAno, currentAutoauditoriaUnit]);

  // Carregar histórico para o Dashboard de Tendências
  useEffect(() => {
    const loadHistory = async () => {
      if (activeTab === 'home' && selectedUnit !== 'Todas') {
        try {
          setIsLoadingHistory(true);
          const history = await api.getHistory(selectedUnit);
          setHistoryData(history);
        } catch (error) {
          console.error("Erro ao carregar histórico:", error);
          setHistoryData([]);
        } finally {
          setIsLoadingHistory(false);
        }
      } else {
        setHistoryData([]);
      }
    };

    loadHistory();
  }, [activeTab, selectedUnit]);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUnitDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Efeitos para persistir mudanças de estado em tempo real
  useEffect(() => {
    localStorage.setItem('som_activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('som_selectedUnit', selectedUnit);
  }, [selectedUnit]);

  useEffect(() => {
    localStorage.setItem('som_sidebarCollapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('som_theme', theme);
  }, [theme]);

  // Força a unidade do usuário se ele não for privilegiado
  useEffect(() => {
    if (currentUser && !isPrivileged && currentUser.unidade && currentUser.unidade !== 'Master') {
      if (selectedUnit !== currentUser.unidade) {
        setSelectedUnit(currentUser.unidade);
      }
    }
  }, [currentUser, isPrivileged, selectedUnit]);

  // --- SINCRONIZAÇÃO AUTOMÁTICA DE NOVAS UNIDADES/ITENS ---
  useEffect(() => {
    const syncChecklists = async () => {
      if (baseItems.length === 0) return;

      const currentItems = items; // From state

      // Otimização: Criar mapas para busca O(1)
      const itemsMap = new Map<string, ChecklistItem>();
      const ghostMap = new Map<string, ChecklistItem>(); // Chave: unit + item_text

      currentItems.forEach(item => {
        itemsMap.set(item.id, item);
        ghostMap.set(`${item.unidade}-${item.item}`, item);
      });

      const allUnits = Array.from(new Set([
        ...UNIDADES_DISPONIVEIS,
        ...(usersList?.map(u => u.unidade) || [])
      ])).filter(u => u && u !== 'Master' && u !== 'Todas');

      const itemsToPut: ChecklistItem[] = [];
      const itemsToDelete: string[] = [];
      const validIds = new Set<string>();

      // 1. Constroi a Verdade Absoluta baseada nos BaseItems e em todas as Unidades Ativas
      for (const unit of allUnits) {
        for (const baseItem of baseItems) {
          const expectedId = `${unit}-${baseItem.id}`;
          validIds.add(expectedId);

          const existingItem = itemsMap.get(expectedId);

          if (!existingItem) {
            // Busca rápida por "fantasma" via mapa
            const ghost = ghostMap.get(`${unit}-${baseItem.item}`);
            if (ghost && ghost.id !== expectedId) {
              itemsToPut.push({
                ...ghost,
                id: expectedId,
                pilar: baseItem.pilar,
                bloco: baseItem.bloco,
                trilha: baseItem.trilha,
                item: baseItem.item,
                descricao: baseItem.descricao,
                exigeEvidencia: baseItem.exigeEvidencia,
                ativo: baseItem.ativo,
                order: baseItem.order
              });
              itemsToDelete.push(ghost.id);
            } else {
              // Totalmente novo
              itemsToPut.push({
                ...baseItem,
                id: expectedId,
                unidade: unit,
                assigneeId: ''
              });
            }
          } else {
            // Atualiza caso os campos da Base tenham mudado
            const hasChanged =
              existingItem.pilar !== baseItem.pilar ||
              existingItem.bloco !== baseItem.bloco ||
              existingItem.ativo !== baseItem.ativo ||
              existingItem.item !== baseItem.item ||
              existingItem.order !== baseItem.order ||
              existingItem.descricao !== baseItem.descricao ||
              existingItem.exigeEvidencia !== baseItem.exigeEvidencia ||
              (existingItem.nossaAcao || '') !== (baseItem.nossaAcao || '');

            if (hasChanged) {
              itemsToPut.push({
                ...existingItem,
                pilar: baseItem.pilar,
                bloco: baseItem.bloco,
                trilha: baseItem.trilha,
                item: baseItem.item,
                descricao: baseItem.descricao,
                exigeEvidencia: baseItem.exigeEvidencia,
                ativo: baseItem.ativo,
                order: baseItem.order,
                nossaAcao: baseItem.nossaAcao
              });
            }
          }
        }
      }

      // 2. Limpa qualquer item que não pertença à Verdade Absoluta (itens fantasmas deletados ou corrompidos)
      for (const currentItem of currentItems) {
        if (!validIds.has(currentItem.id)) {
          if (!itemsToDelete.includes(currentItem.id)) {
            itemsToDelete.push(currentItem.id);
          }
        }
      }

      let shouldReload = false;
      if (itemsToPut.length > 0) {
        await api.bulkPutChecklists(itemsToPut);
        shouldReload = true;
      }
      if (itemsToDelete.length > 0) {
        await api.bulkDeleteChecklists(itemsToDelete);
        shouldReload = true;
      }
      if (shouldReload) {
        loadData();
      }
    };

    syncChecklists();
  }, [baseItems, usersList]);
  const [detailsModalPilar, setDetailsModalPilar] = useState<string | null>(null);
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [selectedPilarFilter, setSelectedPilarFilter] = useState('Todos');
  const [prioritySortOrder, setPrioritySortOrder] = useState<'none' | 'desc' | 'asc'>('none');
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [selectedItemForEvidence, setSelectedItemForEvidence] = useState<ChecklistItem | null>(null);
  const [selectedEvidenceCategory, setSelectedEvidenceCategory] = useState<string | null>(null);
  const [previewEvidence, setPreviewEvidence] = useState<{ url: string, name: string } | null>(null);

  // --- ESTADOS DE USUÁRIOS (ADMIN) ---
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState({ name: '', email: '', role: 'COLABORADOR' as Role, password: '', photo: '', unidade: '' });

  // --- FUNÇÕES DE SISTEMA ---
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  // --- FUNÇÕES DE AUTENTICAÇÃO ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = usersList.find(u => u.email === loginEmail && u.password === loginPassword);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('som_user', JSON.stringify(user));

      const targetUnit = user.unidade === 'Master' ? 'Todas' : (user.unidade || 'Todas');
      setSelectedUnit(targetUnit);
      localStorage.setItem('som_selectedUnit', targetUnit);

      setLoginError('');
      setActiveTab('home');
      localStorage.setItem('som_activeTab', 'home');
    } else {
      setLoginError('E-mail ou senha incorretos.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginPassword('');
    localStorage.removeItem('som_user');
    // Opcional: Limpar outros estados ao deslogar? Geralmente sim para segurança
    localStorage.removeItem('som_activeTab');
    localStorage.removeItem('som_selectedUnit');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setCurrentUser(prev => prev ? { ...prev, photo: base64String } : null);
        if (currentUser) {
          await api.updateUser(currentUser.id, { photo: base64String });
          loadData();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError('');

    
    if (!currentUser) return;
    
    // Validations
    if (passwordFormData.oldPassword !== currentUser.password) {
      setChangePasswordError('Senha atual incorreta.');
      return;
    }
    
    if (passwordFormData.newPassword.length < 3) {
      setChangePasswordError('A nova senha deve ter pelo menos 3 caracteres.');
      return;
    }
    
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setChangePasswordError('As senhas não coincidem.');
      return;
    }
    
    setIsChangingPassword(true);
    try {
      const updatedUser = { ...currentUser, password: passwordFormData.newPassword };
      await api.updateUser(currentUser.id, updatedUser);
      setCurrentUser(updatedUser);
      localStorage.setItem('som_user', JSON.stringify(updatedUser));
      
      setIsChangePasswordModalOpen(false);
      setPasswordFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      alert('Senha atualizada com sucesso!');
    } catch (error) {
      setChangePasswordError('Erro ao atualizar senha. Tente novamente.');
    } finally {
      setIsChangingPassword(false);
    }
  };




  // --- FUNÇÕES DA BASE DE CHECKLIST ---
  const handleAddBaseItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      delete payload.id; // Evita erro de sobrescrita de chave primária (ex: tentar mudar '6994-1' para '1')

      if (editingId) {
        await api.updateBaseItem(editingId, payload);

        const itemsToUpdate = items
          .filter(item => item.id.endsWith(`-${editingId}`))
          .map(item => ({ id: item.id, ...payload }));

        if (itemsToUpdate.length > 0) {
          await api.bulkPutChecklists(itemsToUpdate);
        }
      } else {
        const newId = Date.now().toString();
        const newItem: ChecklistItem = {
          id: newId,
          code: `NEW-${newId.slice(-4)}`,
          order: baseItems.length + 1,
          ...payload
        } as ChecklistItem;
        await api.createBaseItem(newItem);

        const units = Array.from(new Set(usersList.map(u => u.unidade))).filter(u => u !== 'Master');
        const newItems = units.map(unit => ({ ...newItem, id: `${unit}-${newId}`, unidade: unit, assigneeId: '' }));
        if (newItems.length > 0) {
          await api.bulkAddChecklists(newItems);
        }
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ pilar: '', bloco: '', trilha: '', item: '', descricao: '', exigeEvidencia: false, ativo: true, nossaAcao: '' });
      loadData();
    } catch (error) {
      console.error("Erro ao salvar item da base:", error);
      alert("Houve um erro ao efetuar o salvamento. Verifique se os dados estão corretos.");
    }
  };

  const handleEditBaseItem = (item: ChecklistItem) => {
    setFormData({ ...item });
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const openNewBaseItemModal = () => {
    setFormData({ pilar: '', bloco: '', trilha: '', item: '', descricao: '', exigeEvidencia: false, ativo: true, nossaAcao: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openDeletePilarModal = () => {
    setPilarToDelete('');
    setIsDeletePilarModalOpen(true);
  };

  const confirmDeletePilar = async () => {
    if (!pilarToDelete) return;
    try {
      setIsDeletingPilar(true);
      await api.deletePilar(pilarToDelete);
      setIsDeletePilarModalOpen(false);
      setPilarToDelete('');
      loadData();
    } catch (e) {
      console.error(e);
      alert('Erro ao excluir Pilar. Tente novamente.');
    } finally {
      setIsDeletingPilar(false);
    }
  };

  const handleDeleteBaseItem = async (itemId: string, code: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o item ${code}? Esta ação não pode ser desfeita e removerá o histórico desse item nas auditorias.`)) {
      try {
        await api.deleteBaseItem(itemId);
        loadData();
      } catch (error) {
        console.error("Erro ao deletar item da base:", error);
        alert("Erro ao excluir o item. Tente novamente.");
      }
    }
  };

  const handleAssignItem = async (itemId: string, assigneeId: string) => {
    await api.updateChecklist(itemId, { assigneeId });
    loadData();
  };

  const handleUpdateItemField = async (itemId: string, field: keyof ChecklistItem, value: string) => {
    await api.updateChecklist(itemId, { [field]: value } as any);
    loadData();
  };

  const handleEvaluateItem = async (itemId: string, aderente: boolean) => {
    await api.updateChecklist(itemId, {
      completed: true,
      aderente,
      completedAt: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    });
    loadData();
  };

  const handleUndoEvaluation = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      await api.updateChecklist(itemId, {
        completed: false,
        aderente: null as any,
        completedAt: null as any
      });
      loadData();
    }
  };

  const handleEvaluateAuditoria = async (itemId: string, aderente: boolean) => {
    await api.updateChecklist(itemId, {
      auditoriaRealizada: true,
      auditoriaAderente: aderente,
      auditoriaCompletedAt: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    } as any);
    loadData();
  };

  const handleUndoAuditoria = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      await api.updateChecklist(itemId, {
        auditoriaRealizada: false,
        auditoriaAderente: null as any,
        auditoriaCompletedAt: null as any
      } as any);
      loadData();
    }
  };

  // --- FUNÇÕES DE USUÁRIOS ---
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUserId) {
      const existingUser = usersList.find(u => u.id === editingUserId);
      const updatedUser = { ...existingUser, ...userFormData } as User;
      await api.updateUser(editingUserId, updatedUser);
      if (currentUser?.id === editingUserId) {
        setCurrentUser({ ...currentUser, ...userFormData });
      }
    } else {
      const newId = Date.now().toString();
      const newUser: User = { id: newId, ...userFormData } as User;
      await api.createUser(newUser);

      // Check if the new user's unit already has items
      const unitExists = items.some(item => item.unidade === newUser.unidade);
      if (!unitExists && newUser.unidade && newUser.unidade !== 'Master') {
        const newItems = baseItems.map(item => ({ ...item, id: `${newUser.unidade}-${item.id}`, unidade: newUser.unidade, assigneeId: '' }));
        if (newItems.length > 0) {
          await api.bulkAddChecklists(newItems);
        }
      }
    }

    setIsUserModalOpen(false);
    setUserFormData({ name: '', email: '', role: 'COLABORADOR', password: '', photo: '', unidade: '' });
    loadData();
  };

  const handleEditUser = (user: User) => {
    setUserFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: user.password || '',
      photo: user.photo || '',
      unidade: user.unidade
    });
    setEditingUserId(user.id);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (currentUser?.id === userId) {
      alert("Você não pode excluir a si mesmo enquanto estiver logado.");
      return;
    }
    if (window.confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.")) {
      await api.deleteUser(userId);
      loadData();
    }
  };

  // --- CÁLCULOS DO PAINEL DE CHECKLIST (MEMOIZADOS PARA PERFORMANCE) ---
  const dashboardStats = React.useMemo(() => {
    const vItems = items.filter(i => selectedUnit === 'Todas' ? true : i.unidade === selectedUnit);

    const aItems = vItems.filter(i => i.ativo);
    const tItems = aItems.length;
    const tResp = aItems.filter(i => i.completed).length;
    const tAder = aItems.filter(i => i.completed && i.aderente).length;

    const progTotal = tItems === 0 ? 0 : (tResp / tItems) * 100;
    const aderMedia = tItems === 0 ? 0 : (tAder / tItems) * 100;
    const sGeral = aderMedia >= 80 ? 'Aderente' : 'Não Aderente';

    const currentPilares = PILAR_ORDER;

    const rPorPilar = currentPilares.map(pilar => {
      const pilarBaseItems = baseItems.filter(i => i.pilar === pilar && i.ativo);
      const pilarUnitItems = aItems.filter(i => i.pilar === pilar);

      const pTotal = pilarUnitItems.length;
      const pRespondidos = pilarUnitItems.filter(i => i.completed).length;
      const pAderentes = pilarUnitItems.filter(i => i.completed && i.aderente).length;
      const pNaoAderentes = pRespondidos - pAderentes;

      // Calculo de Auditoria Oficial baseado em allAutoauditorias
      let totalPoints = 0;
      let possiblePoints = 0;

      if (selectedUnit === 'Todas') {
        // Média de todos os CDs que tem autoauditoria realizada
        allAutoauditorias.forEach(audit => {
          pilarBaseItems.forEach(bi => {
            const ai = audit.items?.find((item: any) => item.baseItemId === bi.id);
            if (ai) {
              possiblePoints += 3;
              if (ai.score === '3') totalPoints += 3;
              else if (ai.score === '1') totalPoints += 1;
            }
          });
        });
      } else {
        const unitAudit = allAutoauditorias.find(a => a.unidade === selectedUnit);
        possiblePoints = pilarBaseItems.length * 3;
        pilarBaseItems.forEach(bi => {
          const ai = unitAudit?.items?.find((item: any) => item.baseItemId === bi.id);
          if (ai?.score === '3') totalPoints += 3;
          else if (ai?.score === '1') totalPoints += 1;
        });
      }

      const pAuditoriaOficial = possiblePoints === 0 ? 0 : (totalPoints / possiblePoints) * 100;
      const pProgresso = pTotal === 0 ? 0 : (pRespondidos / pTotal) * 100;
      const pAderencia = pTotal === 0 ? 0 : (pAderentes / pTotal) * 100;
      const pStatus = pAderencia >= 80 ? 'Aderente' : 'Não Aderente';

      return {
        pilar,
        total: pTotal,
        conforme: pAderentes,
        naoConforme: pNaoAderentes,
        progresso: pProgresso,
        auditoriaOficial: pAuditoriaOficial,
        aderencia: pAderencia,
        status: pStatus
      };
    });

    return {
      visibleItems: vItems,
      activeItems: aItems,
      totalItems: tItems,
      totalRespondidos: tResp,
      totalAderentes: tAder,
      progressoTotal: progTotal,
      aderenciaMedia: aderMedia,
      statusGeral: sGeral,
      resumoPorPilar: rPorPilar,
      pilares: currentPilares
    };
  }, [items, selectedUnit, allAutoauditorias, baseItems]);

  const {
    visibleItems, activeItems, totalItems, totalRespondidos, totalAderentes,
    progressoTotal, aderenciaMedia, statusGeral, resumoPorPilar, pilares
  } = dashboardStats;

  // --- MATRIZ DE ADERÊNCIA CONSOLIDADA (P/ Home Visão Empresa) ---
  const matrixStats = React.useMemo(() => {
    const allPilars = PILAR_ORDER;
    const matrix: Record<string, Record<string, string>> = {};
    const divisions: Record<string, string[]> = {};
    const pilarToBlocks: Record<string, string[]> = {};

    allPilars.forEach(pilar => {
      const pilarBaseItems = baseItems.filter(i => i.pilar === pilar);
      const pilarBlocks = Array.from(new Set(pilarBaseItems.map(i => i.bloco)));
      pilarToBlocks[pilar] = pilarBlocks.sort((a, b) => getBlocoWeight(a) - getBlocoWeight(b));
    });

    UNIDADES_DISPONIVEIS.forEach(unit => {
      const division = CD_REGIONS[unit]?.divisao || 'Outros';
      if (!divisions[division]) divisions[division] = [];
      divisions[division].push(unit);

      matrix[unit] = {};
      const unitAudit = allAutoauditorias.find(a => 
        String(a.unidade) === String(unit) && a.mesAno === autoauditoriaMesAno
      );

      let unitTotalPoints = 0;
      let unitMaxPoints = 0;

      allPilars.forEach(pilar => {
        const pilarBaseItems = baseItems.filter(i => i.pilar === pilar);

        // Calculate per bloco
        pilarToBlocks[pilar].forEach(bloco => {
          const blocoBaseItems = pilarBaseItems.filter(i => i.bloco === bloco);
          let blocoPoints = 0;
          blocoBaseItems.forEach(bi => {
            const auditItem = unitAudit?.items?.find((ai: any) => ai.baseItemId === bi.id);
            const score = String(auditItem?.score || '');
            if (score === '3') blocoPoints += 3;
            else if (score === '1') blocoPoints += 1;
          });
          const maxBlocoPoints = blocoBaseItems.length * 3;
          matrix[unit][`${pilar}_${bloco}`] = maxBlocoPoints === 0 ? '0' : Math.round((blocoPoints / maxBlocoPoints) * 100).toString();
        });

        // Calculate pilar total
        if (pilarBaseItems.length === 0) {
          matrix[unit][pilar] = '0';
          return;
        }

        let totalPoints = 0;
        pilarBaseItems.forEach(bi => {
          const auditItem = unitAudit?.items?.find((ai: any) => ai.baseItemId === bi.id);
          const score = String(auditItem?.score || '');
          if (score === '3') totalPoints += 3;
          else if (score === '1') totalPoints += 1;
        });

        unitTotalPoints += totalPoints;
        unitMaxPoints += (pilarBaseItems.length * 3);

        const maxPoints = pilarBaseItems.length * 3;
        const percentage = maxPoints === 0 ? '0' : Math.round((totalPoints / maxPoints) * 100).toString();
        matrix[unit][pilar] = percentage;
      });

      const totalPercentage = unitMaxPoints === 0 ? '0' : Math.round((unitTotalPoints / unitMaxPoints) * 100).toString();
      matrix[unit]['Total'] = totalPercentage;
    });

    // Order divisions: SP first, then others
    const orderedDivisions = Object.keys(divisions).sort((a, b) => {
      if (a === 'SP') return -1;
      if (b === 'SP') return 1;
      return a.localeCompare(b);
    });

    const flatOrderedUnits = orderedDivisions.flatMap(div => divisions[div]);
    const divFirstUnits = new Set(orderedDivisions.map(div => divisions[div][0]));

    return { divisions, orderedDivisions, flatOrderedUnits, divFirstUnits, allPilars, matrix, pilarToBlocks };
  }, [baseItems, allAutoauditorias, autoauditoriaMesAno]);

  // --- TELA DE LOGIN ---
  if (!currentUser) {
    return (
      <div className={`${theme} min-h-screen`}>
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4 font-sans relative overflow-hidden transition-colors duration-300">
          {/* Background Elements */}
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 shadow-2xl relative z-10 transition-colors duration-300"
          >
            <div className="absolute top-4 right-4">
              <button onClick={toggleTheme} className="p-2 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/50 rounded-md transition-colors">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex flex-col items-center mb-10">
              <MainLogo size="large" />
            </div>






            <form onSubmit={handleLogin} className="space-y-5">
              {loginError && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </motion.div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">E-mail</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Senha</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-gray-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                    placeholder="••••••"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-amber-500 text-zinc-950 font-bold rounded-lg py-2.5 hover:bg-amber-400 transition-colors mt-6 shadow-lg shadow-amber-500/20">
                Entrar no Sistema
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-800 text-xs text-gray-500 dark:text-zinc-500 space-y-3">
              <p className="font-medium text-gray-600 dark:text-zinc-400 mb-2 flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Contas de Teste (RBAC):</span>
              </p>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-center items-center bg-gray-50 dark:bg-zinc-950 p-2.5 rounded border border-gray-200 dark:border-zinc-800 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-700 transition-colors" onClick={() => { setLoginEmail('admin@magalu.com'); setLoginPassword('123'); }}>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Admin</span>
                </div>
                <div className="flex justify-center items-center bg-gray-50 dark:bg-zinc-950 p-2.5 rounded border border-gray-200 dark:border-zinc-800 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-700 transition-colors" onClick={() => { setLoginEmail('diretoria@magalu.com'); setLoginPassword('123'); }}>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Diretoria</span>
                </div>
                <div className="flex justify-center items-center bg-gray-50 dark:bg-zinc-950 p-2.5 rounded border border-gray-200 dark:border-zinc-800 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-700 transition-colors" onClick={() => { setLoginEmail('divisional@magalu.com'); setLoginPassword('123'); }}>
                  <span className="text-purple-600 dark:text-purple-400 font-medium">G. Divisional</span>
                </div>
                <div className="flex justify-center items-center bg-gray-50 dark:bg-zinc-950 p-2.5 rounded border border-gray-200 dark:border-zinc-800 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-700 transition-colors" onClick={() => { setLoginEmail('gerentecd@magalu.com'); setLoginPassword('123'); }}>
                  <span className="text-amber-600 dark:text-amber-400 font-medium">Gerente CD</span>
                </div>
                <div className="flex justify-center items-center bg-gray-50 dark:bg-zinc-950 p-2.5 rounded border border-gray-200 dark:border-zinc-800 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-700 transition-colors" onClick={() => { setLoginEmail('donopilar@magalu.com'); setLoginPassword('123'); }}>
                  <span className="text-orange-600 dark:text-orange-400 font-medium">Dono Pilar</span>
                </div>
                <div className="flex justify-center items-center bg-gray-50 dark:bg-zinc-950 p-2.5 rounded border border-gray-200 dark:border-zinc-800 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-700 transition-colors" onClick={() => { setLoginEmail('auditor@magalu.com'); setLoginPassword('123'); }}>
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">Auditor</span>
                </div>
                <div className="flex justify-center items-center bg-gray-50 dark:bg-zinc-950 p-2.5 rounded border border-gray-200 dark:border-zinc-800 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-700 transition-colors" onClick={() => { setLoginEmail('colab@magalu.com'); setLoginPassword('123'); }}>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Colab</span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center text-xs text-gray-400 dark:text-zinc-600">
              © 2026 Magalu | Feito com ❤ por J's Martins
            </div>
          </motion.div>
        </div>
      </div>
    );
  }



  // --- TELA PRINCIPAL (LOGADO) ---
  return (
    <div className={`${theme} min-h-screen`}>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex text-gray-900 dark:text-zinc-100 font-sans transition-colors duration-300 relative overflow-hidden">

        {/* Sidebar Navigation */}
        <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-zinc-900/80 border-r border-gray-200 dark:border-zinc-800 flex flex-col shrink-0 sticky top-0 h-screen transition-all duration-300 z-50 backdrop-blur-xl`}>

          {/* Logo Area & Toggle */}
          <div className={`h-[72px] flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 border-b border-gray-200 dark:border-zinc-800/80 shrink-0`}>

            {!isSidebarCollapsed && (
              <div className="flex flex-col items-center cursor-pointer overflow-hidden py-4 w-full" onClick={() => setActiveTab('home')}>
                <MainLogo size="small" />
              </div>
            )}






            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${isSidebarCollapsed ? '' : ''}`}
            >
              {isSidebarCollapsed ? <Menu className="w-6 h-6" /> : <PanelLeftClose className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />}
            </button>
          </div>

          {/* Unit Dropdown */}
          <div className="px-3 py-4 border-b border-gray-100 dark:border-zinc-800/50 shrink-0">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => isPrivileged && setIsUnitDropdownOpen(!isUnitDropdownOpen)}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl border transition-all duration-200 ${isUnitDropdownOpen
                  ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 ring-2 ring-blue-500/20'
                  : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-sm'
                  } ${!isPrivileged ? 'cursor-default opacity-80 border-dashed bg-gray-50/50 dark:bg-zinc-800/20 grayscale-[0.2]' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${isUnitDropdownOpen ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'}`}>
                    <Package className="w-4 h-4" />
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="flex flex-col items-start leading-tight overflow-hidden flex-1 text-left">
                      <div className="flex flex-col w-full mt-0.5">
                        <span className="text-[13px] font-bold text-gray-800 dark:text-zinc-200 truncate w-full">
                          {selectedUnit === 'Todas' ? 'Todos os CDs' : `CD ${selectedUnit}`}
                        </span>
                        {selectedUnit !== 'Todas' && CD_NAMES[selectedUnit] && (
                          <span className="text-[11px] font-medium text-gray-500 dark:text-zinc-400 truncate w-full">
                            {CD_NAMES[selectedUnit].split(' - ').slice(1).join(' - ')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {(!isSidebarCollapsed && isPrivileged) && (
                  <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ml-1 ${isUnitDropdownOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              <AnimatePresence>
                {isUnitDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className={`absolute left-0 mt-2 ${isSidebarCollapsed ? 'w-[260px]' : 'w-full'} max-h-[250px] overflow-y-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl z-[60] py-2 no-scrollbar scroll-smooth`}
                  >
                    <div className="px-3 pb-2 mb-2 border-b border-gray-100 dark:border-zinc-800/50">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Selecione a Visão</span>
                    </div>
                    <button
                      onClick={() => { setSelectedUnit('Todas'); setIsUnitDropdownOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${selectedUnit === 'Todas'
                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                        }`}
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${selectedUnit === 'Todas' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300 dark:bg-zinc-700'}`} />
                      Todos os CDs
                    </button>
                    {UNIDADES_DISPONIVEIS.map(u => (
                      <button
                        key={u}
                        onClick={() => { setSelectedUnit(u); setIsUnitDropdownOpen(false); }}
                        className={`w-full flex items-start gap-3 px-3 py-2 text-sm transition-colors ${selectedUnit === u
                          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                          : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                          }`}
                      >
                        <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${selectedUnit === u ? 'bg-blue-500 animate-pulse' : 'bg-gray-300 dark:bg-zinc-700'}`} />
                        <div className="flex flex-col items-start text-left w-full leading-snug">
                          <span className="font-bold">CD {u}</span>
                          <span className={`${selectedUnit === u ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-zinc-400'} text-[11px] font-medium`}>
                            {CD_NAMES[u] ? CD_NAMES[u].split(' - ').slice(1).join(' - ') : u}
                          </span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation Links */}
          <div className={`flex-1 overflow-y-auto no-scrollbar py-4 px-3 space-y-1.5 mask-linear-vertical ${isSidebarCollapsed ? 'items-center flex flex-col' : ''}`}>
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'home' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 font-bold tracking-tight shadow-sm' : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800/50'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            >
              <LayoutDashboard className={`w-5 h-5 shrink-0 transition-transform ${activeTab === 'home' ? 'text-blue-600 dark:text-blue-400 scale-110' : ''}`} />
              {!isSidebarCollapsed && <span className="truncate">Dashboard</span>}
            </button>

            <button
              onClick={() => setActiveTab('rank')}
              className={`flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'rank' ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 font-bold tracking-tight shadow-sm' : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800/50'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Trophy className={`w-5 h-5 shrink-0 transition-transform ${activeTab === 'rank' ? 'text-amber-600 dark:text-amber-400 scale-110' : ''}`} />
              {!isSidebarCollapsed && <span className="truncate">Top Magalog</span>}
            </button>


            <button
              onClick={() => setActiveTab('autoauditoria')}
              className={`flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'autoauditoria' ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 font-bold tracking-tight shadow-sm' : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800/50'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            >
              <CheckCircle2 className={`w-5 h-5 shrink-0 transition-transform ${activeTab === 'autoauditoria' ? 'text-purple-600 dark:text-purple-400 scale-110' : ''}`} />
              {!isSidebarCollapsed && <span className="truncate">Autoavaliação</span>}
            </button>

            {(currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DIVISIONAL' || currentUser.role === 'DIRETORIA' || currentUser.role === 'GERENTE_DO_CD') && (
              <div className="pt-2 w-full"> {/* Espaçador */}
                <button
                  onClick={() => setActiveTab('base-checklist')}
                  className={`flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'base-checklist' ? 'text-gray-900 dark:text-white bg-gray-200 dark:bg-zinc-800/80 font-bold tracking-tight shadow-sm' : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800/50'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Database className={`w-5 h-5 shrink-0 transition-transform ${activeTab === 'base-checklist' ? 'scale-110' : ''}`} />
                  {!isSidebarCollapsed && <span className="truncate">Base Check-List</span>}
                </button>
              </div>
            )}

            {currentUser.role === 'ADMIN' && (
              <div className="w-full">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'users' ? 'text-gray-900 dark:text-white bg-gray-200 dark:bg-zinc-800/80 font-bold tracking-tight shadow-sm' : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800/50'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Users className={`w-5 h-5 shrink-0 transition-transform ${activeTab === 'users' ? 'scale-110' : ''}`} />
                  {!isSidebarCollapsed && <span className="truncate">Usuários</span>}
                </button>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-3 border-t border-gray-200 dark:border-zinc-800/80 bg-gray-50 dark:bg-zinc-950/80 shrink-0">
            {/* Quick Actions (Theme & Notifications) */}
            <div className={`flex ${isSidebarCollapsed ? 'flex-col items-center gap-2' : 'items-center justify-between gap-2'} mb-3`}>
              <button
                onClick={toggleTheme}
                className={`${isSidebarCollapsed ? 'w-full' : 'flex-[0.5]'} flex justify-center p-2.5 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm`}
                title="Alternar Tema"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className={`relative ${isSidebarCollapsed ? 'w-full' : 'flex-[0.5]'}`}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="w-full flex justify-center p-2.5 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm relative"
                >
                  <Bell className="w-5 h-5" />
                  {(visibleItems.filter(i => (i.assigneeId === currentUser.id || i.assigneeId2 === currentUser.id || i.assigneeId3 === currentUser.id) && !i.completed).length > 0 || visibleItems.filter(i => !i.completed && i.prazo && ['approaching', 'overdue'].includes(getDueDateStatus(i.prazo))).length > 0) && (
                    <span className="absolute top-1.5 right-1/4 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-500/50"></span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute bottom-full left-0 mb-3 w-[300px] sm:w-[340px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-[60]"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/50 flex justify-between items-center">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Notificações</h4>
                        <span className="bg-amber-500 text-zinc-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          {visibleItems.filter(i => (i.assigneeId === currentUser.id || i.assigneeId2 === currentUser.id || i.assigneeId3 === currentUser.id) && !i.completed).length + visibleItems.filter(i => !i.completed && i.prazo && ['approaching', 'overdue'].includes(getDueDateStatus(i.prazo))).length}
                        </span>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {/* Atribuições Pendentes */}
                        {visibleItems.filter(i => (i.assigneeId === currentUser.id || i.assigneeId2 === currentUser.id || i.assigneeId3 === currentUser.id) && !i.completed).length > 0 && (
                          <div className="p-2 bg-gray-50 dark:bg-zinc-950/50 border-b border-gray-100 dark:border-zinc-800/50">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest pl-2">Suas Atribuições</span>
                          </div>
                        )}
                        {visibleItems.filter(i => (i.assigneeId === currentUser.id || i.assigneeId2 === currentUser.id || i.assigneeId3 === currentUser.id) && !i.completed).map(task => (
                          <div key={`assign-${task.id}`} className="p-4 border-b border-gray-100 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
                            <p className="text-[13px] text-gray-800 dark:text-zinc-200 leading-relaxed">
                              Você foi designado para verificar: <strong className="text-amber-600 dark:text-amber-400 block mt-1">{task.item}</strong>
                            </p>
                            <div className="flex items-center space-x-2 mt-2.5">
                              <span className="text-[9px] font-bold uppercase text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-950 px-2 py-1.5 rounded border border-gray-200 dark:border-zinc-800 shadow-sm">{task.pilar}</span>
                              <span className="text-[9px] font-bold uppercase text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-950 px-2 py-1.5 rounded border border-gray-200 dark:border-zinc-800 shadow-sm">{task.bloco}</span>
                            </div>
                          </div>
                        ))}

                        {/* Prazos Vencendo/Vencidos */}
                        {visibleItems.filter(i => !i.completed && i.prazo && ['approaching', 'overdue'].includes(getDueDateStatus(i.prazo))).length > 0 && (
                          <div className="p-2 bg-gray-50 dark:bg-zinc-950/50 border-b border-gray-100 dark:border-zinc-800/50">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest pl-2">Prazos</span>
                          </div>
                        )}
                        {visibleItems.filter(i => !i.completed && i.prazo && ['approaching', 'overdue'].includes(getDueDateStatus(i.prazo))).map(task => {
                          const status = getDueDateStatus(task.prazo);
                          return (
                            <div key={`deadline-${task.id}`} className={`p-4 border-b border-gray-100 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer ${status === 'overdue' ? 'bg-red-50/50 dark:bg-red-900/10' : 'bg-amber-50/50 dark:bg-amber-900/10'}`}>
                              <p className="text-[13px] text-gray-800 dark:text-zinc-200 leading-relaxed">
                                {status === 'overdue' ? <span className="text-red-600 dark:text-red-400 font-bold">Atrasado: </span> : <span className="text-amber-600 dark:text-amber-400 font-bold">Vencendo em breve: </span>}
                                {task.item}
                              </p>
                              <div className="flex items-center space-x-2 mt-2.5">
                                <span className="text-[9px] font-bold uppercase text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-950 px-2 py-1.5 rounded border border-gray-200 dark:border-zinc-800 shadow-sm">Prazo: {task.prazo}</span>
                              </div>
                            </div>
                          );
                        })}

                        {visibleItems.filter(i => (i.assigneeId === currentUser.id || i.assigneeId2 === currentUser.id || i.assigneeId3 === currentUser.id) && !i.completed).length === 0 && visibleItems.filter(i => !i.completed && i.prazo && ['approaching', 'overdue'].includes(getDueDateStatus(i.prazo))).length === 0 && (
                          <div className="p-8 text-center text-gray-500 dark:text-zinc-500 text-[13px] flex flex-col items-center">
                            <Check className="w-10 h-10 text-gray-200 dark:text-zinc-700 mb-3" />
                            <p>Nenhuma notificação no momento.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Profile Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`w-full flex items-center p-2 rounded-xl border border-gray-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-200 bg-transparent hover:shadow-sm ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div
                    className="relative group cursor-pointer shrink-0"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    title="Alterar foto de perfil"
                  >
                    {currentUser.photo ? (
                      <img src={currentUser.photo} alt="Perfil" className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm" />
                    ) : (
                      <div className="bg-white dark:bg-zinc-800 w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-zinc-700 group-hover:bg-gray-50 dark:group-hover:bg-zinc-700 transition-colors shadow-sm">
                        <UserIcon className="w-4 h-4 text-gray-400 dark:text-zinc-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-[7px] font-black text-white uppercase tracking-widest">Foto</span>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="flex flex-col items-start leading-tight overflow-hidden text-left">
                      <span className="text-[13px] font-bold text-gray-900 dark:text-white truncate w-full">{currentUser.name}</span>
                      <span className={`text-[9px] font-black uppercase tracking-wider truncate w-full mt-0.5 ${currentUser.role === 'ADMIN' ? 'text-blue-600 dark:text-blue-400' :
                        currentUser.role === 'GERENTE_DIVISIONAL' || currentUser.role === 'DIRETORIA' ? 'text-purple-600 dark:text-purple-400' :
                          currentUser.role === 'GERENTE_DO_CD' ? 'text-amber-600 dark:text-amber-400' :
                            currentUser.role === 'DONO_DO_PILAR' ? 'text-orange-600 dark:text-orange-400' :
                              'text-emerald-600 dark:text-emerald-400'
                        }`}>
                        {currentUser.role.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}
                </div>
                {!isSidebarCollapsed && (
                  <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute bottom-full left-0 mb-3 w-[260px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-[60] py-2 overflow-hidden"
                  >
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800/50 flex flex-col bg-gray-50/50 dark:bg-zinc-950/50">
                      <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{currentUser.name}</span>
                      <span className="text-xs text-gray-500 dark:text-zinc-400 truncate mt-0.5">{currentUser.email}</span>
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-800/50 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Unidade Base</span>
                        <span className="text-[10px] font-bold text-gray-700 dark:text-zinc-300 uppercase bg-gray-200 dark:bg-zinc-800 px-2 py-1 rounded">{currentUser.unidade}</span>
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => { setIsChangePasswordModalOpen(true); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center space-x-3 transition-colors font-medium border border-transparent hover:border-gray-200 dark:hover:border-zinc-700"
                      >
                        <Lock className="w-4 h-4 shrink-0" />
                        <span>Trocar Senha</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center space-x-3 transition-colors font-medium border border-transparent hover:border-red-100 dark:hover:border-red-500/20"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>Sair do sistema</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col p-4 w-full h-screen overflow-y-auto no-scrollbar scroll-smooth">
          {activeTab === 'home' ? (
            <div className="max-w-7xl mx-auto w-full py-8 space-y-6">
              <div>
                <h2 className="text-3xl font-light text-gray-900 dark:text-white tracking-tight">
                  {selectedUnit === 'Todas' ? 'Visão Empresa' : `CD ${selectedUnit}`}
                </h2>
                <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Exemplo de consolidação após avaliação oficial</p>
              </div>

              {selectedUnit !== 'Todas' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                      <BarChart className="w-5 h-5 text-blue-500" /> Histórico de Performance
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-500">
                      <div className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500" />
                      <span>Mensal Oficial (%)</span>
                    </div>
                  </div>
                  {isLoadingHistory ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                  ) : (
                    <TrendChart 
                      data={historyData} 
                      onPointClick={(mesAno) => {
                        setAutoauditoriaMesAno(mesAno);
                        setActiveTab('autoauditoria');
                        // Scroll top to ensure they see the header
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  )}
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardData.map((card, idx) => {
                  const Icon = card.icon;
                  // Map card titles to base pilar names for exact matches
                  let pilarName = card.title;
                  if (card.title === 'Clientes') pilarName = 'Cliente';

                  const pilarInfo = resumoPorPilar.find(p => p.pilar === pilarName);
                  const actualAutoAuditoria = pilarInfo ? Math.round(pilarInfo.aderencia) : 0;
                  const actualOficialAuditoria = pilarInfo ? Math.round((pilarInfo as any).auditoriaOficial || 0) : 0;
                  const dispersao = Math.abs(actualAutoAuditoria - actualOficialAuditoria);
                  let dispersaoType = 'up';
                  if (actualAutoAuditoria > actualOficialAuditoria) {
                    dispersaoType = 'down';
                  } else if (actualOficialAuditoria > actualAutoAuditoria) {
                    dispersaoType = 'up';
                  } else {
                    dispersaoType = card.dispersaoType; // fallback if equal
                  }

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4 }}
                      className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-lg hover:border-gray-300 dark:hover:border-zinc-700 hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-300 group"
                    >
                      <div className={`${card.color} px-4 py-3 flex items-center space-x-3 relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: (idx * 0.1) + 0.3, duration: 0.5 }}>
                          <Icon className="w-5 h-5 text-white relative z-10" />
                        </motion.div>
                        <h3 className="text-white font-semibold text-lg relative z-10">{card.title}</h3>
                      </div>

                      <div className="p-5 flex gap-4">
                        <div className="flex-1 space-y-4">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500 dark:text-zinc-400">Objetivo</span>
                              <span className="text-gray-900 dark:text-zinc-200 font-bold">{card.objetivo}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${card.objetivo}%` }} transition={{ duration: 1, delay: 0.5 + (idx * 0.1), ease: "easeOut" }} className="h-full bg-[#6b778c] rounded-full" />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500 dark:text-zinc-400">Autoavaliação</span>
                              <span className="text-gray-900 dark:text-zinc-200 font-bold">{actualAutoAuditoria}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${actualAutoAuditoria}%` }} transition={{ duration: 1, delay: 0.7 + (idx * 0.1), ease: "easeOut" }} className={`h-full ${card.autoColor} rounded-full`} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500 dark:text-zinc-400">Avaliação Oficial</span>
                              <span className="text-gray-900 dark:text-zinc-200 font-bold">{actualOficialAuditoria}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${actualOficialAuditoria}%` }} transition={{ duration: 1, delay: 0.9 + (idx * 0.1), ease: "easeOut" }} className={`h-full ${card.oficialColor} rounded-full`} />
                            </div>
                          </div>
                        </div>

                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 1.2 + (idx * 0.1), type: "spring" }} className="w-24 bg-gray-50 dark:bg-zinc-800/50 rounded-lg flex flex-col items-center justify-center p-2 border border-gray-200 dark:border-zinc-700/30 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-default">
                          <span className="text-[10px] text-gray-500 dark:text-zinc-400 font-medium mb-2 uppercase tracking-wider">Dispersão</span>
                          <div className={`flex items-center space-x-1 font-bold text-xl whitespace-nowrap ${dispersaoType === 'up' ? 'text-[#36b37e]' : 'text-[#e34935]'}`}>
                            {dispersaoType === 'up' ?
                              <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2 }}><ArrowUp className="w-4 h-4" strokeWidth={3} /></motion.div> :
                              <motion.div animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 2 }}><ArrowDown className="w-4 h-4" strokeWidth={3} /></motion.div>
                            }
                            <span className="flex items-baseline space-x-1"><span>{dispersao}</span> <span className="text-sm">pp</span></span>
                            {dispersaoType === 'up' ?
                              <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}><ArrowUp className="w-4 h-4" strokeWidth={3} /></motion.div> :
                              <motion.div animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}><ArrowDown className="w-4 h-4" strokeWidth={3} /></motion.div>
                            }
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Matriz de Aderência Consolidada - Visão Empresa */}
              {selectedUnit === 'Todas' && (
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-lg mt-8">
                  <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/50 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                      <BarChart className="w-5 h-5 text-amber-500" /> Matriz de Aderência Consolidada
                    </h3>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Aderência Oficial (% por CD)</span>
                  </div>
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-center text-[11px] sm:text-sm border-collapse">
                      <thead className="bg-[#1e293b] text-white">
                        <tr className="bg-[#0f172a] text-[10px] uppercase tracking-tighter sm:tracking-normal">
                          <th className="px-2 py-2 border-b border-gray-700 sticky left-0 z-20 w-[120px] sm:w-[180px] bg-[#0f172a]"></th>
                          {matrixStats.orderedDivisions.map((div, idx) => (
                            <th
                              key={div}
                              colSpan={matrixStats.divisions[div].length}
                              className={`px-1 py-2 border-b border-gray-700 border-r border-gray-800 ${idx > 0 ? 'border-l-2 border-amber-500/30 bg-[#161e2e]' : ''}`}
                            >
                              <span className="opacity-80">{div}</span>
                            </th>
                          ))}
                        </tr>
                        <tr>
                          <th className="px-2 py-3 border border-gray-700 font-bold bg-[#1e293b] sticky left-0 z-20 w-[120px] sm:w-[180px] shadow-[2px_0_5px_rgba(0,0,0,0.2)]">Pilar</th>
                          {matrixStats.flatOrderedUnits.map(unit => {
                            const isFirstInDiv = matrixStats.divFirstUnits.has(unit);
                            return (
                              <th
                                key={unit}
                                className={`px-1 py-1 sm:py-3 border border-gray-700 font-bold min-w-[38px] sm:min-w-[42px] ${isFirstInDiv ? 'border-l-4 border-gray-600/50' : ''}`}
                              >
                                {unit}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                        {matrixStats.allPilars.map(pilar => (
                          <React.Fragment key={pilar}>
                            <tr
                              onClick={() => togglePilarExpansion(pilar)}
                              className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                            >
                              <td className="px-2 py-3 border border-gray-200 dark:border-zinc-800 font-bold text-left bg-gray-50 dark:bg-zinc-950/50 sticky left-0 z-10 text-gray-900 dark:text-white whitespace-nowrap shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                <div className="flex items-center gap-1">
                                  {expandedPilars.has(pilar) ?
                                    <ChevronDown className="w-3 h-3 text-amber-500" /> :
                                    <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-amber-500" />
                                  }
                                  {pilar}
                                </div>
                              </td>
                              {matrixStats.flatOrderedUnits.map(unit => {
                                const value = parseInt(matrixStats.matrix[unit][pilar] || '0');
                                const isFirstInDiv = matrixStats.divFirstUnits.has(unit);
                                let bgColor = 'text-gray-900 dark:text-white';
                                if (value >= 70) bgColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold';
                                else if (value >= 50) bgColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold';
                                else if (value > 0) bgColor = 'bg-red-500/10 text-red-600 dark:text-red-400 font-bold';

                                return (
                                  <td
                                    key={`${unit}-${pilar}`}
                                    className={`px-1 py-3 border border-gray-200 dark:border-zinc-800 ${bgColor} ${isFirstInDiv ? 'border-l-4 border-gray-400/30' : ''}`}
                                  >
                                    {value}%
                                  </td>
                                );
                              })}
                            </tr>
                            {/* Sub-rows for blocks */}
                            {expandedPilars.has(pilar) && matrixStats.pilarToBlocks[pilar].map(bloco => (
                              <motion.tr
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={`${pilar}-${bloco}`}
                                className="bg-gray-100/30 dark:bg-zinc-900/40 text-[10px] sm:text-xs"
                              >
                                <td className="px-4 py-2 border border-gray-200 dark:border-zinc-800 text-left bg-gray-100/50 dark:bg-zinc-900/50 sticky left-0 z-10 text-gray-500 dark:text-zinc-400 whitespace-nowrap italic">
                                  {bloco}
                                </td>
                                {matrixStats.flatOrderedUnits.map(unit => {
                                  const value = parseInt(matrixStats.matrix[unit][`${pilar}_${bloco}`] || '0');
                                  const isFirstInDiv = matrixStats.divFirstUnits.has(unit);
                                  let textColor = 'text-gray-400 dark:text-zinc-500';
                                  if (value > 0) textColor = 'text-gray-600 dark:text-zinc-300 font-medium';

                                  return (
                                    <td
                                      key={`${unit}-${pilar}-${bloco}`}
                                      className={`px-1 py-2 border border-gray-200 dark:border-zinc-800 ${textColor} ${isFirstInDiv ? 'border-l-4 border-gray-400/20' : ''}`}
                                    >
                                      {value}%
                                    </td>
                                  );
                                })}
                              </motion.tr>
                            ))}
                          </React.Fragment>
                        ))}
                        <tr className="bg-gray-50 dark:bg-zinc-950/50 font-extrabold border-t-2 border-gray-300 dark:border-zinc-700">
                          <td className="px-2 py-3 border border-gray-300 dark:border-zinc-700 text-left sticky left-0 z-10 text-blue-600 dark:text-blue-400 whitespace-nowrap bg-gray-100 dark:bg-zinc-900 shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                            Aderência Total
                          </td>
                          {matrixStats.flatOrderedUnits.map(unit => {
                            const value = parseInt(matrixStats.matrix[unit]['Total'] || '0');
                            const isFirstInDiv = matrixStats.divFirstUnits.has(unit);
                            let bgColor = 'text-gray-900 dark:text-white';
                            if (value >= 70) bgColor = 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400';
                            else if (value >= 50) bgColor = 'bg-amber-500/20 text-amber-600 dark:text-amber-400';
                            else if (value > 0) bgColor = 'bg-red-500/20 text-red-600 dark:text-red-400';

                            return (
                              <td
                                key={`${unit}-total`}
                                className={`px-1 py-3 border border-gray-300 dark:border-zinc-700 ${bgColor} ${isFirstInDiv ? 'border-l-4 border-gray-400/30' : ''}`}
                              >
                                {value}%
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'rank' ? (
            <div className="max-w-7xl mx-auto w-full py-8 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <TopMagalogLogo />
                  <p className="text-gray-500 dark:text-zinc-400 text-sm mt-4 pl-1">Acompanhamento consolidado de Aderência Oficial por CD e Pilar.</p>
                </div>

                {/* Legenda de Classificação */}
                <div className="bg-[#1a1a1a] dark:bg-zinc-900 border border-gray-800 dark:border-zinc-800 rounded-lg p-3 text-sm shadow-md min-w-[320px]">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                      <div className="w-4 h-4 rounded-full bg-red-600 shadow-sm"></div>
                      <span className="text-gray-200 font-bold">&lt; 50% &rarr;</span>
                      <span className="text-blue-200 font-bold">Não aderente</span>
                      <span className="text-gray-400 text-xs">(Fundo Vermelho)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                      <div className="w-4 h-4 rounded-full bg-yellow-400 shadow-sm"></div>
                      <span className="text-gray-200 font-bold">50% a 69.9% &rarr;</span>
                      <span className="text-blue-200 font-bold">Qualificado</span>
                      <span className="text-gray-400 text-xs">(Fundo Amarelo)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                      <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></div>
                      <span className="text-gray-200 font-bold">&ge; 70% &rarr;</span>
                      <span className="text-blue-200 font-bold">Certificado</span>
                      <span className="text-gray-400 text-xs">(Fundo Verde Esmeralda)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-center text-sm text-gray-600 dark:text-zinc-300">
                    <thead className="bg-[#1e293b] text-white font-medium whitespace-nowrap">
                      <tr>
                        <th className="px-6 py-4 text-left border-r border-gray-700 sticky left-0 bg-[#1e293b] uppercase tracking-wider text-xs">UNIDADE</th>
                        <th className="px-6 py-4 font-bold border-r border-gray-700 uppercase tracking-wider text-xs">Aderência Geral</th>
                        {PILAR_ORDER.map(pilar => (
                          <th key={pilar} className="px-4 py-4 uppercase tracking-wider text-xs">{pilar}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                      {(() => {
                        // Primeiro, calcula a pontuação de todas as unidades usando o sistema de pontos (Aderência Oficial)
                        const unitsWithPontos = UNIDADES_DISPONIVEIS.map(unidade => {
                          const unitAudit = allAutoauditorias.find(a => 
                            String(a.unidade) === String(unidade) && a.mesAno === autoauditoriaMesAno
                          );
                          const activeBaseItems = baseItems.filter(i => i.ativo);

                          let totalPoints = 0;
                          let respondidosCount = 0;

                          activeBaseItems.forEach(bi => {
                            const ai = unitAudit?.items?.find((item: any) => item.baseItemId === bi.id);
                            if (ai?.score === '3') {
                              totalPoints += 3;
                            } else if (ai?.score === '1') {
                              totalPoints += 1;
                            }
                            if (ai && ai.score && ai.score !== '') {
                              respondidosCount++;
                            }
                          });

                          const maxPoints = activeBaseItems.length * 3;
                          const aderenciaGeral = maxPoints === 0 ? 0 : (totalPoints / maxPoints) * 100;

                          return {
                            unidade,
                            totalGeral: activeBaseItems.length,
                            respondidosGeral: respondidosCount,
                            aderenciaGeral
                          };
                        }).filter(u => u.totalGeral > 0);

                        // Ordena para definir o ranking (do maior para o menor)
                        const sortedUnits = [...unitsWithPontos].sort((a, b) => b.aderenciaGeral - a.aderenciaGeral);

                        // Mapeia cada unidade para sua posição no ranking com visual de medalha e número
                        const getRankIcon = (unidade: string) => {
                          const index = sortedUnits.findIndex(u => u.unidade === unidade);
                          if (index === 0) return (
                            <div className="flex items-center space-x-1.5 bg-yellow-400 text-yellow-950 px-2.5 py-1 rounded-full border-2 border-yellow-500 shadow-sm transform scale-105" title="1º Lugar">
                              <span className="font-extrabold text-sm leading-none pl-0.5">1º</span>
                              <CustomTrophy gold className="w-5 h-5 drop-shadow-md" />
                            </div>
                          );
                          if (index === 1) return (
                            <div className="flex items-center space-x-1.5 bg-slate-300 text-slate-800 px-2 py-0.5 rounded-full border-2 border-slate-400 shadow-sm opacity-90" title="2º Lugar">
                              <span className="font-bold text-xs leading-none pl-0.5">2º</span>
                              <CustomTrophy silver className="w-4 h-4 drop-shadow-md" />
                            </div>
                          );
                          if (index === 2) return (
                            <div className="flex items-center space-x-1 bg-orange-500 text-orange-50 px-2 py-0.5 rounded-full border-2 border-orange-600 shadow-sm opacity-90" title="3º Lugar">
                              <span className="font-bold text-xs leading-none pl-0.5">3º</span>
                              <CustomTrophy bronze className="w-4 h-4 drop-shadow-md" />
                            </div>
                          );
                          return null;
                        };

                        return sortedUnits.map(({ unidade, aderenciaGeral, totalGeral, respondidosGeral }) => {

                          return (
                            <tr key={unidade} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors odd:bg-white even:bg-gray-50 dark:odd:bg-zinc-900 dark:even:bg-zinc-800/50">
                              <td className="px-6 py-5 font-bold text-gray-900 dark:text-zinc-100 border-r border-gray-200 dark:border-zinc-700 sticky left-0 bg-inherit shadow-[1px_0_0_0_rgba(229,231,235,1)] dark:shadow-[1px_0_0_0_rgba(63,63,70,1)] z-10 w-48">
                                <div className="flex flex-col items-center justify-center space-y-1">
                                  <div className="flex items-center space-x-2">
                                    {getRankIcon(unidade)}
                                    <span className="whitespace-nowrap">CD {unidade}</span>
                                  </div>
                                  <div className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400 text-center tracking-wide">
                                    {CD_REGIONS[unidade]?.divisao || 'Geral'}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 font-bold border-r border-gray-200 dark:border-zinc-700 bg-blue-50/30 dark:bg-blue-900/5">
                                <div className="flex flex-col items-center justify-center">
                                  <span className={`px-3 py-1.5 rounded-md text-sm shadow-sm ${aderenciaGeral === 0 ? 'bg-gray-400 dark:bg-zinc-600 text-white' :
                                    aderenciaGeral >= 70 ? 'bg-emerald-500 text-white' :
                                      aderenciaGeral >= 50 ? 'bg-yellow-400 text-yellow-950 font-bold' :
                                        'bg-red-500 text-white'
                                    }`}>
                                    {aderenciaGeral.toFixed(1).replace('.', ',')}%
                                  </span>
                                  {totalGeral > 0 && (
                                    <div className="flex items-center space-x-1 mt-1.5 bg-gray-100 dark:bg-zinc-950 px-2 py-0.5 rounded text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700">
                                      <span className={respondidosGeral === totalGeral ? "text-emerald-600 dark:text-emerald-500" : "text-gray-900 dark:text-white"}>{respondidosGeral}</span>
                                      <span className="text-gray-400 dark:text-zinc-500">/</span>
                                      <span className="text-gray-500 dark:text-zinc-400">{totalGeral}</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              {PILAR_ORDER.map(pilar => {
                                const pilarBaseItems = baseItems.filter(i => i.pilar === pilar && i.ativo);
                                const unitAudit = allAutoauditorias.find(a => 
                                  String(a.unidade) === String(unidade) && a.mesAno === autoauditoriaMesAno
                                );

                                let pilarPoints = 0;
                                let pilarRespondidos = 0;

                                pilarBaseItems.forEach(bi => {
                                  const ai = unitAudit?.items?.find((item: any) => item.baseItemId === bi.id);
                                  if (ai?.score === '3') {
                                    pilarPoints += 3;
                                  } else if (ai?.score === '1') {
                                    pilarPoints += 1;
                                  }
                                  if (ai && ai.score && ai.score !== '') {
                                    pilarRespondidos++;
                                  }
                                });

                                const pilarMaxPoints = pilarBaseItems.length * 3;
                                const pAderencia = pilarMaxPoints === 0 ? 0 : (pilarPoints / pilarMaxPoints) * 100;

                                return (
                                  <td key={`${unidade}-${pilar}`} className="px-4 py-5 border-b border-gray-100 dark:border-zinc-800/80">
                                    {pilarMaxPoints > 0 ? (
                                      <div className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white dark:hover:bg-zinc-800 shadow-sm transition-colors border border-transparent hover:border-gray-200 dark:hover:border-zinc-700">
                                        <span className={`text-sm font-bold px-2 py-1 rounded shadow-sm ${pAderencia === 0 ? 'bg-gray-400 dark:bg-zinc-600 text-white' :
                                          pAderencia >= 70 ? 'bg-emerald-500 text-white' :
                                            pAderencia >= 50 ? 'bg-yellow-400 text-yellow-950' :
                                              'bg-red-500 text-white'
                                          }`}>
                                          {pAderencia.toFixed(1).replace('.', ',')}%
                                        </span>
                                        <div className="flex items-center space-x-1 mt-1.5 bg-gray-100 dark:bg-zinc-950 px-2 py-0.5 rounded text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700">
                                          <span className={pilarRespondidos === pilarBaseItems.length ? "text-emerald-600 dark:text-emerald-500" : "text-gray-900 dark:text-white"}>{pilarRespondidos}</span>
                                          <span className="text-gray-400 dark:text-zinc-500">/</span>
                                          <span className="text-gray-500 dark:text-zinc-400">{pilarBaseItems.length}</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-gray-300 dark:text-zinc-700 flex justify-center">-</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'base-checklist' && (currentUser.role === 'ADMIN' || currentUser.role === 'AUDITOR' || currentUser.role === 'GERENTE_DIVISIONAL' || currentUser.role === 'DIRETORIA' || currentUser.role === 'GERENTE_DO_CD') ? (
            <div className="max-w-7xl mx-auto w-full py-8 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Base de Dados do Check-List</h2>
                  <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Gerencie os itens padrão que aparecerão nos preenchimentos.</p>
                </div>
                <div className="flex space-x-3 items-center">
                  <button
                    onClick={openNewBaseItemModal}
                    className="bg-amber-500 text-zinc-950 px-4 py-2 rounded-md font-medium hover:bg-amber-400 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Novo Item Base</span>
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600 dark:text-zinc-300">
                    <thead className="bg-gray-50 dark:bg-zinc-950/50 border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 font-medium">
                      <tr>
                        <th className="px-6 py-4">Código</th>
                        <th className="px-6 py-4">Pilar</th>
                        <th className="px-6 py-4">Bloco</th>
                        <th className="px-6 py-4">Item</th>

                        <th className="px-6 py-4">Evidência</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                      {baseItems.map((baseItem) => (
                        <tr key={baseItem.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group">
                          <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-zinc-400">{baseItem.code}</td>
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-zinc-200">{baseItem.pilar}</td>
                          <td className="px-6 py-4">{baseItem.bloco}</td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs truncate" title={baseItem.item}>{baseItem.item}</div>
                          </td>

                          <td className="px-6 py-4">
                            {baseItem.exigeEvidencia ? (
                              <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10 px-2 py-1 rounded text-xs font-medium">
                                <Check className="w-3 h-3" /> <span>Sim</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs font-medium">
                                <X className="w-3 h-3" /> <span>Não</span>
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {baseItem.ativo ? (
                              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">Ativo</span>
                            ) : (
                              <span className="text-red-600 dark:text-red-400 text-xs font-medium">Inativo</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleDeleteBaseItem(baseItem.id, baseItem.code)}
                              className="p-2 text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 rounded-md transition-colors"
                              title="Excluir Item Base"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditBaseItem(baseItem)}
                              className="p-2 text-gray-400 dark:text-zinc-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-400/10 rounded-md transition-colors"
                              title="Editar Item Base"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'checklist' ? (
            <div className="max-w-7xl mx-auto w-full py-8 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Preenchimento do Check-List</h2>
                  <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Execute a auditoria e atribua responsáveis.</p>
                </div>
              </div>

              {/* Painel de Resumo */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm mb-6">
                {/* Top Section */}
                <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-zinc-800 border-b border-gray-200 dark:border-zinc-800 p-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{progressoTotal.toFixed(1).replace('.', ',')}%</div>
                    <div className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Progresso Total</div>
                    <div className="text-xs text-gray-400 dark:text-zinc-500">({totalRespondidos}/{totalItems} itens)</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{aderenciaMedia.toFixed(1).replace('.', ',')}%</div>
                    <div className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Aderência Média</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{statusGeral}</div>
                    <div className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Status Geral</div>
                  </div>
                </div>

                {/* Table Section */}
                <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/50 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-zinc-200">Resumo por Pilar</h3>
                  <div className="flex items-center space-x-3">
                    <select
                      value={selectedPilarFilter}
                      onChange={(e) => setSelectedPilarFilter(e.target.value)}
                      className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-zinc-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                    >
                      <option value="Minhas Atribuições">Minhas atribuições</option>
                      <option value="Todos">Todos os Pilares</option>
                      {pilares.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowOnlyPending(!showOnlyPending)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${showOnlyPending ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                    >
                      {showOnlyPending ? 'Mostrar Todos' : 'Ver Pendências'}
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-center text-sm text-gray-600 dark:text-zinc-300">
                    <thead className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 font-bold">
                      <tr>
                        <th className="px-6 py-4 text-left">Pilar</th>
                        <th className="px-6 py-4">Total de Itens</th>
                        <th className="px-6 py-4 text-emerald-600 dark:text-emerald-400">Conforme</th>
                        <th className="px-6 py-4 text-red-600 dark:text-red-400">Não Conforme</th>
                        <th className="px-6 py-4">Progresso</th>
                        <th className="px-6 py-4">Aderência</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                      {resumoPorPilar.map(row => (
                        <tr key={row.pilar} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="px-6 py-4 text-left font-bold text-gray-900 dark:text-zinc-100">{row.pilar}</td>
                          <td className="px-6 py-4">{row.total}</td>
                          <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">{row.conforme}</td>
                          <td className="px-6 py-4 font-bold text-red-600 dark:text-red-400">{row.naoConforme}</td>
                          <td className="px-6 py-4">{row.progresso.toFixed(1).replace('.', ',')}%</td>
                          <td className="px-6 py-4">{row.aderencia.toFixed(1).replace('.', ',')}%</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-md text-xs font-bold text-white ${row.status === 'Aderente' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setDetailsModalPilar(row.pilar)}
                              className="px-3 py-1.5 border border-blue-500 text-blue-600 dark:text-blue-400 rounded-md text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                            >
                              Ver Detalhes
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-zinc-950 overflow-hidden">
                <div className="overflow-x-auto pb-8">
                  {selectedUnit === 'Todas' ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 dark:text-zinc-400">
                      <LayoutDashboard className="w-16 h-16 mb-4 text-gray-300 dark:text-zinc-700" />
                      <h3 className="text-xl font-bold text-gray-700 dark:text-zinc-300 mb-2">Visão Geral dos CDs</h3>
                      <p className="max-w-md">Selecione um CD específico no menu lateral para preencher ou visualizar os itens do Check-List detalhadamente.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-sm text-gray-600 dark:text-zinc-300">

                      <thead className="hidden">
                        <tr>
                          <th>Pilar</th>
                        </tr>
                      </thead>
                      <tbody className="bg-transparent">
                        {visibleItems
                          .filter(i => i.ativo && (!showOnlyPending || !i.completed) && (selectedPilarFilter === 'Todos' || (selectedPilarFilter === 'Minhas Atribuições' ? (i.assigneeId === currentUser?.id || i.assigneeId2 === currentUser?.id || i.assigneeId3 === currentUser?.id) : i.pilar === selectedPilarFilter)))
                          .sort((a, b) => {
                            const wPilarA = getPilarWeight(a.pilar);
                            const wPilarB = getPilarWeight(b.pilar);
                            if (wPilarA !== wPilarB) return wPilarA - wPilarB;

                            const wBlocoA = getBlocoWeight(a.bloco);
                            const wBlocoB = getBlocoWeight(b.bloco);
                            if (wBlocoA !== wBlocoB) return wBlocoA - wBlocoB;

                            if (prioritySortOrder === 'none') return (a.order || 0) - (b.order || 0);

                            const weight = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
                            const wA = weight[a.prioridade || 'Média'];
                            const wB = weight[b.prioridade || 'Média'];
                            return prioritySortOrder === 'desc' ? wB - wA : wA - wB;
                          })
                          .map((checkItem) => {
                            const dueDateStatus = getDueDateStatus(checkItem.prazo);
                            const isApproaching = dueDateStatus === 'approaching' && !checkItem.completed;
                            const isOverdue = dueDateStatus === 'overdue' && !checkItem.completed;

                            return (
                              <React.Fragment key={checkItem.id}>
                                {/* Row 1: Headers for Item & Score */}
                                <tr className="bg-gray-100 dark:bg-zinc-800/80">
                                  <td rowSpan={6} className="border border-gray-300 dark:border-zinc-700 p-2 w-32 bg-white dark:bg-zinc-900 overflow-hidden">
                                    <div className="flex flex-col items-center justify-center h-full space-y-1">
                                      {checkItem.completed && (
                                        <motion.div
                                          initial={{ scale: 0, opacity: 0, y: 10 }}
                                          animate={{ scale: 1, opacity: 1, y: 0 }}
                                          className="text-amber-500/80"
                                          title="Item Bloqueado"
                                        >
                                          <Lock className="w-4 h-4" />
                                        </motion.div>
                                      )}
                                      <div className="text-center">
                                        <div className="font-bold text-gray-900 dark:text-white leading-tight">{checkItem.pilar}</div>
                                        <div className="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5">{checkItem.bloco}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2 font-bold italic text-center text-gray-700 dark:text-zinc-300">
                                    Item a Verificar
                                  </td>
                                  <td colSpan={5} className="border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold text-center text-orange-500 text-lg">Performance</td>
                                </tr>

                                {/* Row 2: Item content & Score value */}
                                <tr className="bg-white dark:bg-zinc-900">
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">
                                    <div className="font-bold text-gray-900 dark:text-white">{checkItem.item}</div>
                                    <div className="text-xs text-gray-600 dark:text-zinc-400 mt-1">{checkItem.descricao}</div>
                                  </td>
                                  <td colSpan={5} className="border border-gray-300 dark:border-zinc-700 p-2">
                                    <DebouncedTextarea
                                      value={checkItem.auditoriaTexto || ''}
                                      onChange={(val) => handleUpdateItemField(checkItem.id, 'auditoriaTexto', val)}
                                      placeholder="Digite o texto aqui"
                                      className="w-full bg-white/50 dark:bg-black/20 border border-transparent hover:border-gray-200 dark:hover:border-zinc-700/50 focus:bg-white dark:focus:bg-zinc-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg text-sm text-center text-orange-500 font-semibold placeholder-orange-300 dark:placeholder-orange-700 resize-y min-h-[50px] p-2 transition-all duration-200 shadow-inner disabled:opacity-40 disabled:cursor-not-allowed"
                                      rows={2}
                                      disabled={currentUser.role !== 'AUDITOR'}
                                    />
                                  </td>
                                </tr>

                                {/* Row 3: Action Headers */}
                                <tr className="bg-gray-100 dark:bg-zinc-800/80 text-center text-xs font-bold italic text-gray-700 dark:text-zinc-300">
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2 text-emerald-600 dark:text-emerald-400">Plano de ação / Obs</td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">Prioridade</td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">Prazo</td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">Atribuído a</td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">Período da ação</td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">Status</td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2 text-orange-500">Performance check</td>
                                </tr>

                                {/* Row 4: Action Values */}
                                <tr className="bg-white dark:bg-zinc-900 text-center">
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">
                                    <DebouncedTextarea
                                      value={checkItem.nossaAcao || ''}
                                      onChange={(val) => handleUpdateItemField(checkItem.id, 'nossaAcao', val)}
                                      placeholder="Descreva a ação a ser tomada..."
                                      className="w-full bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-zinc-700/50 hover:border-gray-300 dark:hover:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm text-gray-700 dark:text-zinc-300 placeholder-gray-400 dark:placeholder-zinc-600 resize-y min-h-[70px] p-3 transition-all duration-200 shadow-inner disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale-[0.5]"
                                      rows={2}
                                      disabled={(checkItem.completed && currentUser.role !== 'ADMIN') || !(currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR' || (currentUser.id === checkItem.assigneeId || currentUser.id === checkItem.assigneeId2 || currentUser.id === checkItem.assigneeId3))}
                                    />
                                  </td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">
                                    <select
                                      value={checkItem.prioridade || 'Média'}
                                      onChange={(e) => handleUpdateItemField(checkItem.id, 'prioridade', e.target.value)}
                                      className="w-full bg-transparent border-none focus:ring-0 text-center text-sm italic text-gray-700 dark:text-zinc-300 cursor-pointer dark:[color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed"
                                      disabled={(checkItem.completed && currentUser.role !== 'ADMIN') || !(currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR' || (currentUser.id === checkItem.assigneeId || currentUser.id === checkItem.assigneeId2 || currentUser.id === checkItem.assigneeId3))}
                                    >
                                      <option value="Alta" className="not-italic font-medium bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100">alta</option>
                                      <option value="Média" className="not-italic font-medium bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100">média</option>
                                      <option value="Baixa" className="not-italic font-medium bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100">baixa</option>
                                    </select>
                                  </td>
                                  <td className={`border border-gray-300 dark:border-zinc-700 p-2 ${isOverdue ? 'bg-red-50 dark:bg-red-900/20' : isApproaching ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}>
                                    <input
                                      type="date"
                                      value={checkItem.prazo || ''}
                                      onChange={(e) => handleUpdateItemField(checkItem.id, 'prazo', e.target.value)}
                                      className={`w-full bg-transparent border-none focus:ring-0 text-center text-sm italic cursor-pointer dark:[color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed ${isOverdue ? 'text-red-600 dark:text-red-400 font-bold' : isApproaching ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-gray-700 dark:text-zinc-300'}`}
                                      disabled={(checkItem.completed && currentUser.role !== 'ADMIN') || !(currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR' || (currentUser.id === checkItem.assigneeId || currentUser.id === checkItem.assigneeId2 || currentUser.id === checkItem.assigneeId3))}
                                    />
                                  </td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">
                                    <div className="flex flex-col space-y-1">
                                      <select
                                        value={checkItem.assigneeId || ''}
                                        onChange={(e) => handleUpdateItemField(checkItem.id, 'assigneeId', e.target.value)}
                                        className="w-full bg-transparent border-none focus:ring-0 text-center text-sm italic text-gray-700 dark:text-zinc-300 cursor-pointer dark:[color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed"
                                        disabled={(checkItem.completed && currentUser.role !== 'ADMIN') || !(currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR')}
                                      >
                                        <option value="" className="not-italic font-medium bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100">Não atribuído</option>
                                        {usersList.filter(u => u.unidade === checkItem.unidade && u.id !== checkItem.assigneeId2 && u.id !== checkItem.assigneeId3).map(u => (
                                          <option key={u.id} value={u.id} className="not-italic font-medium bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100">{u.name.split(' ')[0]}</option>
                                        ))}
                                      </select>

                                      <select
                                        value={checkItem.assigneeId2 || ''}
                                        onChange={(e) => handleUpdateItemField(checkItem.id, 'assigneeId2', e.target.value)}
                                        className="w-full bg-transparent border-none focus:ring-0 text-center text-sm italic text-gray-700 dark:text-zinc-300 cursor-pointer dark:[color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed"
                                        disabled={(checkItem.completed && currentUser.role !== 'ADMIN') || !(currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR')}
                                      >
                                        <option value="" className="not-italic font-medium bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100">Não atribuído</option>
                                        {usersList.filter(u => u.unidade === checkItem.unidade && u.id !== checkItem.assigneeId && u.id !== checkItem.assigneeId3).map(u => (
                                          <option key={`a2-${u.id}`} value={u.id} className="not-italic font-medium bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100">{u.name.split(' ')[0]}</option>
                                        ))}
                                      </select>

                                      <select
                                        value={checkItem.assigneeId3 || ''}
                                        onChange={(e) => handleUpdateItemField(checkItem.id, 'assigneeId3', e.target.value)}
                                        className="w-full bg-transparent border-none focus:ring-0 text-center text-sm italic text-gray-700 dark:text-zinc-300 cursor-pointer dark:[color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed"
                                        disabled={(checkItem.completed && currentUser.role !== 'ADMIN') || !(currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR')}
                                      >
                                        <option value="" className="not-italic font-medium bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100">Não atribuído</option>
                                        {usersList.filter(u => u.unidade === checkItem.unidade && u.id !== checkItem.assigneeId && u.id !== checkItem.assigneeId2).map(u => (
                                          <option key={`a3-${u.id}`} value={u.id} className="not-italic font-medium bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100">{u.name.split(' ')[0]}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">
                                    <input
                                      type="date"
                                      value={checkItem.periodoAcao || ''}
                                      onChange={(e) => handleUpdateItemField(checkItem.id, 'periodoAcao', e.target.value)}
                                      className="w-full bg-transparent border-none focus:ring-0 text-center text-sm italic text-gray-700 dark:text-zinc-300 cursor-pointer dark:[color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed"
                                      disabled={(checkItem.completed && currentUser.role !== 'ADMIN') || !(currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR' || (currentUser.id === checkItem.assigneeId || currentUser.id === checkItem.assigneeId2 || currentUser.id === checkItem.assigneeId3))}
                                    />
                                  </td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">
                                    {checkItem.completed ? (
                                      <div className="flex flex-col items-center justify-center space-y-1">
                                        <div className="flex items-center justify-center space-x-2">
                                          {checkItem.aderente ? (
                                            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm italic whitespace-nowrap">Conforme <Check className="w-4 h-4 inline" /></span>
                                          ) : (
                                            <span className="text-red-600 dark:text-red-400 font-bold text-sm italic whitespace-nowrap">Não Conforme <X className="w-4 h-4 inline" /></span>
                                          )}
                                          {(currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR' || (currentUser.id === checkItem.assigneeId || currentUser.id === checkItem.assigneeId2 || currentUser.id === checkItem.assigneeId3)) && (
                                            <button onClick={() => handleUndoEvaluation(checkItem.id)} className="p-1 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-gray-300 transition-colors" title="Desfazer">
                                              <Edit2 className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>
                                        {checkItem.completedAt && (
                                          <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">{checkItem.completedAt}</span>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center space-x-2">
                                        <span className="text-gray-500 dark:text-zinc-400 font-bold text-sm italic">Pendente</span>
                                        {(currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR' || (currentUser.id === checkItem.assigneeId || currentUser.id === checkItem.assigneeId2 || currentUser.id === checkItem.assigneeId3)) && (
                                          <>
                                            <button onClick={() => handleEvaluateItem(checkItem.id, true)} className="p-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors" title="Marcar como Conforme">
                                              <Check className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleEvaluateItem(checkItem.id, false)} className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors" title="Marcar como Não Conforme">
                                              <X className="w-4 h-4" />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">
                                    {checkItem.auditoriaRealizada ? (
                                      <div className="flex flex-col items-center justify-center space-y-1">
                                        <div className="flex items-center justify-center space-x-2">
                                          {checkItem.auditoriaAderente ? (
                                            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm italic whitespace-nowrap">Conforme <Check className="w-4 h-4 inline" /></span>
                                          ) : (
                                            <span className="text-red-600 dark:text-red-400 font-bold text-sm italic whitespace-nowrap">Não Conforme <X className="w-4 h-4 inline" /></span>
                                          )}
                                          {currentUser.role === 'AUDITOR' && (
                                            <button onClick={() => handleUndoAuditoria(checkItem.id)} className="p-1 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-gray-300 transition-colors" title="Desfazer">
                                              <Edit2 className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>
                                        {checkItem.auditoriaCompletedAt && (
                                          <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">{checkItem.auditoriaCompletedAt}</span>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center space-x-2">
                                        <span className="text-gray-500 dark:text-zinc-400 font-bold text-sm italic">Pendente</span>
                                        {currentUser.role === 'AUDITOR' && (
                                          <>
                                            <button onClick={() => handleEvaluateAuditoria(checkItem.id, true)} className="p-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors" title="Aprovar">
                                              <Check className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleEvaluateAuditoria(checkItem.id, false)} className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors" title="Rejeitar">
                                              <X className="w-4 h-4" />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                </tr>

                                {/* Row 5: Justificativa & Evidencias Headers */}
                                <tr className="bg-gray-100 dark:bg-zinc-800/50 text-center text-xs font-bold italic text-gray-700 dark:text-zinc-300">
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2 text-gray-500">Justificativa do responsável</td>
                                  <td colSpan={6} className="border border-gray-300 dark:border-zinc-700 p-2">Anexa Evidências</td>
                                </tr>

                                {/* Row 6: Justificativa & Evidencias Values */}
                                <tr className="bg-white dark:bg-zinc-900 text-center">
                                  <td className="border border-gray-300 dark:border-zinc-700 p-2">
                                    <DebouncedTextarea
                                      value={checkItem.justificativaResponsavel || ''}
                                      onChange={(val) => handleUpdateItemField(checkItem.id, 'justificativaResponsavel', val)}
                                      placeholder="Justifique o motivo de não conseguir atender ao item..."
                                      className="w-full bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-zinc-700/50 hover:border-gray-300 dark:hover:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm text-gray-700 dark:text-zinc-300 placeholder-gray-400 dark:placeholder-zinc-600 resize-y min-h-[70px] p-3 transition-all duration-200 shadow-inner disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale-[0.5]"
                                      rows={2}
                                      disabled={(checkItem.completed && currentUser.role !== 'ADMIN') || !(currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR' || (currentUser.id === checkItem.assigneeId || currentUser.id === checkItem.assigneeId2 || currentUser.id === checkItem.assigneeId3))}
                                    />
                                  </td>
                                  <td colSpan={6} className="border border-gray-300 dark:border-zinc-700 p-2">
                                    <div className="flex justify-around items-start">
                                      {EVIDENCE_CATEGORIES.map(cat => {
                                        const count = checkItem.evidencias?.filter(e => e.category === cat.id).length || 0;
                                        return (
                                          <button
                                            key={cat.id}
                                            onClick={() => {
                                              const canAccess = currentUser.role === 'ADMIN' || currentUser.role === 'AUDITOR' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR' || currentUser.id === checkItem.assigneeId || currentUser.id === checkItem.assigneeId2 || currentUser.id === checkItem.assigneeId3;
                                              if (!canAccess) return;
                                              setSelectedItemForEvidence(checkItem);
                                              setSelectedEvidenceCategory(cat.id);
                                              setIsEvidenceModalOpen(true);
                                            }}
                                            disabled={!(currentUser.role === 'ADMIN' || currentUser.role === 'AUDITOR' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR' || currentUser.id === checkItem.assigneeId || currentUser.id === checkItem.assigneeId2 || currentUser.id === checkItem.assigneeId3)}
                                            className="flex flex-col items-center justify-start w-20 text-center group relative disabled:opacity-40 disabled:cursor-not-allowed"
                                          >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm mb-1 transition-transform group-hover:scale-110 ${cat.bg}`}>
                                              <cat.icon className="w-5 h-5" />
                                            </div>
                                            {count > 0 && (
                                              <span className="absolute top-0 right-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-zinc-900">
                                                {count}
                                              </span>
                                            )}
                                            <span className="text-[10px] leading-tight text-gray-700 dark:text-gray-300 italic">{cat.label}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </td>
                                </tr>

                                {/* Spacer Row to separate items */}
                                <tr className="bg-gray-50 dark:bg-zinc-950 border-none">
                                  <td colSpan={8} className="h-8 border-none bg-gray-50 dark:bg-zinc-950"></td>
                                </tr>
                              </React.Fragment>
                            );
                          })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'users' && (currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DIVISIONAL' || currentUser.role === 'DIRETORIA') ? (
            <div className="max-w-7xl mx-auto w-full py-8 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Usuários</h2>
                  <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Controle de acesso e permissões do sistema.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingUserId(null);
                    setUserFormData({ name: '', email: '', role: 'COLABORADOR', password: '', photo: '', unidade: '' });
                    setIsUserModalOpen(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-500 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Usuário</span>
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600 dark:text-zinc-300">
                    <thead className="bg-gray-50 dark:bg-zinc-950/50 border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 font-medium">
                      <tr>
                        <th className="px-6 py-4">Nome</th>
                        <th className="px-6 py-4">E-mail</th>
                        <th className="px-6 py-4">Unidade/CD</th>
                        <th className="px-6 py-4">Nível de Acesso</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                      {usersList.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-zinc-200 flex items-center space-x-3">
                            {user.photo ? (
                              <img src={user.photo} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-zinc-700" />
                            ) : (
                              <div className="bg-gray-200 dark:bg-zinc-800 p-2 rounded-full">
                                <UserIcon className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                              </div>
                            )}
                            <span>{user.name}</span>
                          </td>
                          <td className="px-6 py-4">{user.email}</td>
                          <td className="px-6 py-4">{user.unidade || '-'}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' :
                              user.role === 'AUDITOR' ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' :
                                user.role === 'GERENTE_DIVISIONAL' || user.role === 'DIRETORIA' ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' :
                                  user.role === 'GERENTE_DO_CD' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800' :
                                    user.role === 'DONO_DO_PILAR' ? 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800' :
                                      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
                              }`}>
                              <Shield className="w-3 h-3 mr-1" />
                              {user.role.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-2 text-gray-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-400/10 rounded-md transition-colors focus:opacity-100"
                              title="Editar Usuário"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 rounded-md transition-colors focus:opacity-100"
                              title="Excluir Usuário"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'autoauditoria' ? (
            <div className="max-w-7xl mx-auto w-full py-8 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Autoauditoria - {(currentAutoauditoriaUnit === 'Todas' || currentAutoauditoriaUnit === 'Master') ? 'Selecione um CD' : `Unidade ${currentAutoauditoriaUnit}`}</h2>
                  <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Preencha ou edite a autoauditoria mensal referente à unidade selecionada.</p>
                </div>
                <div className="flex space-x-4 items-center">
                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    disabled={!isPrivileged}
                    className={`bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm font-medium ${!isPrivileged ? 'opacity-70 cursor-not-allowed bg-gray-50' : ''}`}
                  >
                    {!isPrivileged ? (
                      <option value={selectedUnit}>{CD_NAMES[selectedUnit] || selectedUnit}</option>
                    ) : (
                      <>
                        <option value="Todas">Selecionar CD</option>
                        {UNIDADES_DISPONIVEIS.map(u => (
                          <option key={u} value={u}>{CD_NAMES[u] || u}</option>
                        ))}
                      </>
                    )}
                  </select>

                  <select
                    value={selectedAutoauditoriaPilar}
                    onChange={(e) => {
                      setSelectedAutoauditoriaPilar(e.target.value);
                      setSelectedAutoauditoriaBloco('Todos');
                    }}
                    className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm font-medium"
                  >
                    <option value="Todos">Filtrar Pilar</option>
                    {pilares.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>

                  <select
                    value={selectedAutoauditoriaBloco}
                    onChange={(e) => setSelectedAutoauditoriaBloco(e.target.value)}
                    className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm font-medium"
                  >
                    <option value="Todos">Filtrar Bloco</option>
                    {Array.from(new Set(baseItems
                      .filter(item => selectedAutoauditoriaPilar === 'Todos' || item.pilar === selectedAutoauditoriaPilar)
                      .map(item => item.bloco)))
                      .sort((a, b) => getBlocoWeight(a) - getBlocoWeight(b))
                      .map(bloco => (
                        <option key={bloco} value={bloco}>{bloco}</option>
                      ))
                    }
                  </select>

                  <select
                    value={autoauditoriaMesAno}
                    onChange={(e) => setAutoauditoriaMesAno(e.target.value)}
                    className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm font-medium"
                  >
                    {[0, 1, 2, 3, 4, 5].map((offset) => {
                      const d = new Date();
                      d.setMonth(d.getMonth() - offset);
                      const mes = d.toLocaleString('pt-BR', { month: 'long' });
                      const ano = d.getFullYear();
                      const val = `${mes.charAt(0).toUpperCase() + mes.slice(1)}-${ano}`;
                      return <option key={val} value={val}>{val.replace('-', ' ')}</option>;
                    })}
                  </select>

                  {/* Status de auto-save */}
                  {currentUser &&
                    currentAutoauditoriaUnit !== 'Todas' &&
                    currentAutoauditoriaUnit !== 'Master' &&
                    ['ADMIN', 'GERENTE_DO_CD', 'DONO_DO_PILAR'].includes(currentUser?.role || '') &&
                    (currentUser?.role === 'ADMIN' || currentUser?.unidade === currentAutoauditoriaUnit) && (
                      <div className="flex items-center space-x-2 text-sm">
                        {isSavingAutoauditoria ? (
                          <span className="text-amber-600 dark:text-amber-500 flex items-center bg-amber-50 dark:bg-amber-500/10 px-3 py-2 rounded-md border border-amber-200 dark:border-amber-500/20">
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Salvando...
                          </span>
                        ) : lastSavedTime ? (
                          <span className="text-emerald-600 dark:text-emerald-500 flex items-center bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 rounded-md border border-emerald-200 dark:border-emerald-500/20">
                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Salvo às {lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : null}
                      </div>
                    )}
                </div>
              </div>

              {(currentAutoauditoriaUnit !== 'Todas' && currentAutoauditoriaUnit !== 'Master') ? (
                <>
                  <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm mb-6">
                    <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/50">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-zinc-200">Painel de Conformidade por Pilar</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-center text-sm text-gray-600 dark:text-zinc-300">
                        <thead className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 font-bold">
                          <tr>
                            <th className="px-6 py-4 text-left">Pilar Estratégico</th>
                            <th className="px-6 py-4 text-emerald-600 dark:text-emerald-400" title="Conformidade Plena">Conforme</th>
                            <th className="px-6 py-4 text-amber-600 dark:text-amber-400" title="Conformidade Parcial">Parcial</th>
                            <th className="px-6 py-4 text-red-600 dark:text-red-400" title="Não Conforme">Não Conforme</th>
                            <th className="px-6 py-4" title="Índice de Aderência">Aderência</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                          {pilares
                            .filter(pilar => selectedAutoauditoriaPilar === 'Todos' || pilar === selectedAutoauditoriaPilar)
                            .map(pilar => {
                              const pilarItems = baseItems.filter(item => item.pilar === pilar);
                              if (pilarItems.length === 0) return null;

                              let atende = 0;
                              let parcial = 0;
                              let naoAtende = 0;
                              let totalPoints = 0;
                              let answeredCount = 0;

                              pilarItems.forEach(item => {
                                const score = autoauditoriaData[item.id]?.score;
                                if (score === '3' || score === '1' || score === '0') {
                                  answeredCount++;
                                }

                                if (score === '3') {
                                  atende++;
                                  totalPoints += 3;
                                } else if (score === '1') {
                                  parcial++;
                                  totalPoints += 1;
                                } else if (score === '0') {
                                  naoAtende++;
                                }
                              });

                              const maxPoints = pilarItems.length * 3;
                              const aderencia = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;
                              const progresso = pilarItems.length > 0 ? (answeredCount / pilarItems.length) * 100 : 0;

                              let aderenciaColor = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'; // < 50%
                              if (aderencia >= 70) {
                                aderenciaColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
                              } else if (aderencia >= 50) {
                                aderenciaColor = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
                              }

                              let pilarDashboardName = pilar;
                              if (pilar === 'Cliente') pilarDashboardName = 'Clientes';

                              const dashCard = dashboardData.find(c => c.title === pilarDashboardName);
                              const Icon = dashCard?.icon || Circle;
                              const iconColor = dashCard?.color || 'bg-gray-500';
                              const barColor = dashCard?.autoColor || 'bg-blue-500';

                              return (
                                <tr key={pilar} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                  <td className="px-6 py-4 text-left">
                                    <div className="flex items-center space-x-3">
                                      <div className={`flex-shrink-0 p-1.5 rounded-md text-white ${iconColor}`}>
                                        <Icon className="w-4 h-4" />
                                      </div>
                                      <div className="flex flex-col w-full min-w-[150px]">
                                        <span className="font-medium text-gray-900 dark:text-zinc-200 mb-1">{pilar}</span>
                                        <div className="w-full">
                                          <div className="flex justify-between text-[10px] text-gray-500 dark:text-zinc-400 font-medium mb-1 pr-4">
                                            <span>{Math.round(progresso)}% concl.</span>
                                            <span>{answeredCount}/{pilarItems.length}</span>
                                          </div>
                                          <div className="h-1.5 w-full bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden" title={`${answeredCount} de ${pilarItems.length} respondidas`}>
                                            <motion.div
                                              initial={{ width: 0 }}
                                              animate={{ width: `${Math.min(progresso, 100)}%` }}
                                              transition={{ duration: 1, ease: "easeOut" }}
                                              className={`h-full bg-blue-500 rounded-full`}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">{atende}</td>
                                  <td className="px-6 py-4 font-bold text-amber-600 dark:text-amber-400">{parcial}</td>
                                  <td className="px-6 py-4 font-bold text-red-600 dark:text-red-400">{naoAtende}</td>
                                  <td className="px-6 py-4">
                                    <div className="flex justify-center">
                                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${aderenciaColor}`}>
                                        {aderencia.toFixed(1).replace('.', ',')}%
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-gray-600 dark:text-zinc-300">
                        <thead className="bg-gray-50 dark:bg-zinc-950/50 border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 font-medium whitespace-nowrap">
                          <tr>
                            <th className="px-6 py-4">Pilar</th>
                            <th className="px-6 py-4">Bloco</th>
                            <th className="px-6 py-4">Trilha</th>
                            <th className="px-6 py-4 min-w-[300px]">Pergunta/Verificação</th>
                            <th className="px-6 py-4">Ponto</th>
                            <th className="px-6 py-4 min-w-[200px]">Plano de ação / Obs</th>
                            <th className="px-6 py-4">Evidência</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                          {baseItems
                            .filter(item => (selectedAutoauditoriaPilar === 'Todos' || item.pilar === selectedAutoauditoriaPilar) && (selectedAutoauditoriaBloco === 'Todos' || item.bloco === selectedAutoauditoriaBloco))
                            .sort((a, b) => {
                              const pilarDiff = getPilarWeight(a.pilar) - getPilarWeight(b.pilar);
                              if (pilarDiff !== 0) return pilarDiff;
                              return getBlocoWeight(a.bloco) - getBlocoWeight(b.bloco);
                            })
                            .map((baseItem) => {
                              const scoreValue = autoauditoriaData[baseItem.id]?.score || '';
                              const nossaAcaoValue = autoauditoriaData[baseItem.id]?.nossaAcao || '';
                              const evidenciaItemDB = autoauditoriaData[baseItem.id]?.evidencias?.[0];
                              const existingUrl = evidenciaItemDB?.url || undefined;
                              const canEdit = currentUser &&
                                ['ADMIN', 'GERENTE_DO_CD', 'DONO_DO_PILAR'].includes(currentUser?.role || '') &&
                                (currentUser?.role === 'ADMIN' || currentUser?.unidade === currentAutoauditoriaUnit);

                              return (
                                <AutoauditoriaRow
                                  key={baseItem.id}
                                  item={baseItem}
                                  canEdit={!!canEdit}
                                  pontoValue={scoreValue}
                                  nossaAcaoValue={nossaAcaoValue}
                                  unidade={currentAutoauditoriaUnit}
                                  mesAno={autoauditoriaMesAno}
                                  existingEvidenciaUrl={existingUrl}
                                  onPontoChange={(itemId, newPonto) => {
                                    pendingAutoauditoriaEdits.current.add(itemId);
                                    needsAutoauditoriaSave.current = true;
                                    setAutoauditoriaData(prev => ({
                                      ...prev,
                                      [itemId]: {
                                        ...(prev[itemId] || { nossaAcao: '', evidencias: [] }),
                                        score: newPonto
                                      }
                                    }));
                                  }}
                                  onNossaAcaoChange={(itemId, newAcao) => {
                                    // Tranca o sync de polling enquanto o usuário digita
                                    pendingAutoauditoriaEdits.current.add(itemId);
                                  }}
                                  onNossaAcaoBlur={(itemId, finalAcao) => {
                                    pendingAutoauditoriaEdits.current.add(itemId);
                                    needsAutoauditoriaSave.current = true;
                                    setAutoauditoriaData(prev => ({
                                      ...prev,
                                      [itemId]: {
                                        ...(prev[itemId] || { score: '', evidencias: [] }),
                                        nossaAcao: finalAcao
                                      }
                                    }));
                                  }}
                                />
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-16 text-center shadow-sm flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <Building className="w-8 h-8 text-gray-400 dark:text-zinc-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-zinc-200 mb-2">Nenhum CD Selecionado</h3>
                  <p className="text-gray-500 dark:text-zinc-400 max-w-md">
                    Selecione um Centro de Distribuição no menu acima para visualizar o painel de conformidade e o checklist da autoauditoria.
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {/* Footer */}
          <footer className="mt-auto pt-8 pb-4 text-center text-[10px] md:text-xs text-gray-400 dark:text-zinc-600 font-medium tracking-wide w-full shrink-0 flex flex-col items-center justify-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1.5">
              <span>© 2026</span>
              <span className="font-bold text-gray-600 dark:text-zinc-400">Magalu</span>
              <span className="px-1 text-gray-300 dark:text-zinc-700">|</span>
              <span className="flex items-center gap-1">
                Feito com <span className="text-red-500 animate-pulse text-sm">❤</span> por
                <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">J's Martins</span>
              </span>
            </div>
          </footer>
        </main>

        {/* Modal Excluir Pilar */}
        {isDeletePilarModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-sm w-full p-6 shadow-xl border border-gray-200 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <Trash2 className="w-5 h-5 mr-2 text-red-500" />
                Excluir Pilar
              </h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6 leading-relaxed">
                Atenção: A exclusão de um Pilar removerá <strong>todos</strong> os itens de base associados a ele. Esta ação não pode ser desfeita.
              </p>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Selecione o Pilar para excluir:</label>
                <select
                  value={pilarToDelete}
                  onChange={(e) => setPilarToDelete(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
                >
                  <option value="">Selecione um pilar...</option>
                  {Array.from(new Set(baseItems.map(b => b.pilar))).filter(Boolean).sort().map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsDeletePilarModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                  disabled={isDeletingPilar}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDeletePilar}
                  disabled={!pilarToDelete || isDeletingPilar}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isDeletingPilar ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isDeletingPilar ? 'Excluindo...' : 'Excluir Pilar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Novo Item de Base */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-800">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingId ? 'Editar Item da Base' : 'Novo Item da Base'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddBaseItem} className="p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Pilar</label>
                      <input required type="text" value={formData.pilar} onChange={(e) => setFormData({ ...formData, pilar: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" placeholder="Ex: Pessoas" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Bloco</label>
                      <input required type="text" value={formData.bloco} onChange={(e) => setFormData({ ...formData, bloco: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" placeholder="Ex: Reconhecimento" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Trilha</label>
                      <input required type="text" value={formData.trilha} onChange={(e) => setFormData({ ...formData, trilha: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" placeholder="Ex: Básico bem feito" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Item (Pergunta/Verificação)</label>
                    <input required type="text" value={formData.item} onChange={(e) => setFormData({ ...formData, item: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" placeholder="Ex: Programa de reconhecimento formalizado?" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Descrição / Instrução</label>
                    <textarea required value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all min-h-[80px]" placeholder="Instruções detalhadas sobre como auditar este item..." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 flex items-center gap-2">
                      <span>Plano de ação / Obs (Padrão)</span>
                      <span className="text-xs text-gray-400 dark:text-zinc-500 font-normal italic">- Opcional</span>
                    </label>
                    <textarea value={formData.nossaAcao || ''} onChange={(e) => setFormData({ ...formData, nossaAcao: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all min-h-[60px]" placeholder="Ação padrão a ser tomada que será distribuída para todos..." />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 flex flex-col justify-center pt-6">
                      <label className="flex items-center space-x-3 cursor-pointer group w-fit">
                        <div className="relative flex items-center justify-center">
                          <input type="checkbox" checked={formData.exigeEvidencia} onChange={(e) => setFormData({ ...formData, exigeEvidencia: e.target.checked })} className="peer sr-only" />
                          <div className="w-5 h-5 border-2 border-gray-300 dark:border-zinc-600 rounded bg-gray-50 dark:bg-zinc-950 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-colors"></div>
                          <Check className="w-3.5 h-3.5 text-white dark:text-zinc-950 absolute opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-zinc-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Exige Evidência?</span>
                      </label>
                    </div>
                    <div className="space-y-2 flex flex-col justify-center pt-6">
                      <label className="flex items-center space-x-3 cursor-pointer group w-fit">
                        <div className="relative flex items-center justify-center">
                          <input type="checkbox" checked={formData.ativo} onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })} className="peer sr-only" />
                          <div className="w-5 h-5 border-2 border-gray-300 dark:border-zinc-600 rounded bg-gray-50 dark:bg-zinc-950 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-colors"></div>
                          <Check className="w-3.5 h-3.5 text-white dark:text-zinc-950 absolute opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-zinc-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Item Ativo?</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end space-x-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">Cancelar</button>
                    <button type="submit" className="bg-amber-500 text-zinc-950 px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-400 transition-colors flex items-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>{editingId ? 'Salvar Alterações' : 'Salvar Item'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal Novo Usuário (Apenas Admin) */}
        <AnimatePresence>
          {isUserModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm" onClick={() => setIsUserModalOpen(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-800">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingUserId ? 'Editar Usuário' : 'Criar Novo Usuário'}</h3>
                  <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddUser} className="p-6 space-y-4">
                  <div className="flex flex-col items-center justify-center mb-4">
                    <div className="relative group">
                      {userFormData.photo ? (
                        <img src={userFormData.photo} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-zinc-700" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-zinc-700 group-hover:border-blue-500 dark:group-hover:border-blue-500 transition-colors">
                          <UserIcon className="w-8 h-8 text-gray-400 dark:text-zinc-500" />
                        </div>
                      )}
                      <div
                        className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                        onClick={() => document.getElementById('newUserPhoto')?.click()}
                      >
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Foto</span>
                      </div>
                      {userFormData.photo && (
                        <button
                          type="button"
                          onClick={() => setUserFormData({ ...userFormData, photo: '' })}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-sm"
                          title="Remover foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <input
                      id="newUserPhoto"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setUserFormData({ ...userFormData, photo: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Nome Completo</label>
                    <input required type="text" value={userFormData.name} onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Ex: João Silva" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Unidade/CD</label>
                    <select required value={userFormData.unidade} onChange={(e) => setUserFormData({ ...userFormData, unidade: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer truncate">
                      <option value="" disabled>Selecione um CD</option>
                      <option value="Master">Master</option>
                      {UNIDADES_DISPONIVEIS.map(u => (
                        <option key={u} value={u} className="truncate">CD {CD_NAMES[u] || u}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">E-mail</label>
                    <input required type="email" value={userFormData.email} onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="joao@magalu.com" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Senha Temporária</label>
                    <input required type="password" value={userFormData.password} onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="••••••" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Nível de Acesso (Papel)</label>
                    <select value={userFormData.role} onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as Role })} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none">
                      <option value="COLABORADOR">Colaborador (Apenas visualiza)</option>
                      <option value="DONO_DO_PILAR">Dono do Pilar (Edita e atribui no Check-List)</option>
                      <option value="GERENTE_DO_CD">Gerente do CD (Pode editar Check-List)</option>
                      <option value="GERENTE_DIVISIONAL">Gerente Divisional (Visualiza todas as unidades, não edita)</option>
                      <option value="DIRETORIA">Diretoria (Visualiza todas as unidades, não edita)</option>
                      <option value="ADMIN">Administrador (Acesso Total)</option>
                      <option value="AUDITOR">Auditor (Validação de Check-list)</option>
                    </select>
                  </div>

                  <div className="pt-6 flex justify-end space-x-3">
                    <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">Cancelar</button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition-colors flex items-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>{editingUserId ? 'Salvar Alterações' : 'Criar Usuário'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Evidence Modal */}
        <AnimatePresence>
          {isEvidenceModalOpen && selectedItemForEvidence && selectedEvidenceCategory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-zinc-800"
              >
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/50">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Evidências</h3>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{selectedItemForEvidence.item}</p>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1 uppercase tracking-wider">
                      {EVIDENCE_CATEGORIES.find(c => c.id === selectedEvidenceCategory)?.label}
                    </p>
                  </div>
                  <button onClick={() => setIsEvidenceModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-gray-300 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Upload Section - Permite apenas quem pode editar */}
                  {((!selectedItemForEvidence.completed || currentUser.role === 'ADMIN') && (currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR' || currentUser.id === selectedItemForEvidence.assigneeId || currentUser.id === selectedItemForEvidence.assigneeId2 || currentUser.id === selectedItemForEvidence.assigneeId3)) ? (
                    <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <input
                        type="file"
                        id="evidence-upload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              if (!selectedItemForEvidence) return;
                              const newEvidence = { name: file.name, url: reader.result as string, category: selectedEvidenceCategory || '' };
                              const item = items.find(i => i.id === selectedItemForEvidence.id);
                              if (item) {
                                const newEvidencias = [...(item.evidencias || []), newEvidence];
                                setSelectedItemForEvidence({ ...item, evidencias: newEvidencias });
                                await api.updateChecklist(item.id, { evidencias: newEvidencias } as any);
                                loadData();
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label htmlFor="evidence-upload" className="cursor-pointer flex flex-col items-center">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-3">
                          <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Clique para anexar evidência</span>
                        <span className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Imagens, PDFs ou documentos</span>
                      </label>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg text-center">
                      <p className="text-sm text-gray-500 dark:text-zinc-400">
                        O seu nível de acesso atual permite apenas visualização dos anexos.
                      </p>
                    </div>
                  )}

                  {/* Evidence List */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Arquivos Anexados</h4>
                    {(() => {
                      const categoryEvidences = selectedItemForEvidence.evidencias?.filter(e => e.category === selectedEvidenceCategory) || [];
                      return categoryEvidences.length > 0 ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                          {categoryEvidences.map((ev, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg">
                              <button
                                type="button"
                                onClick={() => setPreviewEvidence(ev)}
                                className="flex items-center space-x-3 overflow-hidden text-left hover:opacity-80 transition-opacity"
                              >
                                <div className="w-8 h-8 bg-gray-200 dark:bg-zinc-800 rounded flex items-center justify-center flex-shrink-0">
                                  {ev.url.startsWith('data:image') ? (
                                    <img src={ev.url} alt="thumb" className="w-full h-full object-cover rounded" />
                                  ) : (
                                    <Database className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                                  )}
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-zinc-300 truncate">{ev.name}</span>
                              </button>
                              <div className="flex items-center space-x-2 ml-4">
                                <a href={ev.url} download={ev.name} className="p-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded transition-colors" title="Baixar">
                                  <ArrowDown className="w-4 h-4" />
                                </a>
                                {((!selectedItemForEvidence.completed || currentUser.role === 'ADMIN') && (currentUser.role === 'ADMIN' || currentUser.role === 'GERENTE_DO_CD' || currentUser.role === 'DONO_DO_PILAR' || currentUser.id === selectedItemForEvidence.assigneeId || currentUser.id === selectedItemForEvidence.assigneeId2 || currentUser.id === selectedItemForEvidence.assigneeId3)) && (
                                  <button
                                    onClick={async () => {
                                      if (!selectedItemForEvidence) return;
                                      const item = items.find(i => i.id === selectedItemForEvidence.id);
                                      if (item && item.evidencias) {
                                        const newEvidencias = item.evidencias.filter(e => e.url !== ev.url);
                                        await api.updateChecklist(item.id, { evidencias: newEvidencias } as any);
                                        setSelectedItemForEvidence({ ...item, evidencias: newEvidencias });
                                        loadData();
                                      }
                                    }}
                                    className="flex items-center space-x-1 px-2 py-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded transition-colors"
                                    title="Remover"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="text-xs font-medium">Remover</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-800 rounded-lg border-dashed">
                          <p className="text-sm text-gray-500 dark:text-zinc-400">Nenhuma evidência anexada ainda.</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Preview Evidence Modal */}
        <AnimatePresence>
          {previewEvidence && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-zinc-800"
              >
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/50">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate pr-4">{previewEvidence.name}</h3>
                  <div className="flex items-center space-x-2">
                    <a
                      href={previewEvidence.url}
                      download={previewEvidence.name}
                      className="px-3 py-1.5 flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                    >
                      <ArrowDown className="w-4 h-4" />
                      <span>Baixar</span>
                    </a>
                    <button onClick={() => setPreviewEvidence(null)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-gray-300 transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-4 bg-gray-100 dark:bg-zinc-950 flex items-center justify-center min-h-[50vh]">
                  {previewEvidence.url.startsWith('data:image') ? (
                    <img src={previewEvidence.url} alt={previewEvidence.name} className="max-w-full max-h-[70vh] object-contain rounded shadow-sm" />
                  ) : previewEvidence.url.startsWith('data:application/pdf') ? (
                    <object data={previewEvidence.url} type="application/pdf" className="w-full h-[70vh] rounded">
                      <div className="text-center p-6 bg-white dark:bg-zinc-800 rounded">
                        <p className="mb-4 text-gray-700 dark:text-zinc-300">O navegador não suporta a visualização deste PDF.</p>
                        <a href={previewEvidence.url} download={previewEvidence.name} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors inline-block">Baixar PDF</a>
                      </div>
                    </object>
                  ) : (
                    <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 max-w-md mx-auto">
                      <Database className="w-16 h-16 text-gray-400 dark:text-zinc-600 mx-auto mb-4" />
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Visualização não disponível</h4>
                      <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">Este tipo de arquivo não pode ser visualizado diretamente no navegador. Por favor, faça o download para abri-lo.</p>
                      <a href={previewEvidence.url} download={previewEvidence.name} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors inline-flex items-center space-x-2">
                        <ArrowDown className="w-4 h-4" />
                        <span>Baixar Arquivo</span>
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        {/* Modal Trocar Senha */}
        <AnimatePresence>
          {isChangePasswordModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-zinc-800"
              >
                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-950/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500 rounded-lg text-zinc-950">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Trocar Senha</h3>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">Atualize sua credencial de acesso</p>
                    </div>
                  </div>
                  <button onClick={() => setIsChangePasswordModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                  {changePasswordError && (
                    <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{changePasswordError}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Senha Atual</label>
                    <input
                      type="password"
                      required
                      value={passwordFormData.oldPassword}
                      onChange={(e) => setPasswordFormData({ ...passwordFormData, oldPassword: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Nova Senha</label>
                    <input
                      type="password"
                      required
                      value={passwordFormData.newPassword}
                      onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      placeholder="Mínimo 3 caracteres"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Confirmar Nova Senha</label>
                    <input
                      type="password"
                      required
                      value={passwordFormData.confirmPassword}
                      onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      placeholder="Repita a nova senha"
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsChangePasswordModalOpen(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-sm font-bold text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="flex-2 px-6 py-2.5 rounded-xl bg-amber-500 text-zinc-950 text-sm font-black hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                    >
                      {isChangingPassword ? (
                        <div className="w-4 h-4 border-2 border-zinc-950/20 border-t-zinc-950 rounded-full animate-spin" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                      Atualizar Senha
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div >
    </div >
  );
}
