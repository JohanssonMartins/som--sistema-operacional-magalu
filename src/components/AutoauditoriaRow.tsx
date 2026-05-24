import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, PlusCircle, X, Upload, Sparkles, Loader2, HelpCircle, Link, Calendar, User, MapPin, DollarSign, Settings, FileText, Activity } from 'lucide-react';
import { ChecklistItem } from '../data';
import { api } from '../api';
import { formatBlocoName } from '../utils/appUtils';
import { useStore } from '../store/useStore';

export interface ActionPlan5W2H {
  what: string;
  why: string;
  where: string;
  who: string;
  whenStart: string;
  whenEnd: string;
  how: string;
  howMuch: string;
  status: string;
  observations?: string;
}

export const parse5W2H = (val: string): ActionPlan5W2H => {
  try {
    const trimmed = (val || '').trim();
    if (trimmed.startsWith('{')) {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object') {
        return {
          what: parsed.what || '',
          why: parsed.why || '',
          where: parsed.where || '',
          who: parsed.who || '',
          whenStart: parsed.whenStart || '',
          whenEnd: parsed.whenEnd || '',
          how: parsed.how || '',
          howMuch: parsed.howMuch || '',
          status: parsed.status || 'Não Iniciado',
          observations: parsed.observations || ''
        };
      }
    }
  } catch (e) {
    // Fail silently
  }
  return {
    what: val || '',
    why: '',
    where: '',
    who: '',
    whenStart: '',
    whenEnd: '',
    how: '',
    howMuch: '',
    status: 'Não Iniciado',
    observations: ''
  };
};

export const stringify5W2H = (plan: ActionPlan5W2H): string => {
  return JSON.stringify(plan);
};

export const is5W2HEmpty = (plan: ActionPlan5W2H): boolean => {
  return !plan.what.trim() && 
         !plan.why.trim() && 
         !plan.where.trim() && 
         !plan.who.trim() && 
         !plan.whenStart.trim() && 
         !plan.whenEnd.trim() && 
         !plan.how.trim() && 
         !plan.howMuch.trim() &&
         !(plan.observations || '').trim();
};

interface AutoauditoriaRowProps {
  item: ChecklistItem;
  canEdit: boolean;
  pontoValue: string;
  nossaAcaoValue: string;
  onPontoChange: (itemId: string, newPonto: string) => void;
  onNossaAcaoChange: (itemId: string, newAcao: string) => void;
  onNossaAcaoBlur: (itemId: string, finalAcao: string) => void;
  unidade: string;
  mesAno: string;
  tipo?: 'AUTO' | 'EXTERNA';
  evidencias?: any[];
  onEvidenciaUploaded?: (itemId: string, evidencia: any) => void;
  onEvidenciaDeleted?: (itemId: string, evidenceId: string) => void;
  isNossaAcaoReadOnly?: boolean;
  isEvidenceReadOnly?: boolean;
  cdPontoValue?: string;
}

