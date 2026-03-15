import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, PlusCircle, X, Upload, Sparkles, Loader2 } from 'lucide-react';
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
  existingEvidenciaUrl?: string;
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
  existingEvidenciaUrl
}: AutoauditoriaRowProps) => {
  const [localNossaAcao, setLocalNossaAcao] = useState(nossaAcaoValue);
  const [isUploading, setIsUploading] = useState(false);
  const [evidenciaUrl, setEvidenciaUrl] = useState<string | undefined>(existingEvidenciaUrl);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [evidenceId, setEvidenceId] = useState<string | undefined>(undefined); // ID do Drive para análise

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

      const res = await api.uploadEvidenciaGoogleDrive(formData);
      if (res.success && res.url) {
        setEvidenciaUrl(res.url);
        if (res.evidencia && res.evidencia.name) {
          setEvidenceId(res.evidencia.name); // O FileID foi salvo no name no server
        }
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

                  <div className="mb-4 flex justify-between items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">Descrição Detalhada:</label>
                    </div>
                    {canEdit && (
                      <button
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
                      </button>
                    )}
                  </div>
                  <textarea
                    value={localNossaAcao}
                    onChange={(e) => handleNossaAcaoChange(e.target.value)}
                    onBlur={handleNossaAcaoBlur}
                    disabled={!canEdit}
                    placeholder={canEdit ? "Descreva detalhadamente a ação corretiva ou observação técnica..." : "Nenhum plano registrado."}
                    className={`w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white transition-all min-h-[150px] resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${!canEdit ? 'opacity-70 cursor-not-allowed' : ''}`}
                  />
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
          
          {(evidenciaUrl && canEdit) && (
            <button
              onClick={handleAIAnalysis}
              disabled={isAnalyzing}
              className={`flex items-center space-x-1 px-2 py-1 rounded border text-[10px] font-bold transition-all ${
                aiAnalysis 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-800'
                  : 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-800 hover:bg-purple-100'
              }`}
              title={aiAnalysis || "Analisar evidência com Vision IA"}
            >
              {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3" />}
              <span>{aiAnalysis ? 'Evidência Analisada' : 'Validar com IA'}</span>
            </button>
          )}

          {aiAnalysis && (
            <div className="text-[10px] text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-800/50 p-2 rounded border border-dashed border-gray-200 dark:border-zinc-700 mt-1">
              <span className="font-bold text-gray-700 dark:text-zinc-300">Análise IA: </span>
              {aiAnalysis}
            </div>
          ) }

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
