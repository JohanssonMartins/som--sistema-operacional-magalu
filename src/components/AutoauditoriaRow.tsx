import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, PlusCircle, X, Upload, Sparkles, Loader2, HelpCircle } from 'lucide-react';
import { ChecklistItem } from '../data';
import { api } from '../api';

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
  existingEvidenciaUrl?: string;
  onEvidenciaUploaded?: (itemId: string, url: string, evidenceId: string) => void;
  isNossaAcaoReadOnly?: boolean;
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
  existingEvidenciaUrl,
  onEvidenciaUploaded,
  isNossaAcaoReadOnly = false,
  cdPontoValue
}: AutoauditoriaRowProps) => {
  const [localNossaAcao, setLocalNossaAcao] = useState(nossaAcaoValue);
  const [isUploading, setIsUploading] = useState(false);
  const [evidenciaUrl, setEvidenciaUrl] = useState<string | undefined>(existingEvidenciaUrl);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [evidenceId, setEvidenceId] = useState<string | undefined>(undefined); // ID do Drive para análise
  const [showCriteria, setShowCriteria] = useState(false);
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);

  useEffect(() => {
    setLocalNossaAcao(nossaAcaoValue);
  }, [nossaAcaoValue]);

  useEffect(() => {
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
      formData.append('tipo', tipo);

      const res = await api.uploadEvidenciaGoogleDrive(formData);
      if (res.success && res.url) {
        setEvidenciaUrl(res.url);
        const driveId = res.evidencia?.name || '';
        if (driveId) setEvidenceId(driveId);

        // Notifica o pai para persistir no estado global
        onEvidenciaUploaded?.(item.id, res.url, driveId);
      }
    } catch (error) {
      console.error('Erro no upload da evidência:', error);
      alert('Falha ao enviar arquivo para o Google Drive. Verifique o console.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleAISuggestion = async () => {
    try {
      setIsSuggesting(true);
      const res = await api.suggestAction(item.pilar, item.bloco, item.item, item.descricao || '');
      if (res.suggestion) {
        handleNossaAcaoChange(res.suggestion);
      }
    } catch (error) {
      console.error('Erro ao sugerir com IA:', error);
      alert('Não foi possível obter sugestão da IA agora. Tente mais tarde.');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAIAnalysis = async () => {
    if (!evidenceId) {
      alert('ID da evidência não disponível para análise.');
      return;
    }
    try {
      setIsAnalyzing(true);
      const res = await api.analyzeEvidence(item.pilar, item.bloco, item.item, item.descricao || '', evidenceId);
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
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group"
    >
      <td className="px-6 py-4 font-medium text-gray-900 dark:text-zinc-200">{item.pilar}</td>
      <td className="px-6 py-4">{item.bloco}</td>
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
              className={`w-10 h-7 border border-gray-200 dark:border-zinc-800 rounded-md px-0.5 py-0 text-xs font-bold transition-all text-center shrink-0 ${!canEdit ? 'opacity-70 cursor-not-allowed' : 'focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-sm'} ${pontoValue === '3'
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
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all shadow-sm border ${localNossaAcao.trim()
              ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
              : (pontoValue === '0' || pontoValue === '1')
                ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-300 dark:border-red-500/30 ring-1 ring-red-500/20'
                : 'bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-800'
              }`}
          >
            {localNossaAcao.trim() ? <CheckCircle2 className="w-3 h-3" /> : <PlusCircle className="w-3 h-3" />}
            <span>{localNossaAcao.trim() ? 'Plano' : 'Add Plano'}</span>
          </motion.button>
        </div>

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
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Plano de Ação / Observações</h3>
                      {tipo === 'EXTERNA' && localNossaAcao && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                          Ref: Autoavaliação
                        </span>
                      )}
                    </div>
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

                  <div className="mb-4 flex justify-between items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">Descrição Detalhada:</label>
                    </div>
                    {canEdit && !isNossaAcaoReadOnly && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAISuggestion}
                        disabled={isSuggesting}
                        className="mb-2 flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md text-[10px] font-bold hover:shadow-lg disabled:opacity-50 transition-all shrink-0"
                      >
                        {isSuggesting ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        <span>{isSuggesting ? 'Sugestionando...' : 'Sugerir com IA'}</span>
                      </motion.button>
                    )}
                  </div>
                  <textarea
                    value={localNossaAcao}
                    onChange={(e) => !isNossaAcaoReadOnly && handleNossaAcaoChange(e.target.value)}
                    onBlur={handleNossaAcaoBlur}
                    disabled={!canEdit || isNossaAcaoReadOnly}
                    placeholder={canEdit && !isNossaAcaoReadOnly ? "Descreva detalhadamente a ação corretiva ou observação técnica..." : "Nenhum plano registrado."}
                    className={`w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white transition-all min-h-[150px] resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${(!canEdit || isNossaAcaoReadOnly) ? 'opacity-70 cursor-not-allowed' : ''}`}
                  />
                </div>

                <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsModalOpen(false)}
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
      <td className="px-1 py-2">
        <div className="flex flex-col items-center gap-1">
          {evidenciaUrl && (
            <a
              href={evidenciaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 w-full text-center"
            >
              Ver
            </a>
          )}
          <motion.label
            className={`inline-flex items-center justify-center space-x-1 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 px-2 py-0.5 rounded text-[9px] font-bold transition-colors shadow-sm w-full ${!canEdit || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Upload className="w-2.5 h-2.5" />
            <span>{isUploading ? '...' : (evidenciaUrl ? 'Trocar' : 'Anexar')}</span>
            <input type="file" className="hidden" disabled={!canEdit || isUploading} onChange={handleFileUpload} />
          </motion.label>
        </div>
      </td>
    </motion.tr >
  );
});