export const AutoauditoriaRow = React.memo(({
  item,
  canEdit,
  pontoValue,
  nossaAcaoValue,
  onPontoChange,
  onNossaAcaoChange,
  onNossaAcaoBlur,
  unidade,
  mesAno,
  tipo = 'AUTO',
  evidencias = [],
  onEvidenciaUploaded,
  onEvidenciaDeleted,
  isNossaAcaoReadOnly = false,
  isEvidenceReadOnly = false,
  cdPontoValue
}: AutoauditoriaRowProps) => {
  const usersList = useStore(state => state.usersList || []);

  const [localNossaAcao, setLocalNossaAcao] = useState(nossaAcaoValue);
  const [planState, setPlanState] = useState<ActionPlan5W2H>(() => parse5W2H(nossaAcaoValue));

  const [isUploading, setIsUploading] = useState(false);
  const [driveEvidencias, setDriveEvidencias] = useState<any[]>(() => evidencias.filter(e => e.name !== 'Manual Link' && e.category !== 'Manual'));
  const [manualLinks, setManualLinks] = useState<any[]>(() => evidencias.filter(e => e.name === 'Manual Link' || e.category === 'Manual'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [whoInput, setWhoInput] = useState('');

  const addUser = (userName: string) => {
    const currentUsers = planState.who.split(',').map(s => s.trim()).filter(Boolean);
    if (!currentUsers.includes(userName)) {
      currentUsers.push(userName);
      handlePlanChange('who', currentUsers.join(', '));
    }
  };

  const removeUser = (userName: string) => {
    let currentUsers = planState.who.split(',').map(s => s.trim()).filter(Boolean);
    currentUsers = currentUsers.filter(u => u !== userName);
    handlePlanChange('who', currentUsers.join(', '));
  };

  useEffect(() => {
    setLocalNossaAcao(nossaAcaoValue);
    setPlanState(parse5W2H(nossaAcaoValue));
  }, [nossaAcaoValue]);

  useEffect(() => {
    setDriveEvidencias(evidencias.filter(e => e.name !== 'Manual Link' && e.category !== 'Manual'));
    setManualLinks(evidencias.filter(e => e.name === 'Manual Link' || e.category === 'Manual'));
  }, [evidencias]);

  const activeUsers = useMemo(() => {
    return (usersList || []).filter(u => u.active).sort((a, b) => a.name.localeCompare(b.name));
  }, [usersList]);

  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handlePlanChange = (key: keyof ActionPlan5W2H, value: string) => {
    setPlanState(prev => {
      const next = { ...prev, [key]: value };
      const serialized = stringify5W2H(next);
      setLocalNossaAcao(serialized);
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        onNossaAcaoChange(item.id, serialized);
      }, 500);
      
      return next;
    });
  };

  const handleNossaAcaoBlur = () => {
    if (localNossaAcao !== nossaAcaoValue) {
      onNossaAcaoBlur(item.id, localNossaAcao);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('unidade', unidade);
        formData.append('mesAno', mesAno);
        formData.append('pilar', item.pilar);
        formData.append('bloco', item.bloco);
        formData.append('pergunta', item.item);
        formData.append('baseItemId', item.id);
        formData.append('tipo', tipo);

        const res = await api.uploadEvidenciaGoogleDrive(formData);
        if (res.success && res.evidencia) {
          onEvidenciaUploaded?.(item.id, res.evidencia);
        }
      }
    } catch (error) {
      console.error('Erro no upload da evidência:', error);
      alert('Falha ao enviar arquivo(s) para o Google Drive. Verifique o console.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleEvidenceDelete = async (evidenceIdOrName: string) => {
    if (!canEdit) return;
    
    const ev = evidencias.find(e => e.id === evidenceIdOrName || e.name === evidenceIdOrName);
    if (!ev) return;
    
    const confirmDelete = window.confirm("Deseja realmente remover esta evidência?");
    if (!confirmDelete) return;

    try {
      setIsUploading(true);
      if (ev.id) {
        const res = await api.deleteEvidencia(ev.id);
        if (res.success) {
          onEvidenciaDeleted?.(item.id, ev.id);
        } else {
          alert('Falha ao deletar a evidência.');
        }
      } else {
        onEvidenciaDeleted?.(item.id, ev.name);
      }
    } catch (error) {
      console.error("Erro ao deletar evidência:", error);
      alert("Erro ao deletar evidência.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLinkUpload = async () => {
    if (!canEdit) return;
    const url = window.prompt('Cole aqui o link da evidência (ex: SharePoint, Notion, etc):');
    if (!url || !url.trim()) return;

    try {
      setIsUploading(true);
      const res = await api.saveEvidenciaLink({
        baseItemId: item.id,
        url: url.trim(),
        unidade,
        mesAno,
        tipo
      });
      if (res.success && res.evidencia) {
        onEvidenciaUploaded?.(item.id, res.evidencia);
      }
    } catch (error) {
      console.error('Erro ao salvar link:', error);
      alert('Falha ao salvar o link de evidência.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAISuggestion = async () => {
    try {
      setIsSuggesting(true);
      const res = await api.suggestAction(item.pilar, item.bloco, item.item, item.descricao || '');
      if (res.suggestion) {
        handlePlanChange('what', res.suggestion);
      }
    } catch (error) {
      console.error('Erro ao sugerir com IA:', error);
      alert('Não foi possível obter sugestão da IA agora. Tente mais tarde.');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAIAnalysis = async () => {
    const mainDriveEv = driveEvidencias[0];
    if (!mainDriveEv?.name && !mainDriveEv?.id) {
      alert('ID da evidência não disponível para análise.');
      return;
    }
    try {
      setIsAnalyzing(true);
      const driveFileId = mainDriveEv.name && mainDriveEv.name !== 'Manual Link' ? mainDriveEv.name : mainDriveEv.id;
      const res = await api.analyzeEvidence(item.pilar, item.bloco, item.item, item.descricao || '', driveFileId);
      if (res.analysis) {
        setAiAnalysis(res.analysis);
      }
    } catch (error) {
      console.error('Erro ao analisar com IA:', error);
      alert('Não foi possível analisar a evidência agora.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <tr
      className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group"
    >
      <td className="px-6 py-4 font-medium text-[13px] text-gray-800 dark:text-zinc-200 capitalize">{String(item.pilar || '').toLowerCase()}</td>
      <td className="px-6 py-4 font-medium text-[13px] text-gray-600 dark:text-zinc-300 capitalize">{formatBlocoName(item.bloco).toLowerCase()}</td>
      <td className="px-6 py-4">{item.trilha}</td>
      <td className="px-6 py-4">
        <div className="max-w-md">
          <div className="font-medium text-gray-900 dark:text-zinc-100">{item.item}</div>
          {item.descricao && (
            <div className="text-sm italic text-gray-500 dark:text-zinc-400 mt-1">
              {item.descricao}
            </div>
          )}
        </div>
      </td>
      <td className="px-1 py-3">
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-center gap-1 min-w-[80px]">
            {/* Slot Esquerdo: Nota do CD (apenas em visão EXTERNA) */}
            <div className="w-8 flex justify-end">
              {tipo === 'EXTERNA' && (
                <div
                  title="Nota da Autoavaliação (CD)"
                  className={`w-7 h-7 flex items-center justify-center rounded-md border text-xs font-bold shadow-sm cursor-help shrink-0 ${cdPontoValue === '3'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : cdPontoValue === '1'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : cdPontoValue === '0'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-gray-50 text-gray-400 border-gray-200 border-dashed'
                    }`}
                >
                  {cdPontoValue || '-'}
                </div>
              )}
            </div>

            {/* Slot Central: Seletor Principal */}
            <select
              value={pontoValue}
              disabled={!canEdit}
              onChange={(e) => onPontoChange(item.id, e.target.value)}
              className={`w-12 h-7 border border-gray-200 dark:border-zinc-800 rounded-md px-0.5 py-0 text-xs font-bold transition-all text-center shrink-0 ${!canEdit ? 'opacity-70 cursor-not-allowed' : 'focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-sm'} ${pontoValue === '3'
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                : pontoValue === '1'
                  ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30'
                  : pontoValue === '0'
                    ? 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border-red-300 dark:border-red-500/30'
                    : pontoValue === 'N/A'
                      ? 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-300 dark:border-zinc-700'
                      : 'bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white'
                }`}
            >
              <option value=""></option>
              <option value="1">1</option>
              <option value="3">3</option>
              <option value="0">0</option>
              <option value="N/A">N/A</option>
            </select>

            {/* Slot Direito: Botão de Critérios */}
            <div className="w-10 flex justify-start">
              {item.criterios && (
                <button
                  onClick={() => setIsCriteriaModalOpen(true)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors group/help"
                  title="Ver critérios de pontuação"
                >
                  <HelpCircle className="w-4 h-4 text-gray-400 group-hover/help:text-blue-500 transition-colors" />
                </button>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isCriteriaModalOpen && item.criterios && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCriteriaModalOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-950/50">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Critérios de Pontuação</h3>
                  </div>
                  <button
                    onClick={() => setIsCriteriaModalOpen(false)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="text-sm text-gray-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {item.criterios}
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 flex justify-end">
                  <button
                    onClick={() => setIsCriteriaModalOpen(false)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all text-sm"
                  >
                    Entendi
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </td>
      <td className="px-1 py-2">
        <div className="flex justify-center">
          {(() => {
            const hasPlan = localNossaAcao.trim() && !is5W2HEmpty(parse5W2H(localNossaAcao));
            return (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsModalOpen(true)}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all shadow-sm border ${hasPlan
                  ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                  : (pontoValue === '0' || pontoValue === '1')
                    ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-300 dark:border-red-500/30 ring-1 ring-red-500/20'
                    : 'bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-800'
                  }`}
              >
                {hasPlan ? <CheckCircle2 className="w-3 h-3" /> : <PlusCircle className="w-3 h-3" />}
                <span>{hasPlan ? '5W2H' : '5W2H'}</span>
              </motion.button>
            );
          })()}
        </div>

        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  handleNossaAcaoBlur();
                  setIsModalOpen(false);
                }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-6xl bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-950/50">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Plano de Ação (5W2H)</h3>
                      {tipo === 'EXTERNA' && localNossaAcao && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                          Ref: Autoavaliação
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">{item.pilar} {' > '} {item.bloco}</p>
                  </div>
                  <button
                    onClick={() => {
                      handleNossaAcaoBlur();
                      setIsModalOpen(false);
                    }}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                  {/* Item a ser Auditado */}
                  <div className="bg-gray-50/50 dark:bg-zinc-950/30 p-4 rounded-xl border border-gray-100 dark:border-zinc-800/80 shadow-sm">
                    <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Item a ser Auditado</label>
                    <p className="text-[14px] text-gray-800 dark:text-zinc-200 italic font-semibold leading-relaxed">
                      "{item.item}"
                    </p>
                  </div>

                  {/* Grid Principal Duas Colunas */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Painel Esquerdo (7 colunas): Definição da Ação (O Quê e Como) */}
                    <div className="lg:col-span-7 space-y-5">
                      
                      {/* O Quê (What) */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                            O Quê? <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-normal normal-case ml-1">(What - Ação a ser realizada)</span>
                          </label>
                          {canEdit && !isNossaAcaoReadOnly && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleAISuggestion}
                              disabled={isSuggesting}
                              className="flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-md text-[10px] font-bold shadow-sm disabled:opacity-50 transition-all shrink-0"
                            >
                              {isSuggesting ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Sparkles className="w-3 h-3" />
                              )}
                              <span>{isSuggesting ? 'Sugerindo...' : 'Sugerir com IA'}</span>
                            </motion.button>
                          )}
                        </div>
                        <textarea
                          value={planState.what}
                          onChange={(e) => !isNossaAcaoReadOnly && handlePlanChange('what', e.target.value)}
                          disabled={!canEdit || isNossaAcaoReadOnly}
                          placeholder={canEdit && !isNossaAcaoReadOnly ? "O que será feito? Descreva detalhadamente a ação corretiva..." : "Nenhuma ação descrita."}
                          className={`w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white transition-all min-h-[110px] resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${(!canEdit || isNossaAcaoReadOnly) ? 'opacity-70 cursor-not-allowed' : ''}`}
                        />
                      </div>

                      {/* Como (How) */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Settings className="w-4 h-4 text-orange-500 shrink-0" />
                          Como? <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-normal normal-case ml-1">(How - Método / Passos detalhados)</span>
                        </label>
                        <textarea
                          value={planState.how}
                          onChange={(e) => !isNossaAcaoReadOnly && handlePlanChange('how', e.target.value)}
                          disabled={!canEdit || isNossaAcaoReadOnly}
                          placeholder={canEdit && !isNossaAcaoReadOnly ? "Como será feito? Descreva os passos, recursos e metodologia de execução..." : "Nenhum método descrito."}
                          className={`w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white transition-all min-h-[110px] resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${(!canEdit || isNossaAcaoReadOnly) ? 'opacity-70 cursor-not-allowed' : ''}`}
                        />
                      </div>

                      {/* Observações do Auditor */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-pink-500 dark:text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-pink-500 shrink-0" />
                          Observações do Auditor
                        </label>
                        <textarea
                          value={planState.observations || ''}
                          onChange={(e) => handlePlanChange('observations', e.target.value)}
                          disabled={!canEdit}
                          placeholder={canEdit ? "Digite aqui as observações do auditor..." : "Nenhuma observação descrita."}
                          className={`w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white transition-all min-h-[140px] resize-none focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 ${!canEdit ? 'opacity-70 cursor-not-allowed' : ''}`}
                        />
                      </div>

                    </div>

                    {/* Painel Direito (5 colunas): Planejamento e Metadados */}
                    <div className="lg:col-span-5 space-y-4 bg-gray-50/30 dark:bg-zinc-950/20 p-4 rounded-xl border border-gray-100 dark:border-zinc-800/80 shadow-inner">
                      
                      {/* Status */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-blue-500 shrink-0" />
                          Status <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-normal normal-case ml-1">(Situação do Plano)</span>
                        </label>
                        <select
                          value={planState.status || 'Não Iniciado'}
                          onChange={(e) => !isNossaAcaoReadOnly && handlePlanChange('status', e.target.value)}
                          disabled={!canEdit || isNossaAcaoReadOnly}
                          className={`w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold ${
                            planState.status === 'Concluído' ? 'text-emerald-600 dark:text-emerald-400' :
                            planState.status === 'Atrasado' ? 'text-red-600 dark:text-red-400' :
                            planState.status === 'Em Andamento' ? 'text-amber-600 dark:text-amber-400' :
                            planState.status === 'Cancelado' ? 'text-gray-500 dark:text-gray-400' :
                            'text-gray-900 dark:text-white'
                          }`}
                        >
                          <option value="Não Iniciado" className="text-gray-900 dark:text-white font-medium">Não Iniciado</option>
                          <option value="Em Andamento" className="text-amber-600 dark:text-amber-400 font-medium">Em Andamento</option>
                          <option value="Atrasado" className="text-red-600 dark:text-red-400 font-medium">Atrasado</option>
                          <option value="Concluído" className="text-emerald-600 dark:text-emerald-400 font-medium">Concluído</option>
                          <option value="Cancelado" className="text-gray-500 dark:text-gray-400 font-medium">Cancelado</option>
                        </select>
                      </div>

                      {/* Por Quê (Why) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-purple-500 shrink-0" />
                          Por Quê? <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-normal normal-case ml-1">(Why - Justificativa)</span>
                        </label>
                        <textarea
                          value={planState.why}
                          onChange={(e) => !isNossaAcaoReadOnly && handlePlanChange('why', e.target.value)}
                          disabled={!canEdit || isNossaAcaoReadOnly}
                          placeholder="Por que será feito?"
                          className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white min-h-[60px] resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      {/* Onde (Where) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                          Onde? <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-normal normal-case ml-1">(Where - Local / Área)</span>
                        </label>
                        <textarea
                          value={planState.where}
                          onChange={(e) => !isNossaAcaoReadOnly && handlePlanChange('where', e.target.value)}
                          disabled={!canEdit || isNossaAcaoReadOnly}
                          placeholder="Onde será feito?"
                          className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white min-h-[60px] resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      {/* Quem (Who) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                          <User className="w-4 h-4 text-amber-500 shrink-0" />
                          Quem? <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-normal normal-case ml-1">(Who - Responsáveis)</span>
                        </label>
                        
                        <div className={`w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg p-2 min-h-[46px] flex flex-wrap gap-2 items-center transition-all ${(!canEdit || isNossaAcaoReadOnly) ? 'opacity-70 cursor-not-allowed' : 'focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'}`}>
                          {planState.who.split(',').map(s => s.trim()).filter(Boolean).map(u => (
                            <span key={u} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-500/30">
                              {u}
                              {!isNossaAcaoReadOnly && canEdit && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.preventDefault(); removeUser(u); }}
                                  className="hover:text-red-500 transition-colors focus:outline-none"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </span>
                          ))}
                          
                          {(!isNossaAcaoReadOnly && canEdit) && (
                            <div className="relative flex-1 min-w-[120px]">
                              <input
                                list={`users-datalist-${item.id}`}
                                value={whoInput}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setWhoInput(val);
                                  const matchedUser = activeUsers.find(u => u.name.toLowerCase() === val.trim().toLowerCase() && !planState.who.includes(u.name));
                                  if (matchedUser) {
                                    addUser(matchedUser.name);
                                    setWhoInput('');
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = whoInput.trim();
                                    if (val) {
                                      addUser(val);
                                      setWhoInput('');
                                    }
                                  }
                                }}
                                onBlur={() => {
                                  setTimeout(() => {
                                    const val = whoInput.trim();
                                    if (val) {
                                      addUser(val);
                                      setWhoInput('');
                                    }
                                  }, 150);
                                }}
                                placeholder={planState.who.trim() ? "Adicionar..." : "Digite ou selecione o(s) responsável(is)..."}
                                className="w-full bg-transparent border-none focus:outline-none text-sm text-gray-900 dark:text-white"
                              />
                            </div>
                          )}
                        </div>
                        
                        <datalist id={`users-datalist-${item.id}`}>
                          {activeUsers.filter(u => !planState.who.includes(u.name)).map(u => (
                            <option key={u.id} value={u.name}>{u.email}</option>
                          ))}
                        </datalist>
                      </div>

                      {/* Quanto (How Much) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-cyan-500" />
                          Quanto? <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-normal normal-case ml-1">(How Much - Custo financeiro)</span>
                        </label>
                        <input
                          type="text"
                          value={planState.howMuch}
                          onChange={(e) => !isNossaAcaoReadOnly && handlePlanChange('howMuch', e.target.value)}
                          disabled={!canEdit || isNossaAcaoReadOnly}
                          placeholder="Custo estimado (ex: R$ 0,00 ou Grátis)"
                          className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      {/* Prazos (Quando Inicia e Fim) */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            Início <span className="text-[9px] text-gray-400 dark:text-zinc-500 font-normal normal-case ml-0.5">(Start)</span>
                          </label>
                          <input
                            type="date"
                            value={planState.whenStart}
                            onChange={(e) => !isNossaAcaoReadOnly && handlePlanChange('whenStart', e.target.value)}
                            disabled={!canEdit || isNossaAcaoReadOnly}
                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            Prazo <span className="text-[9px] text-gray-400 dark:text-zinc-500 font-normal normal-case ml-0.5">(End)</span>
                          </label>
                          <input
                            type="date"
                            value={planState.whenEnd}
                            onChange={(e) => !isNossaAcaoReadOnly && handlePlanChange('whenEnd', e.target.value)}
                            disabled={!canEdit || isNossaAcaoReadOnly}
                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>

                    </div>

                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleNossaAcaoBlur();
                      setIsModalOpen(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all text-sm"
                  >
                    {isNossaAcaoReadOnly ? 'Fechar' : 'Salvar e Fechar'}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </td >
      <td className="px-1 py-1">
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 w-full text-center">
            
            {/* --- COLUNA ANEXO (DRIVE) --- */}
            <div className="flex flex-col items-center justify-center min-h-[50px] gap-1 px-1">
              {driveEvidencias.length > 0 ? (
                <div className="flex flex-col gap-1 w-full items-center">
                  {driveEvidencias.map((ev, index) => (
                    <div key={ev.id || ev.name || index} className="flex items-center gap-1 max-w-full">
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[50px]"
                        title={ev.name === 'Manual Link' ? 'Link' : 'Anexo'}
                      >
                        Anexo {index + 1}
                      </a>
                      {!isEvidenceReadOnly && canEdit && (
                        <button
                          type="button"
                          onClick={() => handleEvidenceDelete(ev.id || ev.name)}
                          className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none shrink-0"
                          title="Remover anexo"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {!isEvidenceReadOnly && (
                    <motion.label
                      whileHover={{ scale: 1.05 }}
                      className="text-[9px] text-gray-400 dark:text-zinc-500 hover:text-blue-500 transition-colors cursor-pointer underline underline-offset-2 mt-0.5"
                    >
                      + Anexo
                      <input type="file" className="hidden" disabled={!canEdit || isUploading} onChange={handleFileUpload} multiple />
                    </motion.label>
                  )}
                </div>
              ) : (
                !isEvidenceReadOnly && (
                  <motion.label
                    whileHover={{ scale: 1.05 }}
                    className={`flex flex-col items-center text-[10px] font-bold text-gray-400 dark:text-zinc-500 cursor-pointer hover:text-blue-500 transition-colors ${isUploading ? 'opacity-50' : ''}`}
                  >
                    <Upload className="w-3 h-3 mb-0.5" />
                    <span>Anexo</span>
                    <input type="file" className="hidden" disabled={!canEdit || isUploading} onChange={handleFileUpload} multiple />
                  </motion.label>
                )
              )}
              {isEvidenceReadOnly && driveEvidencias.length === 0 && (
                <span className="text-[10px] text-gray-400 italic">Sem anexo</span>
              )}
            </div>

            {/* --- COLUNA LINK (MANUAL) --- */}
            <div className="flex flex-col items-center justify-center min-h-[50px] gap-1">
              {manualLinks.length > 0 ? (
                <div className="flex flex-col gap-1 w-full px-1">
                  {manualLinks.map((link, index) => (
                    <div key={link.id || index} className="flex items-center justify-between gap-1 bg-white/40 dark:bg-zinc-800/40 rounded px-1.5 py-0.5 border border-gray-100 dark:border-zinc-700/50">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[50px]"
                        title={link.url}
                      >
                        Link {index + 1}
                      </a>
                      {!isEvidenceReadOnly && canEdit && (
                        <button
                          type="button"
                          onClick={() => handleEvidenceDelete(link.id || link.name)}
                          className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none ml-1"
                          title="Remover link"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {!isEvidenceReadOnly && (
                    <button
                      onClick={handleLinkUpload}
                      disabled={!canEdit || isUploading}
                      className="text-[9px] text-blue-500 hover:text-blue-700 transition-colors font-semibold mt-1"
                    >
                      + Link
                    </button>
                  )}
                </div>
              ) : (
                !isEvidenceReadOnly && (
                  <button
                    onClick={handleLinkUpload}
                    disabled={!canEdit || isUploading}
                    className="flex flex-col items-center text-[10px] font-bold text-gray-400 dark:text-zinc-500 hover:text-blue-500 transition-colors disabled:opacity-50"
                  >
                    <Link className="w-3 h-3 mb-0.5" />
                    <span>Link</span>
                  </button>
                )
              )}
              {isEvidenceReadOnly && manualLinks.length === 0 && (
                <span className="text-[10px] text-gray-400 italic">Sem link</span>
              )}
            </div>
            
          </div>
          {isUploading && <div className="text-[8px] animate-pulse text-blue-500 font-bold mt-1">Lendo...</div>}
        </div>
      </td>
    </tr >
  );
});
