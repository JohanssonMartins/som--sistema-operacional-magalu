import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, RefreshCw, Check, X, Lock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { PILAR_ORDER } from '../constants/appConstants';
import { getPilarWeight, getBlocoWeight } from '../utils/appUtils';
import { AutoauditoriaRow } from '../components/AutoauditoriaRow';
import { api } from '../api';

export const Autoauditoria = () => {
  const { 
    currentUser, 
    selectedUnit, 
    autoauditoriaMesAno, 
    autoauditoriaData, 
    setAutoauditoriaData,
    baseItems,
    allAutoauditorias,
    setAllAutoauditorias 
  } = useStore();

  const { dashboardStats } = useDashboardStats(selectedUnit, autoauditoriaMesAno);
  const { resumoPorPilar, aderenciaMedia, progressoTotal, totalRespondidos, totalItems } = dashboardStats;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [selectedPilarFilter, setSelectedPilarFilter] = useState('Todos');
  const [showOnlyPending, setShowOnlyPending] = useState(false);

  const isInitialLoad = useRef(true);
  const needsSave = useRef(false);
  const pendingEdits = useRef<Set<string>>(new Set());

  const loadAutoauditoria = async (unidade: string, mesAno: string, isPolling = false) => {
    try {
      if (!isPolling) {
        setIsLoading(true);
        isInitialLoad.current = true;
      }
      const data = await api.getAutoauditoria(unidade, mesAno);
      if (data && data.items) {
        setAutoauditoriaData(prevData => {
          const mappedData: Record<string, any> = { ...prevData };
          let hasChanges = false;
          data.items.forEach((item: any) => {
            if (!pendingEdits.current.has(item.baseItemId)) {
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
          return (hasChanges || !isPolling) ? mappedData : prevData;
        });
      }

      if (!isPolling) setLastSavedTime(null);
    } catch (e) {
      console.error("Erro ao carregar autoauditoria:", e);
    } finally {
      if (!isPolling) {
        setIsLoading(false);
        setTimeout(() => {
          isInitialLoad.current = false;
        }, 500);
      }
    }
  };

  useEffect(() => {
    if (selectedUnit && selectedUnit !== 'Todas' && selectedUnit !== 'Master') {
      loadAutoauditoria(selectedUnit, autoauditoriaMesAno);
    } else {
      setAutoauditoriaData({});
    }
  }, [selectedUnit, autoauditoriaMesAno]);

  // Debounced Auto-save
  useEffect(() => {
    if (isInitialLoad.current || !currentUser) return;
    if (Object.keys(autoauditoriaData).length === 0) return;
    if (selectedUnit === 'Todas' || selectedUnit === 'Master') return;

    if (!needsSave.current) return;

    setIsSaving(true);
    const timeoutId = setTimeout(async () => {
      const savingIds = new Set(pendingEdits.current);
      try {
        const itemsToSave = Object.keys(autoauditoriaData).map(baseItemId => ({
          baseItemId,
          score: autoauditoriaData[baseItemId].score,
          nossaAcao: autoauditoriaData[baseItemId].nossaAcao,
        }));

        await api.saveAutoauditoria({
          unidade: selectedUnit,
          mesAno: autoauditoriaMesAno,
          items: itemsToSave
        });

        savingIds.forEach(id => pendingEdits.current.delete(id));
        needsSave.current = pendingEdits.current.size > 0;
        setLastSavedTime(new Date());
      } catch (e) {
        console.error("Erro no auto-save:", e);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [autoauditoriaData, selectedUnit, autoauditoriaMesAno, currentUser]);

  const handlePontoChange = (itemId: string, newPonto: string) => {
    pendingEdits.current.add(itemId);
    needsSave.current = true;
    setAutoauditoriaData(prev => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || { nossaAcao: '' }), score: newPonto }
    }));
  };

  const handleNossaAcaoChange = (itemId: string, newAcao: string) => {
    setAutoauditoriaData(prev => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || { score: '' }), nossaAcao: newAcao }
    }));
  };

  const handleNossaAcaoBlur = (itemId: string, finalAcao: string) => {
    pendingEdits.current.add(itemId);
    needsSave.current = true;
    // Trigger save via useEffect
    setAutoauditoriaData(prev => ({ ...prev })); 
  };

  const canEdit = currentUser && ['ADMIN', 'GERENTE_DO_CD', 'DONO_DO_PILAR'].includes(currentUser.role) &&
    (currentUser.role === 'ADMIN' || currentUser.unidade === selectedUnit);

  const filteredItems = baseItems
    .filter(i => i.ativo && 
      (selectedPilarFilter === 'Todos' || i.pilar === selectedPilarFilter) &&
      (!showOnlyPending || !(autoauditoriaData[i.id]?.score))
    )
    .sort((a, b) => {
      const wA = getPilarWeight(a.pilar);
      const wB = getPilarWeight(b.pilar);
      if (wA !== wB) return wA - wB;
      return getBlocoWeight(a.bloco) - getBlocoWeight(b.bloco);
    });

  return (
    <div className="max-w-7xl mx-auto w-full py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Autoavaliação Mensal</h2>
          <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Realize a autoavaliação da sua unidade para o mês de {autoauditoriaMesAno.split('-')[0]}.</p>
        </div>
        {isSaving && (
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 text-sm font-medium animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Salvando alterações...</span>
          </div>
        )}
        {!isSaving && lastSavedTime && (
          <div className="text-emerald-600 dark:text-emerald-400 text-xs">
            Última alteração salva às {lastSavedTime.toLocaleTimeString()}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-zinc-800 border-b border-gray-200 dark:border-zinc-800 p-6 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{progressoTotal.toFixed(1).replace('.', ',')}%</div>
            <div className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Progresso</div>
            <div className="text-xs text-gray-400 dark:text-zinc-500">({totalRespondidos}/{totalItems} itens)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{aderenciaMedia.toFixed(1).replace('.', ',')}%</div>
            <div className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Aderência Auto</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${aderenciaMedia >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {aderenciaMedia >= 80 ? 'Aderente' : 'Não Aderente'}
            </div>
            <div className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Status</div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-zinc-200">Resumo por Pilar</h3>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPilarFilter}
              onChange={(e) => setSelectedPilarFilter(e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="Todos">Todos os Pilares</option>
              {PILAR_ORDER.map(p => (
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
            <thead className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 font-bold">
              <tr>
                <th className="px-6 py-4 text-left">Pilar</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-emerald-600">Conforme</th>
                <th className="px-6 py-4 text-red-600">N. Conforme</th>
                <th className="px-6 py-4">Aderência</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
              {resumoPorPilar.map(row => (
                <tr key={row.pilar} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 text-left font-bold text-gray-900 dark:text-zinc-100">{row.pilar}</td>
                  <td className="px-6 py-4">{row.total}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{row.conforme}</td>
                  <td className="px-6 py-4 font-bold text-red-600">{row.naoConforme}</td>
                  <td className="px-6 py-4">{row.aderencia.toFixed(1).replace('.', ',')}%</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${row.status === 'Aderente' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
        {selectedUnit === 'Todas' ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 dark:text-zinc-400">
            <LayoutDashboard className="w-16 h-16 mb-4 text-gray-300 dark:text-zinc-700" />
            <h3 className="text-xl font-bold text-gray-700 dark:text-zinc-300 mb-2">Visão Geral dos CDs</h3>
            <p className="max-w-md">Selecione um CD específico no menu lateral para realizar a autoavaliação detalhada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-zinc-300">
              <thead className="bg-gray-50 dark:bg-zinc-950 font-bold border-b border-gray-200 dark:border-zinc-800 uppercase text-[10px] tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3">Pilar</th>
                  <th className="px-6 py-3">Bloco</th>
                  <th className="px-6 py-3">Trilha</th>
                  <th className="px-6 py-3">Item</th>
                  <th className="px-6 py-3 w-24">Ponto</th>
                  <th className="px-6 py-3 w-32">Plano</th>
                  <th className="px-6 py-3 w-40">Evidência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/50">
                {filteredItems.map(item => (
                  <AutoauditoriaRow
                    key={item.id}
                    item={item}
                    canEdit={!!canEdit}
                    pontoValue={autoauditoriaData[item.id]?.score || ''}
                    nossaAcaoValue={autoauditoriaData[item.id]?.nossaAcao || ''}
                    onPontoChange={handlePontoChange}
                    onNossaAcaoChange={handleNossaAcaoChange}
                    onNossaAcaoBlur={handleNossaAcaoBlur}
                    unidade={selectedUnit}
                    mesAno={autoauditoriaMesAno}
                    existingEvidenciaUrl={autoauditoriaData[item.id]?.evidencias?.[0]?.url}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
